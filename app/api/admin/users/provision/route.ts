export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { z } from "zod";
import crypto from "crypto";

import { requirePlatformAdminAccess } from "@/server/auth";
import { prisma } from "@/lib/prisma";
import { ensureWorkspaceSystemRoles } from "@/server/catalog";

const provisionSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2).max(120),
  isPlatformAdmin: z.boolean().default(true),
  workspaceId: z.string().cuid().optional(),
});

export async function POST(request: Request) {
  try {
    // Require platform admin session
    const { user: adminUser } = await requirePlatformAdminAccess();

    const body = provisionSchema.parse(await request.json());

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: body.email },
      select: { id: true, status: true },
    });

    let userId: string;

    if (existingUser) {
      if (existingUser.status !== "ACTIVE") {
        return NextResponse.json(
          { code: "USER_NOT_ACTIVE", message: "User exists but is not active." },
          { status: 400 }
        );
      }
      // Grant platform admin if requested
      if (body.isPlatformAdmin) {
        await prisma.user.update({
          where: { id: existingUser.id },
          data: { isPlatformAdmin: true },
        });
      }
      userId = existingUser.id;
    } else {
      // Create placeholder user — they will set their own password on first login
      const tempToken = crypto.randomBytes(32).toString("hex");
      const newUser = await prisma.user.create({
        data: {
          email: body.email,
          name: body.name,
          status: "ACTIVE",
          isPlatformAdmin: body.isPlatformAdmin,
          hasCompletedProcessFocusOnboarding: true,
          preferences: {
            provisionedAt: new Date().toISOString(),
            provisionedBy: adminUser.id,
            passwordResetToken: tempToken,
          },
        },
        select: { id: true },
      });
      userId = newUser.id;
    }

    // If a workspaceId is provided, assign WORKSPACE_ADMIN role in that workspace
    if (body.workspaceId) {
      const roles = await ensureWorkspaceSystemRoles(prisma, body.workspaceId);
      const adminRole = roles["WORKSPACE_ADMIN"];

      if (adminRole) {
        const existing = await prisma.membership.findUnique({
          where: { userId_workspaceId: { userId, workspaceId: body.workspaceId } },
        });

        if (existing) {
          await prisma.membership.update({
            where: { id: existing.id },
            data: {
              roleId: adminRole.id,
              status: "ACTIVE",
              acceptedAt: existing.acceptedAt ?? new Date(),
              lastActiveAt: new Date(),
              deletedAt: null,
            },
          });
        } else {
          await prisma.membership.create({
            data: {
              userId,
              workspaceId: body.workspaceId,
              roleId: adminRole.id,
              status: "ACTIVE",
              acceptedAt: new Date(),
              lastActiveAt: new Date(),
            },
          });
        }
      }
    }

    return NextResponse.json({
      ok: true,
      userId,
      message: `Platform Admin provisioned: ${body.email}`,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ code: "INVALID_PAYLOAD" }, { status: 400 });
    }
    if (error instanceof Error && error.message === "NEXT_REDIRECT") throw error;
    return NextResponse.json({ code: "UNKNOWN_ERROR" }, { status: 500 });
  }
}
