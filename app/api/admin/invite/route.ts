export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { resolveSessionContextForUserId } from "@/server/session-context";
import { hasPermission } from "@/lib/rbac";

const inviteSchema = z.object({
  emails: z.array(z.string().email()).min(1).max(10),
  roleCode: z.string().default("TRANSFORMATION_MANAGER"),
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

  // Only users with users.manage permission can invite
  if (!hasPermission(ctx.permissions, "users.manage")) {
    return NextResponse.json({ code: "FORBIDDEN" }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const parsed = inviteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ code: "INVALID_PAYLOAD" }, { status: 400 });
  }

  const { emails, roleCode } = parsed.data;

  // Fetch the target role in this workspace
  const role = await prisma.role.findFirst({
    where: { workspaceId: ctx.workspace.id, code: roleCode, deletedAt: null },
    select: { id: true },
  });

  if (!role) {
    return NextResponse.json({ code: "ROLE_NOT_FOUND" }, { status: 400 });
  }

  const results: { email: string; status: "invited" | "already_member" | "created" }[] = [];

  for (const email of emails) {
    // Check if user already exists
    let targetUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: { id: true },
    });

    if (!targetUser) {
      // Create a placeholder user — they'll set a password on first login
      targetUser = await prisma.user.create({
        data: {
          email: email.toLowerCase(),
          status: "ACTIVE",
        },
        select: { id: true },
      });
      results.push({ email, status: "created" });
    } else {
      // Check if already a member
      const existingMembership = await prisma.membership.findUnique({
        where: { userId_workspaceId: { userId: targetUser.id, workspaceId: ctx.workspace.id } },
        select: { id: true, status: true },
      });

      if (existingMembership?.status === "ACTIVE") {
        results.push({ email, status: "already_member" });
        continue;
      }

      if (existingMembership) {
        // Reactivate
        await prisma.membership.update({
          where: { id: existingMembership.id },
          data: { status: "INVITED", roleId: role.id, deletedAt: null },
        });
        results.push({ email, status: "invited" });
        continue;
      }
    }

    // Create membership with INVITED status
    await prisma.membership.create({
      data: {
        userId: targetUser.id,
        workspaceId: ctx.workspace.id,
        roleId: role.id,
        status: "INVITED",
      },
    });

    if (!results.find((r) => r.email === email)) {
      results.push({ email, status: "invited" });
    }
  }

  return NextResponse.json({ ok: true, results });
}
