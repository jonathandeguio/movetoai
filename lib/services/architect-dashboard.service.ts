import "server-only";
import { prisma } from "@/lib/prisma";

export interface TechRadarEntry {
  state: string;
  count: number;
}

export interface ArchitectDashboardData {
  counts: {
    applications:         number;
    processes:            number;
    capabilities:         number;
    architectureDecisions: number;
    technologies:         number;
  };
  techRadar: TechRadarEntry[];
}

export const architectDashboardService = {
  async getPageData(workspaceId: string): Promise<ArchitectDashboardData> {
    const [
      appCount,
      processCount,
      capabilityCount,
      archDecisionCount,
      techCount,
      techByState,
    ] = await Promise.all([
      prisma.application.count({          where: { workspaceId, deletedAt: null } }),
      prisma.process.count({              where: { workspaceId, deletedAt: null } }),
      prisma.capability.count({           where: { workspaceId, deletedAt: null } }),
      prisma.architectureDecision.count({ where: { workspaceId, deletedAt: null } }),
      prisma.technology.count({           where: { workspaceId, deletedAt: null } }),
      prisma.technology.groupBy({
        by:    ["lifecycleState"],
        where: { workspaceId, deletedAt: null },
        _count: true,
      }),
    ]);

    return {
      counts: {
        applications:          appCount,
        processes:             processCount,
        capabilities:          capabilityCount,
        architectureDecisions: archDecisionCount,
        technologies:          techCount,
      },
      techRadar: techByState.map((t) => ({
        state: t.lifecycleState ?? "unknown",
        count: t._count,
      })),
    };
  },
};
