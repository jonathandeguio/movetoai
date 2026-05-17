export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/lib/auth";
import { resolveSessionContextForUserId } from "@/server/session-context";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

async function getWorkspaceId(): Promise<string | null> {
  const session = await auth();
  if (!session?.user?.id) return null;
  const ctx = await resolveSessionContextForUserId(session.user.id);
  return ctx?.workspace?.id ?? null;
}

// ── GET ────────────────────────────────────────────────────────────────────────

export async function GET(_req: Request, { params }: Params) {
  const workspaceId = await getWorkspaceId();
  if (!workspaceId) return NextResponse.json({ code: "UNAUTHENTICATED" }, { status: 401 });

  const { id } = await params;

  const cert = await prisma.workspaceCertification.findFirst({
    where: { id, workspaceId },
    include: {
      catalog: true,
      links: true,
      owner: { select: { id: true, name: true, email: true } },
    },
  });

  if (!cert) return NextResponse.json({ code: "NOT_FOUND" }, { status: 404 });
  return NextResponse.json({ certification: cert });
}

// ── PATCH ──────────────────────────────────────────────────────────────────────

const patchSchema = z.object({
  status: z.enum(["obtained", "in_progress", "planned", "not_applicable", "expired"]).optional(),
  obtainedDate: z.string().datetime().nullable().optional(),
  expiryDate: z.string().datetime().nullable().optional(),
  nextAuditDate: z.string().datetime().nullable().optional(),
  certifyingBody: z.string().nullable().optional(),
  certificateRef: z.string().nullable().optional(),
  documentUrl: z.string().url().nullable().optional(),
  scopeNotes: z.string().nullable().optional(),
  ownerId: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
});

export async function PATCH(req: Request, { params }: Params) {
  const workspaceId = await getWorkspaceId();
  if (!workspaceId) return NextResponse.json({ code: "UNAUTHENTICATED" }, { status: 401 });

  const { id } = await params;

  const existing = await prisma.workspaceCertification.findFirst({ where: { id, workspaceId } });
  if (!existing) return NextResponse.json({ code: "NOT_FOUND" }, { status: 404 });

  const body = await req.json().catch(() => null);
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ code: "INVALID_PAYLOAD" }, { status: 400 });

  const data = parsed.data;
  const updated = await prisma.workspaceCertification.update({
    where: { id },
    data: {
      ...data,
      obtainedDate: data.obtainedDate !== undefined ? (data.obtainedDate ? new Date(data.obtainedDate) : null) : undefined,
      expiryDate:   data.expiryDate   !== undefined ? (data.expiryDate   ? new Date(data.expiryDate)   : null) : undefined,
      nextAuditDate: data.nextAuditDate !== undefined ? (data.nextAuditDate ? new Date(data.nextAuditDate) : null) : undefined,
    },
    include: { catalog: { select: { code: true, name: true, shortName: true } } },
  });

  return NextResponse.json({ certification: updated });
}

// ── DELETE ─────────────────────────────────────────────────────────────────────

export async function DELETE(_req: Request, { params }: Params) {
  const workspaceId = await getWorkspaceId();
  if (!workspaceId) return NextResponse.json({ code: "UNAUTHENTICATED" }, { status: 401 });

  const { id } = await params;

  const existing = await prisma.workspaceCertification.findFirst({ where: { id, workspaceId } });
  if (!existing) return NextResponse.json({ code: "NOT_FOUND" }, { status: 404 });

  await prisma.workspaceCertification.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
