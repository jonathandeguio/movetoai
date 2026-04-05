import type { ReportingAssetType } from "../domain/data-product.enums.ts";

export interface ReportingAssetRef {
  id: string;
  name: string;
  slug: string;
  assetType: ReportingAssetType | null;
  externalUrl: string | null;
}

export interface ReportingAssetSummary extends ReportingAssetRef {
  dataProductId: string;
  processName: string | null;
  ownerName: string | null;
}
