export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getCurrentWorkspaceContext } from "@/server/auth";
import { canReadUseCases, canConvertToUseCase } from "@/lib/permissions/opportunities";

const FilterSchema = z.object({
  search: z.string().optional(),
  status: z.string().optional(),
  priority: z.string().optional(),
  assignedTo: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { workspace, role } = await getCurrentWorkspaceContext({ requireMembership: true });
  if (!workspace?.id) return NextResponse.json({ error: "No workspace" }, { status: 403 });

  if (!canReadUseCases(role?.code ?? "")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const filters = FilterSchema.parse(Object.fromEntries(searchParams));

  const where: Record<string, unknown> = {
    workspaceId: workspace.id,
    deletedAt: null,
  };

  if (filters.search) {
    where.OR = [
      { title: { contains: filters.search } },
      { processDescription: { contains: filters.search } },
    ];
  }
  if (filters.status) where.status = filters.status;
  if (filters.priority) where.priorityLevel = filters.priority;
  if (filters.assignedTo) where.assignedTo = filters.assignedTo;

  const skip = (filters.page - 1) * filters.limit;

  const [items, total] = await Promise.all([
    prisma.useCase.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: filters.limit,
      select: {
        id: true,
        title: true,
        solutionType: true,
        status: true,
        priorityLevel: true,
        effortDays: true,
        roiEstimated: true,
        assignedTo: true,
        technicalOwner: true,
        createdAt: true,
        updatedAt: true,
        opportunity: {
          select: { id: true, title: true, domainLabel: true, gainEstimate: true },
        },
      },
    }),
    prisma.useCase.count({ where }),
  ]);

  return NextResponse.json({ items, total, page: filters.page, limit: filters.limit });
}

const CreateUseCaseSchema = z.object({
  opportunityId: z.string().cuid(),
  title: z.string().min(5).max(120),
  solutionType: z.enum(["automation", "assistant", "analysis", "generation"]),
  solutionDescription: z.string().optional(),
  priorityLevel: z.enum(["P0", "P1", "P2"]).default("P1"),
  effortDays: z.number().int().min(0).optional(),
  assignedTo: z.string().cuid().nullable().optional(),
  technicalOwner: z.string().cuid().nullable().optional(),
  consultantId: z.string().cuid().nullable().optional(),
});

export async function POST(request: Request) {
  // 1. Auth check
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  // 2. Workspace context
  const { workspace, role } = await getCurrentWorkspaceContext({ requireMembership: true });
  if (!workspace?.id) return NextResponse.json({ error: "No workspace" }, { status: 403 });
  // 3. Permission check
  if (!canConvertToUseCase(role?.code ?? "")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  // 4. Parse body
  let body: unknown;
  try { body = await request.json(); }
  catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }
  const parsed = CreateUseCaseSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation error", issues: parsed.error.issues }, { status: 422 });
  }
  const d = parsed.data;
  // 5. Check opportunity exists, belongs to workspace, is CONVERTED, and has no useCase yet
  const opportunity = await prisma.opportunity.findFirst({
    where: { id: d.opportunityId, workspaceId: workspace.id, status: "CONVERTED", deletedAt: null },
  });
  if (!opportunity) {
    return NextResponse.json({ error: "Opportunity not found or not convertible" }, { status: 404 });
  }
  if (opportunity.useCaseId) {
    return NextResponse.json({ error: "This opportunity already has a use case" }, { status: 409 });
  }
  // 6. Create UseCase + update Opportunity.useCaseId in a transaction
  const useCase = await prisma.$transaction(async (tx) => {
    const uc = await tx.useCase.create({
      data: {
        workspaceId: workspace.id,
        opportunityId: d.opportunityId,
        title: d.title,
        solutionType: d.solutionType,
        solutionDescription: d.solutionDescription ?? null,
        priorityLevel: d.priorityLevel,
        effortDays: d.effortDays ?? null,
        assignedTo: d.assignedTo ?? null,
        technicalOwner: d.technicalOwner ?? null,
        consultantId: d.consultantId ?? null,
        status: "backlog",
      },
      select: { id: true, title: true, status: true, createdAt: true },
    });
    await tx.opportunity.update({
      where: { id: d.opportunityId },
      data: { useCaseId: uc.id },
    });
    return uc;
  });
  return NextResponse.json(useCase, { status: 201 });
}
