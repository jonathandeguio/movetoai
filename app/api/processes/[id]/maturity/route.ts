// app/api/processes/[id]/maturity/route.ts
import { NextResponse }               from "next/server";
import { auth }                       from "@/lib/auth";
import { getCurrentWorkspaceContext }  from "@/lib/current-workspace";
import { prisma }                     from "@/lib/prisma";
import { calculateMaturityScore }     from "@/lib/processes/maturity-calculator";

export const runtime = "nodejs";

export async function GET(
  _req: Request,
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

  const result = await calculateMaturityScore(id);
  return NextResponse.json(result);
}
