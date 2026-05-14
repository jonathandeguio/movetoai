export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getCurrentWorkspaceContext } from "@/server/auth";

type RouteContext = { params: Promise<{ id: string }> };

const PatchSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  description: z.string().nullable().optional(),
  status: z.enum(["draft", "active", "closed"]).optional(),
  dueDate: z.string().nullable().optional(),
});

// ── GET /api/surveys/[id] ─────────────────────────────────────────────────────

export async function GET(_req: Request, { params }: RouteContext) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { workspace } = await getCurrentWorkspaceContext({ requireMembership: true });
  if (!workspace?.id) return NextResponse.json({ error: "No workspace" }, { status: 403 });

  const survey = await prisma.survey.findFirst({
    where: { id, workspaceId: workspace.id, deletedAt: null },
    include: {
      questions: { orderBy: { order: "asc" } },
      _count: { select: { responses: true } },
    },
  });

  if (!survey) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json(survey);
}

// ── PATCH /api/surveys/[id] ───────────────────────────────────────────────────

export async function PATCH(request: Request, { params }: RouteContext) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { workspace } = await getCurrentWorkspaceContext({ requireMembership: true });
  if (!workspace?.id) return NextResponse.json({ error: "No workspace" }, { status: 403 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = PatchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation error", issues: parsed.error.issues }, { status: 422 });
  }

  const d = parsed.data;
  const upd: Record<string, unknown> = {};
  if (d.title !== undefined) upd.title = d.title;
  if (d.description !== undefined) upd.description = d.description;
  if (d.status !== undefined) upd.status = d.status;
  if (d.dueDate !== undefined) upd.dueDate = d.dueDate ? new Date(d.dueDate) : null;

  const survey = await prisma.survey.update({
    where: { id, workspaceId: workspace.id },
    data: upd,
    select: { id: true, title: true, status: true, updatedAt: true },
  });

  return NextResponse.json(survey);
}

// ── DELETE /api/surveys/[id] ──────────────────────────────────────────────────

export async function DELETE(_req: Request, { params }: RouteContext) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { workspace } = await getCurrentWorkspaceContext({ requireMembership: true });
  if (!workspace?.id) return NextResponse.json({ error: "No workspace" }, { status: 403 });

  const existing = await prisma.survey.findFirst({
    where: { id, workspaceId: workspace.id, deletedAt: null },
    select: { id: true },
  });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.survey.update({
    where: { id },
    data: { deletedAt: new Date() },
  });

  return new NextResponse(null, { status: 204 });
}
