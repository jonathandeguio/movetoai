export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getCurrentWorkspaceContext } from "@/server/auth";
import { canCreateOpportunity, canReadOpportunities } from "@/lib/permissions/opportunities";

// ── Zod schemas ───────────────────────────────────────────────────────────────

const OpportunityCreateSchema = z.object({
  title: z.string().min(5).max(80),
  domain: z.enum(["Finance", "RH", "Commercial", "Marketing", "Ops", "Support", "Juridique", "Achats", "IT"]),
  description: z.string().min(30),
  gain_estimate: z.string().max(255).optional(),
  complexity: z.enum(["low", "medium", "high"]),
  priority: z.enum(["P0", "P1", "P2"]),
  detected_by: z.enum(["ai", "manual", "terrain"]),
  source_text: z.string().optional(),
  assigned_to: z.string().cuid().optional(),
});

const FilterSchema = z.object({
  search: z.string().optional(),
  domain: z.string().optional(),
  status: z.string().optional(),
  priority: z.string().optional(),
  detectedBy: z.string().optional(),
  sort: z.enum(["created_at", "priority", "gain_estimate", "complexity"]).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});

// ── GET /api/opportunities ────────────────────────────────────────────────────

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { workspace, role } = await getCurrentWorkspaceContext({ requireMembership: true });
  if (!workspace?.id) return NextResponse.json({ error: "No workspace" }, { status: 403 });

  if (!canReadOpportunities(role?.code ?? "")) {
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
      { problemStatement: { contains: filters.search } },
      { summary: { contains: filters.search } },
    ];
  }
  if (filters.domain) where.domainLabel = filters.domain;
  if (filters.status) where.status = filters.status.toUpperCase();
  if (filters.priority) where.priorityLevel = filters.priority;
  if (filters.detectedBy) where.detectedBy = filters.detectedBy;

  const orderBy: Record<string, string> = {};
  switch (filters.sort) {
    case "priority":   orderBy.priorityLevel = "asc"; break;
    case "complexity": orderBy.complexity = "asc"; break;
    default:           orderBy.createdAt = "desc";
  }

  const skip = (filters.page - 1) * filters.limit;
  const [items, total] = await Promise.all([
    prisma.opportunity.findMany({
      where,
      orderBy,
      skip,
      take: filters.limit,
      select: {
        id: true,
        title: true,
        domainLabel: true,
        status: true,
        detectedBy: true,
        gainEstimate: true,
        complexity: true,
        priorityLevel: true,
        createdAt: true,
        updatedAt: true,
        ownerId: true,
        useCaseId: true,
        rejectionReason: true,
        owner: { select: { name: true, email: true } },
        useCase: { select: { id: true, status: true } },
      },
    }),
    prisma.opportunity.count({ where }),
  ]);

  return NextResponse.json({ items, total, page: filters.page, limit: filters.limit });
}

// ── POST /api/opportunities ───────────────────────────────────────────────────

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { workspace, role } = await getCurrentWorkspaceContext({ requireMembership: true });
  if (!workspace?.id) return NextResponse.json({ error: "No workspace" }, { status: 403 });

  if (!canCreateOpportunity(role?.code ?? "")) {
    return NextResponse.json({ error: "Forbidden — insufficient permissions" }, { status: 403 });
  }

  let body: unknown;
  try { body = await request.json(); }
  catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  const parsed = OpportunityCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation error", issues: parsed.error.issues }, { status: 422 });
  }

  const d = parsed.data;

  // We need a valid opportunityType and domain FK for the existing schema.
  // Find or create a system "intake" opportunity type.
  let oppType = await prisma.opportunityType.findFirst({
    where: { workspaceId: workspace.id, code: "intake" },
  });
  if (!oppType) {
    oppType = await prisma.opportunityType.create({
      data: {
        workspaceId: workspace.id,
        code: "intake",
        isSystem: true,
        label: "Intake",
        description: "Created via intake form",
        labelTranslations: {},
        descriptionTranslations: {},
      },
    });
  }

  // Find the domain FK — use first available or skip required FK by using a fallback
  // The schema requires domainId — find a matching domain or the first workspace domain
  let domainRecord = await prisma.domain.findFirst({
    where: { workspaceId: workspace.id, name: { contains: d.domain } },
  });
  if (!domainRecord) {
    domainRecord = await prisma.domain.findFirst({
      where: { workspaceId: workspace.id },
    });
  }

  // Capability + Process are also required — find workspace defaults
  const capability = await prisma.capability.findFirst({ where: { workspaceId: workspace.id } });
  const process = await prisma.process.findFirst({ where: { workspaceId: workspace.id } });

  if (!domainRecord || !capability || !process) {
    return NextResponse.json(
      { error: "Workspace structure incomplète — domaine/capacité/processus requis" },
      { status: 422 }
    );
  }

  const opportunity = await prisma.opportunity.create({
    data: {
      workspaceId: workspace.id,
      title: d.title,
      problemStatement: d.description,
      summary: d.description.slice(0, 500),
      domainLabel: d.domain,
      detectedBy: d.detected_by,
      sourceText: d.source_text,
      gainEstimate: d.gain_estimate,
      complexity: d.complexity,
      priorityLevel: d.priority,
      status: "DRAFT",
      opportunityTypeId: oppType.id,
      domainId: domainRecord.id,
      capabilityId: capability.id,
      processId: process.id,
      createdById: session.user.id,
      ownerId: d.assigned_to ?? null,
    },
  });

  return NextResponse.json({ id: opportunity.id }, { status: 201 });
}
