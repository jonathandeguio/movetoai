import type { Locale } from "@/lib/i18n/config";
import type {
  OpportunityWorkflowStatus
} from "@/modules/scoring/model/scoring.types";
export {
  formatScoreValue,
  getScoreBadgeVariant,
  getScoreDimensionLabel,
  getScorePriorityBadgeLabel,
  getScorePriorityBadgeVariant
} from "@/modules/scoring/domain/scoring-display";

function getIntlLocale(locale: Locale) {
  if (locale === "fr") {
    return "fr-FR";
  }

  if (locale === "es") {
    return "es-ES";
  }

  return "en-US";
}

export function formatCurrency(locale: Locale, value: number, currencyCode = "USD") {
  return new Intl.NumberFormat(getIntlLocale(locale), {
    style: "currency",
    currency: currencyCode,
    maximumFractionDigits: 0
  }).format(value);
}

export function formatCompactCurrency(locale: Locale, value: number, currencyCode = "USD") {
  return new Intl.NumberFormat(getIntlLocale(locale), {
    style: "currency",
    currency: currencyCode,
    notation: "compact",
    maximumFractionDigits: 1
  }).format(value);
}

export function formatDate(locale: Locale, value: Date | string | null | undefined) {
  if (!value) {
    return null;
  }

  return new Intl.DateTimeFormat(getIntlLocale(locale), {
    year: "numeric",
    month: "short",
    day: "numeric"
  }).format(new Date(value));
}

export function getRiskBadgeVariant(riskSeverity: string | null | undefined) {
  if (riskSeverity === "CRITICAL" || riskSeverity === "HIGH") {
    return "danger" as const;
  }

  if (riskSeverity === "MEDIUM") {
    return "warning" as const;
  }

  return "outline" as const;
}

export function getWorkflowBadgeVariant(workflowStatus: OpportunityWorkflowStatus) {
  if (workflowStatus === "LIVE" || workflowStatus === "APPROVED") {
    return "success" as const;
  }

  if (workflowStatus === "REJECTED" || workflowStatus === "ARCHIVED") {
    return "secondary" as const;
  }

  if (workflowStatus === "DEFERRED") {
    return "warning" as const;
  }

  if (workflowStatus === "IN_DELIVERY") {
    return "default" as const;
  }

  return "outline" as const;
}
