export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getCurrentWorkspaceContext } from "@/server/auth";
import { generateRelationshipSuggestions } from "@/lib/ai/relationship-suggester";

export async function POST(_request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { workspace } = await getCurrentWorkspaceContext({ requireMembership: true });
  if (!workspace?.id) {
    return NextResponse.json({ error: "No workspace" }, { status: 403 });
  }

  const count = await generateRelationshipSuggestions(workspace.id);

  return NextResponse.json({ count }, { status: 202 });
}

export async function GET(_request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { workspace } = await getCurrentWorkspaceContext({ requireMembership: true });
  if (!workspace?.id) {
    return NextResponse.json({ error: "No workspace" }, { status: 403 });
  }

  const suggestions = await prisma.relationshipSuggestion.findMany({
    where: { workspaceId: workspace.id, status: "pending" },
    orderBy: [{ confidence: "desc" }, { createdAt: "desc" }],
  });

  // Collect all unique IDs per type
  const appIds = new Set<string>();
  const capIds = new Set<string>();
  const procIds = new Set<string>();

  for (const s of suggestions) {
    if (s.sourceType === "application") appIds.add(s.sourceId);
    if (s.targetType === "application") appIds.add(s.targetId);
    if (s.sourceType === "capability") capIds.add(s.sourceId);
    if (s.targetType === "capability") capIds.add(s.targetId);
    if (s.sourceType === "process") procIds.add(s.sourceId);
    if (s.targetType === "process") procIds.add(s.targetId);
  }

  const [apps, caps, procs] = await Promise.all([
    appIds.size > 0
      ? prisma.application.findMany({
          where: { id: { in: [...appIds] } },
          select: { id: true, name: true },
        })
      : Promise.resolve([]),
    capIds.size > 0
      ? prisma.capability.findMany({
          where: { id: { in: [...capIds] } },
          select: { id: true, name: true },
        })
      : Promise.resolve([]),
    procIds.size > 0
      ? prisma.process.findMany({
          where: { id: { in: [...procIds] } },
          select: { id: true, name: true },
        })
      : Promise.resolve([]),
  ]);

  const nameMap = new Map<string, string>();
  for (const a of apps) nameMap.set(a.id, a.name);
  for (const c of caps) nameMap.set(c.id, c.name);
  for (const p of procs) nameMap.set(p.id, p.name);

  const enriched = suggestions.map((s) => ({
    ...s,
    sourceName: nameMap.get(s.sourceId) ?? s.sourceId,
    targetName: nameMap.get(s.targetId) ?? s.targetId,
  }));

  return NextResponse.json({ suggestions: enriched });
}
