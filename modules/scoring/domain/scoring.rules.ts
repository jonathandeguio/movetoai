import type {
  OpportunityScoringInput,
  ScoreDimensionKey
} from "../model/scoring.types.ts";

export const dimensionWeights: Record<ScoreDimensionKey, number> = {
  businessValue: 0.3,
  dataReadiness: 0.2,
  technicalFeasibility: 0.2,
  risk: 0.15,
  timeToValue: 0.15
};

const dataReadinessScoreMap: Record<string, number> = {
  UNKNOWN: 30,
  LOW: 45,
  MEDIUM: 65,
  HIGH: 82,
  PRODUCTION_READY: 95
};

const feasibilityFallbackMap: Record<string, number> = {
  UNKNOWN: 35,
  LOW: 42,
  MEDIUM: 62,
  HIGH: 78,
  PRODUCTION_READY: 90
};

const riskSeverityScoreMap: Record<string, number> = {
  LOW: 90,
  MEDIUM: 68,
  HIGH: 40,
  CRITICAL: 20
};

const timeToValueBaseMap: Record<string, number> = {
  UNKNOWN: 35,
  LOW: 42,
  MEDIUM: 62,
  HIGH: 78,
  PRODUCTION_READY: 90
};

export function clampScore(value: number) {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.min(100, Math.max(0, Math.round(value)));
}

export function normalizeScore(value: unknown, fallback = 0) {
  const resolved = Number(value);

  if (!Number.isFinite(resolved)) {
    return fallback;
  }

  if (resolved >= 0 && resolved <= 5) {
    return clampScore(resolved * 20);
  }

  return clampScore(resolved);
}

export function resolveBusinessValueScore(
  assessmentValue: unknown,
  expectedValue: unknown
) {
  const assessmentScore = Number(assessmentValue);

  if (Number.isFinite(assessmentScore)) {
    return normalizeScore(assessmentScore);
  }

  const value = Number(expectedValue ?? 0);

  if (!Number.isFinite(value) || value <= 0) {
    return 35;
  }

  if (value >= 1_500_000) {
    return 95;
  }

  if (value >= 1_000_000) {
    return 88;
  }

  if (value >= 500_000) {
    return 78;
  }

  if (value >= 250_000) {
    return 68;
  }

  if (value >= 100_000) {
    return 58;
  }

  return 45;
}

export function resolveDataReadinessScore(dataReadiness?: string | null) {
  return dataReadinessScoreMap[dataReadiness ?? "UNKNOWN"] ?? dataReadinessScoreMap.UNKNOWN;
}

export function resolveTechnicalFeasibilityScore(
  assessmentValue: unknown,
  dataReadiness?: string | null
) {
  const assessmentScore = Number(assessmentValue);

  if (Number.isFinite(assessmentScore)) {
    return normalizeScore(assessmentScore);
  }

  return feasibilityFallbackMap[dataReadiness ?? "UNKNOWN"] ?? feasibilityFallbackMap.UNKNOWN;
}

export function resolveRiskScore(assessmentValue: unknown, riskSeverity?: string | null) {
  const assessmentScore = Number(assessmentValue);

  if (Number.isFinite(assessmentScore)) {
    return normalizeScore(assessmentScore);
  }

  return riskSeverityScoreMap[riskSeverity ?? "MEDIUM"] ?? riskSeverityScoreMap.MEDIUM;
}

export function resolveTimeToValueScore(
  dataReadiness?: string | null,
  expectedValue?: unknown,
  workflowStatus?: OpportunityScoringInput["workflowStatus"],
  existingBadge?: string | null
) {
  let score = timeToValueBaseMap[dataReadiness ?? "UNKNOWN"] ?? timeToValueBaseMap.UNKNOWN;
  const value = Number(expectedValue ?? 0);

  if (Number.isFinite(value)) {
    if (value >= 1_000_000) {
      score -= 8;
    } else if (value <= 250_000 && value > 0) {
      score += 6;
    }
  }

  if (workflowStatus === "IN_DELIVERY" || workflowStatus === "LIVE") {
    score += 8;
  }

  if (existingBadge === "QUICK_WIN" || existingBadge === "HIGH_CONFIDENCE") {
    score += 6;
  }

  if (existingBadge === "TRANSFORMATIONAL") {
    score -= 8;
  }

  if (existingBadge === "AT_RISK") {
    score -= 10;
  }

  return clampScore(score);
}
