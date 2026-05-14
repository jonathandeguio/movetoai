export const runtime = "nodejs";

import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getCurrentWorkspaceContext } from "@/server/auth";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(req: Request, { params }: RouteContext) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const { workspace } = await getCurrentWorkspaceContext({ requireMembership: true });

  const useCase = await prisma.useCase.findFirst({
    where: { id, workspaceId: workspace?.id, deletedAt: null },
    select: {
      title:              true,
      processDescription: true,
      expectedOutcome:    true,
      kpis:               true,
    },
  });
  if (!useCase) return NextResponse.json({ error: "Not found" }, { status: 404 });

  let body: {
    kpis?: unknown;
    actors?: { assignedTo?: string; technicalOwner?: string; consultantId?: string };
  };
  try { body = await req.json(); }
  catch { body = {}; }

  const actorLines = [
    body.actors?.assignedTo     ? `- Responsable Métier : présent` : null,
    body.actors?.technicalOwner ? `- DSI / IT : présent`           : null,
    body.actors?.consultantId   ? `- Consultant IA : présent`      : null,
  ].filter(Boolean).join("\n");

  const client = new Anthropic();

  try {
    const response = await client.messages.create({
      model:      "claude-sonnet-4-6",
      max_tokens: 2000,
      messages: [
        {
          role: "user",
          content: `Tu es un expert BPMN 2.0. Génère un diagramme BPMN XML valide pour ce processus.

Titre : ${useCase.title}
Description : ${useCase.processDescription ?? ""}
Résultat attendu : ${useCase.expectedOutcome ?? ""}
KPIs : ${JSON.stringify(useCase.kpis ?? [])}
Acteurs :
${actorLines || "- Aucun acteur défini"}

Règles :
- Utiliser des swimlanes (bpmn:laneSet) pour chaque acteur fourni
- Inclure un startEvent, 4-8 tâches logiques, un endEvent
- Nommer les tâches de façon actionnable (verbe + objet)
- XML BPMN 2.0 valide uniquement, sans markdown, sans commentaires

Réponds UNIQUEMENT avec le XML BPMN, rien d'autre.`,
        },
      ],
    });

    const xml =
      response.content[0].type === "text"
        ? response.content[0].text.trim()
        : null;

    if (!xml?.includes("bpmn:definitions")) {
      return NextResponse.json({ error: "XML invalide généré" }, { status: 500 });
    }

    return NextResponse.json({ xml });
  } catch (err) {
    console.error("BPMN suggest error:", err);
    return NextResponse.json({ error: "Erreur lors de la génération IA" }, { status: 500 });
  }
}
