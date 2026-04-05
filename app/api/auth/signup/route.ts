export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { z } from "zod";

import { locales } from "@/lib/i18n/config";
import { hashPassword } from "@/lib/password";
import { prisma } from "@/lib/prisma";

const signupSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email(),
  password: z.string().min(8).max(128),
  preferredLocale: z.enum(locales).default("en")
});

export async function POST(request: Request) {
  try {
    const payload = signupSchema.parse(await request.json());
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

    await prisma.user.create({
      data: {
        name: payload.name,
        email,
        hashedPassword: hashPassword(payload.password),
        status: "ACTIVE",
        preferredLocale: payload.preferredLocale.toUpperCase() as "EN" | "FR" | "ES",
        preferences: {
          signupSource: "self-serve"
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
