export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { z } from "zod";
import type { Prisma } from "@prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getCurrentWorkspaceContext } from "@/server/auth";
import { canEditUseCase, canEditTechnicalSection } from "@/lib/permissions/opportunities";

type RouteContext = { params: Promise<{ id: string }> };

const PatchSchema = z.object({
  title: z.string().min(5).max(120).optional(),
  solutionType: z.enum(["automation", "assistant", "analysis", "generation"]).optional(),
  solutionDescription: z.string().optional(),
  processSteps: z.array(z.string()).optional(),
  kpis: z.array(z.any()).optional(),
  roiEstimated: z.record(z.unknown()).optional(),
  effortDays: z.number().int().min(0).optional(),
  effortBreakdown: z.record(z.number()).optional(),
  dataRequired: z.array(z.any()).optional(),
  risks: z.array(z.any()).optional(),
  recommendedTools: z.array(z.string()).optional(),
  nextSteps: z.array(z.string()).optional(),
  priorityLevel: z.enum(["P0", "P1", "P2"]).optional(),
  status: z.enum(["backlog", "analysis", "active", "deployed", "paused"]).optional(),
  assignedTo: z.string().cuid().nullable().optional(),
  technicalOwner: z.string().cuid().nullable().optional(),
  consultantId: z.string().cuid().nullable().optional(),
  constraints: z.string().optional(),
  // Post-deployment
  realKpis: z.array(z.any()).optional(),
  realRoiAnalysis: z.string().optional(),
});

export async function GET(_req: Request, { params }: RouteContext) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { workspace } = await getCurrentWorkspaceContext({ requireMembership: true });

  const useCase = await prisma.useCase.findFirst({
    where: { id, workspaceId: workspace?.id, deletedAt: null },
    include: {
      opportunity: {
        select: { id: true, title: true, domainLabel: true, gainEstimate: true, status: true },
      },
    },
  });

  if (!useCase) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(useCase);
}

export async function PATCH(request: Request, { params }: RouteContext) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { workspace, role } = await getCurrentWorkspaceContext({ requireMembership: true });

  if (!canEditUseCase(role?.code ?? "") && !canEditTechnicalSection(role?.code ?? "")) {
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

  const updateData: Prisma.UseCaseUpdateInput = {};
  if (d.title !== undefined) updateData.title = d.title;
  if (d.solutionType !== undefined) updateData.solutionType = d.solutionType;
  if (d.solutionDescription !== undefined) updateData.solutionDescription = d.solutionDescription;
  if (d.processSteps !== undefined) updateData.processSteps = d.processSteps;
  if (d.kpis !== undefined) updateData.kpis = d.kpis;
  if (d.roiEstimated !== undefined) updateData.roiEstimated = d.roiEstimated as Prisma.InputJsonValue;
  if (d.effortDays !== undefined) updateData.effortDays = d.effortDays;
  if (d.effortBreakdown !== undefined) updateData.effortBreakdown = d.effortBreakdown as Prisma.InputJsonValue;
  if (d.dataRequired !== undefined) updateData.dataRequired = d.dataRequired;
  if (d.risks !== undefined) updateData.risks = d.risks;
  if (d.recommendedTools !== undefined) updateData.recommendedTools = d.recommendedTools;
  if (d.nextSteps !== undefined) updateData.nextSteps = d.nextSteps;
  if (d.priorityLevel !== undefined) updateData.priorityLevel = d.priorityLevel;
  if (d.status !== undefined) {
    updateData.status = d.status;
    if (d.status === "deployed") updateData.deployedAt = new Date();
  }
  if (d.assignedTo !== undefined) updateData.assignedTo = d.assignedTo;
  if (d.technicalOwner !== undefined) updateData.technicalOwner = d.technicalOwner;
  if (d.consultantId !== undefined) updateData.consultantId = d.consultantId;
  if (d.constraints !== undefined) updateData.constraints = d.constraints;
  if (d.realKpis !== undefined) updateData.realKpis = d.realKpis;
  if (d.realRoiAnalysis !== undefined) updateData.realRoiAnalysis = d.realRoiAnalysis;

  const useCase = await prisma.useCase.update({
    where: { id, workspaceId: workspace?.id },
    data: updateData,
    select: { id: true, updatedAt: true, status: true },
  });

  return NextResponse.json(useCase);
}

export async function DELETE(_req: Request, { params }: RouteContext) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { workspace, role } = await getCurrentWorkspaceContext({ requireMembership: true });

  // Only admins and portfolio managers can delete
  if (!["WORKSPACE_ADMIN", "ENTERPRISE_ARCHITECT", "TRANSFORMATION_MANAGER"].includes(role?.code ?? "")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Check it exists and belongs to workspace
  const useCase = await prisma.useCase.findFirst({
    where: { id, workspaceId: workspace?.id, deletedAt: null },
    select: { id: true, opportunityId: true },
  });
  if (!useCase) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Soft delete + clear Opportunity.useCaseId in transaction
  await prisma.$transaction([
    prisma.useCase.update({
      where: { id },
      data: { deletedAt: new Date() },
    }),
    prisma.opportunity.update({
      where: { id: useCase.opportunityId },
      data: { useCaseId: null },
    }),
  ]);

  return new NextResponse(null, { status: 204 });
}
