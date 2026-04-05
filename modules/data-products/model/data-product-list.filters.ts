import type {
  DataProductMedallionStage,
  DataProductReadinessStatus,
} from "../domain/data-product.enums.ts";

export interface DataProductListFilters {
  search?: string;
  medallionStage?: DataProductMedallionStage;
  readinessStatus?: Exclude<DataProductReadinessStatus, "CERTIFIED">;
}
