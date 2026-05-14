export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getCurrentWorkspaceContext } from "@/server/auth";

function slugify(t: string) { return t.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,""); }
function shortId() { return Math.random().toString(36).slice(2,8); }

const CreateSchema = z.object({
  name: z.string().min(2).max(120),
  description: z.string().max(2000).nullable().optional(),
  code: z.string().max(20).nullable().optional(),
  parentId: z.string().cuid().nullable().optional(),
});

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { workspace } = await getCurrentWorkspaceContext({ requireMembership: true });
  if (!workspace?.id) return NextResponse.json({ error: "No workspace" }, { status: 403 });

  const items = await prisma.businessUnit.findMany({
    where: { workspaceId: workspace.id, deletedAt: null },
    orderBy: { name: "asc" },
    select: {
      id: true, name: true, description: true, slug: true, code: true, parentId: true, updatedAt: true,
      _count: { select: { domains: true, capabilities: true, processes: true } },
    },
  });
  return NextResponse.json({ items, total: items.length });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { workspace, role } = await getCurrentWorkspaceContext({ requireMembership: true });
  if (!workspace?.id) return NextResponse.json({ error: "No workspace" }, { status: 403 });

  if (!["WORKSPACE_ADMIN"].includes(role?.code ?? "")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }
  const parsed = CreateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Validation error", issues: parsed.error.issues }, { status: 422 });

  const d = parsed.data;
  const bu = await prisma.businessUnit.create({
    data: { workspaceId: workspace.id, name: d.name, slug: `${slugify(d.name)}-${shortId()}`, description: d.description ?? null, code: d.code ?? null, parentId: d.parentId ?? null },
    select: { id: true, name: true, slug: true, code: true, createdAt: true },
  });
  return NextResponse.json(bu, { status: 201 });
}
