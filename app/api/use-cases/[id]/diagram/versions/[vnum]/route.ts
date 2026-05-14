export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type RouteContext = { params: Promise<{ id: string; vnum: string }> };

export async function GET(_req: Request, { params }: RouteContext) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id, vnum } = await params;
  const versionNumber = parseInt(vnum, 10);
  if (isNaN(versionNumber)) {
    return NextResponse.json({ error: "Invalid version number" }, { status: 400 });
  }

  const diagram = await prisma.processDiagram.findUnique({
    where: { useCaseId: id },
    select: { id: true },
  });
  if (!diagram) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const version = await prisma.processDiagramVersion.findUnique({
    where: {
      diagramId_versionNumber: {
        diagramId:     diagram.id,
        versionNumber,
      },
    },
    select: { xml: true, svg: true, createdAt: true },
  });

  if (!version) return NextResponse.json({ error: "Version not found" }, { status: 404 });
  return NextResponse.json(version);
}
