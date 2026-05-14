export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getCurrentWorkspaceContext } from "@/server/auth";

type RouteContext = { params: Promise<{ id: string }> };
function slugify(t: string) { return t.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,""); }

const PatchSchema = z.object({
  name: z.string().min(2).max(120).optional(),
  description: z.string().max(2000).nullable().optional(),
  code: z.string().max(20).nullable().optional(),
  parentId: z.string().cuid().nullable().optional(),
});

export async function GET(_req: Request, { params }: RouteContext) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const { workspace } = await getCurrentWorkspaceContext({ requireMembership: true });

  const bu = await prisma.businessUnit.findFirst({
    where: { id, workspaceId: workspace?.id, deletedAt: null },
    select: { id: true, name: true, description: true, slug: true, code: true, parentId: true, updatedAt: true },
  });
  if (!bu) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(bu);
}

export async function PATCH(request: Request, { params }: RouteContext) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const { workspace, role } = await getCurrentWorkspaceContext({ requireMembership: true });

  if (!["WORKSPACE_ADMIN"].includes(role?.code ?? "")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }
  const parsed = PatchSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Validation error", issues: parsed.error.issues }, { status: 422 });

  const d = parsed.data;
  const upd: Record<string, unknown> = {};
  if (d.name !== undefined) { upd.name = d.name; upd.slug = `${slugify(d.name)}-${id.slice(-6)}`; }
  if (d.description !== undefined) upd.description = d.description;
  if (d.code !== undefined) upd.code = d.code;
  if (d.parentId !== undefined) upd.parentId = d.parentId;

  const bu = await prisma.businessUnit.update({
    where: { id, workspaceId: workspace?.id },
    data: upd,
    select: { id: true, name: true, slug: true, updatedAt: true },
  });
  return NextResponse.json(bu);
}

export async function DELETE(_req: Request, { params }: RouteContext) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const { workspace, role } = await getCurrentWorkspaceContext({ requireMembership: true });

  if (!["WORKSPACE_ADMIN"].includes(role?.code ?? "")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const bu = await prisma.businessUnit.findFirst({
    where: { id, workspaceId: workspace?.id, deletedAt: null },
    select: { id: true, _count: { select: { domains: { where: { deletedAt: null } }, capabilities: { where: { deletedAt: null } } } } },
  });
  if (!bu) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const total = bu._count.domains + bu._count.capabilities;
  if (total > 0) return NextResponse.json({ error: `Cannot delete: ${bu._count.domains} domain(s) and ${bu._count.capabilities} capability/ies still active` }, { status: 409 });

  await prisma.businessUnit.update({ where: { id }, data: { deletedAt: new Date() } });
  return new NextResponse(null, { status: 204 });
}
