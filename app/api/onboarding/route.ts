export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/lib/auth";
import { locales } from "@/lib/i18n/config";
import { createWorkspaceForUser } from "@/server/onboarding";

const onboardingSchema = z.object({
  preferredLocale: z.enum(locales).default("en"),
  companyName: z.string().trim().min(2).max(160),
  workspaceName: z.string().trim().min(2).max(160)
});

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ code: "UNAUTHENTICATED" }, { status: 401 });
  }

  try {
    const payload = onboardingSchema.parse(await request.json());
    await createWorkspaceForUser({
      userId: session.user.id,
      preferredLocale: payload.preferredLocale,
      companyName: payload.companyName,
      workspaceName: payload.workspaceName
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ code: "INVALID_PAYLOAD" }, { status: 400 });
    }

    if (error instanceof Error) {
      const knownCode = error.message === "ALREADY_ONBOARDED" ? error.message : null;

      if (knownCode) {
        return NextResponse.json({ code: knownCode }, { status: 400 });
      }
    }

    return NextResponse.json({ code: "UNKNOWN_ERROR" }, { status: 500 });
  }
}
