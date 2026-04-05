import { DataProductReadinessStatus } from "../domain/data-product.enums.ts";
import type { DataProductListFilters } from "../model/data-product-list.filters.ts";
import type { DataProductListItemViewModel } from "../model/data-product-list.view-model.ts";

type RawDataProductListItem = {
  id: string;
  name: string;
  description: string | null;
  medallionStage: DataProductListItemViewModel["medallionStage"];
  readinessStatus: "READY" | "PARTIALLY_READY" | "NOT_READY";
  _count: {
    processLinks: number;
    opportunityLinks: number;
    reportingAssets: number;
  };
};

export function mapListReadinessStatus(
  readinessStatus: RawDataProductListItem["readinessStatus"],
): DataProductListItemViewModel["readinessStatus"] {
  switch (readinessStatus) {
    case "READY":
      return DataProductReadinessStatus.READY;
    case "PARTIALLY_READY":
      return DataProductReadinessStatus.IN_PROGRESS;
    case "NOT_READY":
    default:
      return DataProductReadinessStatus.DRAFT;
  }
}

export function mapListReadinessFilter(
  readinessStatus?: DataProductListFilters["readinessStatus"],
): RawDataProductListItem["readinessStatus"] | undefined {
  switch (readinessStatus) {
    case DataProductReadinessStatus.READY:
      return "READY";
    case DataProductReadinessStatus.IN_PROGRESS:
      return "PARTIALLY_READY";
    case DataProductReadinessStatus.DRAFT:
      return "NOT_READY";
    default:
      return undefined;
  }
}

export function normalizeDataProductListSearch(search?: string) {
  const normalized = search?.trim();

  return normalized ? normalized : undefined;
}

export function toDataProductListItemViewModel(
  dataProduct: RawDataProductListItem,
): DataProductListItemViewModel {
  return {
    id: dataProduct.id,
    name: dataProduct.name,
    description: dataProduct.description,
    medallionStage: dataProduct.medallionStage,
    readinessStatus: mapListReadinessStatus(dataProduct.readinessStatus),
    processCount: dataProduct._count.processLinks,
    opportunityCount: dataProduct._count.opportunityLinks,
    reportingAssetCount: dataProduct._count.reportingAssets,
  };
}
