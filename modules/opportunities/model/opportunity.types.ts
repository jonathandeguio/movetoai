import type {
  OpportunityScoringSummary,
  OpportunityWorkflowStatus
} from "@/modules/scoring/model/scoring.types";

export type OpportunityOption = {
  id: string;
  name: string;
};

export type OpportunityCurrentDecision = {
  status: string;
  summary?: string | null;
  decidedAt?: Date | null;
} | null;

export type OpportunityListMetrics = {
  total: number;
  quickWins: number;
  portfolioReady: number;
  inDeliveryOrLive: number;
  realizedValue: number;
};

export type OpportunityListItem = {
  id: string;
  title: string;
  summary: string | null;
  status: string;
  badge: string;
  riskSeverity: string;
  dataReadiness: string;
  overallScore: unknown;
  expectedValue: unknown;
  realizedValue: unknown;
  domain: OpportunityOption;
  process: OpportunityOption;
  businessUnit: OpportunityOption | null;
  opportunityType: OpportunityOption;
  owner: OpportunityOption | null;
  sponsor: OpportunityOption | null;
  currentDecision: OpportunityCurrentDecision;
  initiatives: Array<{
    id: string;
    name: string;
    status: string;
  }>;
  risks: Array<{ id: string }>;
  comments: Array<{ id: string }>;
  complianceChecks: Array<{ id: string }>;
  assessments: Array<{
    valueScore: unknown;
    feasibilityScore: unknown;
    riskScore: unknown;
  }>;
  workflowStatus: OpportunityWorkflowStatus;
  scoring: OpportunityScoringSummary;
  riskCount: number;
  commentCount: number;
  complianceCount: number;
};
