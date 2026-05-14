export const runtime = "nodejs";
import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getCurrentWorkspaceContext } from "@/server/auth";

type RouteContext = { params: Promise<{ id: string }> };

const EDIT_ROLES = ["WORKSPACE_ADMIN","ENTERPRISE_ARCHITECT","TRANSFORMATION_MANAGER"];

const PatchSchema = z.object({
  title: z.string().min(3).max(200).optional(),
  description: z.string().max(2000).nullable().optional(),
  severity: z.enum(["LOW","MEDIUM","HIGH","CRITICAL"]).optional(),
  processId: z.string().cuid().nullable().optional(),
  domainId: z.string().cuid().nullable().optional(),
  capabilityId: z.string().cuid().nullable().optional(),
});

export async function GET(_req: Request, { params }: RouteContext) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const { workspace } = await getCurrentWorkspaceContext({ requireMembership: true });

  const item = await prisma.painPoint.findFirst({
    where: { id, workspaceId: workspace?.id, deletedAt: null },
    select: { id: true, title: true, description: true, severity: true, processId: true, domainId: true, capabilityId: true, updatedAt: true },
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
  if (d.title !== undefined) upd.title = d.title;
  if (d.description !== undefined) upd.description = d.description;
  if (d.severity !== undefined) upd.severity = d.severity;
  if (d.processId !== undefined) upd.processId = d.processId;
  if (d.domainId !== undefined) upd.domainId = d.domainId;
  if (d.capabilityId !== undefined) upd.capabilityId = d.capabilityId;

  const item = await prisma.painPoint.update({
    where: { id, workspaceId: workspace?.id },
    data: upd,
    select: { id: true, title: true, severity: true, updatedAt: true },
  });
  return NextResponse.json(item);
}

export async function DELETE(_req: Request, { params }: RouteContext) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const { workspace, role } = await getCurrentWorkspaceContext({ requireMembership: true });

  if (!EDIT_ROLES.includes(role?.code ?? "")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const item = await prisma.painPoint.findFirst({
    where: { id, workspaceId: workspace?.id, deletedAt: null },
    select: { id: true },
  });
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.painPoint.update({ where: { id }, data: { deletedAt: new Date() } });
  return new NextResponse(null, { status: 204 });
}
