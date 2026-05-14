export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getCurrentWorkspaceContext } from "@/server/auth";

// ── Zod schemas ───────────────────────────────────────────────────────────────

const QuestionSchema = z.object({
  type: z.enum(["text", "rating", "choice", "yesno"]).default("text"),
  label: z.string().min(1).max(500),
  options: z.array(z.string()).optional(),
  required: z.boolean().default(false),
});

const SurveyCreateSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().optional(),
  status: z.enum(["draft", "active", "closed"]).default("draft"),
  dueDate: z.string().optional(),
  targetEntityType: z.enum(["application", "process", "capability"]).optional(),
  targetEntityId: z.string().optional(),
  questions: z.array(QuestionSchema).optional(),
});

// ── GET /api/surveys ──────────────────────────────────────────────────────────

export async function GET(_request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { workspace } = await getCurrentWorkspaceContext({ requireMembership: true });
  if (!workspace?.id) return NextResponse.json({ error: "No workspace" }, { status: 403 });

  const surveys = await prisma.survey.findMany({
    where: { workspaceId: workspace.id, deletedAt: null },
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { questions: true, responses: true },
      },
    },
  });

  return NextResponse.json({ items: surveys, total: surveys.length });
}

// ── POST /api/surveys ─────────────────────────────────────────────────────────

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { workspace } = await getCurrentWorkspaceContext({ requireMembership: true });
  if (!workspace?.id) return NextResponse.json({ error: "No workspace" }, { status: 403 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = SurveyCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation error", issues: parsed.error.issues }, { status: 422 });
  }

  const d = parsed.data;

  const survey = await prisma.$transaction(async (tx) => {
    const created = await tx.survey.create({
      data: {
        workspaceId: workspace.id,
        title: d.title,
        description: d.description ?? null,
        status: d.status,
        dueDate: d.dueDate ? new Date(d.dueDate) : null,
        targetEntityType: d.targetEntityType ?? null,
        targetEntityId: d.targetEntityId ?? null,
        createdById: session.user.id,
      },
    });

    if (d.questions && d.questions.length > 0) {
      await tx.surveyQuestion.createMany({
        data: d.questions.map((q, idx) => ({
          surveyId: created.id,
          order: idx,
          type: q.type,
          label: q.label,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          options: (q.options ?? null) as any,
          required: q.required,
        })),
      });
    }

    return created;
  });

  return NextResponse.json({ id: survey.id }, { status: 201 });
}
