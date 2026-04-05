import "server-only";

import type {
  PortfolioSummaryMetric,
  PrioritizedOpportunityGroup
} from "@/modules/portfolio/model/portfolio.types";

type PortfolioSummaryLabels = {
  total: string;
  quickWins: string;
  strategicBets: string;
  highRisk: string;
};

export function getPortfolioSummary(
  groups: PrioritizedOpportunityGroup[],
  labels: PortfolioSummaryLabels
): PortfolioSummaryMetric[] {
  const total = groups.reduce((count, group) => count + group.items.length, 0);
  const quickWins = groups.find((group) => group.key === "QUICK_WIN")?.items.length ?? 0;
  const strategicBets =
    groups.find((group) => group.key === "STRATEGIC_BET")?.items.length ?? 0;
  const highRisk = groups.find((group) => group.key === "HIGH_RISK")?.items.length ?? 0;

  return [
    {
      label: labels.total,
      value: total.toString()
    },
    {
      label: labels.quickWins,
      value: quickWins.toString()
    },
    {
      label: labels.strategicBets,
      value: strategicBets.toString()
    },
    {
      label: labels.highRisk,
      value: highRisk.toString()
    }
  ];
}
