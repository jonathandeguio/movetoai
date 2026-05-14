export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getCurrentWorkspaceContext } from "@/server/auth";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = prisma as any;

const PatchSchema = z.object({
  title: z.string().min(2).max(300).optional(),
  status: z.enum(["proposed", "accepted", "superseded", "deprecated"]).optional(),
  decisionDate: z.string().datetime().or(z.string().date()).optional(),
  context: z.string().min(1).max(10000).optional(),
  decision: z.string().min(1).max(10000).optional(),
  rationale: z.string().min(1).max(10000).optional(),
  consequences: z.string().max(10000).nullable().optional(),
  alternatives: z.array(z.unknown()).nullable().optional(),
  impactedApps: z.array(z.unknown()).nullable().optional(),
  impactedProcesses: z.array(z.unknown()).nullable().optional(),
  expectedOutcome: z.string().max(5000).nullable().optional(),
  observedOutcome: z.string().max(5000).nullable().optional(),
  outcomeDate: z.string().datetime().nullable().optional(),
});

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { workspace } = await getCurrentWorkspaceContext({ requireMembership: true });
  if (!workspace?.id) {
    return NextResponse.json({ error: "No workspace" }, { status: 403 });
  }

  const { id } = await params;

  const item = await db.architectureDecision.findFirst({
    where: { id, workspaceId: workspace.id, deletedAt: null },
    include: {
      author: { select: { id: true, name: true, email: true } },
    },
  });

  if (!item) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(item);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { workspace } = await getCurrentWorkspaceContext({ requireMembership: true });
  if (!workspace?.id) {
    return NextResponse.json({ error: "No workspace" }, { status: 403 });
  }

  const { id } = await params;

  const existing = await db.architectureDecision.findFirst({
    where: { id, workspaceId: workspace.id, deletedAt: null },
  });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = PatchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation error", issues: parsed.error.issues },
      { status: 422 }
    );
  }

  const d = parsed.data;
  const updateData: Record<string, unknown> = {};

  if (d.title !== undefined) updateData.title = d.title;
  if (d.status !== undefined) updateData.status = d.status;
  if (d.decisionDate !== undefined) updateData.decisionDate = new Date(d.decisionDate);
  if (d.context !== undefined) updateData.context = d.context;
  if (d.decision !== undefined) updateData.decision = d.decision;
  if (d.rationale !== undefined) updateData.rationale = d.rationale;
  if (d.consequences !== undefined) updateData.consequences = d.consequences;
  if (d.alternatives !== undefined) updateData.alternatives = d.alternatives;
  if (d.impactedApps !== undefined) updateData.impactedApps = d.impactedApps;
  if (d.impactedProcesses !== undefined) updateData.impactedProcesses = d.impactedProcesses;
  if (d.expectedOutcome !== undefined) updateData.expectedOutcome = d.expectedOutcome;
  if (d.observedOutcome !== undefined) updateData.observedOutcome = d.observedOutcome;
  if (d.outcomeDate !== undefined) {
    updateData.outcomeDate = d.outcomeDate ? new Date(d.outcomeDate) : null;
  }

  const updated = await db.architectureDecision.update({
    where: { id },
    data: updateData,
    include: {
      author: { select: { id: true, name: true, email: true } },
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { workspace } = await getCurrentWorkspaceContext({ requireMembership: true });
  if (!workspace?.id) {
    return NextResponse.json({ error: "No workspace" }, { status: 403 });
  }

  const { id } = await params;

  const existing = await db.architectureDecision.findFirst({
    where: { id, workspaceId: workspace.id, deletedAt: null },
  });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await db.architectureDecision.update({
    where: { id },
    data: { deletedAt: new Date() },
  });

  return NextResponse.json({ success: true });
}
