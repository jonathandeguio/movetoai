export type DecisionSummary = {
  id: string;
  status: string;
  summary: string | null;
  decidedAt: Date | null;
};

export type GovernanceDecisionListItem = {
  id: string;
  opportunityId: string;
  opportunityTitle: string;
  currentStatus: string;
  decisionStatus: string | null;
  ownerName: string | null;
  updatedAt: Date;
};

export type GovernanceApprovalQueueItem = {
  id: string;
  opportunityId: string;
  opportunityTitle: string;
  decisionStatus: string;
  approverName: string | null;
  approverRoleLabel: string | null;
  dueDate: Date | null;
  updatedAt: Date;
};
