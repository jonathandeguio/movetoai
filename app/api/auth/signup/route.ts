export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { z } from "zod";

import { locales } from "@/lib/i18n/config";
import { hashPassword } from "@/lib/password";
import { prisma } from "@/lib/prisma";
import { verifyTurnstileToken } from "@/lib/turnstile";
import { checkRateLimit } from "@/lib/rate-limit";

const USER_FUNCTIONS = ["transformation_manager", "enterprise_architect"] as const;

// Accept legacy values from old signup forms still in cache
const LEGACY_FUNCTION_MAP: Record<string, typeof USER_FUNCTIONS[number]> = {
  executive:      "transformation_manager",
  ai_lead:        "transformation_manager",
  business_owner: "transformation_manager",
  other:          "transformation_manager",
  data_it:        "enterprise_architect",
  it_manager:     "enterprise_architect",
  consultant:     "enterprise_architect",
};

const signupSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email(),
  password: z.string().min(8).max(128),
  preferredLocale: z.enum(locales).default("en"),
  userFunction: z.string().optional(),
  turnstileToken: z.string()
});

export async function POST(request: Request) {
  try {
    // Extract client IP
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      request.headers.get("x-real-ip") ??
      "unknown";

    // Rate limit: 3 signup attempts per IP per hour
    const rateCheck = checkRateLimit(`signup:${ip}`, 3, 60 * 60 * 1000);
    if (!rateCheck.allowed) {
      return NextResponse.json({ code: "RATE_LIMITED" }, { status: 429 });
    }

    const payload = signupSchema.parse(await request.json());

    // Verify Cloudflare Turnstile token
    const turnstileOk = await verifyTurnstileToken(payload.turnstileToken, ip);
    if (!turnstileOk) {
      return NextResponse.json({ code: "BOT_DETECTED" }, { status: 403 });
    }

    const email = payload.email.toLowerCase();
    const existingUser = await prisma.user.findUnique({
      where: {
        email
      },
      select: {
        id: true
      }
    });

    if (existingUser) {
      return NextResponse.json({ code: "EMAIL_TAKEN" }, { status: 409 });
    }

    // Normalize userFunction: accept legacy values, default to transformation_manager
    const rawFn = payload.userFunction;
    const userFunction: typeof USER_FUNCTIONS[number] =
      rawFn
        ? (USER_FUNCTIONS.includes(rawFn as typeof USER_FUNCTIONS[number])
            ? (rawFn as typeof USER_FUNCTIONS[number])
            : (LEGACY_FUNCTION_MAP[rawFn] ?? "transformation_manager"))
        : "transformation_manager";

    await prisma.user.create({
      data: {
        name: payload.name,
        email,
        hashedPassword: hashPassword(payload.password),
        status: "ACTIVE",
        preferredLocale: payload.preferredLocale.toUpperCase() as "EN" | "FR" | "ES",
        userFunction,
        preferences: {
          signupSource: "self-serve",
          userFunction, // keep in JSON for backward compat with existing code
        }
      }
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ code: "INVALID_PAYLOAD" }, { status: 400 });
    }

    return NextResponse.json({ code: "UNKNOWN_ERROR" }, { status: 500 });
  }
}
