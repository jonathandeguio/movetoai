import "server-only";
import { prisma } from "@/lib/prisma";

export interface WorkspaceAdminData {
  workspace: {
    name:       string;
    sectorCode: string | null;
    planType:   string | null;
    seatsUsed:  number | null;
    seatsLimit: number | null;
    certCount:  number;
  };
  counts: {
    members:      number;
    opportunities: number;
    processes:    number;
    capabilities: number;
    pendingOpps:  number;
    aiOpps:       number;
  };
}

export const workspaceAdminDashboardService = {
  async getPageData(workspaceId: string): Promise<WorkspaceAdminData> {
    const [ws, memberCount, oppCount, processCount, capabilityCount, pendingOpps, aiOppsCount] =
      await Promise.all([
        prisma.workspace.findUnique({
          where:  { id: workspaceId },
          select: { name: true, sectorCode: true, companySize: true, planType: true, seatsUsed: true, seatsLimit: true, settings: true },
        }),
        prisma.membership.count({  where: { workspaceId, status: "ACTIVE",  deletedAt: null } }),
        prisma.opportunity.count({ where: { workspaceId, deletedAt: null } }),
        prisma.process.count({     where: { workspaceId, deletedAt: null } }),
        prisma.capability.count({  where: { workspaceId, deletedAt: null } }),
        prisma.opportunity.count({ where: { workspaceId, status: "DRAFT",  deletedAt: null } }),
        prisma.opportunity.count({ where: { workspaceId, detectedBy: "ai", deletedAt: null } }),
      ]);

    const settings = (ws?.settings as Record<string, unknown> | null) ?? {};
    const certs    = (settings.certifications as unknown[] | null) ?? [];

    return {
      workspace: {
        name:       ws?.name       ?? "",
        sectorCode: ws?.sectorCode ?? null,
        planType:   ws?.planType   ?? null,
        seatsUsed:  ws?.seatsUsed  ?? null,
        seatsLimit: ws?.seatsLimit ?? null,
        certCount:  certs.length,
      },
      counts: {
        members:       memberCount,
        opportunities: oppCount,
        processes:     processCount,
        capabilities:  capabilityCount,
        pendingOpps,
        aiOpps:        aiOppsCount,
      },
    };
  },
};
