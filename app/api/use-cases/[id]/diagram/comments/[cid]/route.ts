export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type RouteContext = { params: Promise<{ id: string; cid: string }> };

export async function PATCH(req: Request, { params }: RouteContext) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { cid } = await params;

  const existing = await prisma.diagramComment.findUnique({ where: { id: cid } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  let body: { content?: string; resolved?: boolean };
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  const updated = await prisma.diagramComment.update({
    where: { id: cid },
    data: {
      ...(body.content  !== undefined && { content: body.content.trim() }),
      ...(body.resolved !== undefined && {
        resolved:   body.resolved,
        resolvedBy: body.resolved ? session.user.id : null,
        resolvedAt: body.resolved ? new Date()       : null,
      }),
    },
    include: {
      author:  { select: { id: true, name: true, image: true } },
      replies: { include: { author: { select: { id: true, name: true, image: true } } } },
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(_req: Request, { params }: RouteContext) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { cid } = await params;

  const existing = await prisma.diagramComment.findUnique({ where: { id: cid } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (existing.authorId !== session.user.id)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await prisma.diagramComment.delete({ where: { id: cid } });
  return NextResponse.json({ success: true });
}
