export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getCurrentWorkspaceContext } from "@/server/auth";

function slugify(t: string) { return t.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,""); }
function shortId() { return Math.random().toString(36).slice(2,8); }

const CreateSchema = z.object({
  name: z.string().min(2).max(120),
  description: z.string().max(2000).nullable().optional(),
  domainId: z.string().cuid(),
  businessUnitId: z.string().cuid().nullable().optional(),
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

  const items = await prisma.capability.findMany({
    where,
    orderBy: { name: "asc" },
    select: {
      id: true, name: true, description: true, slug: true, domainId: true, businessUnitId: true, updatedAt: true,
      domain: { select: { id: true, name: true } },
      _count: { select: { processes: true, opportunities: true } },
    },
  });
  return NextResponse.json({ items, total: items.length });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { workspace, role } = await getCurrentWorkspaceContext({ requireMembership: true });
  if (!workspace?.id) return NextResponse.json({ error: "No workspace" }, { status: 403 });

  const allowed = ["WORKSPACE_ADMIN","ENTERPRISE_ARCHITECT","TRANSFORMATION_MANAGER"];
  if (!allowed.includes(role?.code ?? "")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }
  const parsed = CreateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Validation error", issues: parsed.error.issues }, { status: 422 });

  const d = parsed.data;
  const domain = await prisma.domain.findFirst({ where: { id: d.domainId, workspaceId: workspace.id, deletedAt: null }, select: { id: true } });
  if (!domain) return NextResponse.json({ error: "Domain not found" }, { status: 404 });

  const capability = await prisma.capability.create({
    data: { workspaceId: workspace.id, name: d.name, slug: `${slugify(d.name)}-${shortId()}`, description: d.description ?? null, domainId: d.domainId, businessUnitId: d.businessUnitId ?? null },
    select: { id: true, name: true, slug: true, domainId: true, createdAt: true },
  });
  return NextResponse.json(capability, { status: 201 });
}
