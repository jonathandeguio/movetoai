export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getCurrentWorkspaceContext } from "@/server/auth";
import { canValidateOpportunity } from "@/lib/permissions/opportunities";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(_req: Request, { params }: RouteContext) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { workspace, role } = await getCurrentWorkspaceContext({ requireMembership: true });

  if (!canValidateOpportunity(role?.code ?? "")) {
    return NextResponse.json({ error: "Forbidden — Admin or Executive required" }, { status: 403 });
  }

  const opp = await prisma.opportunity.findFirst({
    where: { id, workspaceId: workspace?.id, deletedAt: null },
    select: { status: true },
  });
  if (!opp) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (opp.status === "VALIDATED") return NextResponse.json({ ok: true, already: true });

  await prisma.opportunity.update({
    where: { id },
    data: { status: "VALIDATED" },
  });

  return NextResponse.json({ ok: true });
}
