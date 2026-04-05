import assert from "node:assert/strict";

import {
  canUseAdvancedGovernance,
  canUseAdvancedOpportunityFilters,
  canUseAdvancedPortfolioFeatures,
  canUseCustomScoring,
  canUseOpportunityKanban,
  canUseOpportunityMatrix
} from "../modules/plans/domain/feature-gates.ts";
import {
  isEnterprisePlan,
  isFreePlan,
  isPlanAtLeast,
  isProPlan,
  normalizePlanType
} from "../modules/plans/domain/plan-checks.ts";

assert.equal(normalizePlanType(undefined), "FREE");
assert.equal(normalizePlanType("PRO"), "PRO");
assert.equal(normalizePlanType("ENTERPRISE"), "ENTERPRISE");

assert.equal(isFreePlan("FREE"), true);
assert.equal(isProPlan("PRO"), true);
assert.equal(isEnterprisePlan("ENTERPRISE"), true);
assert.equal(isPlanAtLeast("FREE", "PRO"), false);
assert.equal(isPlanAtLeast("ENTERPRISE", "PRO"), true);

assert.equal(canUseCustomScoring("FREE"), false);
assert.equal(canUseCustomScoring("PRO"), true);
assert.equal(canUseAdvancedPortfolioFeatures("FREE"), false);
assert.equal(canUseAdvancedPortfolioFeatures("PRO"), true);
assert.equal(canUseAdvancedOpportunityFilters("FREE"), false);
assert.equal(canUseOpportunityKanban("PRO"), true);
assert.equal(canUseOpportunityMatrix("PRO"), false);
assert.equal(canUseAdvancedGovernance("PRO"), false);
assert.equal(canUseAdvancedGovernance("ENTERPRISE"), true);

console.log("plan gating tests passed");
