export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/lib/auth";
import { resolveSessionContextForUserId } from "@/server/session-context";
import { prisma } from "@/lib/prisma";

// ── GET — list workspace certifications ──────────────────────────────────────

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ code: "UNAUTHENTICATED" }, { status: 401 });
  }

  const ctx = await resolveSessionContextForUserId(session.user.id);
  if (!ctx?.workspace?.id) {
    return NextResponse.json({ code: "NO_WORKSPACE" }, { status: 400 });
  }

  const certs = await prisma.workspaceCertification.findMany({
    where: { workspaceId: ctx.workspace.id },
    include: {
      catalog: {
        select: {
          code: true, name: true, shortName: true, family: true,
          description: true, certifyingBody: true, isMandatory: true,
          riskIfMissing: true, officialUrl: true, costEstimate: true,
          linkedProcessCodes: true, mandatorySectors: true,
          estimatedCostMin: true, estimatedCostMax: true,
          implementationMin: true, implementationMax: true,
          aiAutomationPotential: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ certifications: certs });
}

// ── POST — add a certification to workspace ───────────────────────────────────

const addSchema = z.object({
  catalogId: z.string().min(1),
  status: z.enum(["obtained", "in_progress", "planned", "not_applicable", "expired"]).default("planned"),
  obtainedDate: z.string().datetime().optional().nullable(),
  expiryDate: z.string().datetime().optional().nullable(),
  notes: z.string().optional().nullable(),
  source: z.string().default("manual"),
});

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ code: "UNAUTHENTICATED" }, { status: 401 });
  }

  const ctx = await resolveSessionContextForUserId(session.user.id);
  if (!ctx?.workspace?.id) {
    return NextResponse.json({ code: "NO_WORKSPACE" }, { status: 400 });
  }

  const body = await request.json().catch(() => null);
  const parsed = addSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ code: "INVALID_PAYLOAD", errors: parsed.error.flatten() }, { status: 400 });
  }

  const { catalogId, status, obtainedDate, expiryDate, notes, source } = parsed.data;

  // Verify catalog exists
  const catalog = await prisma.certificationCatalog.findUnique({ where: { id: catalogId } });
  if (!catalog) {
    return NextResponse.json({ code: "CATALOG_NOT_FOUND" }, { status: 404 });
  }

  const cert = await prisma.workspaceCertification.upsert({
    where: { workspaceId_catalogId: { workspaceId: ctx.workspace.id, catalogId } },
    create: {
      workspaceId: ctx.workspace.id,
      catalogId,
      status,
      obtainedDate: obtainedDate ? new Date(obtainedDate) : null,
      expiryDate: expiryDate ? new Date(expiryDate) : null,
      notes,
      source,
    },
    update: {
      status,
      obtainedDate: obtainedDate ? new Date(obtainedDate) : null,
      expiryDate: expiryDate ? new Date(expiryDate) : null,
      notes,
      source,
    },
    include: { catalog: { select: { code: true, name: true, shortName: true } } },
  });

  return NextResponse.json({ certification: cert }, { status: 201 });
}
