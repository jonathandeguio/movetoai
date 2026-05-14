export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getCurrentWorkspaceContext } from "@/server/auth";

const PatchSchema = z.object({
  status: z.enum(["accepted", "rejected"]),
});

export async function PATCH(
  request: Request,
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

  const body = await request.json().catch(() => ({}));
  const parsed = PatchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid body", details: parsed.error.flatten() }, { status: 400 });
  }

  const { status } = parsed.data;

  const suggestion = await prisma.relationshipSuggestion.findFirst({
    where: { id, workspaceId: workspace.id },
  });

  if (!suggestion) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Apply relationship if accepted
  if (status === "accepted") {
    const { sourceType, sourceId, targetType, targetId } = suggestion;

    if (sourceType === "application" && targetType === "capability") {
      await prisma.appCapabilityMap.upsert({
        where: { applicationId_capabilityId: { applicationId: sourceId, capabilityId: targetId } },
        update: {},
        create: { applicationId: sourceId, capabilityId: targetId, coverage: "partial" },
      });
    } else if (sourceType === "capability" && targetType === "application") {
      await prisma.appCapabilityMap.upsert({
        where: { applicationId_capabilityId: { applicationId: targetId, capabilityId: sourceId } },
        update: {},
        create: { applicationId: targetId, capabilityId: sourceId, coverage: "partial" },
      });
    } else if (sourceType === "application" && targetType === "process") {
      await prisma.processApplication.upsert({
        where: { processId_applicationId: { processId: targetId, applicationId: sourceId } },
        update: {},
        create: { processId: targetId, applicationId: sourceId },
      });
    } else if (sourceType === "process" && targetType === "application") {
      await prisma.processApplication.upsert({
        where: { processId_applicationId: { processId: sourceId, applicationId: targetId } },
        update: {},
        create: { processId: sourceId, applicationId: targetId },
      });
    }
    // process <-> capability: no junction table found, skip silently
  }

  const updated = await prisma.relationshipSuggestion.update({
    where: { id },
    data: { status },
  });

  return NextResponse.json({ suggestion: updated });
}
