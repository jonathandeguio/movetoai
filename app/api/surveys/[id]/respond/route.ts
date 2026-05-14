export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getCurrentWorkspaceContext } from "@/server/auth";

type RouteContext = { params: Promise<{ id: string }> };

const RespondSchema = z.object({
  answers: z.record(z.string(), z.unknown()),
});

// ── POST /api/surveys/[id]/respond ────────────────────────────────────────────

export async function POST(request: Request, { params }: RouteContext) {
  const session = await auth();

  const { id } = await params;
  const { workspace } = await getCurrentWorkspaceContext({ requireMembership: true });
  if (!workspace?.id) return NextResponse.json({ error: "No workspace" }, { status: 403 });

  const survey = await prisma.survey.findFirst({
    where: { id, workspaceId: workspace.id, deletedAt: null },
    select: { id: true, status: true },
  });
  if (!survey) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (survey.status !== "active") {
    return NextResponse.json({ error: "Ce sondage n'est plus actif" }, { status: 409 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = RespondSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation error", issues: parsed.error.issues }, { status: 422 });
  }

  const respondentId = session?.user?.id ?? null;

  const response = await prisma.surveyResponse.create({
    data: {
      surveyId: id,
      respondentId,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      answers: parsed.data.answers as any,
    },
    select: { id: true, submittedAt: true },
  });

  return NextResponse.json(response, { status: 201 });
}
