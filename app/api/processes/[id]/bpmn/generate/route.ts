// app/api/processes/[id]/bpmn/generate/route.ts
// POST — génère un BPMN 2.0 via Claude à partir de la description et des étapes

import { NextResponse }              from "next/server";
import { auth }                      from "@/lib/auth";
import { getCurrentWorkspaceContext } from "@/lib/current-workspace";
import { prisma }                    from "@/lib/prisma";
import { llmRouter }                 from "@/lib/ai/llm-router";

export const runtime = "nodejs";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { workspace } = await getCurrentWorkspaceContext();
    if (!workspace?.id) return NextResponse.json({ error: "No workspace" }, { status: 400 });

    const { id } = await params;

    const process = await prisma.process.findFirst({
      where:   { id, workspaceId: workspace.id, deletedAt: null },
      include: { steps: { orderBy: { order: "asc" } }, owner: { select: { name: true } } },
    });

    if (!process) return NextResponse.json({ error: "Process not found" }, { status: 404 });

    const systemPrompt = `Tu es un expert BPMN 2.0 et processus métier.
Génère un diagramme BPMN 2.0 complet et valide en XML pour le processus métier décrit.

RÈGLES STRICTES :
1. Swimlanes pour séparer les acteurs (une lane = un acteur ou système)
2. ServiceTask (type="service") pour les tâches automatisables
3. UserTask (type="user") pour les tâches manuelles
4. ExclusiveGateway pour les décisions binaires
5. StartEvent et EndEvent obligatoires — correctement connectés par SequenceFlow
6. Tous les éléments connectés (aucun élément isolé)
7. IDs uniques préfixés "mta_"
8. Section bpmndi complète avec positions x,y réalistes pour le rendu graphique
9. Format : <?xml version="1.0" encoding="UTF-8"?><bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" xmlns:di="http://www.omg.org/spec/DD/20100524/DI" targetNamespace="http://movetoai.io/bpmn">...</bpmn:definitions>

Réponds UNIQUEMENT avec le XML BPMN 2.0, sans aucun texte avant ou après.`;

    const userPrompt = `PROCESSUS : ${process.name}
DOMAINE : ${process.description ? `${process.description.slice(0, 200)}...` : "Non renseigné"}
FRÉQUENCE : ${process.frequency ?? "Non renseigné"}
EFFORT MANUEL : ${process.manualEffortH ?? "?"}h/semaine
PROPRIÉTAIRE : ${process.owner?.name ?? "Non assigné"}

ÉTAPES DÉFINIES :
${process.steps.length > 0
  ? process.steps.map((s, i) =>
      `${i + 1}. [${s.actor}] ${s.name}${s.tool ? ` (outil: ${s.tool})` : ""}${s.durationMin ? ` — ${s.durationMin}min` : ""}${s.automatable ? " [AUTOMATISABLE]" : ""}`
    ).join("\n")
  : "Aucune étape définie — génère un flux logique standard pour ce type de processus."
}`;

    const response = await llmRouter.complete({
      task:         "bpmn_generate",
      system:       systemPrompt,
      prompt:       userPrompt,
      max_tokens:   4000,
      temperature:  0.1,
      workspace_id: workspace.id,
    });

    // Extraire le XML
    let xml = response.content?.trim() ?? "";
    const start = xml.indexOf("<?xml");
    const end   = xml.lastIndexOf("</bpmn:definitions>") + "</bpmn:definitions>".length;
    if (start !== -1 && end > start) xml = xml.slice(start, end);

    if (!xml.includes("bpmn:definitions") || !xml.includes("bpmn:process")) {
      return NextResponse.json({ error: "BPMN invalide généré — réessayez" }, { status: 422 });
    }

    // Sauvegarder
    const existing = await prisma.processDiagram.findUnique({ where: { processId: id } });

    if (existing) {
      await prisma.processDiagram.update({
        where: { id: existing.id },
        data:  {
          xml,
          versionCount:     { increment: 1 },
          validationStatus: "draft",
          updatedBy:        session.user.id,
        },
      });
      await prisma.processDiagramVersion.create({
        data: {
          diagramId:     existing.id,
          versionNumber: existing.versionCount + 1,
          xml,
          changeSummary: "BPMN généré automatiquement par Aria",
          createdBy:     session.user.id,
        },
      });
    } else {
      const created = await prisma.processDiagram.create({
        data: {
          processId:        id,
          xml,
          versionCount:     1,
          validationStatus: "draft",
          createdBy:        session.user.id,
          updatedBy:        session.user.id,
        },
      });
      await prisma.processDiagramVersion.create({
        data: {
          diagramId:     created.id,
          versionNumber: 1,
          xml,
          changeSummary: "BPMN initial généré par Aria",
          createdBy:     session.user.id,
        },
      });
    }

    // Historique
    await prisma.processHistory.create({
      data: {
        processId:   id,
        userId:      session.user.id,
        action:      "bpmn_generated",
        description: "Diagramme BPMN 2.0 généré automatiquement par Aria",
      },
    }).catch(() => {});

    return NextResponse.json({ xml, success: true });

  } catch (err) {
    console.error("[bpmn/generate]", err);
    return NextResponse.json({ error: "Erreur lors de la génération" }, { status: 500 });
  }
}
