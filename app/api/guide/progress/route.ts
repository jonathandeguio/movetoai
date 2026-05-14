export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// ── helpers ───────────────────────────────────────────────────────────────────

function safeArray(value: unknown): string[] {
  if (Array.isArray(value)) return value.filter((v): v is string => typeof v === "string");
  return [];
}

function safeRecord(value: unknown): Record<string, string | null> {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, string | null>;
  }
  return {};
}

async function getOrCreateProgress(userId: string) {
  return prisma.userGuideProgress.upsert({
    where: { userId },
    create: {
      userId,
      toursCompleted: [],
      toursDismissed: [],
      checklistSteps: {},
      helpEnabled: true,
      tooltipsEnabled: true,
      totalHelpViews: 0,
    },
    update: {},
  });
}

function formatProgress(p: {
  toursCompleted: unknown;
  toursDismissed: unknown;
  checklistSteps: unknown;
  helpEnabled: boolean;
  tooltipsEnabled: boolean;
  lastHelpOpenedAt: Date | null;
  totalHelpViews: number;
}) {
  return {
    toursCompleted: safeArray(p.toursCompleted),
    toursDismissed: safeArray(p.toursDismissed),
    checklistSteps: safeRecord(p.checklistSteps),
    helpEnabled: p.helpEnabled,
    tooltipsEnabled: p.tooltipsEnabled,
    lastHelpOpenedAt: p.lastHelpOpenedAt?.toISOString() ?? null,
    totalHelpViews: p.totalHelpViews,
  };
}

// ── GET /api/guide/progress ───────────────────────────────────────────────────

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const progress = await getOrCreateProgress(session.user.id);
  return NextResponse.json(formatProgress(progress));
}

// ── POST /api/guide/progress ──────────────────────────────────────────────────

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const { action } = body as Record<string, unknown>;

  if (typeof action !== "string") {
    return NextResponse.json({ error: "Missing action" }, { status: 400 });
  }

  const userId = session.user.id;

  // Ensure progress row exists
  const current = await getOrCreateProgress(userId);

  switch (action) {
    case "complete_tour": {
      const { tourId } = body as Record<string, unknown>;
      if (typeof tourId !== "string") {
        return NextResponse.json({ error: "Missing tourId" }, { status: 400 });
      }
      const existing = safeArray(current.toursCompleted);
      if (!existing.includes(tourId)) {
        existing.push(tourId);
      }
      const updated = await prisma.userGuideProgress.update({
        where: { userId },
        data: { toursCompleted: existing },
      });
      return NextResponse.json(formatProgress(updated));
    }

    case "dismiss_tour": {
      const { tourId } = body as Record<string, unknown>;
      if (typeof tourId !== "string") {
        return NextResponse.json({ error: "Missing tourId" }, { status: 400 });
      }
      const existing = safeArray(current.toursDismissed);
      if (!existing.includes(tourId)) {
        existing.push(tourId);
      }
      const updated = await prisma.userGuideProgress.update({
        where: { userId },
        data: { toursDismissed: existing },
      });
      return NextResponse.json(formatProgress(updated));
    }

    case "complete_step": {
      const { stepId } = body as Record<string, unknown>;
      if (typeof stepId !== "string") {
        return NextResponse.json({ error: "Missing stepId" }, { status: 400 });
      }
      const steps = safeRecord(current.checklistSteps);
      steps[stepId] = new Date().toISOString();
      const updated = await prisma.userGuideProgress.update({
        where: { userId },
        data: { checklistSteps: steps },
      });
      return NextResponse.json(formatProgress(updated));
    }

    case "toggle_help": {
      const { enabled } = body as Record<string, unknown>;
      if (typeof enabled !== "boolean") {
        return NextResponse.json({ error: "Missing enabled boolean" }, { status: 400 });
      }
      const updated = await prisma.userGuideProgress.update({
        where: { userId },
        data: { helpEnabled: enabled },
      });
      return NextResponse.json(formatProgress(updated));
    }

    case "toggle_tooltips": {
      const { enabled } = body as Record<string, unknown>;
      if (typeof enabled !== "boolean") {
        return NextResponse.json({ error: "Missing enabled boolean" }, { status: 400 });
      }
      const updated = await prisma.userGuideProgress.update({
        where: { userId },
        data: { tooltipsEnabled: enabled },
      });
      return NextResponse.json(formatProgress(updated));
    }

    case "open_help": {
      const updated = await prisma.userGuideProgress.update({
        where: { userId },
        data: {
          totalHelpViews: { increment: 1 },
          lastHelpOpenedAt: new Date(),
        },
      });
      return NextResponse.json(formatProgress(updated));
    }

    default:
      return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
  }
}
