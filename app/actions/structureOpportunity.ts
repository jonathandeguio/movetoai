"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getCurrentWorkspaceContext } from "@/server/auth";

const MODEL = "claude-sonnet-4-6";
const TIMEOUT_MS = 30_000;

export type StructuredOpportunity = {
  title: string;
  domain: string;
  description: string;
  gain_estimate: string;
  complexity: "low" | "medium" | "high";
  priority_suggestion: "P0" | "P1" | "P2";
  rationale: string;
  quick_solution: string;
};

export type StructureOpportunityResult =
  | { ok: true; data: StructuredOpportunity }
  | { ok: false; error: string };

/**
 * Server Action — converts a natural-language problem description into a
 * structured Opportunity using Claude.
 */
export async function structureOpportunity(
  rawText: string
): Promise<StructureOpportunityResult> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "Non authentifié" };

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return { ok: false, error: "ANTHROPIC_API_KEY non configurée" };

  // Gather workspace context for the prompt
  let sector = "entreprise B2B";
  let companySize = "PME/ETI";
  let existingDomains = "Finance, RH, Commercial";

  try {
    const { workspace, user } = await getCurrentWorkspaceContext({ requireMembership: true });
    const prefs = user.preferences as Record<string, unknown> | null;
    if (prefs?.companySize) companySize = String(prefs.companySize);
    if (prefs?.sector) sector = String(prefs.sector);

    if (workspace?.id) {
      const domains = await prisma.domain.findMany({
        where: { workspaceId: workspace.id },
        select: { name: true },
        take: 10,
      });
      if (domains.length > 0) existingDomains = domains.map((d) => d.name).join(", ");
    }
  } catch {
    // non-fatal — continue with defaults
  }

  const systemPrompt = `Tu es un expert en transformation IA pour entreprises B2B.
L'utilisateur décrit un problème métier en langage naturel.

Contexte workspace :
- Secteur : ${sector}
- Taille : ${companySize}
- Domaines déjà couverts : ${existingDomains}

Ta mission : structurer ce problème en une opportunité IA.
Réponds UNIQUEMENT en JSON valide, sans markdown, sans préambule :
{
  "title": "Titre court et actionnable (max 8 mots)",
  "domain": "domaine_métier (Finance|RH|Commercial|Marketing|Ops|Support|Juridique|Achats|IT)",
  "description": "Description structurée du problème (2-3 phrases)",
  "gain_estimate": "Gain estimé qualitatif ou quantitatif",
  "complexity": "low|medium|high",
  "priority_suggestion": "P0|P1|P2",
  "rationale": "Pourquoi cette opportunité est prioritaire (1 phrase)",
  "quick_solution": "Type de solution IA recommandée (1 phrase)"
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
        max_tokens: 600,
        temperature: 0,
        system: systemPrompt,
        messages: [{ role: "user", content: rawText }],
      }),
      signal: controller.signal,
    });

    clearTimeout(timer);

    if (!resp.ok) {
      return { ok: false, error: `Erreur API Claude (${resp.status})` };
    }

    const body = await resp.json();
    const text: string = body.content?.[0]?.text ?? "";

    // Extract JSON even if Claude adds surrounding text
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return { ok: false, error: "Réponse Claude invalide" };

    const parsed = JSON.parse(jsonMatch[0]) as StructuredOpportunity;
    return { ok: true, data: parsed };
  } catch (err) {
    clearTimeout(timer);
    if (err instanceof Error && err.name === "AbortError") {
      return { ok: false, error: "Délai dépassé (30s). Réessayez ou utilisez le mode manuel." };
    }
    return { ok: false, error: "Erreur lors de l'analyse" };
  }
}
