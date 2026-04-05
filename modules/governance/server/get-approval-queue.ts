import "server-only";

import { prisma } from "@/lib/prisma";
import type { GovernanceApprovalQueueItem } from "@/modules/governance/model/governance.types";

export async function getApprovalQueue(
  workspaceId: string
): Promise<GovernanceApprovalQueueItem[]> {
  const steps = await prisma.approvalStep.findMany({
    where: {
      status: "PENDING",
      decision: {
        workspaceId,
        deletedAt: null,
        opportunity: {
          deletedAt: null
        }
      }
    },
    select: {
      id: true,
      approverRoleLabel: true,
      dueDate: true,
      updatedAt: true,
      approver: {
        select: {
          name: true
        }
      },
      decision: {
        select: {
          status: true,
          opportunity: {
            select: {
              id: true,
              title: true
            }
          }
        }
      }
    },
    orderBy: [
      {
        dueDate: "asc"
      },
      {
        updatedAt: "desc"
      }
    ],
    take: 12
  });

  return steps.map<GovernanceApprovalQueueItem>((step) => ({
    id: step.id,
    opportunityId: step.decision.opportunity.id,
    opportunityTitle: step.decision.opportunity.title,
    decisionStatus: step.decision.status,
    approverName: step.approver?.name ?? null,
    approverRoleLabel: step.approverRoleLabel,
    dueDate: step.dueDate,
    updatedAt: step.updatedAt
  }));
}
