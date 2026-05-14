"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getCurrentWorkspaceContext } from "@/server/auth";

const MODEL = "claude-sonnet-4-6";
const TIMEOUT_MS = 30_000;

export type UseCaseKPI = {
  label: string;
  baseline: string;
  target: string;
  unit: string;
};

export type UseCaseROI = {
  savings_hours_per_month: number;
  savings_euros_per_year: number;
  payback_months: number;
  assumptions: string;
};

export type UseCaseRisk = {
  description: string;
  mitigation: string;
  level: "low" | "medium" | "high";
};

export type UseCaseDataSource = {
  source: string;
  type: string;
  available: boolean;
};

export type GeneratedUseCase = {
  title: string;
  solution_type: "automation" | "assistant" | "analysis" | "generation";
  solution_description: string;
  process_steps: string[];
  kpis: UseCaseKPI[];
  roi_estimated: UseCaseROI;
  effort_days: number;
  effort_breakdown: {
    design: number;
    development: number;
    testing: number;
    deployment: number;
  };
  data_required: UseCaseDataSource[];
  risks: UseCaseRisk[];
  recommended_tools: string[];
  next_steps: string[];
};

export type GenerateUseCaseResult =
  | { ok: true; data: GeneratedUseCase }
  | { ok: false; error: string };

export type GenerateUseCaseInput = {
  opportunityId: string;
  processDescription: string;
  dataAvailable: string[];
  expectedOutcome: string;
  constraints?: string;
};

/**
 * Server Action — generates a full use case spec from an opportunity + form data.
 * Uses Claude to produce KPIs, ROI estimates, risks, and recommendations.
 */
export async function generateUseCase(
  input: GenerateUseCaseInput
): Promise<GenerateUseCaseResult> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "Non authentifié" };

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return { ok: false, error: "ANTHROPIC_API_KEY non configurée" };

  // Load the opportunity for context
  const opportunity = await prisma.opportunity.findUnique({
    where: { id: input.opportunityId },
    select: {
      title: true,
      domainLabel: true,
      summary: true,
      gainEstimate: true,
      complexity: true,
    },
  });

  if (!opportunity) return { ok: false, error: "Opportunité introuvable" };

  let sector = "entreprise B2B";
  let companySize = "PME/ETI";
  try {
    const { user } = await getCurrentWorkspaceContext({ requireMembership: true });
    const prefs = user.preferences as Record<string, unknown> | null;
    if (prefs?.companySize) companySize = String(prefs.companySize);
    if (prefs?.sector) sector = String(prefs.sector);
  } catch {
    // non-fatal
  }

  const systemPrompt = `Tu es un expert en conception de projets IA pour entreprises B2B.
Tu dois produire une fiche use case complète et réaliste.

Contexte :
- Opportunité : ${opportunity.title}
- Domaine : ${opportunity.domainLabel ?? "Non spécifié"}
- Gain estimé : ${opportunity.gainEstimate ?? "Non estimé"}
- Complexité : ${opportunity.complexity}
- Entreprise : ${companySize} du secteur ${sector}
- Processus actuel : ${input.processDescription}
- Données disponibles : ${input.dataAvailable.join(", ")}
- Résultat attendu : ${input.expectedOutcome}
- Contraintes : ${input.constraints ?? "Aucune contrainte spécifiée"}

Génère une fiche use case complète en JSON valide, sans markdown, sans préambule :
{
  "title": "Titre du use case (actionnable, max 10 mots)",
  "solution_type": "automation|assistant|analysis|generation",
  "solution_description": "Description de la solution IA (3-4 phrases)",
  "process_steps": ["étape 1 automatisée", "étape 2", "étape 3"],
  "kpis": [
    { "label": "Temps économisé", "baseline": "3h/sem", "target": "30min/sem", "unit": "heures" },
    { "label": "Taux de traitement", "baseline": "70%", "target": "98%", "unit": "%" }
  ],
  "roi_estimated": {
    "savings_hours_per_month": 12,
    "savings_euros_per_year": 8400,
    "payback_months": 4,
    "assumptions": "Basé sur 1 ETP à 45k€/an, gain de 20% de productivité"
  },
  "effort_days": 15,
  "effort_breakdown": { "design": 3, "development": 8, "testing": 2, "deployment": 2 },
  "data_required": [
    { "source": "Nom du système", "type": "API|CSV|Base SQL|Email|PDF", "available": true }
  ],
  "risks": [
    { "description": "Risque identifié", "mitigation": "Mesure de mitigation", "level": "low|medium|high" }
  ],
  "recommended_tools": ["Outil 1", "Outil 2"],
  "next_steps": ["Étape suivante 1", "Étape suivante 2"]
}`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const resp = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 2000,
        temperature: 0,
        system: systemPrompt,
        messages: [
          {
            role: "user",
            content: `Génère la fiche use case complète pour cette opportunité.`,
          },
        ],
      }),
      signal: controller.signal,
    });

    clearTimeout(timer);

    if (!resp.ok) {
      return { ok: false, error: `Erreur API Claude (${resp.status})` };
    }

    const body = await resp.json();
    const text: string = body.content?.[0]?.text ?? "";

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return { ok: false, error: "Réponse Claude invalide" };

    const parsed = JSON.parse(jsonMatch[0]) as GeneratedUseCase;
    return { ok: true, data: parsed };
  } catch (err) {
    clearTimeout(timer);
    if (err instanceof Error && err.name === "AbortError") {
      return { ok: false, error: "Délai dépassé (30s). Veuillez réessayer." };
    }
    return { ok: false, error: "Erreur lors de la génération" };
  }
}
