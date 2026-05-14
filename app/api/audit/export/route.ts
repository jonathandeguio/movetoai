export const runtime = "nodejs";

import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getCurrentWorkspaceContext } from "@/server/auth";

function escapeCsvField(value: string | null | undefined): string {
  if (value === null || value === undefined) return "";
  const str = String(value);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { workspace } = await getCurrentWorkspaceContext({ requireMembership: true });
  if (!workspace?.id) return NextResponse.json({ error: "No workspace" }, { status: 403 });

  const logs = await prisma.auditLog.findMany({
    where: { workspaceId: workspace.id },
    include: {
      actorUser: { select: { name: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 500,
  });

  const header = "id,date,acteur,action,entityType,entityId,summary\n";
  const rows = logs
    .map((log) => {
      const date = new Date(log.createdAt).toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
      const acteur = log.actorUser
        ? `${log.actorUser.name ?? ""} <${log.actorUser.email ?? ""}>`
        : "";
      return [
        escapeCsvField(log.id),
        escapeCsvField(date),
        escapeCsvField(acteur),
        escapeCsvField(log.action),
        escapeCsvField(log.entityType),
        escapeCsvField(log.entityId),
        escapeCsvField(log.summary),
      ].join(",");
    })
    .join("\n");

  const csv = header + rows;

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="audit-log.csv"',
    },
  });
}
