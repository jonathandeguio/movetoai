import type {
  DataProductMedallionStage,
  DataProductReadinessStatus,
} from "../domain/data-product.enums.ts";

export type DataProductReadinessBadgeVariant =
  | "default"
  | "warning"
  | "success";

export type DataProductFreshnessTier =
  | "NONE"
  | "LIVE"
  | "RECENT"
  | "PERIODIC"
  | "MANUAL"
  | "UNKNOWN";

export interface DataProductReadinessInput {
  medallionStage: DataProductMedallionStage;
  freshness: string | null;
  qualitySignalCount: number;
  reportingAssetCount: number;
}

export interface DataProductReadinessEvaluation {
  status: DataProductReadinessStatus;
  label: string;
  badgeVariant: DataProductReadinessBadgeVariant;
  freshnessTier: DataProductFreshnessTier;
  hasQualitySignals: boolean;
  hasReportingAssets: boolean;
}
