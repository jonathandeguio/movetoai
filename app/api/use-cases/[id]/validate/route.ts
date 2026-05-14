export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getCurrentWorkspaceContext } from "@/server/auth";
import { canValidateUseCase } from "@/lib/permissions/opportunities";

const Schema = z.object({
  decision: z.enum(["approve", "reject", "request_info"]),
  comment: z.string().optional(),
});

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: RouteContext) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { workspace, role } = await getCurrentWorkspaceContext({ requireMembership: true });

  if (!canValidateUseCase(role?.code ?? "")) {
    return NextResponse.json({ error: "Forbidden — Admin or Executive required" }, { status: 403 });
  }

  let body: unknown;
  try { body = await request.json(); }
  catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  const parsed = Schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation error" }, { status: 422 });
  }

  const { decision } = parsed.data;

  if (decision === "approve") {
    await prisma.useCase.update({
      where: { id, workspaceId: workspace?.id },
      data: { status: "active", validatedBy: session.user.id, validatedAt: new Date() },
    });
  } else if (decision === "reject") {
    await prisma.useCase.update({
      where: { id, workspaceId: workspace?.id },
      data: { status: "paused" },
    });
  }
  // "request_info" — no status change, handled by comment system

  return NextResponse.json({ ok: true, decision });
}
