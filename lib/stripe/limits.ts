import "server-only";
import { prisma } from "@/lib/prisma";
import { getPlanLimits } from "./plans";

export async function checkLimit(
  workspaceId: string,
  feature: "opportunities" | "useCases" | "members" | "bpmn" | "aiScans"
): Promise<{ allowed: boolean; limit: number | null; current?: number }> {
  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    select: { planType: true, seatsUsed: true },
  });
  const plan = getPlanLimits(workspace?.planType ?? "FREE");

  switch (feature) {
    case "opportunities": {
      if (plan.maxOpportunities === null) return { allowed: true, limit: null };
      const count = await prisma.opportunity.count({ where: { workspaceId, deletedAt: null } });
      return { allowed: count < plan.maxOpportunities, limit: plan.maxOpportunities, current: count };
    }
    case "useCases": {
      if (plan.maxUseCases === null) return { allowed: true, limit: null };
      const count = await prisma.useCase.count({ where: { workspaceId, deletedAt: null } });
      return { allowed: count < plan.maxUseCases, limit: plan.maxUseCases, current: count };
    }
    case "members": {
      return { allowed: (workspace?.seatsUsed ?? 0) < plan.maxMembers, limit: plan.maxMembers, current: workspace?.seatsUsed };
    }
    case "bpmn": return { allowed: plan.bpmn, limit: null };
    case "aiScans": {
      if (plan.aiScansPerMonth === null) return { allowed: true, limit: null };
      // Simple check — could add monthly counter later
      return { allowed: true, limit: plan.aiScansPerMonth };
    }
    default: return { allowed: true, limit: null };
  }
}
