import { DataProductMedallionStage } from "./data-product.enums.ts";

export function deriveMedallionLabel(stage: DataProductMedallionStage): string {
  switch (stage) {
    case DataProductMedallionStage.BRONZE:
      return "Bronze";
    case DataProductMedallionStage.SILVER:
      return "Silver";
    case DataProductMedallionStage.GOLD:
      return "Gold";
    default:
      return stage;
  }
}

export function deriveMedallionDescription(
  stage: DataProductMedallionStage,
): string {
  switch (stage) {
    case DataProductMedallionStage.BRONZE:
      return "Identified but not yet trusted for scaled AI use.";
    case DataProductMedallionStage.SILVER:
      return "Usable for analysis and controlled AI experimentation.";
    case DataProductMedallionStage.GOLD:
      return "Trusted and reusable for reporting and production-oriented AI.";
    default:
      return "Unknown stage.";
  }
}

export function getMedallionLabel(stage: DataProductMedallionStage): string {
  return deriveMedallionLabel(stage);
}

export function getMedallionDescription(
  stage: DataProductMedallionStage,
): string {
  return deriveMedallionDescription(stage);
}
