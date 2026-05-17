// app/api/processes/[id]/history/route.ts
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

  const history = await prisma.processHistory.findMany({
    where:   { processId: id },
    orderBy: { createdAt: "desc" },
    take:    50,
    include: { user: { select: { name: true, image: true } } },
  });

  return NextResponse.json({ items: history });
}
