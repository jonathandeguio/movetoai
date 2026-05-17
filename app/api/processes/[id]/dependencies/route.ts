// app/api/processes/[id]/dependencies/route.ts
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

  const [upstream, downstream] = await Promise.all([
    prisma.processDependency.findMany({
      where:   { sourceId: id },
      include: { target: { select: { id: true, name: true, domain: { select: { name: true } } } } },
    }),
    prisma.processDependency.findMany({
      where:   { targetId: id },
      include: { source: { select: { id: true, name: true, domain: { select: { name: true } } } } },
    }),
  ]);

  return NextResponse.json({ upstream, downstream });
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
  const body = await req.json() as { targetId: string; dependencyType?: string; description?: string };

  const dep = await prisma.processDependency.create({
    data: {
      sourceId:       id,
      targetId:       body.targetId,
      dependencyType: body.dependencyType ?? "upstream",
      description:    body.description,
    },
  });

  return NextResponse.json(dep, { status: 201 });
}
