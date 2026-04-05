import type {
  OpportunityScorePriorityBadge,
  ScoreDimensionKey,
  ScoringLocale
} from "../model/scoring.types.ts";

type ScoreBadgeVariant = "success" | "warning" | "danger" | "default";

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
    fr: "Pari strategique",
    es: "Apuesta estrategica"
  },
  HIGH_RISK: {
    en: "High Risk",
    fr: "Risque eleve",
    es: "Alto riesgo"
  }
};

const scoreDimensionLabels: Record<ScoreDimensionKey, Record<ScoringLocale, string>> = {
  businessValue: {
    en: "Business Value",
    fr: "Valeur metier",
    es: "Valor de negocio"
  },
  dataReadiness: {
    en: "Data Readiness",
    fr: "Maturite des donnees",
    es: "Madurez de datos"
  },
  technicalFeasibility: {
    en: "Technical Feasibility",
    fr: "Faisabilite technique",
    es: "Factibilidad tecnica"
  },
  risk: {
    en: "Risk",
    fr: "Risque",
    es: "Riesgo"
  },
  timeToValue: {
    en: "Time to Value",
    fr: "Temps vers la valeur",
    es: "Tiempo hasta el valor"
  }
};

function getIntlLocale(locale: ScoringLocale) {
  if (locale === "fr") {
    return "fr-FR";
  }

  if (locale === "es") {
    return "es-ES";
  }

  return "en-US";
}

export function formatScoreValue(locale: ScoringLocale, score: number | null | undefined) {
  return new Intl.NumberFormat(getIntlLocale(locale), {
    maximumFractionDigits: 0
  }).format(Number(score ?? 0));
}

export function getScoreBadgeVariant(score: number | null | undefined): ScoreBadgeVariant {
  if ((score ?? 0) >= 80) {
    return "success";
  }

  if ((score ?? 0) >= 60) {
    return "warning";
  }

  return "danger";
}

export function getScorePriorityBadgeVariant(
  badge: OpportunityScorePriorityBadge
): ScoreBadgeVariant {
  if (badge === "QUICK_WIN") {
    return "success";
  }

  if (badge === "HIGH_RISK") {
    return "danger";
  }

  return "default";
}

export function getScorePriorityBadgeLabel(
  locale: ScoringLocale,
  badge: OpportunityScorePriorityBadge
) {
  return scorePriorityBadgeLabels[badge][locale];
}

export function getScoreDimensionLabel(
  locale: ScoringLocale,
  dimension: ScoreDimensionKey
) {
  return scoreDimensionLabels[dimension][locale];
}
