export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/lib/auth";
import { saveITOnboardingData } from "@/modules/workspace/server/it-onboarding";
import type { ITRoadmapResult } from "@/lib/claude-it";

const itCompleteSchema = z.object({
  itTitle: z.string().min(1).max(120),
  teamSize: z.string().min(1).max(80),
  selectedSystems: z.array(z.string()).min(1),
  mainConstraint: z.string().min(1).max(200),
  roadmap: z.object({
    phases: z.array(z.any()),
    summary: z.string(),
    priority_recommendation: z.string(),
  }),
});

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = itCompleteSchema.parse(await request.json());

    const result = await saveITOnboardingData({
      userId: session.user.id,
      itTitle: body.itTitle,
      teamSize: body.teamSize,
      selectedSystems: body.selectedSystems,
      mainConstraint: body.mainConstraint,
      roadmap: body.roadmap as ITRoadmapResult,
    });

    return NextResponse.json({ ok: true, redirectTo: result.redirectTo });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ code: "INVALID_PAYLOAD" }, { status: 400 });
    }
    return NextResponse.json({ code: "UNKNOWN_ERROR" }, { status: 500 });
  }
}
