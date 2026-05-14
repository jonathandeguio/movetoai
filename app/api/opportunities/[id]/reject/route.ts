export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getCurrentWorkspaceContext } from "@/server/auth";
import { canRejectOpportunity } from "@/lib/permissions/opportunities";

const Schema = z.object({ reason: z.string().min(5).max(1000) });

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: RouteContext) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { workspace, role } = await getCurrentWorkspaceContext({ requireMembership: true });

  if (!canRejectOpportunity(role?.code ?? "")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: unknown;
  try { body = await request.json(); }
  catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  const parsed = Schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Motif requis (min 5 chars)" }, { status: 422 });
  }

  await prisma.opportunity.update({
    where: { id, workspaceId: workspace?.id },
    data: { status: "REJECTED", rejectionReason: parsed.data.reason },
  });

  return NextResponse.json({ ok: true });
}
