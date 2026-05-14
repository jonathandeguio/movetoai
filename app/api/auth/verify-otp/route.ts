import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { verifyOTP } from "@/lib/auth/otp";
import { authRateLimit, checkRateLimit } from "@/lib/auth/rate-limit";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const schema = z.object({
  email: z.string().email(),
  code: z.string().length(6),
});

export async function POST(req: NextRequest) {
  try {
    const body = schema.parse(await req.json());
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";

    const { limited } = await checkRateLimit(authRateLimit, `verify-otp:${ip}`);
    if (limited) {
      return NextResponse.json({ error: "Trop de tentatives. Réessayez dans 15 minutes." }, { status: 429 });
    }

    const result = await verifyOTP(body.email, body.code);
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 422 });
    }

    // Mark user email as verified
    await prisma.user.updateMany({
      where: { email: body.email, emailVerified: null },
      data: { emailVerified: new Date() },
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }
}
