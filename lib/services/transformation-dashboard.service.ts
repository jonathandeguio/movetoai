import "server-only";
import { prisma } from "@/lib/prisma";

export interface TransformationDashboardData {
  workspace: {
    name:       string;
    sectorCode: string | null;
    aiMaturity: string | null;
    horizon:    string | null;
  };
  portfolio: {
    total:      number;
    approved:   number;
    inProgress: number;
    live:       number;
  };
  initiatives: {
    total:      number;
    inProgress: number;
  };
  topP0Opps: Array<{
    id:           string;
    title:        string;
    status:       string;
    gainEstimate: string | null;
  }>;
  recentInitiatives: Array<{
    id:         string;
    name:       string;
    status:     string;
    targetDate: Date | null;
  }>;
}

export const transformationDashboardService = {
  async getPageData(workspaceId: string): Promise<TransformationDashboardData> {
    const [
      ws,
      oppTotal,
      oppApproved,
      oppInProgress,
      oppLive,
      initiativeCount,
      initiativeInProgress,
      topP0Opps,
      recentInitiatives,
    ] = await Promise.all([
      prisma.workspace.findUnique({
        where:  { id: workspaceId },
        select: { name: true, sectorCode: true, aiMaturity: true, horizon: true },
      }),
      prisma.opportunity.count({ where: { workspaceId, deletedAt: null } }),
      prisma.opportunity.count({ where: { workspaceId, status: "APPROVED",    deletedAt: null } }),
      prisma.opportunity.count({ where: { workspaceId, status: "IN_PROGRESS", deletedAt: null } }),
      prisma.opportunity.count({ where: { workspaceId, status: "LIVE",        deletedAt: null } }),
      prisma.initiative.count({  where: { workspaceId, deletedAt: null } }),
      prisma.initiative.count({  where: { workspaceId, status: "IN_PROGRESS", deletedAt: null } }),
      prisma.opportunity.findMany({
        where:   { workspaceId, priorityLevel: "P0", deletedAt: null },
        select:  { id: true, title: true, status: true, gainEstimate: true },
        orderBy: { createdAt: "asc" },
        take:    5,
      }),
      prisma.initiative.findMany({
        where:   { workspaceId, deletedAt: null },
        select:  { id: true, name: true, status: true, targetDate: true },
        orderBy: { createdAt: "desc" },
        take:    4,
      }),
    ]);

    return {
      workspace: {
        name:       ws?.name       ?? "",
        sectorCode: ws?.sectorCode ?? null,
        aiMaturity: ws?.aiMaturity ?? null,
        horizon:    ws?.horizon    ?? null,
      },
      portfolio: {
        total:      oppTotal,
        approved:   oppApproved,
        inProgress: oppInProgress,
        live:       oppLive,
      },
      initiatives: {
        total:      initiativeCount,
        inProgress: initiativeInProgress,
      },
      topP0Opps,
      recentInitiatives,
    };
  },
};
