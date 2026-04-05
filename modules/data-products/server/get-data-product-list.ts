import "server-only";

import type {
  MedallionStage as PrismaMedallionStage,
} from "@prisma/client";

import { prisma } from "@/lib/prisma";
import type { DataProductListFilters } from "@/modules/data-products/model/data-product-list.filters";
import type { DataProductListItemViewModel } from "@/modules/data-products/model/data-product-list.view-model";
import {
  mapListReadinessFilter,
  normalizeDataProductListSearch,
  toDataProductListItemViewModel,
} from "./data-product-list.helpers";

export async function getDataProductList(
  workspaceId: string,
  filters: DataProductListFilters = {},
): Promise<DataProductListItemViewModel[]> {
  const search = normalizeDataProductListSearch(filters.search);
  const readinessStatus = mapListReadinessFilter(filters.readinessStatus);
  const medallionStage = filters.medallionStage as PrismaMedallionStage | undefined;

  const dataProducts = await prisma.dataProduct.findMany({
    where: {
      workspaceId,
      deletedAt: null,
      ...(search
        ? {
            name: {
              contains: search,
            },
          }
        : {}),
      ...(medallionStage ? { medallionStage } : {}),
      ...(readinessStatus ? { readinessStatus } : {}),
    },
    select: {
      id: true,
      name: true,
      description: true,
      medallionStage: true,
      readinessStatus: true,
      _count: {
        select: {
          processLinks: true,
          opportunityLinks: true,
          reportingAssets: true,
        },
      },
    },
    orderBy: {
      name: "asc",
    },
  });

  return dataProducts.map(toDataProductListItemViewModel);
}
