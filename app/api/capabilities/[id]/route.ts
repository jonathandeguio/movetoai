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
  businessUnitId: z.string().cuid().nullable().optional(),
});

export async function GET(_req: Request, { params }: RouteContext) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const { workspace } = await getCurrentWorkspaceContext({ requireMembership: true });

  const cap = await prisma.capability.findFirst({
    where: { id, workspaceId: workspace?.id, deletedAt: null },
    select: { id: true, name: true, description: true, slug: true, domainId: true, businessUnitId: true, updatedAt: true },
  });
  if (!cap) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(cap);
}

export async function PATCH(request: Request, { params }: RouteContext) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const { workspace, role } = await getCurrentWorkspaceContext({ requireMembership: true });

  const allowed = ["WORKSPACE_ADMIN","ENTERPRISE_ARCHITECT","TRANSFORMATION_MANAGER"];
  if (!allowed.includes(role?.code ?? "")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }
  const parsed = PatchSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Validation error", issues: parsed.error.issues }, { status: 422 });

  const d = parsed.data;
  const upd: Record<string, unknown> = {};
  if (d.name !== undefined) { upd.name = d.name; upd.slug = `${slugify(d.name)}-${id.slice(-6)}`; }
  if (d.description !== undefined) upd.description = d.description;
  if (d.businessUnitId !== undefined) upd.businessUnitId = d.businessUnitId;

  const cap = await prisma.capability.update({
    where: { id, workspaceId: workspace?.id },
    data: upd,
    select: { id: true, name: true, slug: true, updatedAt: true },
  });
  return NextResponse.json(cap);
}

export async function DELETE(_req: Request, { params }: RouteContext) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const { workspace, role } = await getCurrentWorkspaceContext({ requireMembership: true });

  if (!["WORKSPACE_ADMIN"].includes(role?.code ?? "")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const cap = await prisma.capability.findFirst({
    where: { id, workspaceId: workspace?.id, deletedAt: null },
    select: { id: true, _count: { select: { processes: { where: { deletedAt: null } } } } },
  });
  if (!cap) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (cap._count.processes > 0) return NextResponse.json({ error: "Cannot delete a capability that still has active processes" }, { status: 409 });

  await prisma.capability.update({ where: { id }, data: { deletedAt: new Date() } });
  return new NextResponse(null, { status: 204 });
}
