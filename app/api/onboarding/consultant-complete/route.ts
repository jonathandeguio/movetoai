export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/lib/auth";
import { saveConsultantOnboardingData } from "@/modules/workspace/server/consultant-onboarding";
import type { ConsultantRecommendationResult } from "@/lib/claude-consultant";

const consultantCompleteSchema = z.object({
  consultantType: z.string().min(1).max(100),
  specialization: z.string().min(1).max(120),
  yearsExperience: z.string().min(1).max(20),
  linkedinUrl: z.string().url().or(z.literal("")),
  website: z.string().url().or(z.literal("")).default(""),
  simultaneousClients: z.string().min(1),
  sectors: z.array(z.string()).min(1),
  tools: z.array(z.string()).min(1),
  recommendation: z.object({
    use_cases: z.array(z.any()),
    positioning_summary: z.string(),
    partner_tier_suggestion: z.enum(["Explorer", "Certified", "Expert"]),
  }),
});

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = consultantCompleteSchema.parse(await request.json());

    const result = await saveConsultantOnboardingData({
      userId: session.user.id,
      consultantType: body.consultantType,
      specialization: body.specialization,
      yearsExperience: body.yearsExperience,
      linkedinUrl: body.linkedinUrl,
      website: body.website,
      simultaneousClients: body.simultaneousClients,
      sectors: body.sectors,
      tools: body.tools,
      recommendation: body.recommendation as ConsultantRecommendationResult,
    });

    return NextResponse.json({ ok: true, redirectTo: result.redirectTo });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ code: "INVALID_PAYLOAD" }, { status: 400 });
    }
    return NextResponse.json({ code: "UNKNOWN_ERROR" }, { status: 500 });
  }
}
