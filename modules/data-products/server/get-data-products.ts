import "server-only";

import type { DataProductListItemViewModel } from "../model/data-product-list.view-model";
import type { DataProductListFilters } from "../model/data-product-list.filters";
import { getDataProductList } from "./get-data-product-list";

export interface GetDataProductsParams {
  workspaceId: string;
  query?: string;
  processId?: string;
  ownerId?: string;
  medallionStage?: string;
  readinessStatus?: string;
}

export async function getDataProducts(
  params: GetDataProductsParams,
): Promise<DataProductListItemViewModel[]> {
  return getDataProductList(params.workspaceId, {
    search: params.query,
    medallionStage: params.medallionStage as DataProductListFilters["medallionStage"],
    readinessStatus: params.readinessStatus as DataProductListFilters["readinessStatus"],
  });
}
