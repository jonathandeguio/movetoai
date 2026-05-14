export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getCurrentWorkspaceContext } from "@/server/auth";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function shortId(): string {
  return Math.random().toString(36).slice(2, 8);
}

const CreateSchema = z.object({
  name: z.string().min(2).max(120),
  description: z.string().max(2000).nullable().optional(),
  domainId: z.string().cuid(),
  capabilityId: z.string().cuid().nullable().optional(),
  businessUnitId: z.string().cuid().nullable().optional(),
  ownerId: z.string().cuid().nullable().optional(),
});

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { workspace } = await getCurrentWorkspaceContext({ requireMembership: true });
  if (!workspace?.id) return NextResponse.json({ error: "No workspace" }, { status: 403 });

  const { searchParams } = new URL(request.url);
  const domainId = searchParams.get("domainId");
  const q = searchParams.get("q");

  const where: Record<string, unknown> = { workspaceId: workspace.id, deletedAt: null };
  if (domainId) where.domainId = domainId;
  if (q) where.name = { contains: q };

  const processes = await prisma.process.findMany({
    where,
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      description: true,
      slug: true,
      domainId: true,
      capabilityId: true,
      ownerId: true,
      updatedAt: true,
      domain: { select: { id: true, name: true } },
      owner: { select: { id: true, name: true } },
    },
  });

  return NextResponse.json({ items: processes, total: processes.length });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { workspace, role } = await getCurrentWorkspaceContext({ requireMembership: true });
  if (!workspace?.id) return NextResponse.json({ error: "No workspace" }, { status: 403 });

  const allowed = ["WORKSPACE_ADMIN", "ENTERPRISE_ARCHITECT", "TRANSFORMATION_MANAGER"];
  if (!allowed.includes(role?.code ?? "")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: unknown;
  try { body = await request.json(); }
  catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  const parsed = CreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation error", issues: parsed.error.issues }, { status: 422 });
  }

  const d = parsed.data;

  // Verify domain belongs to workspace
  const domain = await prisma.domain.findFirst({
    where: { id: d.domainId, workspaceId: workspace.id, deletedAt: null },
    select: { id: true },
  });
  if (!domain) return NextResponse.json({ error: "Domain not found" }, { status: 404 });

  const slug = `${slugify(d.name)}-${shortId()}`;

  const process = await prisma.process.create({
    data: {
      workspaceId: workspace.id,
      name: d.name,
      slug,
      description: d.description ?? null,
      domainId: d.domainId,
      capabilityId: d.capabilityId ?? null,
      businessUnitId: d.businessUnitId ?? null,
      ownerId: d.ownerId ?? null,
    },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      domainId: true,
      createdAt: true,
    },
  });

  return NextResponse.json(process, { status: 201 });
}
