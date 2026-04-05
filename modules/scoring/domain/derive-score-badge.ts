import type {
  OpportunityScoreDimensions,
  OpportunityScorePriorityBadge
} from "../model/scoring.types.ts";

export function deriveOpportunityScoreBadge(
  dimensions: OpportunityScoreDimensions,
  total: number
): OpportunityScorePriorityBadge {
  if (dimensions.risk < 45) {
    return "HIGH_RISK";
  }

  if (
    total >= 75 &&
    dimensions.timeToValue >= 70 &&
    dimensions.dataReadiness >= 60 &&
    dimensions.technicalFeasibility >= 60
  ) {
    return "QUICK_WIN";
  }

  return "STRATEGIC_BET";
}
