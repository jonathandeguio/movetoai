export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getCurrentWorkspaceContext } from "@/server/auth";
import { generateInitialBpmn } from "@/lib/bpmn/generate-initial";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: RouteContext) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const { workspace } = await getCurrentWorkspaceContext({ requireMembership: true });

  const diagram = await prisma.processDiagram.findUnique({
    where: { useCaseId: id },
  });

  if (diagram) {
    return NextResponse.json({
      xml:       diagram.xml,
      version:   diagram.versionCount,
      updatedAt: diagram.updatedAt,
      updatedBy: diagram.updatedBy,
      isNew:     false,
    });
  }

  // Generate initial XML from use case
  const useCase = await prisma.useCase.findFirst({
    where: { id, workspaceId: workspace?.id, deletedAt: null },
    select: {
      id:            true,
      title:         true,
      processSteps:  true,
      assignedTo:    true,
      technicalOwner: true,
      consultantId:  true,
    },
  });

  if (!useCase) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const initialXml = generateInitialBpmn(useCase);
  return NextResponse.json({ xml: initialXml, version: 0, isNew: true });
}

export async function PUT(req: Request, { params }: RouteContext) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const { workspace } = await getCurrentWorkspaceContext({ requireMembership: true });

  const useCase = await prisma.useCase.findFirst({
    where: { id, workspaceId: workspace?.id, deletedAt: null },
    select: { id: true },
  });
  if (!useCase) return NextResponse.json({ error: "Not found" }, { status: 404 });

  let body: { xml?: string; svg?: string; changeSummary?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { xml, svg, changeSummary } = body;
  if (!xml?.includes("bpmn:definitions")) {
    return NextResponse.json({ error: "XML BPMN invalide" }, { status: 400 });
  }

  const diagram = await prisma.processDiagram.upsert({
    where: { useCaseId: id },
    create: {
      useCaseId:    id,
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
