export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/lib/auth";
import { saveProcessFocusSelection } from "@/modules/workspace/server/process-focus-onboarding";
import { resolveSessionContextForUserId } from "@/server/session-context";

const processFocusSchema = z.object({
  selectedProcessIds: z.array(z.string().min(1)).max(5),
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

  try {
    const payload = processFocusSchema.parse(await request.json());
    const result = await saveProcessFocusSelection({
      userId: session.user.id,
      workspaceId: sessionContext.workspace.id,
      selectedProcessIds: payload.selectedProcessIds,
    });

    return NextResponse.json({ ok: true, redirectTo: result.redirectTo });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ code: "INVALID_PAYLOAD" }, { status: 400 });
    }

    if (error instanceof Error) {
      if (
        error.message === "INVALID_SELECTION" ||
        error.message === "INVALID_PROCESS_SELECTION"
      ) {
        return NextResponse.json({ code: error.message }, { status: 400 });
      }
    }

    return NextResponse.json({ code: "UNKNOWN_ERROR" }, { status: 500 });
  }
}
