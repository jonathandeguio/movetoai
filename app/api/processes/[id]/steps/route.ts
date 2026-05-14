export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getCurrentWorkspaceContext } from "@/server/auth";

type RouteContext = { params: Promise<{ id: string }> };

const CreateStepSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  order: z.number().int().min(0),
  actor: z.string().min(1).max(50),
  tool: z.string().max(200).optional(),
  durationMin: z.number().int().min(0).optional(),
  isManual: z.boolean().optional(),
  painScore: z.number().int().min(0).max(10).optional(),
  automatable: z.boolean().optional(),
});

export async function GET(_req: Request, { params }: RouteContext) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { workspace } = await getCurrentWorkspaceContext({ requireMembership: true });
  if (!workspace?.id) return NextResponse.json({ error: "No workspace" }, { status: 403 });

  // Verify process belongs to workspace
  const process = await prisma.process.findFirst({
    where: { id, workspaceId: workspace.id, deletedAt: null },
    select: { id: true },
  });
  if (!process) return NextResponse.json({ error: "Process not found" }, { status: 404 });

  const steps = await prisma.processStep.findMany({
    where: { processId: id },
    orderBy: { order: "asc" },
  });

  return NextResponse.json({ items: steps, total: steps.length });
}

export async function POST(request: Request, { params }: RouteContext) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
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

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = CreateStepSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation error", issues: parsed.error.issues }, { status: 422 });
  }

  const d = parsed.data;

  const step = await prisma.processStep.create({
    data: {
      processId: id,
      name: d.name,
      description: d.description ?? null,
      order: d.order,
      actor: d.actor,
      tool: d.tool ?? null,
      durationMin: d.durationMin ?? null,
      isManual: d.isManual ?? true,
      painScore: d.painScore ?? null,
      automatable: d.automatable ?? false,
    },
  });

  return NextResponse.json(step, { status: 201 });
}
