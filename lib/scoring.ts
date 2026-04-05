export {
  calculateOpportunityScore,
  deriveOpportunityScoring
} from "@/modules/scoring/domain/calculate-score";
export { deriveOpportunityScoreBadge } from "@/modules/scoring/domain/derive-score-badge";
export type {
  OpportunityScoringInput,
  OpportunityScoringSummary,
  OpportunityScoreDimensions,
  OpportunityScorePriorityBadge,
  OpportunityWorkflowStatus,
  ScoreDimensionKey,
  ScoringLocale
} from "@/modules/scoring/model/scoring.types";
/*
export type ScoringLocale = "en" | "fr" | "es";

export type ScoreDimensionKey =
  | "businessValue"
  | "dataReadiness"
  | "technicalFeasibility"
  | "risk"
  | "timeToValue";

export type OpportunityScorePriorityBadge =
  | "QUICK_WIN"
  | "STRATEGIC_BET"
  | "HIGH_RISK";

export type OpportunityWorkflowStatus =
  | "DRAFT"
  | "ASSESSED"
  | "UNDER_REVIEW"
  | "APPROVED"
  | "DEFERRED"
  | "REJECTED"
  | "IN_DELIVERY"
  | "LIVE"
  | "ARCHIVED";

export type OpportunityScoreDimensions = Record<ScoreDimensionKey, number>;

export type OpportunityScoringSummary = {
  total: number;
  badge: OpportunityScorePriorityBadge;
  dimensions: OpportunityScoreDimensions;
};

export type OpportunityScoringInput = {
  expectedValue?: unknown;
  dataReadiness?: string | null;
  riskSeverity?: string | null;
  workflowStatus?: OpportunityWorkflowStatus | string | null;
  existingBadge?: string | null;
  assessment?: {
    valueScore?: unknown;
    feasibilityScore?: unknown;
    riskScore?: unknown;
  } | null;
};

const dimensionWeights: Record<ScoreDimensionKey, number> = {
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

const scorePriorityBadgeLabels: Record<
  OpportunityScorePriorityBadge,
  Record<ScoringLocale, string>
> = {
  QUICK_WIN: {
    en: "Quick Win",
    fr: "Quick Win",
    es: "Quick Win"
  },
  STRATEGIC_BET: {
    en: "Strategic Bet",
    fr: "Pari Stratégique",
    es: "Apuesta Estratégica"
  },
  HIGH_RISK: {
    en: "High Risk",
    fr: "Risque Élevé",
    es: "Alto Riesgo"
  }
};

const scoreDimensionLabels: Record<
  ScoreDimensionKey,
  Record<ScoringLocale, string>
> = {
  businessValue: {
    en: "Business Value",
    fr: "Valeur Métier",
    es: "Valor de Negocio"
  },
  dataReadiness: {
    en: "Data Readiness",
    fr: "Maturité des Données",
    es: "Madurez de Datos"
  },
  technicalFeasibility: {
    en: "Technical Feasibility",
    fr: "Faisabilité Technique",
    es: "Factibilidad Técnica"
  },
  risk: {
    en: "Risk",
    fr: "Risque",
    es: "Riesgo"
  },
  timeToValue: {
    en: "Time to Value",
    fr: "Temps vers la Valeur",
    es: "Tiempo hasta el Valor"
  }
};

function clampScore(value: number) {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.min(100, Math.max(0, Math.round(value)));
}

function normalizeScore(value: unknown, fallback = 0) {
  const resolved = Number(value);

  if (!Number.isFinite(resolved)) {
    return fallback;
  }

  if (resolved >= 0 && resolved <= 5) {
    return clampScore(resolved * 20);
  }

  return clampScore(resolved);
}

function resolveBusinessValueScore(
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

function resolveDataReadinessScore(dataReadiness?: string | null) {
  return dataReadinessScoreMap[dataReadiness ?? "UNKNOWN"] ?? dataReadinessScoreMap.UNKNOWN;
}

function resolveTechnicalFeasibilityScore(
  assessmentValue: unknown,
  dataReadiness?: string | null
) {
  const assessmentScore = Number(assessmentValue);

  if (Number.isFinite(assessmentScore)) {
    return normalizeScore(assessmentScore);
  }

  return feasibilityFallbackMap[dataReadiness ?? "UNKNOWN"] ?? feasibilityFallbackMap.UNKNOWN;
}

function resolveRiskScore(assessmentValue: unknown, riskSeverity?: string | null) {
  const assessmentScore = Number(assessmentValue);

  if (Number.isFinite(assessmentScore)) {
    return normalizeScore(assessmentScore);
  }

  return riskSeverityScoreMap[riskSeverity ?? "MEDIUM"] ?? riskSeverityScoreMap.MEDIUM;
}

function resolveTimeToValueScore(
  dataReadiness?: string | null,
  expectedValue?: unknown,
  workflowStatus?: OpportunityWorkflowStatus | string | null,
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

export function calculateOpportunityScore(dimensions: OpportunityScoreDimensions) {
  const weightedTotal = Object.entries(dimensionWeights).reduce((total, [key, weight]) => {
    const value = dimensions[key as ScoreDimensionKey];
    return total + clampScore(value) * weight;
  }, 0);

  return clampScore(weightedTotal);
}

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

export function getScorePriorityBadgeLabel(
  locale: ScoringLocale,
  badge: OpportunityScorePriorityBadge
) {
  return scorePriorityBadgeLabels[badge][locale];
}

export function getScorePriorityBadgeVariant(badge: OpportunityScorePriorityBadge) {
  if (badge === "QUICK_WIN") {
    return "success" as const;
  }

  if (badge === "HIGH_RISK") {
    return "danger" as const;
  }

  return "default" as const;
}

export function getScoreDimensionLabel(
  locale: ScoringLocale,
  dimension: ScoreDimensionKey
) {
  return scoreDimensionLabels[dimension][locale];
}
*/
