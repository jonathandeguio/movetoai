import "server-only";
import { prisma } from "@/lib/prisma";

export const technologyRepo = {
  /** Liste pour le Tech Radar */
  async findForRadar(workspaceId: string) {
    return prisma.technology.findMany({
      where:   { workspaceId, deletedAt: null },
      select:  { id: true, name: true, category: true, lifecycleState: true, vendor: true, riskLevel: true },
      orderBy: { name: "asc" },
    });
  },

  /** Distribution par lifecycleState */
  async groupByState(workspaceId: string) {
    return prisma.technology.groupBy({
      by:    ["lifecycleState"],
      where: { workspaceId, deletedAt: null },
      _count: true,
    });
  },
};
