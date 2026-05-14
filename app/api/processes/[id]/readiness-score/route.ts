export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getCurrentWorkspaceContext } from "@/server/auth";
import { scoreProcess } from "@/lib/ai/readiness-scorer";

type RouteContext = { params: Promise<{ id: string }> };

const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

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

  // Return cached assessment if it is less than 24 hours old
  const cached = await prisma.aIReadinessAssessment.findFirst({
    where: { entityType: "process", entityId: id, workspaceId: workspace.id },
    orderBy: { assessedAt: "desc" },
  });

  if (cached) {
    const age = Date.now() - cached.assessedAt.getTime();
    if (age < CACHE_TTL_MS) {
      return NextResponse.json({
        overallScore: cached.overallScore,
        classification: cached.classification,
        breakdown: cached.breakdown,
        recommendations: cached.recommendations,
        cachedAt: cached.assessedAt,
      });
    }
  }

  try {
    const result = await scoreProcess(id, workspace.id);
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Scoring failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
