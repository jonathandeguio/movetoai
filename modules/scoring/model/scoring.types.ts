export type ScoringLocale = "en" | "fr" | "es";

export type ScoreDimensionKey =
  | "businessValue"
  | "dataReadiness"
  | "technicalFeasibility"
  | "risk"
  | "timeToValue";

export type OpportunityScorePriorityBadge =
  | "QUICK_WIN"
  | "STRATEGIC_BET"
  | "HIGH_RISK";

export type OpportunityWorkflowStatus =
  | "DRAFT"
  | "ASSESSED"
  | "UNDER_REVIEW"
  | "APPROVED"
  | "DEFERRED"
  | "REJECTED"
  | "IN_DELIVERY"
  | "LIVE"
  | "ARCHIVED";

export type OpportunityScoreDimensions = Record<ScoreDimensionKey, number>;

export type OpportunityScoringSummary = {
  total: number;
  badge: OpportunityScorePriorityBadge;
  dimensions: OpportunityScoreDimensions;
};

export type OpportunityScoringInput = {
  expectedValue?: unknown;
  dataReadiness?: string | null;
  riskSeverity?: string | null;
  workflowStatus?: OpportunityWorkflowStatus | string | null;
  existingBadge?: string | null;
  assessment?: {
    valueScore?: unknown;
    feasibilityScore?: unknown;
    riskScore?: unknown;
  } | null;
};
