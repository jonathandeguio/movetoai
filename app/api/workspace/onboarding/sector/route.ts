export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { z } from "zod";

import { getCurrentWorkspaceContext } from "@/server/auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  sectorCode:  z.string().min(1),
  companySize: z.enum(["tpe", "pme", "eti", "ge"]),
});

export async function PATCH(request: Request) {
  const { workspace } = await getCurrentWorkspaceContext({ requireMembership: true });
  if (!workspace?.id) {
    return NextResponse.json({ code: "NO_WORKSPACE" }, { status: 400 });
  }

  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ code: "INVALID_PAYLOAD" }, { status: 400 });
  }

  await prisma.workspace.update({
    where: { id: workspace.id },
    data: {
      sectorCode:  parsed.data.sectorCode,
      companySize: parsed.data.companySize,
    },
  });

  return NextResponse.json({ ok: true });
}
