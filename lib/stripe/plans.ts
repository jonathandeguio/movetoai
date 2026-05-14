export type PlanType = "FREE" | "PRO" | "ENTERPRISE";

export interface PlanLimits {
  maxOpportunities: number | null;  // null = unlimited
  maxUseCases: number | null;
  maxMembers: number;
  bpmn: boolean;
  aiScansPerMonth: number | null;
}

export const PLAN_LIMITS: Record<PlanType, PlanLimits> = {
  FREE: { maxOpportunities: 5, maxUseCases: 1, maxMembers: 2, bpmn: false, aiScansPerMonth: 3 },
  PRO: { maxOpportunities: null, maxUseCases: null, maxMembers: 10, bpmn: true, aiScansPerMonth: null },
  ENTERPRISE: { maxOpportunities: null, maxUseCases: null, maxMembers: 999, bpmn: true, aiScansPerMonth: null },
};

export function getPlanLimits(planType: string): PlanLimits {
  const key = (planType?.toUpperCase() ?? "FREE") as PlanType;
  return PLAN_LIMITS[key] ?? PLAN_LIMITS.FREE;
}
