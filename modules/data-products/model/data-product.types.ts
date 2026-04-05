import type {
  DataProductMedallionStage,
  DataProductReadinessStatus,
} from "../domain/data-product.enums.ts";
import type { DataQualitySignal } from "./data-quality-signal.types.ts";
import type { ReportingAssetDisplayModel } from "./reporting-asset.display-model.ts";

export interface DataProductOwnerRef {
  id: string | null;
  name: string;
  role: string | null;
}

export interface DataProductProcessRef {
  id: string;
  name: string;
  slug: string;
}

export interface DataProductOpportunityRef {
  id: string;
  title: string;
  status: string | null;
}

export interface DataProductSummary {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  businessPurpose: string | null;
  medallionStage: DataProductMedallionStage;
  readinessStatus: DataProductReadinessStatus;
  owner: DataProductOwnerRef | null;
  freshness: string | null;
  classification: string | null;
  sourceSystem: string | null;
  processCount: number;
  opportunityCount: number;
  reportingAssetCount: number;
}

export interface DataProductDetail extends DataProductSummary {
  duckdbDatasetRef: string | null;
  reportingDatasetRef: string | null;
  linkedProcesses: DataProductProcessRef[];
  linkedOpportunities: DataProductOpportunityRef[];
  linkedReportingAssets: ReportingAssetDisplayModel[];
  qualitySignals: DataQualitySignal[];
  sourceSystemNames: string[];
  consumerNames: string[];
}
