export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getCurrentWorkspaceContext } from "@/server/auth";

type RouteContext = { params: Promise<{ id: string }> };

const DEFAULT_BPMN = `<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions
  xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL"
  xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI"
  xmlns:dc="http://www.omg.org/spec/DD/20100524/DC"
  xmlns:di="http://www.omg.org/spec/DD/20100524/DI"
  id="Definitions_1"
  targetNamespace="http://bpmn.io/schema/bpmn">
  <bpmn:process id="Process_1" isExecutable="false">
    <bpmn:startEvent id="StartEvent_1" name="Début" />
    <bpmn:task id="Task_1" name="Étape 1" />
    <bpmn:endEvent id="EndEvent_1" name="Fin" />
    <bpmn:sequenceFlow id="Flow_1" sourceRef="StartEvent_1" targetRef="Task_1" />
    <bpmn:sequenceFlow id="Flow_2" sourceRef="Task_1" targetRef="EndEvent_1" />
  </bpmn:process>
  <bpmndi:BPMNDiagram id="BPMNDiagram_1">
    <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process_1">
      <bpmndi:BPMNShape id="StartEvent_1_di" bpmnElement="StartEvent_1">
        <dc:Bounds x="152" y="82" width="36" height="36" />
        <bpmndi:BPMNLabel><dc:Bounds x="145" y="125" width="50" height="14" /></bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_1_di" bpmnElement="Task_1">
        <dc:Bounds x="250" y="60" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="EndEvent_1_di" bpmnElement="EndEvent_1">
        <dc:Bounds x="412" y="82" width="36" height="36" />
        <bpmndi:BPMNLabel><dc:Bounds x="406" y="125" width="48" height="14" /></bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNEdge id="Flow_1_di" bpmnElement="Flow_1">
        <di:waypoint x="188" y="100" /><di:waypoint x="250" y="100" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_2_di" bpmnElement="Flow_2">
        <di:waypoint x="350" y="100" /><di:waypoint x="412" y="100" />
      </bpmndi:BPMNEdge>
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</bpmn:definitions>`;

export async function GET(_req: Request, { params }: RouteContext) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { workspace } = await getCurrentWorkspaceContext({ requireMembership: true });

  // Verify process belongs to this workspace
  const process = await prisma.process.findFirst({
    where: { id, workspaceId: workspace?.id, deletedAt: null },
    select: { id: true, name: true },
  });
  if (!process) return NextResponse.json({ error: "Process not found" }, { status: 404 });

  const diagram = await prisma.processDiagram.findUnique({
    where: { processId: id },
  });

  if (diagram) {
    return NextResponse.json({
      xml:       diagram.xml,
      version:   diagram.versionCount,
      updatedAt: diagram.updatedAt,
      isNew:     false,
    });
  }

  // Return default template — don't persist yet (let first save do it)
  return NextResponse.json({
    xml:     DEFAULT_BPMN,
    version: 0,
    isNew:   true,
  });
}

export async function PUT(req: Request, { params }: RouteContext) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { workspace } = await getCurrentWorkspaceContext({ requireMembership: true });

  const process = await prisma.process.findFirst({
    where: { id, workspaceId: workspace?.id, deletedAt: null },
    select: { id: true },
  });
  if (!process) return NextResponse.json({ error: "Process not found" }, { status: 404 });

  let body: { xml?: string; svg?: string; changeSummary?: string };
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  const { xml, svg, changeSummary } = body;
  if (!xml?.includes("bpmn:definitions"))
    return NextResponse.json({ error: "XML BPMN invalide" }, { status: 400 });

  const diagram = await prisma.processDiagram.upsert({
    where:  { processId: id },
    create: {
      processId:    id,
      xml,
      svg:          svg ?? null,
      createdBy:    session.user.id,
      updatedBy:    session.user.id,
      versionCount: 1,
    },
    update: {
      xml,
      svg:          svg ?? null,
      updatedBy:    session.user.id,
      versionCount: { increment: 1 },
    },
  });

  await prisma.processDiagramVersion.create({
    data: {
      diagramId:     diagram.id,
      versionNumber: diagram.versionCount,
      xml,
      svg:           svg ?? null,
      changeSummary: changeSummary ?? `Version ${diagram.versionCount}`,
      createdBy:     session.user.id,
    },
  });

  return NextResponse.json({
    success:   true,
    version:   diagram.versionCount,
    updatedAt: new Date().toISOString(),
  });
}
