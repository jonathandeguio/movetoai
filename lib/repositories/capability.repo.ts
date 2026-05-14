import "server-only";
import { prisma } from "@/lib/prisma";

export const capabilityRepo = {
  /** Compte les capacités issues du catalogue */
  async countFromCatalog(workspaceId: string): Promise<number> {
    return prisma.capability.count({ where: { workspaceId, isFromCatalog: true, deletedAt: null } });
  },

  /** Toutes les capacités d'un workspace (vue complète) */
  async findByWorkspace(workspaceId: string) {
    return prisma.capability.findMany({
      where:   { workspaceId, deletedAt: null },
      orderBy: { name: "asc" },
      include: {
        parent:    { select: { id: true, name: true } },
        children:  { select: { id: true, name: true, level: true } },
        processes: { select: { id: true, name: true, aiPotential: true } },
        _count:    { select: { processes: true, opportunities: true } },
      },
    });
  },

  /** Vue pour la page knowledge/capabilities (arbre) */
  async findForKnowledge(workspaceId: string) {
    return prisma.capability.findMany({
      where:   { workspaceId, deletedAt: null },
      orderBy: { level: "asc" },
      select: {
        id: true, name: true, description: true, level: true, parentId: true,
        strategicValue: true, aiPotential: true, maturityScore: true,
        owner: { select: { name: true } },
        _count: { select: { processes: true, appCapabilities: true } },
      },
    });
  },

  /** Vue allégée pour le heatmap de maturité */
  async findForMaturity(workspaceId: string) {
    return prisma.capability.findMany({
      where:   { workspaceId, deletedAt: null },
      orderBy: [{ level: "asc" }, { name: "asc" }],
      select: {
        id: true, name: true, level: true, parentId: true,
        maturityScore: true, strategicValue: true, aiPotential: true,
        owner: { select: { name: true } },
        _count: { select: { processes: true, appCapabilities: true } },
      },
    });
  },
};
