export interface ExternalReportingAssetReference {
  id: string;
  name: string;
  provider: "SUPERSET" | "OTHER";
  url: string | null;
}
