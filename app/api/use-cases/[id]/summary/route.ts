export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getCurrentWorkspaceContext } from "@/server/auth";
import { generateSummary } from "@/app/actions/generateSummary";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(_req: Request, { params }: RouteContext) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await getCurrentWorkspaceContext({ requireMembership: true });

  const { id } = await params;
  const result = await generateSummary(id);

  if (!result.ok) return NextResponse.json({ error: result.error }, { status: 500 });
  return NextResponse.json({ markdown: result.markdown });
}
