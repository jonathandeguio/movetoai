export const runtime = "nodejs";

import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getCurrentWorkspaceContext } from "@/server/auth";

// ── GET /api/search?q=... ─────────────────────────────────────────────────────

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { workspace } = await getCurrentWorkspaceContext({ requireMembership: true });
  if (!workspace?.id) return NextResponse.json({ error: "No workspace" }, { status: 403 });

  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") ?? "").trim();

  if (q.length < 2) return NextResponse.json({ results: [] });

  const wid = workspace.id;

  type SearchResult = {
    type: string;
    id: string;
    label: string;
    subtitle: string | null;
    href: string;
  };

  const [applications, capabilities, processes, useCases, opportunities, technologies, surveys, decisions] =
    await Promise.all([
      prisma.application.findMany({
        where: {
          workspaceId: wid,
          deletedAt: null,
          OR: [{ name: { contains: q } }, { description: { contains: q } }],
        },
        select: { id: true, name: true, description: true },
        take: 5,
      }),
      prisma.capability.findMany({
        where: {
          workspaceId: wid,
          OR: [{ name: { contains: q } }, { description: { contains: q } }],
        },
        select: { id: true, name: true, description: true },
        take: 5,
      }),
      prisma.process.findMany({
        where: {
          workspaceId: wid,
          OR: [{ name: { contains: q } }, { description: { contains: q } }],
        },
        select: { id: true, name: true, description: true },
        take: 5,
      }),
      prisma.useCase.findMany({
        where: {
          workspaceId: wid,
          deletedAt: null,
          OR: [{ title: { contains: q } }],
        },
        select: { id: true, title: true, status: true },
        take: 5,
      }),
      prisma.opportunity.findMany({
        where: {
          workspaceId: wid,
          deletedAt: null,
          OR: [{ title: { contains: q } }, { summary: { contains: q } }],
        },
        select: { id: true, title: true, status: true },
        take: 5,
      }),
      prisma.technology.findMany({
        where: {
          workspaceId: wid,
          OR: [{ name: { contains: q } }],
        },
        select: { id: true, name: true, category: true },
        take: 5,
      }),
      prisma.survey.findMany({
        where: {
          workspaceId: wid,
          deletedAt: null,
          OR: [{ title: { contains: q } }, { description: { contains: q } }],
        },
        select: { id: true, title: true, status: true },
        take: 3,
      }),
      prisma.architectureDecision.findMany({
        where: {
          workspaceId: wid,
          deletedAt: null,
          OR: [{ title: { contains: q } }, { context: { contains: q } }],
        },
        select: { id: true, title: true, status: true },
        take: 3,
      }),
    ]);

  const results: SearchResult[] = [
    ...applications.map((a) => ({
      type: "application" as const,
      id: a.id,
      label: a.name,
      subtitle: a.description ?? null,
      href: `/app/knowledge/applications/${a.id}`,
    })),
    ...capabilities.map((c) => ({
      type: "capability" as const,
      id: c.id,
      label: c.name,
      subtitle: c.description ?? null,
      href: `/app/knowledge/capabilities/${c.id}`,
    })),
    ...processes.map((p) => ({
      type: "process" as const,
      id: p.id,
      label: p.name,
      subtitle: p.description ?? null,
      href: `/app/knowledge/processes/${p.id}`,
    })),
    ...useCases.map((u) => ({
      type: "use_case" as const,
      id: u.id,
      label: u.title,
      subtitle: u.status ?? null,
      href: `/app/use-cases/${u.id}`,
    })),
    ...opportunities.map((o) => ({
      type: "opportunity" as const,
      id: o.id,
      label: o.title,
      subtitle: String(o.status),
      href: `/app/opportunities/${o.id}`,
    })),
    ...technologies.map((t) => ({
      type: "technology" as const,
      id: t.id,
      label: t.name,
      subtitle: t.category ?? null,
      href: `/app/knowledge/technologies/${t.id}`,
    })),
    ...surveys.map((s) => ({
      type: "survey" as const,
      id: s.id,
      label: s.title,
      subtitle: s.status,
      href: `/app/surveys/${s.id}`,
    })),
    ...decisions.map((d) => ({
      type: "decision" as const,
      id: d.id,
      label: d.title,
      subtitle: d.status,
      href: `/app/governance/decisions/${d.id}`,
    })),
  ];

  return NextResponse.json({ results, query: q });
}
