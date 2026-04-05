import type {
  DataProductMedallionStage,
  DataProductReadinessStatus,
} from "../domain/data-product.enums.ts";

export interface DataProductListItemViewModel {
  id: string;
  name: string;
  description: string | null;
  medallionStage: DataProductMedallionStage;
  readinessStatus: DataProductReadinessStatus;
  processCount: number;
  opportunityCount: number;
  reportingAssetCount: number;
}
