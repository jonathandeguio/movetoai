export const runtime = "nodejs";
import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getCurrentWorkspaceContext } from "@/server/auth";

type RouteContext = { params: Promise<{ id: string }> };
function slugify(t: string) { return t.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,""); }

const EDIT_ROLES = ["WORKSPACE_ADMIN","ENTERPRISE_ARCHITECT","TRANSFORMATION_MANAGER"];

const PatchSchema = z.object({
  name: z.string().min(2).max(120).optional(),
  vendor: z.string().max(120).nullable().optional(),
  description: z.string().max(2000).nullable().optional(),
});

export async function GET(_req: Request, { params }: RouteContext) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const { workspace } = await getCurrentWorkspaceContext({ requireMembership: true });
  const item = await prisma.application.findFirst({
    where: { id, workspaceId: workspace?.id, deletedAt: null },
    select: { id: true, name: true, vendor: true, description: true, slug: true, updatedAt: true },
  });
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(item);
}

export async function PATCH(request: Request, { params }: RouteContext) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const { workspace, role } = await getCurrentWorkspaceContext({ requireMembership: true });
  if (!EDIT_ROLES.includes(role?.code ?? "")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }
  const parsed = PatchSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Validation error", issues: parsed.error.issues }, { status: 422 });

  const d = parsed.data;
  const upd: Record<string, unknown> = {};
  if (d.name !== undefined) { upd.name = d.name; upd.slug = `${slugify(d.name)}-${id.slice(-6)}`; }
  if (d.vendor !== undefined) upd.vendor = d.vendor;
  if (d.description !== undefined) upd.description = d.description;

  const item = await prisma.application.update({
    where: { id, workspaceId: workspace?.id },
    data: upd,
    select: { id: true, name: true, slug: true, updatedAt: true },
  });
  return NextResponse.json(item);
}

export async function DELETE(_req: Request, { params }: RouteContext) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const { workspace, role } = await getCurrentWorkspaceContext({ requireMembership: true });
  if (!["WORKSPACE_ADMIN"].includes(role?.code ?? "")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const item = await prisma.application.findFirst({
    where: { id, workspaceId: workspace?.id, deletedAt: null },
    select: { id: true, _count: { select: { processes: true, opportunities: true } } },
  });
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const links = item._count.processes + item._count.opportunities;
  if (links > 0) return NextResponse.json({ error: `Cannot delete: still linked to ${links} process(es)/opportunity(ies)` }, { status: 409 });

  await prisma.application.update({ where: { id }, data: { deletedAt: new Date() } });
  return new NextResponse(null, { status: 204 });
}
