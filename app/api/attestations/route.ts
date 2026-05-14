export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getCurrentWorkspaceContext } from "@/server/auth";

// ── Zod schemas ───────────────────────────────────────────────────────────────

const AttestationCreateSchema = z.object({
  entityType: z.enum(["application", "process", "capability"]),
  entityId: z.string().min(1),
  validUntil: z.string().optional(),
  notes: z.string().optional(),
});

// ── GET /api/attestations ─────────────────────────────────────────────────────

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { workspace } = await getCurrentWorkspaceContext({ requireMembership: true });
  if (!workspace?.id) return NextResponse.json({ error: "No workspace" }, { status: 403 });

  const { searchParams } = new URL(request.url);
  const entityTypeFilter = searchParams.get("entityType");

  const where: Record<string, unknown> = { workspaceId: workspace.id };
  if (entityTypeFilter) where.entityType = entityTypeFilter;

  const attestations = await prisma.attestation.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ items: attestations, total: attestations.length });
}

// ── POST /api/attestations ────────────────────────────────────────────────────

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

  const parsed = AttestationCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation error", issues: parsed.error.issues }, { status: 422 });
  }

  const d = parsed.data;

  const attestation = await prisma.attestation.create({
    data: {
      workspaceId: workspace.id,
      entityType: d.entityType,
      entityId: d.entityId,
      status: "attested",
      attestedById: session.user.id,
      attestedAt: new Date(),
      validUntil: d.validUntil ? new Date(d.validUntil) : null,
      notes: d.notes ?? null,
    },
    select: { id: true, entityType: true, entityId: true, status: true, attestedAt: true },
  });

  return NextResponse.json(attestation, { status: 201 });
}
