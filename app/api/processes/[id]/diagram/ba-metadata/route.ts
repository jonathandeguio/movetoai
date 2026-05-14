export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getCurrentWorkspaceContext } from "@/server/auth";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, { params }: RouteContext) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await getCurrentWorkspaceContext({ requireMembership: true });

  let body: { elementId?: string; metadata?: Record<string, unknown> };
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  if (!body.elementId) return NextResponse.json({ error: "elementId required" }, { status: 400 });

  const diagram = await prisma.processDiagram.findUnique({
    where: { processId: id },
    select: { id: true, baMetadata: true },
  });
  if (!diagram) return NextResponse.json({ error: "Diagram not found" }, { status: 404 });

  const existing = (diagram.baMetadata as Record<string, unknown> | null) ?? {};
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const merged: any = { ...existing, [body.elementId]: body.metadata ?? {} };

  await prisma.processDiagram.update({ where: { id: diagram.id }, data: { baMetadata: merged } });
  return NextResponse.json({ success: true, elementId: body.elementId });
}

export async function GET(_req: Request, { params }: RouteContext) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await getCurrentWorkspaceContext({ requireMembership: true });

  const diagram = await prisma.processDiagram.findUnique({
    where: { processId: id },
    select: { baMetadata: true },
  });
  return NextResponse.json(diagram?.baMetadata ?? {});
}
