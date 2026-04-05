import { deriveOpportunityScoreBadge } from "./derive-score-badge.ts";
import {
  clampScore,
  dimensionWeights,
  resolveBusinessValueScore,
  resolveDataReadinessScore,
  resolveRiskScore,
  resolveTechnicalFeasibilityScore,
  resolveTimeToValueScore
} from "./scoring.rules.ts";
import type {
  OpportunityScoringInput,
  OpportunityScoringSummary,
  OpportunityScoreDimensions,
  ScoreDimensionKey
} from "../model/scoring.types.ts";

export function calculateOpportunityScore(dimensions: OpportunityScoreDimensions) {
  const weightedTotal = Object.entries(dimensionWeights).reduce((total, [key, weight]) => {
    const value = dimensions[key as ScoreDimensionKey];
    return total + clampScore(value) * weight;
  }, 0);

  return clampScore(weightedTotal);
}

export function deriveOpportunityScoring(
  input: OpportunityScoringInput
): OpportunityScoringSummary {
  const dimensions: OpportunityScoreDimensions = {
    businessValue: resolveBusinessValueScore(
      input.assessment?.valueScore,
      input.expectedValue
    ),
    dataReadiness: resolveDataReadinessScore(input.dataReadiness),
    technicalFeasibility: resolveTechnicalFeasibilityScore(
      input.assessment?.feasibilityScore,
      input.dataReadiness
    ),
    risk: resolveRiskScore(input.assessment?.riskScore, input.riskSeverity),
    timeToValue: resolveTimeToValueScore(
      input.dataReadiness,
      input.expectedValue,
      input.workflowStatus,
      input.existingBadge
    )
  };

  const total = calculateOpportunityScore(dimensions);

  return {
    total,
    badge: deriveOpportunityScoreBadge(dimensions, total),
    dimensions
  };
}
