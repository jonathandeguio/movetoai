export const DataProductMedallionStage = {
  BRONZE: "BRONZE",
  SILVER: "SILVER",
  GOLD: "GOLD",
} as const;

export type DataProductMedallionStage =
  (typeof DataProductMedallionStage)[keyof typeof DataProductMedallionStage];

export const DataProductReadinessStatus = {
  DRAFT: "DRAFT",
  IN_PROGRESS: "IN_PROGRESS",
  READY: "READY",
  CERTIFIED: "CERTIFIED",
} as const;

export type DataProductReadinessStatus =
  (typeof DataProductReadinessStatus)[keyof typeof DataProductReadinessStatus];

export const ReportingAssetType = {
  DASHBOARD: "DASHBOARD",
  REPORT: "REPORT",
  SCORECARD: "SCORECARD",
  KPI_VIEW: "KPI_VIEW",
} as const;

export type ReportingAssetType =
  (typeof ReportingAssetType)[keyof typeof ReportingAssetType];

export const DataQualitySignalType = {
  FRESHNESS: "FRESHNESS",
  COMPLETENESS: "COMPLETENESS",
  ACCURACY: "ACCURACY",
  CONSISTENCY: "CONSISTENCY",
  TRUST: "TRUST",
} as const;

export type DataQualitySignalType =
  (typeof DataQualitySignalType)[keyof typeof DataQualitySignalType];

export const DataQualitySignalStatus = {
  UNKNOWN: "UNKNOWN",
  HEALTHY: "HEALTHY",
  WARNING: "WARNING",
  CRITICAL: "CRITICAL",
} as const;

export type DataQualitySignalStatus =
  (typeof DataQualitySignalStatus)[keyof typeof DataQualitySignalStatus];
