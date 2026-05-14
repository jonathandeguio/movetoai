// app/api/aria/context/route.ts
// GET ?page=/app/opportunities — retourne les métriques de la page pour les bannières Aria.

import { NextResponse }              from "next/server";
import { auth }                      from "@/lib/auth";
import { getCurrentWorkspaceContext } from "@/lib/current-workspace";
import { buildPageContext }           from "@/lib/aria/context-builder";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({});

    const { workspace } = await getCurrentWorkspaceContext();
    if (!workspace?.id)  return NextResponse.json({});

    const url      = new URL(request.url);
    const pagePath = url.searchParams.get("page") ?? "/app";

    const context = await buildPageContext(pagePath, workspace.id);
    return NextResponse.json(context);
  } catch {
    return NextResponse.json({});
  }
}
