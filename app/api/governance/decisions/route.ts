export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getCurrentWorkspaceContext } from "@/server/auth";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = prisma as any;

const CreateSchema = z.object({
  title: z.string().min(2).max(300),
  status: z.enum(["proposed", "accepted", "superseded", "deprecated"]).default("proposed"),
  decisionDate: z.string().datetime().or(z.string().date()),
  context: z.string().min(1).max(10000),
  decision: z.string().min(1).max(10000),
  rationale: z.string().min(1).max(10000),
  consequences: z.string().max(10000).nullable().optional(),
  alternatives: z.array(z.unknown()).nullable().optional(),
  impactedApps: z.array(z.unknown()).nullable().optional(),
  impactedProcesses: z.array(z.unknown()).nullable().optional(),
  expectedOutcome: z.string().max(5000).nullable().optional(),
});

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { workspace } = await getCurrentWorkspaceContext({ requireMembership: true });
  if (!workspace?.id) {
    return NextResponse.json({ error: "No workspace" }, { status: 403 });
  }

  const url = new URL(request.url);
  const limit = Math.min(parseInt(url.searchParams.get("limit") ?? "20", 10), 100);
  const cursor = url.searchParams.get("cursor");
  const status = url.searchParams.get("status");

  const where: Record<string, unknown> = {
    workspaceId: workspace.id,
    deletedAt: null,
  };
  if (status) {
    where.status = status;
  }

  const items = await db.architectureDecision.findMany({
    where,
    orderBy: { decisionDate: "desc" },
    take: limit,
    ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
    include: {
      author: { select: { id: true, name: true, email: true } },
    },
  });

  const nextCursor = items.length === limit ? items[items.length - 1]?.id : null;

  return NextResponse.json({ items, nextCursor });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { workspace } = await getCurrentWorkspaceContext({ requireMembership: true });
  if (!workspace?.id) {
    return NextResponse.json({ error: "No workspace" }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = CreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation error", issues: parsed.error.issues },
      { status: 422 }
    );
  }

  const d = parsed.data;

  const item = await db.architectureDecision.create({
    data: {
      workspaceId: workspace.id,
      authorId: session.user.id,
      title: d.title,
      status: d.status,
      decisionDate: new Date(d.decisionDate),
      context: d.context,
      decision: d.decision,
      rationale: d.rationale,
      consequences: d.consequences ?? null,
      alternatives: d.alternatives ?? undefined,
      impactedApps: d.impactedApps ?? undefined,
      impactedProcesses: d.impactedProcesses ?? undefined,
      expectedOutcome: d.expectedOutcome ?? null,
    },
    include: {
      author: { select: { id: true, name: true, email: true } },
    },
  });

  return NextResponse.json(item, { status: 201 });
}
