import "server-only";

import Anthropic from "@anthropic-ai/sdk";
import { prisma } from "@/lib/prisma";

const client = new Anthropic();

export interface CopilotMessage {
  role: "user" | "assistant";
  content: string;
  createdAt: string;
}

export async function buildWorkspaceContext(workspaceId: string): Promise<string> {
  const [
    applicationCount,
    processCount,
    capabilityCount,
    useCaseCount,
    opportunityCount,
    assessments,
    topOpportunities,
    topProcesses,
  ] = await Promise.all([
    prisma.application.count({ where: { workspaceId, deletedAt: null } }),
    prisma.process.count({ where: { workspaceId, deletedAt: null } }),
    prisma.capability.count({ where: { workspaceId, deletedAt: null } }),
    prisma.useCase.count({ where: { workspaceId, deletedAt: null } }),
    prisma.opportunity.count({ where: { workspaceId, deletedAt: null } }),
    prisma.aIReadinessAssessment.findMany({
      where: { workspaceId },
      select: { overallScore: true },
    }),
    prisma.opportunity.findMany({
      where: { workspaceId, deletedAt: null },
      orderBy: { createdAt: "desc" },
      take: 3,
      select: { title: true, priorityLevel: true, gainEstimate: true, domainLabel: true },
    }),
    prisma.process.findMany({
      where: { workspaceId, deletedAt: null, aiPotential: { not: null } },
      orderBy: { aiPotential: "desc" },
      take: 3,
      select: { name: true, aiPotential: true, frequency: true },
    }),
  ]);

  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    select: { name: true },
  });

  const avgMaturity =
    assessments.length > 0
      ? (
          assessments.reduce((sum, a) => sum + (a.overallScore ?? 0), 0) / assessments.length
        ).toFixed(1)
      : null;

  const topOppsText = topOpportunities
    .map(
      (o, i) =>
        `  ${i + 1}. ${o.title} [${o.priorityLevel ?? "—"}] — domaine: ${o.domainLabel ?? "—"}${o.gainEstimate ? `, gain: ${o.gainEstimate}` : ""}`
    )
    .join("\n");

  const topProcsText = topProcesses
    .map(
      (p, i) =>
        `  ${i + 1}. ${p.name} (potentiel IA: ${p.aiPotential ?? "—"}, fréquence: ${p.frequency ?? "—"})`
    )
    .join("\n");

  return `Vous êtes l'assistant IA de BluePilot pour le workspace "${workspace?.name ?? workspaceId}".

Contexte actuel du workspace :
- Applications : ${applicationCount}
- Processus : ${processCount}
- Capabilities : ${capabilityCount}
- Use Cases : ${useCaseCount}
- Opportunités IA : ${opportunityCount}
- Score moyen de maturité IA : ${avgMaturity != null ? `${avgMaturity}/100` : "Non encore évalué"}

Top 3 opportunités (par score) :
${topOppsText || "  Aucune opportunité enregistrée"}

Top 3 processus à fort potentiel IA :
${topProcsText || "  Aucun processus évalué"}

Instructions :
- Répondez toujours en français
- Concentrez-vous sur la transformation IA de l'entreprise
- Basez vos réponses sur les données du workspace ci-dessus
- Soyez concis, actionnable et orienté décision
- Si une donnée est manquante, signalez-le et proposez comment l'obtenir`;
}

export async function* streamCopilotResponse(
  workspaceId: string,
  messages: CopilotMessage[],
  userMessage: string
): AsyncGenerator<string> {
  const systemPrompt = await buildWorkspaceContext(workspaceId);

  const anthropicMessages: Anthropic.MessageParam[] = [
    ...messages.map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    })),
    { role: "user" as const, content: userMessage },
  ];

  const stream = await client.messages.stream({
    model: "claude-opus-4-5",
    max_tokens: 1024,
    system: systemPrompt,
    messages: anthropicMessages,
  });

  for await (const chunk of stream) {
    if (
      chunk.type === "content_block_delta" &&
      chunk.delta.type === "text_delta"
    ) {
      yield chunk.delta.text;
    }
  }
}
