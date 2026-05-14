export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type RouteContext = { params: Promise<{ id: string; aid: string }> };

export async function PATCH(req: Request, { params }: RouteContext) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { aid } = await params;

  const existing = await prisma.diagramTaskAssignment.findUnique({ where: { id: aid } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  let body: { status?: string; notes?: string; role?: string; dueDate?: string | null };
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  const updated = await prisma.diagramTaskAssignment.update({
    where: { id: aid },
    data: {
      ...(body.status  !== undefined && { status: body.status }),
      ...(body.notes   !== undefined && { notes: body.notes }),
      ...(body.role    !== undefined && { role: body.role }),
      ...(body.dueDate !== undefined && {
        dueDate: body.dueDate ? new Date(body.dueDate) : null,
      }),
    },
    include: {
      assignee: { select: { id: true, name: true, email: true, image: true } },
      assigner: { select: { id: true, name: true } },
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(_req: Request, { params }: RouteContext) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { aid } = await params;

  const existing = await prisma.diagramTaskAssignment.findUnique({ where: { id: aid } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.diagramTaskAssignment.delete({ where: { id: aid } });
  return NextResponse.json({ success: true });
}
