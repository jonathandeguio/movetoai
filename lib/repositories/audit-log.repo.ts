import "server-only";
import { prisma } from "@/lib/prisma";

export interface AuditLogFilters {
  entityType?: string;
  action?: string;
}

export const auditLogRepo = {
  /** Dernières entrées d'audit (avec filtres optionnels) */
  async findByWorkspace(workspaceId: string, filters: AuditLogFilters = {}, limit = 100) {
    const where: Record<string, unknown> = { workspaceId };
    if (filters.entityType) where.entityType = filters.entityType;
    if (filters.action) where.action = { contains: filters.action };

    return prisma.auditLog.findMany({
      where,
      include: {
        actorUser: { select: { name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
  },

  /** Types d'entités distincts pour les filtres */
  async findDistinctEntityTypes(workspaceId: string): Promise<string[]> {
    const rows = await prisma.auditLog.findMany({
      where:    { workspaceId },
      select:   { entityType: true },
      distinct: ["entityType"],
      orderBy:  { entityType: "asc" },
    });
    return rows.map((r) => r.entityType).filter(Boolean) as string[];
  },
};
