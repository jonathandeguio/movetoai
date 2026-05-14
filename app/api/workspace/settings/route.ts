export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getCurrentWorkspaceContext } from "@/server/auth";

const PatchSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  defaultLocale: z.enum(["EN", "FR", "ES"]).optional(),
  settings: z.object({
    sector: z.string().optional(),
    size: z.string().optional(),
    website: z.string().url().nullable().optional(),
    aiMaturityScore: z.number().int().min(0).max(100).optional(),
    notifyOnNewMember: z.boolean().optional(),
    weeklyReport: z.boolean().optional(),
    notifyOnAnomalies: z.boolean().optional(),
    notifyOnProductUpdates: z.boolean().optional(),
  }).optional(),
});

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { workspace } = await getCurrentWorkspaceContext({ requireMembership: true });
  if (!workspace?.id) return NextResponse.json({ error: "No workspace" }, { status: 403 });

  const ws = await prisma.workspace.findUnique({
    where: { id: workspace.id },
    select: { id: true, name: true, slug: true, defaultLocale: true, settings: true, updatedAt: true },
  });
  if (!ws) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(ws);
}

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { workspace, role } = await getCurrentWorkspaceContext({ requireMembership: true });
  if (!workspace?.id) return NextResponse.json({ error: "No workspace" }, { status: 403 });

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

  const d = parsed.data;
  const updateData: Record<string, unknown> = {};
  if (d.name !== undefined) updateData.name = d.name;
  if (d.defaultLocale !== undefined) updateData.defaultLocale = d.defaultLocale;
  if (d.settings !== undefined) {
    // Merge settings JSON â€” read current first
    const current = await prisma.workspace.findUnique({
      where: { id: workspace.id },
      select: { settings: true },
    });
    const currentSettings = (current?.settings as Record<string, unknown>) ?? {};
    updateData.settings = { ...currentSettings, ...d.settings };
  }

  const ws = await prisma.workspace.update({
    where: { id: workspace.id },
    data: updateData,
    select: { id: true, name: true, slug: true, defaultLocale: true, settings: true, updatedAt: true },
  });
  return NextResponse.json(ws);
}
