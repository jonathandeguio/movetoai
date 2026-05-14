export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getCurrentWorkspaceContext } from "@/server/auth";
import { CHECKLIST_BY_ROLE, DEFAULT_CHECKLIST, type ChecklistStep } from "@/lib/guide/checklist";

// ── helpers ───────────────────────────────────────────────────────────────────

function safeRecord(value: unknown): Record<string, string | null> {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, string | null>;
  }
  return {};
}

function normalizeRoleCode(code: string): string {
  // Role codes in DB may be uppercase (e.g. "ADMIN") or already lowercased slugs
  return code.toLowerCase().replace(/_/g, "-");
}

function resolveSteps(roleCode: string): ChecklistStep[] {
  const normalized = normalizeRoleCode(roleCode);
  return CHECKLIST_BY_ROLE[normalized] ?? DEFAULT_CHECKLIST;
}

// ── GET /api/guide/checklist ──────────────────────────────────────────────────

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { workspace, role } = await getCurrentWorkspaceContext({ requireMembership: true });
  if (!workspace?.id) {
    return NextResponse.json({ error: "No workspace" }, { status: 403 });
  }

  const steps = resolveSteps(role?.code ?? "member");

  const progress = await prisma.userGuideProgress.findUnique({
    where: { userId: session.user.id },
    select: { checklistSteps: true },
  });

  const completedMap = safeRecord(progress?.checklistSteps);

  const stepsWithProgress = steps.map((step) => ({
    id: step.id,
    label: step.label,
    description: step.description,
    href: step.href,
    icon: step.icon ?? null,
    completedAt: completedMap[step.id] ?? null,
  }));

  const completedCount = stepsWithProgress.filter((s) => s.completedAt !== null).length;

  return NextResponse.json({
    steps: stepsWithProgress,
    completedCount,
    totalCount: steps.length,
  });
}

// ── POST /api/guide/checklist ─────────────────────────────────────────────────

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

  const { stepId } = body as Record<string, unknown>;
  if (typeof stepId !== "string" || stepId.trim() === "") {
    return NextResponse.json({ error: "Missing stepId" }, { status: 400 });
  }

  const userId = session.user.id;

  // Get or create progress row
  const current = await prisma.userGuideProgress.upsert({
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

  const steps = safeRecord(current.checklistSteps);
  steps[stepId] = new Date().toISOString();

  await prisma.userGuideProgress.update({
    where: { userId },
    data: { checklistSteps: steps },
  });

  return NextResponse.json({ ok: true, stepId, completedAt: steps[stepId] });
}
