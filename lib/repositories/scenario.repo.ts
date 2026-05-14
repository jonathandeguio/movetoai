import "server-only";
import { prisma } from "@/lib/prisma";

export const scenarioRepo = {
  /** Liste des scénarios d'un workspace */
  async findByWorkspace(workspaceId: string) {
    return prisma.scenario.findMany({
      where:   { workspaceId, deletedAt: null },
      orderBy: { createdAt: "desc" },
      select: {
        id: true, title: true, description: true,
        status: true,
        totalInvestment: true, totalExpectedGain: true, roi: true,
        createdAt: true,
      },
    });
  },

  /** Détail d'un scénario */
  async findById(id: string, workspaceId: string) {
    return prisma.scenario.findFirst({
      where: { id, workspaceId, deletedAt: null },
    });
  },

  /** Tous les titres (pour navigation) */
  async findTitles(workspaceId: string) {
    return prisma.scenario.findMany({
      where:   { workspaceId, deletedAt: null },
      select:  { id: true, title: true },
      orderBy: { createdAt: "desc" },
    });
  },
};
