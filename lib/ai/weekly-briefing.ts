import "server-only";

import { prisma }           from "@/lib/prisma";
import { llmRouter }        from "@/lib/ai/llm-router";
import { parseLLMJsonSafe } from "@/lib/ai/parse-llm-json";

export interface BriefingSection {
  title: string;
  content: string;
  items?: string[];
}

export interface WeeklyBriefing {
  generatedAt: string;
  period: string;
  sections: BriefingSection[];
  topOpportunities: string[];
  keyMetrics: { label: string; value: string; trend: "up" | "down" | "stable" }[];
  recommendations: string[];
}

function weekBounds(): { start: Date; end: Date; label: string } {
  const now = new Date();
  const end = new Date(now);
  const start = new Date(now);
  start.setDate(now.getDate() - 7);

  const fmt = (d: Date) =>
    d.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });

  return { start, end, label: `Semaine du ${fmt(start)} au ${fmt(end)}` };
}

export async function generateWeeklyBriefing(workspaceId: string): Promise<WeeklyBriefing> {
  const { start, end, label } = weekBounds();

  const [
    newOpportunities,
    newUseCases,
    adrs,
    assessments,
    activeSurveys,
    totalOpportunities,
    totalApplications,
    totalProcesses,
    avgMaturity,
    topOpportunities,
  ] = await Promise.all([
    prisma.opportunity.findMany({
      where: { workspaceId, deletedAt: null, createdAt: { gte: start, lte: end } },
      select: { title: true, priorityLevel: true, domainLabel: true, gainEstimate: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.useCase.findMany({
      where: { workspaceId, createdAt: { gte: start, lte: end } },
      select: { title: true, status: true },
    }),
    prisma.architectureDecision.findMany({
      where: { workspaceId, deletedAt: null, createdAt: { gte: start, lte: end } },
      select: { title: true, status: true },
    }).catch(() => [] as { title: string; status: string | null }[]),
    prisma.aIReadinessAssessment.findMany({
      where: { workspaceId, assessedAt: { gte: start, lte: end } },
      select: { entityType: true, overallScore: true },
    }),
    prisma.survey.count({
      where: { workspaceId, status: "active" },
    }).catch(() => 0),
    prisma.opportunity.count({ where: { workspaceId, deletedAt: null } }),
    prisma.application.count({ where: { workspaceId, deletedAt: null } }),
    prisma.process.count({ where: { workspaceId, deletedAt: null } }),
    prisma.aIReadinessAssessment.aggregate({
      where: { workspaceId },
      _avg: { overallScore: true },
    }),
    prisma.opportunity.findMany({
      where: { workspaceId, deletedAt: null, priorityLevel: { in: ["P0", "P1"] } },
      orderBy: [{ priorityLevel: "asc" }, { createdAt: "desc" }],
      take: 5,
      select: { title: true, priorityLevel: true, domainLabel: true },
    }),
  ]);

  const avgScore = avgMaturity._avg.overallScore;

  const dataPayload = `
Workspace data for the weekly AI transformation briefing:

Period: ${label}

New this week:
- New opportunities detected: ${newOpportunities.length}
  ${newOpportunities.map((o) => `  - [${o.priorityLevel ?? "—"}] ${o.title} (${o.domainLabel ?? "—"})${o.gainEstimate ? ` — gain: ${o.gainEstimate}` : ""}`).join("\n") || "  None"}
- New use cases created: ${newUseCases.length}
  ${newUseCases.map((u) => `  - ${u.title} [${u.status}]`).join("\n") || "  None"}
- New ADRs: ${adrs.length}
  ${adrs.map((a) => `  - ${a.title} [${a.status ?? "—"}]`).join("\n") || "  None"}
- New AI assessments: ${assessments.length}

Overall portfolio:
- Total opportunities: ${totalOpportunities}
- Total applications: ${totalApplications}
- Total processes: ${totalProcesses}
- Active surveys: ${activeSurveys}
- Average AI maturity score: ${avgScore != null ? `${avgScore.toFixed(1)}/100` : "Not evaluated"}

Top priority opportunities:
${topOpportunities.map((o) => `- [${o.priorityLevel}] ${o.title} (${o.domainLabel ?? "—"})`).join("\n") || "None"}
`;

  const systemPrompt = `You are an AI transformation advisor. Generate a structured JSON weekly briefing in French based on the workspace data provided.

Return ONLY a valid JSON object with this exact structure:
{
  "sections": [
    {"title": "string", "content": "string", "items": ["string"] }
  ],
  "topOpportunities": ["string"],
  "keyMetrics": [
    {"label": "string", "value": "string", "trend": "up"|"down"|"stable"}
  ],
  "recommendations": ["string"]
}

Rules:
- All text in French
- 3-5 sections (e.g., "Résumé de la semaine", "Opportunités IA", "Maturité & Assessments", "Use Cases", "Actions recommandées")
- 3 keyMetrics maximum
- 3-5 recommendations, short and actionable
- topOpportunities: list of opportunity titles (max 5)
- items in sections are bullet points (max 6 per section)
- content in sections is 1-2 sentences of narrative
- Do not invent data not present in the input`;

  const response = await llmRouter.complete({
    task:        "weekly_briefing",
    workspace_id: workspaceId,
    system:      systemPrompt,
    prompt:      dataPayload,
    json_mode:   true,
    max_tokens:  1500,
    temperature: 0.3,
  });

  type BriefingPayload = Omit<WeeklyBriefing, "generatedAt" | "period">;

  const parsed = parseLLMJsonSafe<BriefingPayload>(response.content);

  const fallback: BriefingPayload = {
    sections: [
      {
        title: "Résumé de la semaine",
        content: `Cette semaine, ${newOpportunities.length} nouvelle(s) opportunité(s) ont été détectées et ${newUseCases.length} use case(s) créés.`,
        items: newOpportunities.slice(0, 3).map((o) => o.title),
      },
    ],
    topOpportunities: topOpportunities.map((o) => o.title),
    keyMetrics: [
      {
        label: "Opportunités totales",
        value: totalOpportunities.toString(),
        trend: newOpportunities.length > 0 ? "up" : "stable",
      },
      {
        label: "Score maturité IA",
        value: avgScore != null ? `${avgScore.toFixed(0)}/100` : "—",
        trend: "stable",
      },
      {
        label: "Applications portfolio",
        value: totalApplications.toString(),
        trend: "stable",
      },
    ],
    recommendations: [
      "Prioriser les opportunités P0 détectées cette semaine",
      "Compléter les assessments manquants",
      "Avancer les use cases en cours",
    ],
  };

  const data = parsed ?? fallback;

  return {
    generatedAt: new Date().toISOString(),
    period: label,
    sections:         data.sections         ?? [],
    topOpportunities: data.topOpportunities ?? [],
    keyMetrics:       data.keyMetrics       ?? [],
    recommendations:  data.recommendations  ?? [],
  };
}
