export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type RouteContext = { params: Promise<{ id: string; cid: string }> };

export async function POST(req: Request, { params }: RouteContext) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { cid } = await params;

  const comment = await prisma.diagramComment.findUnique({ where: { id: cid } });
  if (!comment) return NextResponse.json({ error: "Comment not found" }, { status: 404 });

  let body: { content?: string };
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  if (!body.content?.trim()) return NextResponse.json({ error: "content required" }, { status: 400 });

  const reply = await prisma.diagramCommentReply.create({
    data: {
      commentId: cid,
      authorId:  session.user.id,
      content:   body.content.trim(),
    },
    include: { author: { select: { id: true, name: true, image: true } } },
  });

  return NextResponse.json(reply, { status: 201 });
}
