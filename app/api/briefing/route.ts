export const runtime = "nodejs";

import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { getCurrentWorkspaceContext } from "@/server/auth";
import { generateWeeklyBriefing } from "@/lib/ai/weekly-briefing";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { workspace } = await getCurrentWorkspaceContext({ requireMembership: true });
  if (!workspace?.id) {
    return NextResponse.json({ error: "No workspace" }, { status: 403 });
  }

  try {
    const briefing = await generateWeeklyBriefing(workspace.id);
    return NextResponse.json(briefing);
  } catch (err) {
    console.error("[briefing] error", err);
    return NextResponse.json({ error: "Failed to generate briefing" }, { status: 500 });
  }
}
