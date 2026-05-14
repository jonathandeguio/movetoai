export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { resolveSessionContextForUserId } from "@/server/session-context";

const teamSetupSchema = z.object({
  inviteEmails: z.array(z.string().email()).max(10).default([]),
  emailNotifications: z.boolean().default(true),
  weeklyDigest: z.boolean().default(true),
});

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ code: "UNAUTHENTICATED" }, { status: 401 });
  }

  const sessionContext = await resolveSessionContextForUserId(session.user.id);
  if (!sessionContext?.workspace?.id) {
    return NextResponse.json({ code: "NO_WORKSPACE" }, { status: 400 });
  }

  const body = await request.json().catch(() => null);
  const parsed = teamSetupSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ code: "INVALID_PAYLOAD" }, { status: 400 });
  }

  const { inviteEmails, emailNotifications, weeklyDigest } = parsed.data;

  // Persist notification preferences in user.preferences
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { preferences: true },
  });
  const prefs = (user?.preferences as Record<string, unknown>) ?? {};

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      preferences: {
        ...prefs,
        notifications: { emailNotifications, weeklyDigest },
        onboardingTeamSetupCompleted: true,
      },
    },
  });

  // Store pending invitations in workspace settings for now
  // (full email invite flow would require email provider setup)
  if (inviteEmails.length > 0) {
    const workspace = await prisma.workspace.findUnique({
      where: { id: sessionContext.workspace.id },
      select: { settings: true },
    });
    const settings = (workspace?.settings as Record<string, unknown>) ?? {};
    await prisma.workspace.update({
      where: { id: sessionContext.workspace.id },
      data: {
        settings: {
          ...settings,
          pendingInvitations: inviteEmails,
        },
      },
    });
  }

  return NextResponse.json({ ok: true, redirectTo: "/app/admin/quick-start" });
}
