export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/lib/auth";
import { saveExecutiveOnboardingData } from "@/modules/workspace/server/executive-onboarding";

const quickWinSchema = z.object({
  title: z.string(),
  description: z.string(),
  roi: z.string(),
  timeframe: z.string(),
  effort: z.enum(["low", "medium", "high"])
});

const bodySchema = z.object({
  firstName: z.string().trim().min(1).max(80),
  lastName: z.string().trim().min(1).max(80),
  jobTitle: z.string().trim().min(1).max(120),
  linkedinUrl: z.string().url().optional().or(z.literal("")),
  ambition: z.string().min(1),
  horizon: z.string().min(1),
  maturity: z.string().min(1),
  quickWins: z.array(quickWinSchema).max(3),
  maturityScore: z.number().min(0).max(100)
});

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ code: "UNAUTHORIZED" }, { status: 401 });
  }

  try {
    const body = bodySchema.parse(await request.json());

    const result = await saveExecutiveOnboardingData({
      userId: session.user.id,
      ...body,
      linkedinUrl: body.linkedinUrl || undefined
    });

    return NextResponse.json({ redirectTo: result.redirectTo });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ code: "INVALID_PAYLOAD" }, { status: 400 });
    }
    return NextResponse.json({ code: "UNKNOWN_ERROR" }, { status: 500 });
  }
}
