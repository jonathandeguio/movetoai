export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getCurrentWorkspaceContext } from "@/server/auth";
import { canEditOpportunity } from "@/lib/permissions/opportunities";

const PatchSchema = z.object({
  title: z.string().min(5).max(80).optional(),
  description: z.string().min(30).optional(),
  domain: z.string().optional(),
  gain_estimate: z.string().max(255).optional(),
  complexity: z.enum(["low", "medium", "high"]).optional(),
  priority: z.enum(["P0", "P1", "P2"]).optional(),
  assigned_to: z.string().cuid().nullable().optional(),
});

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: RouteContext) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { workspace } = await getCurrentWorkspaceContext({ requireMembership: true });

  const opportunity = await prisma.opportunity.findFirst({
    where: { id, workspaceId: workspace?.id, deletedAt: null },
    include: {
      owner: { select: { id: true, name: true, email: true } },
      useCase: { select: { id: true, title: true, status: true, priorityLevel: true } },
    },
  });

  if (!opportunity) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(opportunity);
}

export async function PATCH(request: Request, { params }: RouteContext) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { workspace, role } = await getCurrentWorkspaceContext({ requireMembership: true });

  if (!canEditOpportunity(role?.code ?? "")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: unknown;
  try { body = await request.json(); }
  catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  const parsed = PatchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation error", issues: parsed.error.issues }, { status: 422 });
  }

  const d = parsed.data;
  const opportunity = await prisma.opportunity.update({
    where: { id, workspaceId: workspace?.id },
    data: {
      ...(d.title && { title: d.title }),
      ...(d.description && { problemStatement: d.description, summary: d.description.slice(0, 500) }),
      ...(d.domain && { domainLabel: d.domain }),
      ...(d.gain_estimate !== undefined && { gainEstimate: d.gain_estimate }),
      ...(d.complexity && { complexity: d.complexity }),
      ...(d.priority && { priorityLevel: d.priority }),
      ...(d.assigned_to !== undefined && { ownerId: d.assigned_to }),
    },
    select: { id: true, updatedAt: true },
  });

  return NextResponse.json(opportunity);
}

export async function DELETE(_req: Request, { params }: RouteContext) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { workspace, role } = await getCurrentWorkspaceContext({ requireMembership: true });

  if (!["WORKSPACE_ADMIN", "ENTERPRISE_ARCHITECT", "TRANSFORMATION_MANAGER"].includes(role?.code ?? "")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.opportunity.update({
    where: { id, workspaceId: workspace?.id },
    data: { deletedAt: new Date() },
  });

  return NextResponse.json({ ok: true });
}
