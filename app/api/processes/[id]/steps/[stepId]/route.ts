export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getCurrentWorkspaceContext } from "@/server/auth";

type RouteContext = { params: Promise<{ id: string; stepId: string }> };

const PatchStepSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).nullable().optional(),
  order: z.number().int().min(0).optional(),
  actor: z.string().min(1).max(50).optional(),
  tool: z.string().max(200).nullable().optional(),
  durationMin: z.number().int().min(0).nullable().optional(),
  isManual: z.boolean().optional(),
  painScore: z.number().int().min(0).max(10).nullable().optional(),
  automatable: z.boolean().optional(),
});

export async function PATCH(request: Request, { params }: RouteContext) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, stepId } = await params;
  const { workspace, role } = await getCurrentWorkspaceContext({ requireMembership: true });
  if (!workspace?.id) return NextResponse.json({ error: "No workspace" }, { status: 403 });

  const allowed = ["WORKSPACE_ADMIN", "ENTERPRISE_ARCHITECT", "TRANSFORMATION_MANAGER"];
  if (!allowed.includes(role?.code ?? "")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Verify process belongs to workspace
  const process = await prisma.process.findFirst({
    where: { id, workspaceId: workspace.id, deletedAt: null },
    select: { id: true },
  });
  if (!process) return NextResponse.json({ error: "Process not found" }, { status: 404 });

  // Verify step belongs to process
  const existingStep = await prisma.processStep.findFirst({
    where: { id: stepId, processId: id },
    select: { id: true },
  });
  if (!existingStep) return NextResponse.json({ error: "Step not found" }, { status: 404 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = PatchStepSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation error", issues: parsed.error.issues }, { status: 422 });
  }

  const d = parsed.data;
  const updateData: Record<string, unknown> = {};
  if (d.name !== undefined) updateData.name = d.name;
  if (d.description !== undefined) updateData.description = d.description;
  if (d.order !== undefined) updateData.order = d.order;
  if (d.actor !== undefined) updateData.actor = d.actor;
  if (d.tool !== undefined) updateData.tool = d.tool;
  if (d.durationMin !== undefined) updateData.durationMin = d.durationMin;
  if (d.isManual !== undefined) updateData.isManual = d.isManual;
  if (d.painScore !== undefined) updateData.painScore = d.painScore;
  if (d.automatable !== undefined) updateData.automatable = d.automatable;

  const step = await prisma.processStep.update({
    where: { id: stepId },
    data: updateData,
  });

  return NextResponse.json(step);
}

export async function DELETE(_req: Request, { params }: RouteContext) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, stepId } = await params;
  const { workspace, role } = await getCurrentWorkspaceContext({ requireMembership: true });
  if (!workspace?.id) return NextResponse.json({ error: "No workspace" }, { status: 403 });

  const allowed = ["WORKSPACE_ADMIN", "ENTERPRISE_ARCHITECT", "TRANSFORMATION_MANAGER"];
  if (!allowed.includes(role?.code ?? "")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Verify process belongs to workspace
  const process = await prisma.process.findFirst({
    where: { id, workspaceId: workspace.id, deletedAt: null },
    select: { id: true },
  });
  if (!process) return NextResponse.json({ error: "Process not found" }, { status: 404 });

  // Verify step belongs to process
  const existingStep = await prisma.processStep.findFirst({
    where: { id: stepId, processId: id },
    select: { id: true },
  });
  if (!existingStep) return NextResponse.json({ error: "Step not found" }, { status: 404 });

  await prisma.processStep.delete({ where: { id: stepId } });

  return new NextResponse(null, { status: 204 });
}
