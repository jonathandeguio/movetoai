export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/lib/auth";
import { locales } from "@/lib/i18n/config";
import { createWorkspaceForUser } from "@/server/onboarding";

const COMPANY_SIZES = ["pme", "eti", "grand_groupe"] as const;

const onboardingSchema = z.object({
  // Personal profile (Step 0)
  firstName: z.string().trim().min(1).max(80).optional(),
  lastName: z.string().trim().min(1).max(80).optional(),
  jobTitle: z.string().trim().max(120).optional(),
  phone: z.string().trim().max(30).optional().or(z.literal("")).transform((v) => v || undefined),
  // Company info (Step 1)
  preferredLocale: z.enum(locales).default("en"),
  companyName: z.string().trim().min(2).max(160),
  workspaceName: z.string().trim().min(2).max(160),
  companySize: z.enum(COMPANY_SIZES).optional(),
  sector: z.string().trim().max(120).optional(),
  decisionRole: z.string().trim().max(120).optional(),
  // Workspace (Step 2)
  website: z.string().url().optional().or(z.literal("")).transform((v) => v || undefined),
  accountType: z.string().optional(), // kept for backward compat — new signups use userFunction
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
      firstName: payload.firstName,
      lastName: payload.lastName,
      jobTitle: payload.jobTitle,
      phone: payload.phone,
      companyName: payload.companyName,
      workspaceName: payload.workspaceName,
      companySize: payload.companySize,
      sector: payload.sector,
      decisionRole: payload.decisionRole,
      website: payload.website,
      accountType: payload.accountType,
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
