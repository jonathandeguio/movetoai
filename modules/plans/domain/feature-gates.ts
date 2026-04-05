import { isPlanAtLeast } from "./plan-checks.ts";

export function canUseCustomScoring(currentPlanType: string | null | undefined) {
  return isPlanAtLeast(currentPlanType, "PRO");
}

export function canUseAdvancedPortfolioFeatures(currentPlanType: string | null | undefined) {
  return isPlanAtLeast(currentPlanType, "PRO");
}

export function canUseAdvancedGovernance(currentPlanType: string | null | undefined) {
  return isPlanAtLeast(currentPlanType, "ENTERPRISE");
}

export function canUseOpportunityKanban(currentPlanType: string | null | undefined) {
  return canUseAdvancedPortfolioFeatures(currentPlanType);
}

export function canUseOpportunityMatrix(currentPlanType: string | null | undefined) {
  return isPlanAtLeast(currentPlanType, "ENTERPRISE");
}

export function canUseAdvancedOpportunityFilters(currentPlanType: string | null | undefined) {
  return canUseAdvancedPortfolioFeatures(currentPlanType);
}

export function canUseMultiBusinessUnitViews(currentPlanType: string | null | undefined) {
  return isPlanAtLeast(currentPlanType, "ENTERPRISE");
}
