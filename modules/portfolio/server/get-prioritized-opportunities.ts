import "server-only";

import { prisma } from "@/lib/prisma";
import { deriveOpportunityScoring } from "@/modules/scoring/domain/calculate-score";
import type {
  PortfolioPriorityGroup,
  PrioritizedOpportunity,
  PrioritizedOpportunityGroup
} from "@/modules/portfolio/model/portfolio.types";

const portfolioGroupOrder: PortfolioPriorityGroup[] = [
  "QUICK_WIN",
  "STRATEGIC_BET",
  "HIGH_RISK"
];

export async function getPrioritizedOpportunities(
  workspaceId: string
): Promise<PrioritizedOpportunityGroup[]> {
  const opportunities = await prisma.opportunity.findMany({
    where: {
      workspaceId,
      deletedAt: null
    },
    select: {
      id: true,
      title: true,
      status: true,
      badge: true,
      expectedValue: true,
      dataReadiness: true,
      riskSeverity: true,
      process: {
        select: {
          name: true
        }
      },
      assessments: {
        where: {
          deletedAt: null,
          isCurrent: true
        },
        select: {
          valueScore: true,
          feasibilityScore: true,
          riskScore: true
        },
        orderBy: {
          createdAt: "desc"
        },
        take: 1
      }
    },
    orderBy: [
      {
        createdAt: "desc"
      }
    ]
  });

  const prioritized = opportunities
    .map<PrioritizedOpportunity>((opportunity) => {
      const scoring = deriveOpportunityScoring({
        expectedValue: opportunity.expectedValue,
        dataReadiness: opportunity.dataReadiness,
        riskSeverity: opportunity.riskSeverity,
        workflowStatus: opportunity.status,
        existingBadge: opportunity.badge,
        assessment: opportunity.assessments[0] ?? null
      });

      return {
        id: opportunity.id,
        title: opportunity.title,
        processName: opportunity.process.name,
        score: scoring.total,
        badge: scoring.badge,
        status: opportunity.status
      };
    })
    .sort((left, right) => {
      const leftGroupIndex = portfolioGroupOrder.indexOf(left.badge);
      const rightGroupIndex = portfolioGroupOrder.indexOf(right.badge);

      if (leftGroupIndex !== rightGroupIndex) {
        return leftGroupIndex - rightGroupIndex;
      }

      if (left.score !== right.score) {
        return right.score - left.score;
      }

      return left.title.localeCompare(right.title);
    });

  return portfolioGroupOrder.map((groupKey) => ({
    key: groupKey,
    items: prioritized.filter((item) => item.badge === groupKey)
  }));
}
