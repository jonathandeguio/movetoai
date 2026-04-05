import type { WorkspacePlanType } from "../model/plans.types.ts";

const planRank: Record<WorkspacePlanType, number> = {
  FREE: 0,
  PRO: 1,
  ENTERPRISE: 2
};

export function normalizePlanType(planType: string | null | undefined): WorkspacePlanType {
  if (planType === "PRO" || planType === "ENTERPRISE") {
    return planType;
  }

  return "FREE";
}

export function isPlanAtLeast(
  currentPlanType: string | null | undefined,
  targetPlanType: WorkspacePlanType
) {
  const current = normalizePlanType(currentPlanType);
  return planRank[current] >= planRank[targetPlanType];
}

export function isFreePlan(currentPlanType: string | null | undefined) {
  return normalizePlanType(currentPlanType) === "FREE";
}

export function isProPlan(currentPlanType: string | null | undefined) {
  return normalizePlanType(currentPlanType) === "PRO";
}

export function isEnterprisePlan(currentPlanType: string | null | undefined) {
  return normalizePlanType(currentPlanType) === "ENTERPRISE";
}
