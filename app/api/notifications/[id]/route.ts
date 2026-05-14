export const runtime = "nodejs";

import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getCurrentWorkspaceContext } from "@/server/auth";

type RouteContext = { params: Promise<{ id: string }> };

// ── PATCH /api/notifications/[id] — mark single as read ──────────────────────

export async function PATCH(_request: Request, { params }: RouteContext) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { workspace } = await getCurrentWorkspaceContext({ requireMembership: true });
  if (!workspace?.id) return NextResponse.json({ error: "No workspace" }, { status: 403 });

  const notification = await prisma.notification.findFirst({
    where: { id, workspaceId: workspace.id, userId: session.user.id },
  });
  if (!notification) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.notification.update({
    where: { id },
    data: { read: true },
  });

  return NextResponse.json({ ok: true });
}

// ── DELETE /api/notifications/[id] ───────────────────────────────────────────

export async function DELETE(_request: Request, { params }: RouteContext) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { workspace } = await getCurrentWorkspaceContext({ requireMembership: true });
  if (!workspace?.id) return NextResponse.json({ error: "No workspace" }, { status: 403 });

  const notification = await prisma.notification.findFirst({
    where: { id, workspaceId: workspace.id, userId: session.user.id },
  });
  if (!notification) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.notification.delete({ where: { id } });

  return NextResponse.json({ ok: true });
}
