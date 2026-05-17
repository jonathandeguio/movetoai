export const runtime = "nodejs";

import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { resolveSessionContextForUserId } from "@/server/session-context";
import { calculateComplianceScore } from "@/lib/certifications/compliance-calculator";

// ── GET — workspace compliance score ─────────────────────────────────────────

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ code: "UNAUTHENTICATED" }, { status: 401 });
  }

  const ctx = await resolveSessionContextForUserId(session.user.id);
  if (!ctx?.workspace?.id) {
    return NextResponse.json({ code: "NO_WORKSPACE" }, { status: 400 });
  }

  const result = await calculateComplianceScore(ctx.workspace.id);
  return NextResponse.json(result);
}
