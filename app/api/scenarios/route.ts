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

const ScenarioCreateSchema = z.object({
  title: z.string().min(2).max(120),
  description: z.string().optional(),
  items: z.array(ScenarioItemSchema).optional().default([]),
});

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

// ── GET /api/scenarios ────────────────────────────────────────────────────────

export async function GET(_req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { workspace } = await getCurrentWorkspaceContext({ requireMembership: true });
  if (!workspace?.id) return NextResponse.json({ error: "No workspace" }, { status: 403 });

  const scenarios = await prisma.scenario.findMany({
    where: { workspaceId: workspace.id, deletedAt: null },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      description: true,
      status: true,
      totalInvestment: true,
      totalExpectedGain: true,
      roi: true,
      createdAt: true,
    },
  });

  return NextResponse.json({ items: scenarios, total: scenarios.length });
}

// ── POST /api/scenarios ───────────────────────────────────────────────────────

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { workspace } = await getCurrentWorkspaceContext({ requireMembership: true });
  if (!workspace?.id) return NextResponse.json({ error: "No workspace" }, { status: 403 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = ScenarioCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation error", issues: parsed.error.issues }, { status: 422 });
  }

  const { title, description, items } = parsed.data;
  const { totalInvestment, totalExpectedGain, roi } = computeTotals(items);

  const scenario = await prisma.scenario.create({
    data: {
      workspaceId: workspace.id,
      title,
      description: description ?? null,
      status: "draft",
      items: items as object[],
      totalInvestment,
      totalExpectedGain,
      roi: roi ?? null,
      createdById: session.user.id,
    },
  });

  return NextResponse.json({ id: scenario.id }, { status: 201 });
}
