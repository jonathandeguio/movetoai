export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getCurrentWorkspaceContext } from "@/server/auth";

type RouteContext = { params: Promise<{ id: string }> };

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const PatchSchema = z.object({
  name: z.string().min(2).max(120).optional(),
  description: z.string().max(2000).nullable().optional(),
  ownerId: z.string().cuid().nullable().optional(),
  capabilityId: z.string().cuid().nullable().optional(),
  businessUnitId: z.string().cuid().nullable().optional(),
});

export async function GET(_req: Request, { params }: RouteContext) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const { workspace } = await getCurrentWorkspaceContext({ requireMembership: true });

  const process = await prisma.process.findFirst({
    where: { id, workspaceId: workspace?.id, deletedAt: null },
    select: {
      id: true,
      name: true,
      description: true,
      slug: true,
      ownerId: true,
      capabilityId: true,
      businessUnitId: true,
      domainId: true,
      updatedAt: true,
    },
  });
  if (!process) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(process);
}

export async function PATCH(request: Request, { params }: RouteContext) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const { workspace, role } = await getCurrentWorkspaceContext({ requireMembership: true });

  const allowed = ["WORKSPACE_ADMIN", "ENTERPRISE_ARCHITECT", "TRANSFORMATION_MANAGER"];
  if (!allowed.includes(role?.code ?? "")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: unknown;
  try { body = await request.json(); }
  catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  const parsed = PatchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation error", issues: parsed.error.issues }, { status: 422 });
  }

  const d = parsed.data;
  const updateData: Record<string, unknown> = {};
  if (d.name !== undefined) {
    updateData.name = d.name;
    // Regenerate slug — ensure uniqueness by appending id suffix if collision
    updateData.slug = `${slugify(d.name)}-${id.slice(-6)}`;
  }
  if (d.description !== undefined) updateData.description = d.description;
  if (d.ownerId !== undefined) updateData.ownerId = d.ownerId;
  if (d.capabilityId !== undefined) updateData.capabilityId = d.capabilityId;
  if (d.businessUnitId !== undefined) updateData.businessUnitId = d.businessUnitId;

  const process = await prisma.process.update({
    where: { id, workspaceId: workspace?.id },
    data: updateData,
    select: { id: true, name: true, slug: true, updatedAt: true },
  });
  return NextResponse.json(process);
}

export async function DELETE(_req: Request, { params }: RouteContext) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { workspace, role } = await getCurrentWorkspaceContext({ requireMembership: true });

  if (!["WORKSPACE_ADMIN"].includes(role?.code ?? "")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const process = await prisma.process.findFirst({
    where: { id, workspaceId: workspace?.id, deletedAt: null },
    select: { id: true },
  });
  if (!process) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.process.update({
    where: { id },
    data: { deletedAt: new Date() },
  });

  return new NextResponse(null, { status: 204 });
}
