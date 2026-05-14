export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getCurrentWorkspaceContext } from "@/server/auth";
import { canConvertToUseCase } from "@/lib/permissions/opportunities";

const UseCaseSchema = z.object({
  title: z.string().min(5).max(120),
  processDescription: z.string().min(20),
  expectedOutcome: z.string().min(10),
  solutionType: z.enum(["automation", "assistant", "analysis", "generation"]),
  solutionDescription: z.string().optional(),
  processSteps: z.array(z.string()).optional(),
  kpis: z.array(z.object({
    label: z.string(),
    baseline: z.string(),
    target: z.string(),
    unit: z.string(),
  })),
  roiEstimated: z.object({
    savings_hours_per_month: z.number(),
    savings_euros_per_year: z.number(),
    payback_months: z.number(),
    assumptions: z.string(),
  }),
  effortDays: z.number().int().min(0),
  effortBreakdown: z.object({
    design: z.number(),
    development: z.number(),
    testing: z.number(),
    deployment: z.number(),
  }).optional(),
  dataRequired: z.array(z.object({
    source: z.string(),
    type: z.string(),
    available: z.boolean(),
  })),
  risks: z.array(z.object({
    description: z.string(),
    mitigation: z.string(),
    level: z.enum(["low", "medium", "high"]),
  })),
  recommendedTools: z.array(z.string()).optional(),
  nextSteps: z.array(z.string()).optional(),
  priorityLevel: z.enum(["P0", "P1", "P2"]).optional(),
  assignedTo: z.string().cuid().optional(),
  technicalOwner: z.string().cuid().optional(),
  constraints: z.string().optional(),
  submitForValidation: z.boolean().optional(),
});

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: RouteContext) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: opportunityId } = await params;
  const { workspace, role } = await getCurrentWorkspaceContext({ requireMembership: true });

  if (!canConvertToUseCase(role?.code ?? "")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const opp = await prisma.opportunity.findFirst({
    where: { id: opportunityId, workspaceId: workspace?.id, deletedAt: null },
    select: { status: true, useCaseId: true, domainLabel: true },
  });

  if (!opp) return NextResponse.json({ error: "Opportunity not found" }, { status: 404 });
  if (opp.status !== "VALIDATED") {
    return NextResponse.json({ error: "Opportunity must be VALIDATED before conversion" }, { status: 422 });
  }
  if (opp.useCaseId) {
    return NextResponse.json({ error: "Already converted", useCaseId: opp.useCaseId }, { status: 409 });
  }

  let body: unknown;
  try { body = await request.json(); }
  catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  const parsed = UseCaseSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation error", issues: parsed.error.issues }, { status: 422 });
  }

  const d = parsed.data;

  const [useCase] = await prisma.$transaction([
    prisma.useCase.create({
      data: {
        workspaceId: workspace!.id,
        opportunityId,
        title: d.title,
        processDescription: d.processDescription,
        expectedOutcome: d.expectedOutcome,
        solutionType: d.solutionType,
        solutionDescription: d.solutionDescription,
        processSteps: d.processSteps ?? [],
        kpis: d.kpis,
        roiEstimated: d.roiEstimated,
        effortDays: d.effortDays,
        effortBreakdown: d.effortBreakdown ?? {},
        dataRequired: d.dataRequired,
        risks: d.risks,
        recommendedTools: d.recommendedTools ?? [],
        nextSteps: d.nextSteps ?? [],
        priorityLevel: d.priorityLevel ?? "P2",
        status: d.submitForValidation ? "analysis" : "backlog",
        assignedTo: d.assignedTo,
        technicalOwner: d.technicalOwner,
        constraints: d.constraints,
      },
    }),
    prisma.opportunity.update({
      where: { id: opportunityId },
      data: { status: "CONVERTED" },
    }),
  ]);

  return NextResponse.json({ id: useCase.id }, { status: 201 });
}
