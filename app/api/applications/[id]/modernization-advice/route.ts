export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getCurrentWorkspaceContext } from "@/server/auth";
import { generateModernizationAdvice } from "@/lib/ai/modernization-advisor";

type RouteContext = { params: Promise<{ id: string }> };

// GET — return cached modernization advice (or null)
export async function GET(_req: Request, { params }: RouteContext) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { workspace } = await getCurrentWorkspaceContext({ requireMembership: true });
  if (!workspace?.id) return NextResponse.json({ error: "No workspace" }, { status: 403 });

  const app = await prisma.application.findFirst({
    where: { id, workspaceId: workspace.id, deletedAt: null },
    select: { modernizationAdvice: true },
  });

  if (!app) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (!app.modernizationAdvice) {
    return NextResponse.json({ advice: null });
  }

  try {
    const advice =
      typeof app.modernizationAdvice === "string"
        ? JSON.parse(app.modernizationAdvice)
        : app.modernizationAdvice;
    return NextResponse.json({ advice });
  } catch {
    return NextResponse.json({ advice: null });
  }
}

// POST — generate (or regenerate) advice via AI
export async function POST(_req: Request, { params }: RouteContext) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { workspace } = await getCurrentWorkspaceContext({ requireMembership: true });
  if (!workspace?.id) return NextResponse.json({ error: "No workspace" }, { status: 403 });

  try {
    const advice = await generateModernizationAdvice(id, workspace.id);
    return NextResponse.json({ advice });
  } catch (err) {
    console.error("[modernization-advice] POST error:", err);
    const message = err instanceof Error ? err.message : "Generation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
