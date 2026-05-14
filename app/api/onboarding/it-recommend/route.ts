export const runtime = "nodejs";

import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { recommendITRoadmap } from "@/lib/claude-it";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await request.json()) as {
      systems?: string[];
      constraint?: string;
    };

    const systems = Array.isArray(body.systems) ? body.systems : [];
    const constraint =
      typeof body.constraint === "string" ? body.constraint : "Conformité RGPD / sécurité des données";

    // Always returns a result (fallback on error)
    const roadmap = await recommendITRoadmap({ systems, constraint });

    return NextResponse.json({ ok: true, ...roadmap });
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
