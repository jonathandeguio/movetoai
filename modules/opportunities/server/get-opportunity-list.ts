import "server-only";

import type { Prisma } from "@prisma/client";

import { deriveOpportunityWorkflowStatus } from "@/lib/demo-labels";
import { prisma } from "@/lib/prisma";
import type { OpportunityFilters } from "@/modules/opportunities/model/opportunity.filters";
import { deriveOpportunityScoring } from "@/modules/scoring/domain/calculate-score";

function buildOpportunityWhere(
  workspaceId: string,
  filters: OpportunityFilters
): Prisma.OpportunityWhereInput {
  const where: Prisma.OpportunityWhereInput = {
    workspaceId,
    deletedAt: null
  };

  if (filters.q) {
    where.OR = [
      { title: { contains: filters.q } },
      { summary: { contains: filters.q } },
      { problemStatement: { contains: filters.q } },
      { aiHypothesis: { contains: filters.q } },
      { process: { name: { contains: filters.q } } },
      { domain: { name: { contains: filters.q } } }
    ];
  }

  if (filters.domainId) {
    where.domainId = filters.domainId;
  }

  if (filters.processId) {
    where.processId = filters.processId;
  }

  if (filters.typeId) {
    where.opportunityTypeId = filters.typeId;
  }

  if (filters.ownerId) {
    where.ownerId = filters.ownerId;
  }

  if (filters.businessUnitId) {
    where.businessUnitId = filters.businessUnitId;
  }

  if (filters.status) {
    where.status = filters.status as Prisma.EnumOpportunityStatusFilter["equals"];
  }

  if (filters.badge) {
    where.badge = filters.badge as Prisma.EnumOpportunityBadgeFilter["equals"];
  }

  if (filters.riskLevel) {
    where.riskSeverity = filters.riskLevel as Prisma.EnumRiskSeverityFilter["equals"];
  }

  if (filters.score === "80-plus") {
    where.overallScore = { gte: 80 };
  }

  if (filters.score === "60-79") {
    where.overallScore = { gte: 60, lt: 80 };
  }

  if (filters.score === "under-60") {
    where.OR = [
      ...(where.OR ?? []),
      { overallScore: { lt: 60 } },
      { overallScore: null }
    ];
  }

  return where;
}

export async function getOpportunityList(workspaceId: string, filters: OpportunityFilters) {
  const where = buildOpportunityWhere(workspaceId, filters);

  const [businessUnits, domains, processes, owners, opportunityTypes, opportunities] = await Promise.all([
    prisma.businessUnit.findMany({
      where: { workspaceId, deletedAt: null },
      select: { id: true, name: true },
      orderBy: { name: "asc" }
    }),
    prisma.domain.findMany({
      where: { workspaceId, deletedAt: null },
      select: { id: true, name: true },
      orderBy: { name: "asc" }
    }),
    prisma.process.findMany({
      where: { workspaceId, deletedAt: null },
      select: { id: true, name: true },
      orderBy: { name: "asc" }
    }),
    prisma.membership.findMany({
      where: {
        workspaceId,
        status: "ACTIVE",
        deletedAt: null,
        user: {
          deletedAt: null,
          status: "ACTIVE"
        }
      },
      select: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        user: {
          name: "asc"
        }
      }
    }),
    prisma.opportunityType.findMany({
      where: { workspaceId, deletedAt: null },
      select: { id: true, name: true },
      orderBy: { name: "asc" }
    }),
    prisma.opportunity.findMany({
      where,
      select: {
        id: true,
        title: true,
        summary: true,
        status: true,
        badge: true,
        riskSeverity: true,
        dataReadiness: true,
        overallScore: true,
        expectedValue: true,
        realizedValue: true,
        domain: {
          select: {
            id: true,
            name: true
          }
        },
        process: {
          select: {
            id: true,
            name: true
          }
        },
        businessUnit: {
          select: {
            id: true,
            name: true
          }
        },
        opportunityType: {
          select: {
            id: true,
            name: true
          }
        },
        owner: {
          select: {
            id: true,
            name: true
          }
        },
        sponsor: {
          select: {
            id: true,
            name: true
          }
        },
        currentDecision: {
          select: {
            status: true,
            summary: true,
            decidedAt: true
          }
        },
        initiatives: {
          where: { deletedAt: null },
          select: {
            id: true,
            name: true,
            status: true
          },
          orderBy: { createdAt: "desc" },
          take: 1
        },
        risks: {
          where: { deletedAt: null },
          select: { id: true }
        },
        comments: {
          where: { deletedAt: null },
          select: { id: true }
        },
        complianceChecks: {
          where: { deletedAt: null },
          select: { id: true }
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
          orderBy: { createdAt: "desc" },
          take: 1
        }
      },
      orderBy: [
        { overallScore: "desc" },
        { expectedValue: "desc" },
        { createdAt: "desc" }
      ]
    })
  ]);

  const hydratedOpportunities = opportunities.map((opportunity) => {
    const workflowStatus = deriveOpportunityWorkflowStatus(
      opportunity.status,
      opportunity.currentDecision?.status
    );

    return {
      ...opportunity,
      workflowStatus,
      scoring: deriveOpportunityScoring({
        expectedValue: opportunity.expectedValue,
        dataReadiness: opportunity.dataReadiness,
        riskSeverity: opportunity.riskSeverity,
        workflowStatus,
        existingBadge: opportunity.badge,
        assessment: opportunity.assessments[0] ?? null
      }),
      riskCount: opportunity.risks.length,
      commentCount: opportunity.comments.length,
      complianceCount: opportunity.complianceChecks.length
    };
  });

  const metrics = hydratedOpportunities.reduce(
    (accumulator, opportunity) => {
      accumulator.total += 1;

      if (opportunity.scoring.badge === "QUICK_WIN") {
        accumulator.quickWins += 1;
      }

      if (
        opportunity.workflowStatus === "UNDER_REVIEW" ||
        opportunity.workflowStatus === "APPROVED" ||
        opportunity.workflowStatus === "IN_DELIVERY" ||
        opportunity.workflowStatus === "LIVE"
      ) {
        accumulator.portfolioReady += 1;
      }

      if (
        opportunity.workflowStatus === "IN_DELIVERY" ||
        opportunity.workflowStatus === "LIVE"
      ) {
        accumulator.inDeliveryOrLive += 1;
      }

      accumulator.realizedValue += Number(opportunity.realizedValue ?? 0);
      return accumulator;
    },
    {
      total: 0,
      quickWins: 0,
      portfolioReady: 0,
      inDeliveryOrLive: 0,
      realizedValue: 0
    }
  );

  return {
    businessUnits,
    domains,
    processes,
    owners: owners
      .map((membership) => membership.user)
      .filter((user): user is NonNullable<typeof user> => Boolean(user))
      .map((user) => ({
        id: user.id,
        name: user.name ?? user.email ?? "Unknown"
      })),
    opportunityTypes,
    opportunities: hydratedOpportunities,
    metrics
  };
}
