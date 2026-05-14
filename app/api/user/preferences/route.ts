export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const PatchSchema = z.object({
  bio: z.string().max(500).nullable().optional(),
  linkedinUrl: z.string().url().nullable().optional(),
  websiteUrl: z.string().url().nullable().optional(),
  avatarColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).nullable().optional(),
  avatarInitials: z.string().max(3).nullable().optional(),
  preferredLocale: z.enum(["EN", "FR", "ES"]).optional(),
  notificationsEmail: z.boolean().optional(),
  notificationsApp: z.boolean().optional(),
  weeklyReport: z.boolean().optional(),
});

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }
  const parsed = PatchSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Validation error", issues: parsed.error.issues }, { status: 422 });

  const d = parsed.data;

  const current = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { preferences: true },
  });
  const prefs = (current?.preferences as Record<string, unknown>) ?? {};

  const newPrefs: Record<string, unknown> = { ...prefs };
  if (d.bio !== undefined) newPrefs.bio = d.bio;
  if (d.linkedinUrl !== undefined) newPrefs.linkedinUrl = d.linkedinUrl;
  if (d.websiteUrl !== undefined) newPrefs.websiteUrl = d.websiteUrl;
  if (d.avatarColor !== undefined) newPrefs.avatarColor = d.avatarColor;
  if (d.avatarInitials !== undefined) newPrefs.avatarInitials = d.avatarInitials;
  if (d.notificationsEmail !== undefined) newPrefs.notificationsEmail = d.notificationsEmail;
  if (d.notificationsApp !== undefined) newPrefs.notificationsApp = d.notificationsApp;
  if (d.weeklyReport !== undefined) newPrefs.weeklyReport = d.weeklyReport;

  const updateData: Record<string, unknown> = { preferences: newPrefs };
  if (d.preferredLocale !== undefined) updateData.preferredLocale = d.preferredLocale;

  await prisma.user.update({
    where: { id: session.user.id },
    data: updateData,
  });

  return NextResponse.json({ ok: true });
}
