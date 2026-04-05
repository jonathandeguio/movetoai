import assert from "node:assert/strict";

import {
  calculateOpportunityScore,
  deriveOpportunityScoring
} from "../domain/calculate-score.ts";
import { deriveOpportunityScoreBadge } from "../domain/derive-score-badge.ts";

assert.equal(
  calculateOpportunityScore({
    businessValue: 100,
    dataReadiness: 100,
    technicalFeasibility: 100,
    risk: 100,
    timeToValue: 100
  }),
  100
);

assert.equal(
  calculateOpportunityScore({
    businessValue: 0,
    dataReadiness: 0,
    technicalFeasibility: 0,
    risk: 0,
    timeToValue: 0
  }),
  0
);

assert.equal(
  deriveOpportunityScoreBadge(
    {
      businessValue: 90,
      dataReadiness: 78,
      technicalFeasibility: 80,
      risk: 30,
      timeToValue: 74
    },
    73
  ),
  "HIGH_RISK"
);

const quickWinScoring = deriveOpportunityScoring({
  expectedValue: 220000,
  dataReadiness: "PRODUCTION_READY",
  riskSeverity: "LOW",
  workflowStatus: "APPROVED",
  existingBadge: "QUICK_WIN",
  assessment: {
    valueScore: 86,
    feasibilityScore: 84,
    riskScore: 82
  }
});

assert.equal(quickWinScoring.badge, "QUICK_WIN");
assert.equal(quickWinScoring.total >= 75, true);
assert.equal(quickWinScoring.dimensions.timeToValue >= 70, true);

const strategicBetScoring = deriveOpportunityScoring({
  expectedValue: 1800000,
  dataReadiness: "MEDIUM",
  riskSeverity: "MEDIUM",
  workflowStatus: "UNDER_REVIEW",
  existingBadge: "TRANSFORMATIONAL",
  assessment: {
    valueScore: 92,
    feasibilityScore: 72,
    riskScore: 66
  }
});

assert.equal(strategicBetScoring.badge, "STRATEGIC_BET");
assert.equal(strategicBetScoring.total >= 0 && strategicBetScoring.total <= 100, true);

console.log("scoring tests passed");
