export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: RouteContext) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const diagram = await prisma.processDiagram.findUnique({
    where: { useCaseId: id },
    select: {
      versions: {
        orderBy: { versionNumber: "desc" },
        take: 50,
        select: {
          versionNumber: true,
          changeSummary: true,
          createdAt:     true,
          author:        { select: { name: true } },
        },
      },
    },
  });

  return NextResponse.json(diagram?.versions ?? []);
}
