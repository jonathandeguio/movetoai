export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/lib/auth";
import { resolveSessionContextForUserId } from "@/server/session-context";
import { saveAIProcessFocusSelection } from "@/modules/workspace/server/process-focus-onboarding";

const processSchema = z.object({
  id: z.string(),
  label: z.string(),
  domain: z.string(),
  description: z.string(),
  priority: z.number(),
  estimated_gain: z.string(),
  complexity: z.enum(["low", "medium", "high"]),
});

const completeSchema = z.object({
  selectedDomains: z.array(z.string().min(1)).min(1).max(3),
  selectedProcesses: z.array(processSchema).min(1).max(6),
  profileSummary: z.string(),
});

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ code: "UNAUTHENTICATED" }, { status: 401 });
  }

  const sessionContext = await resolveSessionContextForUserId(session.user.id);
  if (!sessionContext?.workspace?.id) {
    return NextResponse.json({ code: "NO_WORKSPACE" }, { status: 400 });
  }

  const body = await request.json().catch(() => null);
  const parsed = completeSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ code: "INVALID_PAYLOAD" }, { status: 400 });
  }

  try {
    const result = await saveAIProcessFocusSelection({
      userId: session.user.id,
      workspaceId: sessionContext.workspace.id,
      selectedDomains: parsed.data.selectedDomains,
      selectedProcesses: parsed.data.selectedProcesses,
      profileSummary: parsed.data.profileSummary,
    });

    return NextResponse.json({ ok: true, redirectTo: result.redirectTo });
  } catch {
    return NextResponse.json({ code: "UNKNOWN_ERROR" }, { status: 500 });
  }
}
