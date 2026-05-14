export const runtime = "nodejs";

import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { recommendConsultantUseCases } from "@/lib/claude-consultant";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await request.json()) as {
      specialization?: string;
      yearsExperience?: string;
      sectors?: string[];
      tools?: string[];
    };

    const specialization =
      typeof body.specialization === "string" ? body.specialization : "IA générative";
    const yearsExperience =
      typeof body.yearsExperience === "string" ? body.yearsExperience : "1-3 ans";
    const sectors = Array.isArray(body.sectors) ? body.sectors : [];
    const tools = Array.isArray(body.tools) ? body.tools : [];

    // Always returns a result (fallback on error)
    const result = await recommendConsultantUseCases({
      specialization,
      yearsExperience,
      sectors,
      tools,
    });

    return NextResponse.json({ ok: true, ...result });
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
