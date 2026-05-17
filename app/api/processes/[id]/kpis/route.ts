// app/api/processes/[id]/kpis/route.ts
import { NextResponse }               from "next/server";
import { auth }                       from "@/lib/auth";
import { getCurrentWorkspaceContext }  from "@/lib/current-workspace";
import { prisma }                     from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { workspace } = await getCurrentWorkspaceContext();
  const { id } = await params;

  const kpis = await prisma.processKPI.findMany({
    where:   { processId: id },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json({ items: kpis });
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { workspace } = await getCurrentWorkspaceContext();
  if (!workspace?.id) return NextResponse.json({ error: "No workspace" }, { status: 400 });

  const { id } = await params;

  const process = await prisma.process.findFirst({
    where: { id, workspaceId: workspace.id, deletedAt: null },
  });
  if (!process) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json() as {
    name: string; unit: string; currentValue?: number; targetValue?: number;
    direction?: string; measurement?: string; sourceSystem?: string;
  };

  const kpi = await prisma.processKPI.create({
    data: {
      processId:    id,
      name:         body.name,
      unit:         body.unit,
      currentValue: body.currentValue,
      targetValue:  body.targetValue,
      direction:    body.direction ?? "down",
      measurement:  body.measurement,
      sourceSystem: body.sourceSystem,
    },
  });

  return NextResponse.json(kpi, { status: 201 });
}
