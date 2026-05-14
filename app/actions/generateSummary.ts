"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const MODEL = "claude-sonnet-4-6";
const TIMEOUT_MS = 30_000;

export type GenerateSummaryResult =
  | { ok: true; markdown: string }
  | { ok: false; error: string };

/**
 * Server Action — generates a one-page executive summary (Markdown) for a use case.
 * Includes context, solution, ROI, risks, and a go/no-go recommendation.
 */
export async function generateSummary(useCaseId: string): Promise<GenerateSummaryResult> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "Non authentifié" };

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return { ok: false, error: "ANTHROPIC_API_KEY non configurée" };

  const uc = await prisma.useCase.findUnique({
    where: { id: useCaseId },
    select: {
      title: true,
      solutionType: true,
      solutionDescription: true,
      processDescription: true,
      expectedOutcome: true,
      kpis: true,
      roiEstimated: true,
      effortDays: true,
      risks: true,
      priorityLevel: true,
      status: true,
      opportunity: {
        select: { title: true, domainLabel: true, gainEstimate: true },
      },
    },
  });

  if (!uc) return { ok: false, error: "Use case introuvable" };

  const prompt = `Tu es un expert en transformation IA. Génère un résumé exécutif en Markdown (format 1 page) pour ce use case IA.

## Données du use case :
- **Titre** : ${uc.title}
- **Opportunité source** : ${uc.opportunity.title} (${uc.opportunity.domainLabel ?? "N/A"})
- **Type de solution** : ${uc.solutionType}
- **Description** : ${uc.solutionDescription ?? "N/A"}
- **Processus actuel** : ${uc.processDescription}
- **Résultat attendu** : ${uc.expectedOutcome}
- **KPIs** : ${JSON.stringify(uc.kpis)}
- **ROI estimé** : ${JSON.stringify(uc.roiEstimated)}
- **Effort** : ${uc.effortDays} jours
- **Risques** : ${JSON.stringify(uc.risks)}
- **Priorité** : ${uc.priorityLevel}

Génère un résumé exécutif Markdown structuré avec ces sections :
1. ## Contexte & Problème
2. ## Solution IA proposée
3. ## Retour sur investissement
4. ## Risques & Mitigations
5. ## Recommandation go/no-go (avec justification claire)

Sois précis, factuel, orienté décision. Max 600 mots.`;

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
        max_tokens: 1200,
        temperature: 0,
        messages: [{ role: "user", content: prompt }],
      }),
      signal: controller.signal,
    });

    clearTimeout(timer);

    if (!resp.ok) return { ok: false, error: `Erreur API Claude (${resp.status})` };

    const body = await resp.json();
    const markdown: string = body.content?.[0]?.text ?? "";
    return { ok: true, markdown };
  } catch (err) {
    clearTimeout(timer);
    if (err instanceof Error && err.name === "AbortError") {
      return { ok: false, error: "Délai dépassé (30s)" };
    }
    return { ok: false, error: "Erreur lors de la génération du résumé" };
  }
}
