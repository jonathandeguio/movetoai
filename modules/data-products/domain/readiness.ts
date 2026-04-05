import {
  DataProductMedallionStage,
  DataProductReadinessStatus,
} from "./data-product.enums.ts";
import type {
  DataProductFreshnessTier,
  DataProductReadinessBadgeVariant,
  DataProductReadinessEvaluation,
  DataProductReadinessInput,
} from "../model/data-product-readiness.types.ts";

function normalizeFreshnessValue(freshness: string | null | undefined) {
  return freshness?.trim().toLowerCase() ?? "";
}

export function deriveReadinessLabel(
  status: DataProductReadinessStatus,
): string {
  switch (status) {
    case DataProductReadinessStatus.DRAFT:
      return "Draft";
    case DataProductReadinessStatus.IN_PROGRESS:
      return "In Progress";
    case DataProductReadinessStatus.READY:
      return "Ready";
    case DataProductReadinessStatus.CERTIFIED:
      return "Certified";
    default:
      return status;
  }
}

export function deriveReadinessBadgeVariant(
  status: DataProductReadinessStatus,
): DataProductReadinessBadgeVariant {
  switch (status) {
    case DataProductReadinessStatus.DRAFT:
      return "default";
    case DataProductReadinessStatus.IN_PROGRESS:
      return "warning";
    case DataProductReadinessStatus.READY:
    case DataProductReadinessStatus.CERTIFIED:
      return "success";
    default:
      return "default";
  }
}

export function deriveFreshnessTier(
  freshness: string | null | undefined,
): DataProductFreshnessTier {
  const normalized = normalizeFreshnessValue(freshness);

  if (!normalized) {
    return "NONE";
  }

  if (
    normalized.includes("real-time") ||
    normalized.includes("realtime") ||
    normalized.includes("stream") ||
    normalized.includes("hourly")
  ) {
    return "LIVE";
  }

  if (
    normalized.includes("daily") ||
    normalized.includes("per day") ||
    normalized.includes("day")
  ) {
    return "RECENT";
  }

  if (
    normalized.includes("weekly") ||
    normalized.includes("bi-weekly") ||
    normalized.includes("biweekly") ||
    normalized.includes("monthly") ||
    normalized.includes("month")
  ) {
    return "PERIODIC";
  }

  if (
    normalized.includes("manual") ||
    normalized.includes("ad hoc") ||
    normalized.includes("adhoc") ||
    normalized.includes("on demand") ||
    normalized.includes("on-demand")
  ) {
    return "MANUAL";
  }

  return "UNKNOWN";
}

export function deriveDataProductReadiness({
  medallionStage,
  freshness,
  qualitySignalCount,
  reportingAssetCount,
}: DataProductReadinessInput): DataProductReadinessEvaluation {
  const freshnessTier = deriveFreshnessTier(freshness);
  const hasQualitySignals = qualitySignalCount > 0;
  const hasReportingAssets = reportingAssetCount > 0;
  const isFreshEnough =
    freshnessTier === "LIVE" ||
    freshnessTier === "RECENT" ||
    freshnessTier === "PERIODIC";

  let status: DataProductReadinessStatus = DataProductReadinessStatus.DRAFT;

  if (
    medallionStage === DataProductMedallionStage.GOLD &&
    hasQualitySignals &&
    hasReportingAssets &&
    (freshnessTier === "LIVE" || freshnessTier === "RECENT")
  ) {
    status = DataProductReadinessStatus.CERTIFIED;
  } else if (
    (medallionStage === DataProductMedallionStage.SILVER ||
      medallionStage === DataProductMedallionStage.GOLD) &&
    hasQualitySignals &&
    (isFreshEnough || hasReportingAssets)
  ) {
    status = DataProductReadinessStatus.READY;
  } else if (
    medallionStage !== DataProductMedallionStage.BRONZE ||
    freshnessTier !== "NONE" ||
    hasQualitySignals ||
    hasReportingAssets
  ) {
    status = DataProductReadinessStatus.IN_PROGRESS;
  }

  return {
    status,
    label: deriveReadinessLabel(status),
    badgeVariant: deriveReadinessBadgeVariant(status),
    freshnessTier,
    hasQualitySignals,
    hasReportingAssets,
  };
}
