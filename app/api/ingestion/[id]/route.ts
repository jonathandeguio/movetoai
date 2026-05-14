export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getCurrentWorkspaceContext } from "@/server/auth";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = prisma as any;

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { workspace } = await getCurrentWorkspaceContext({ requireMembership: true });
  if (!workspace?.id) {
    return NextResponse.json({ error: "No workspace" }, { status: 403 });
  }

  const { id } = await params;

  const job = await db.ingestionJob.findFirst({
    where: { id, workspaceId: workspace.id },
    select: {
      id: true,
      fileName: true,
      fileType: true,
      fileSize: true,
      status: true,
      extractedEntities: true,
      errorMessage: true,
      targetEntityType: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!job) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ job });
}
