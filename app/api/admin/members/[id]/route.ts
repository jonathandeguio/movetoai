export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getCurrentWorkspaceContext } from "@/server/auth";

type RouteContext = { params: Promise<{ id: string }> };

const PatchSchema = z.object({
  roleCode: z.string().min(1).max(60),
});

// PATCH — change role
export async function PATCH(request: Request, { params }: RouteContext) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { workspace, role } = await getCurrentWorkspaceContext({ requireMembership: true });
  if (!workspace?.id) return NextResponse.json({ error: "No workspace" }, { status: 403 });

  // Only admins can change roles
  if (!["WORKSPACE_ADMIN"].includes(role?.code ?? "")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: unknown;
  try { body = await request.json(); }
  catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  const parsed = PatchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation error", issues: parsed.error.issues }, { status: 422 });
  }

  // Find the membership (must belong to this workspace)
  const membership = await prisma.membership.findFirst({
    where: { id, workspaceId: workspace.id, deletedAt: null },
    select: { id: true, userId: true, role: { select: { code: true } } },
  });
  if (!membership) return NextResponse.json({ error: "Member not found" }, { status: 404 });

  // Prevent demoting last WORKSPACE_ADMIN
  if (membership.role.code === "WORKSPACE_ADMIN" && parsed.data.roleCode !== "WORKSPACE_ADMIN") {
    const adminCount = await prisma.membership.count({
      where: { workspaceId: workspace.id, deletedAt: null, role: { code: "WORKSPACE_ADMIN" } },
    });
    if (adminCount <= 1) {
      return NextResponse.json({ error: "Cannot remove the last workspace admin" }, { status: 409 });
    }
  }

  // Find the target role in this workspace
  const targetRole = await prisma.role.findFirst({
    where: { workspaceId: workspace.id, code: parsed.data.roleCode, deletedAt: null },
    select: { id: true, code: true, name: true },
  });
  if (!targetRole) {
    return NextResponse.json({ error: "Role not found in this workspace" }, { status: 404 });
  }

  const updated = await prisma.membership.update({
    where: { id },
    data: { roleId: targetRole.id },
    select: { id: true, updatedAt: true, role: { select: { code: true, name: true } } },
  });

  return NextResponse.json(updated);
}

// DELETE — remove member (soft delete)
export async function DELETE(_req: Request, { params }: RouteContext) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { workspace, role } = await getCurrentWorkspaceContext({ requireMembership: true });
  if (!workspace?.id) return NextResponse.json({ error: "No workspace" }, { status: 403 });

  if (!["WORKSPACE_ADMIN"].includes(role?.code ?? "")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const membership = await prisma.membership.findFirst({
    where: { id, workspaceId: workspace.id, deletedAt: null },
    select: { id: true, userId: true, role: { select: { code: true } } },
  });
  if (!membership) return NextResponse.json({ error: "Member not found" }, { status: 404 });

  // Cannot remove self
  if (membership.userId === session.user.id) {
    return NextResponse.json({ error: "Cannot remove yourself from the workspace" }, { status: 409 });
  }

  // Cannot remove last admin
  if (membership.role.code === "WORKSPACE_ADMIN") {
    const adminCount = await prisma.membership.count({
      where: { workspaceId: workspace.id, deletedAt: null, role: { code: "WORKSPACE_ADMIN" } },
    });
    if (adminCount <= 1) {
      return NextResponse.json({ error: "Cannot remove the last workspace admin" }, { status: 409 });
    }
  }

  await prisma.membership.update({
    where: { id },
    data: { deletedAt: new Date(), status: "REMOVED" },
  });

  return new NextResponse(null, { status: 204 });
}
