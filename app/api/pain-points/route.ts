export const runtime = "nodejs";
import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getCurrentWorkspaceContext } from "@/server/auth";

const SeverityEnum = z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]);

const CreateSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().max(2000).nullable().optional(),
  severity: SeverityEnum.default("MEDIUM"),
  processId: z.string().cuid().nullable().optional(),
  domainId: z.string().cuid().nullable().optional(),
  capabilityId: z.string().cuid().nullable().optional(),
});

const EDIT_ROLES = ["WORKSPACE_ADMIN","ENTERPRISE_ARCHITECT","TRANSFORMATION_MANAGER"];

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { workspace } = await getCurrentWorkspaceContext({ requireMembership: true });
  if (!workspace?.id) return NextResponse.json({ error: "No workspace" }, { status: 403 });

  const { searchParams } = new URL(request.url);
  const processId = searchParams.get("processId");
  const domainId = searchParams.get("domainId");
  const severity = searchParams.get("severity");
  const q = searchParams.get("q");

  const where: Record<string, unknown> = { workspaceId: workspace.id, deletedAt: null };
  if (processId) where.processId = processId;
  if (domainId) where.domainId = domainId;
  if (severity) where.severity = severity;
  if (q) where.title = { contains: q };

  const items = await prisma.painPoint.findMany({
    where,
    orderBy: [{ severity: "desc" }, { createdAt: "desc" }],
    select: {
      id: true, title: true, description: true, severity: true,
      processId: true, domainId: true, capabilityId: true, createdAt: true,
      process: { select: { id: true, name: true } },
      domain: { select: { id: true, name: true } },
    },
  });
  return NextResponse.json({ items, total: items.length });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { workspace, role } = await getCurrentWorkspaceContext({ requireMembership: true });
  if (!workspace?.id) return NextResponse.json({ error: "No workspace" }, { status: 403 });

  if (!EDIT_ROLES.includes(role?.code ?? "")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }
  const parsed = CreateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Validation error", issues: parsed.error.issues }, { status: 422 });

  const d = parsed.data;
  const item = await prisma.painPoint.create({
    data: {
      workspaceId: workspace.id,
      title: d.title,
      description: d.description ?? null,
      severity: d.severity,
      processId: d.processId ?? null,
      domainId: d.domainId ?? null,
      capabilityId: d.capabilityId ?? null,
    },
    select: { id: true, title: true, severity: true, createdAt: true },
  });
  return NextResponse.json(item, { status: 201 });
}
