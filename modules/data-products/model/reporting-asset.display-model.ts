import type { ReportingAssetType } from "../domain/data-product.enums.ts";

export interface ReportingAssetDisplayModel {
  id: string;
  name: string;
  type: ReportingAssetType | null;
  externalUrl: string | null;
  supersetDashboardUrl: string | null;
  processName?: string | null;
}
