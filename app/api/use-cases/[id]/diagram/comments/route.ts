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

  const comments = await prisma.diagramComment.findMany({
    where: { diagramId: diagram.id },
    orderBy: { createdAt: "asc" },
    include: {
      author: { select: { id: true, name: true, image: true } },
      replies: {
        orderBy: { createdAt: "asc" },
        include: { author: { select: { id: true, name: true, image: true } } },
      },
    },
  });

  return NextResponse.json(comments);
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

  let body: { elementId?: string; elementType?: string; content?: string };
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  if (!body.content?.trim()) return NextResponse.json({ error: "content required" }, { status: 400 });

  const comment = await prisma.diagramComment.create({
    data: {
      diagramId:   diagram.id,
      authorId:    session.user.id,
      elementId:   body.elementId   ?? null,
      elementType: body.elementType ?? null,
      content:     body.content.trim(),
    },
    include: {
      author:  { select: { id: true, name: true, image: true } },
      replies: { include: { author: { select: { id: true, name: true, image: true } } } },
    },
  });

  return NextResponse.json(comment, { status: 201 });
}
