import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { generateAndSendOTP } from "@/lib/auth/otp";
import { authRateLimit, checkRateLimit } from "@/lib/auth/rate-limit";

export const runtime = "nodejs";

const schema = z.object({
  email: z.string().email(),
});

export async function POST(req: NextRequest) {
  try {
    const body = schema.parse(await req.json());
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";

    const { limited } = await checkRateLimit(authRateLimit, `send-otp:${ip}`);
    if (limited) {
      return NextResponse.json({ error: "Trop de tentatives. Réessayez dans 15 minutes." }, { status: 429 });
    }

    const result = await generateAndSendOTP(body.email);
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }
}
