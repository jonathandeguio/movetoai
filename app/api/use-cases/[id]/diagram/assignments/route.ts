export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getCurrentWorkspaceContext } from "@/server/auth";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: RouteContext) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await getCurrentWorkspaceContext({ requireMembership: true });

  const diagram = await prisma.processDiagram.findUnique({
    where: { useCaseId: id },
    select: { id: true },
  });
  if (!diagram) return NextResponse.json([]);

  const assignments = await prisma.diagramTaskAssignment.findMany({
    where: { diagramId: diagram.id },
    orderBy: { createdAt: "asc" },
    include: {
      assignee: { select: { id: true, name: true, email: true, image: true } },
      assigner: { select: { id: true, name: true } },
    },
  });

  return NextResponse.json(assignments);
}

export async function POST(req: Request, { params }: RouteContext) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await getCurrentWorkspaceContext({ requireMembership: true });

  const diagram = await prisma.processDiagram.findUnique({
    where: { useCaseId: id },
    select: { id: true },
  });
  if (!diagram) return NextResponse.json({ error: "Diagram not found" }, { status: 404 });

  let body: { elementId?: string; assigneeId?: string; role?: string; dueDate?: string; notes?: string };
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  if (!body.elementId || !body.assigneeId)
    return NextResponse.json({ error: "elementId and assigneeId are required" }, { status: 400 });

  const assignment = await prisma.diagramTaskAssignment.upsert({
    where: {
      diagramId_elementId_assigneeId: {
        diagramId:  diagram.id,
        elementId:  body.elementId,
        assigneeId: body.assigneeId,
      },
    },
    create: {
      diagramId:  diagram.id,
      elementId:  body.elementId,
      assigneeId: body.assigneeId,
      assignedBy: session.user.id,
      role:       body.role    ?? null,
      dueDate:    body.dueDate ? new Date(body.dueDate) : null,
      notes:      body.notes   ?? null,
    },
    update: {
      role:    body.role    ?? null,
      dueDate: body.dueDate ? new Date(body.dueDate) : null,
      notes:   body.notes   ?? null,
    },
    include: {
      assignee: { select: { id: true, name: true, email: true, image: true } },
      assigner: { select: { id: true, name: true } },
    },
  });

  return NextResponse.json(assignment, { status: 201 });
}
