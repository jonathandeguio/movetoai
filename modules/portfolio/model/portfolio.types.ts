export type PortfolioSummaryMetric = {
  label: string;
  value: string;
};

export type PortfolioPriorityGroup = "QUICK_WIN" | "STRATEGIC_BET" | "HIGH_RISK";

export type PrioritizedOpportunity = {
  id: string;
  title: string;
  processName: string;
  score: number;
  badge: PortfolioPriorityGroup;
  status: string;
};

export type PrioritizedOpportunityGroup = {
  key: PortfolioPriorityGroup;
  items: PrioritizedOpportunity[];
};

export type PortfolioSpotlightItem = {
  title: string;
  processName: string;
  ownerName: string | null;
  score: number;
  expectedValue: number;
  status: string;
  badge: string;
  decisionStatus: string | null;
};
