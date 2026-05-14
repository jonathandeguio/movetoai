export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/lib/auth";
import { saveMemberOnboardingData } from "@/modules/workspace/server/member-onboarding";

const schema = z.object({
  firstName: z.string().trim().min(1).max(80),
  lastName: z.string().trim().min(1).max(80),
  jobTitle: z.string().trim().max(120).optional(),
  avatarUrl: z.string().url().optional().or(z.literal("")).transform((v) => v || undefined),
});

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ code: "UNAUTHENTICATED" }, { status: 401 });
  }

  try {
    const payload = schema.parse(await request.json());
    const result = await saveMemberOnboardingData({
      userId: session.user.id,
      ...payload,
    });
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ code: "INVALID_PAYLOAD" }, { status: 400 });
    }
    return NextResponse.json({ code: "UNKNOWN_ERROR" }, { status: 500 });
  }
}
