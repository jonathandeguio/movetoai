export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { getCurrentWorkspaceContext } from "@/server/auth";
import { prisma } from "@/lib/prisma";

interface AppData {
  id: string;
  name: string;
  vendor: string | null;
  lifecycleState: string | null;
  criticality: string | null;
  annualCost: number | null;
  userCount: number | null;
  aiReadinessScore: number | null;
  _count: { capabilities: number; processes: number };
}

// Technical Debt (0-100): higher = more debt
function computeTechDebt(app: AppData): number {
  const lifecycleDebt: Record<string, number> = {
    plan: 10,
    active: 20,
    tolerate: 55,
    phaseout: 80,
    retire: 95,
  };
  const base = lifecycleDebt[app.lifecycleState ?? "active"] ?? 30;
  const penalty =
    app.aiReadinessScore != null ? Math.max(0, 50 - app.aiReadinessScore) * 0.4 : 20;
  return Math.min(100, base + penalty);
}

// Business Value (0-100): higher = more value
function computeBusinessValue(app: AppData): number {
  const critScore: Record<string, number> = {
    critical: 95,
    high: 75,
    medium: 50,
    low: 25,
  };
  const base = critScore[app.criticality ?? "low"] ?? 40;
  const capBonus = Math.min(20, app._count.capabilities * 5);
  const procBonus = Math.min(15, app._count.processes * 3);
  return Math.min(100, base + capBonus + procBonus);
}

function computeQuadrant(
  businessValue: number,
  techDebt: number
): "invest" | "renovate" | "maintain" | "retire" {
  const highValue = businessValue >= 50;
  const highDebt = techDebt >= 50;
  if (highValue && !highDebt) return "invest";
  if (highValue && highDebt) return "renovate";
  if (!highValue && !highDebt) return "maintain";
  return "retire";
}

export async function GET() {
  const { workspace } = await getCurrentWorkspaceContext({ requireMembership: true });
  if (!workspace?.id) {
    return NextResponse.json({ error: "No workspace" }, { status: 400 });
  }

  const applications = await prisma.application.findMany({
    where: { workspaceId: workspace.id, deletedAt: null },
    select: {
      id: true,
      name: true,
      vendor: true,
      lifecycleState: true,
      criticality: true,
      annualCost: true,
      userCount: true,
      aiReadinessScore: true,
      _count: { select: { capabilities: true, processes: true } },
    },
  });

  const result = applications.map((app) => {
    const techDebt = computeTechDebt(app);
    const businessValue = computeBusinessValue(app);
    const quadrant = computeQuadrant(businessValue, techDebt);
    return { ...app, techDebt, businessValue, quadrant };
  });

  return NextResponse.json(result);
}
