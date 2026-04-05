import "server-only";

import { prisma } from "@/lib/prisma";
import type { GovernanceDecisionListItem } from "@/modules/governance/model/governance.types";

export async function getDecisions(workspaceId: string): Promise<GovernanceDecisionListItem[]> {
  const opportunities = await prisma.opportunity.findMany({
    where: {
      workspaceId,
      deletedAt: null
    },
    select: {
      id: true,
      title: true,
      status: true,
      updatedAt: true,
      owner: {
        select: {
          name: true
        }
      },
      currentDecision: {
        select: {
          id: true,
          status: true,
          updatedAt: true
        }
      }
    },
    orderBy: {
      updatedAt: "desc"
    },
    take: 24
  });

  return opportunities
    .map<GovernanceDecisionListItem>((opportunity) => ({
      id: opportunity.currentDecision?.id ?? opportunity.id,
      opportunityId: opportunity.id,
      opportunityTitle: opportunity.title,
      currentStatus: opportunity.status,
      decisionStatus: opportunity.currentDecision?.status ?? null,
      ownerName: opportunity.owner?.name ?? null,
      updatedAt: opportunity.currentDecision?.updatedAt ?? opportunity.updatedAt
    }))
    .sort((left, right) => right.updatedAt.getTime() - left.updatedAt.getTime());
}
