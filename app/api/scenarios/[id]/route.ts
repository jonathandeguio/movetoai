export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getCurrentWorkspaceContext } from "@/server/auth";

// ── Zod schemas ───────────────────────────────────────────────────────────────

const ScenarioItemSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1),
  investmentEuros: z.number().min(0),
  expectedGainEuros: z.number().min(0),
  timelineMonths: z.number().int().min(1),
  effort: z.enum(["low", "medium", "high"]),
  opportunityId: z.string().optional(),
});

const ScenarioPatchSchema = z.object({
  title: z.string().min(2).max(120).optional(),
  description: z.string().optional(),
  status: z.enum(["draft", "active", "archived"]).optional(),
  items: z.array(ScenarioItemSchema).optional(),
});

type RouteContext = { params: Promise<{ id: string }> };

// ── Helpers ───────────────────────────────────────────────────────────────────

function computeTotals(items: z.infer<typeof ScenarioItemSchema>[]) {
  const totalInvestment = items.reduce((acc, i) => acc + i.investmentEuros, 0);
  const totalExpectedGain = items.reduce((acc, i) => acc + i.expectedGainEuros, 0);
  const roi =
    totalInvestment > 0
      ? ((totalExpectedGain - totalInvestment) / totalInvestment) * 100
      : null;
  return { totalInvestment, totalExpectedGain, roi };
}

// ── GET /api/scenarios/[id] ───────────────────────────────────────────────────

export async function GET(_req: Request, { params }: RouteContext) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { workspace } = await getCurrentWorkspaceContext({ requireMembership: true });
  if (!workspace?.id) return NextResponse.json({ error: "No workspace" }, { status: 403 });

  const scenario = await prisma.scenario.findFirst({
    where: { id, workspaceId: workspace.id, deletedAt: null },
  });

  if (!scenario) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json(scenario);
}

// ── PATCH /api/scenarios/[id] ─────────────────────────────────────────────────

export async function PATCH(request: Request, { params }: RouteContext) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { workspace } = await getCurrentWorkspaceContext({ requireMembership: true });
  if (!workspace?.id) return NextResponse.json({ error: "No workspace" }, { status: 403 });

  const existing = await prisma.scenario.findFirst({
    where: { id, workspaceId: workspace.id, deletedAt: null },
  });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = ScenarioPatchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation error", issues: parsed.error.issues }, { status: 422 });
  }

  const updateData: Record<string, unknown> = {};
  if (parsed.data.title !== undefined) updateData.title = parsed.data.title;
  if (parsed.data.description !== undefined) updateData.description = parsed.data.description;
  if (parsed.data.status !== undefined) updateData.status = parsed.data.status;

  if (parsed.data.items !== undefined) {
    const { totalInvestment, totalExpectedGain, roi } = computeTotals(parsed.data.items);
    updateData.items = parsed.data.items as object[];
    updateData.totalInvestment = totalInvestment;
    updateData.totalExpectedGain = totalExpectedGain;
    updateData.roi = roi ?? null;
  }

  const updated = await prisma.scenario.update({
    where: { id },
    data: updateData,
  });

  return NextResponse.json(updated);
}

// ── DELETE /api/scenarios/[id] (soft delete) ──────────────────────────────────

export async function DELETE(_req: Request, { params }: RouteContext) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { workspace } = await getCurrentWorkspaceContext({ requireMembership: true });
  if (!workspace?.id) return NextResponse.json({ error: "No workspace" }, { status: 403 });

  const existing = await prisma.scenario.findFirst({
    where: { id, workspaceId: workspace.id, deletedAt: null },
  });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.scenario.update({
    where: { id },
    data: { deletedAt: new Date() },
  });

  return NextResponse.json({ success: true });
}
