export const runtime = "nodejs";

import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";

import { auth } from "@/lib/auth";
import type { ExecutiveQuickWin } from "@/modules/workspace/server/executive-onboarding";

const bodySchema = z.object({
  ambition: z.string().min(1),
  horizon: z.string().min(1),
  maturity: z.string().min(1),
  companySize: z.string().optional(),
  sector: z.string().optional()
});

type ClaudeResponse = {
  quick_wins: Array<{
    title: string;
    description: string;
    roi: string;
    timeframe: string;
    effort: "low" | "medium" | "high";
  }>;
  maturity_score: number;
};

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ code: "UNAUTHORIZED" }, { status: 401 });
  }

  try {
    const body = bodySchema.parse(await request.json());
    const client = new Anthropic();

    const systemPrompt = `Tu es un conseiller expert en transformation IA pour dirigeants d'entreprise.
Tu dois analyser le profil stratégique d'un dirigeant et recommander exactement 3 quick-wins IA à fort impact.
Réponds UNIQUEMENT avec un JSON valide, sans markdown, sans texte supplémentaire.
Format de réponse : { "quick_wins": [ { "title": "...", "description": "...", "roi": "...", "timeframe": "...", "effort": "low|medium|high" } ], "maturity_score": 0-100 }`;

    const userMessage = `Profil dirigeant :
- Ambition principale : ${body.ambition}
- Horizon de résultats : ${body.horizon}
- Maturité IA actuelle : ${body.maturity}
- Taille d'entreprise : ${body.companySize ?? "PME/ETI"}
- Secteur : ${body.sector ?? "non précisé"}

Recommande 3 quick-wins IA concrets avec ROI estimé. Adapte au niveau de maturité et à l'horizon temps.
L'effort doit être réaliste : si maturité faible → préfère "low" effort.
Le ROI doit être chiffré (ex: "15-20% de réduction des coûts de traitement", "2h/semaine économisées par commercial").`;

    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      system: systemPrompt,
      messages: [{ role: "user", content: userMessage }]
    });

    const rawText =
      message.content[0]?.type === "text" ? message.content[0].text.trim() : "{}";

    let parsed: ClaudeResponse;
    try {
      // Strip potential markdown fences
      const clean = rawText.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
      parsed = JSON.parse(clean) as ClaudeResponse;
    } catch {
      // Fallback quick wins if Claude response is malformed
      parsed = {
        maturity_score: 35,
        quick_wins: [
          {
            title: "Automatisation des rapports hebdomadaires",
            description: "Générer automatiquement les rapports de performance avec l'IA pour économiser du temps de management.",
            roi: "3-5h/semaine économisées par manager",
            timeframe: "4-6 semaines",
            effort: "low"
          },
          {
            title: "Assistant IA pour le service client",
            description: "Déployer un chatbot IA pour traiter les questions fréquentes et réduire le volume de tickets.",
            roi: "20-30% de réduction des tickets de niveau 1",
            timeframe: "2-3 mois",
            effort: "medium"
          },
          {
            title: "Analyse prédictive des ventes",
            description: "Utiliser l'IA pour prédire les opportunités commerciales et prioriser les actions commerciales.",
            roi: "10-15% d'amélioration du taux de conversion",
            timeframe: "3-4 mois",
            effort: "medium"
          }
        ]
      };
    }

    const quickWins: ExecutiveQuickWin[] = (parsed.quick_wins ?? []).slice(0, 3).map((w) => ({
      title: w.title ?? "",
      description: w.description ?? "",
      roi: w.roi ?? "",
      timeframe: w.timeframe ?? "",
      effort: (["low", "medium", "high"].includes(w.effort) ? w.effort : "medium") as "low" | "medium" | "high"
    }));

    const maturityScore = Math.min(100, Math.max(0, parsed.maturity_score ?? 35));

    return NextResponse.json({ quickWins, maturityScore });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ code: "INVALID_PAYLOAD" }, { status: 400 });
    }
    return NextResponse.json({ code: "UNKNOWN_ERROR" }, { status: 500 });
  }
}
