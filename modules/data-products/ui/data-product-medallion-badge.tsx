import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  DataProductMedallionStage,
  type DataProductMedallionStage as DataProductMedallionStageValue,
} from "@/modules/data-products/domain/data-product.enums";
import { deriveMedallionLabel } from "@/modules/data-products/domain/medallion";

type DataProductMedallionBadgeProps = {
  medallionStage: DataProductMedallionStageValue;
};

function getMedallionClassName(stage: DataProductMedallionStageValue) {
  switch (stage) {
    case DataProductMedallionStage.BRONZE:
      return "border-amber-200 bg-amber-50 text-amber-800";
    case DataProductMedallionStage.SILVER:
      return "border-slate-200 bg-slate-100 text-slate-700";
    case DataProductMedallionStage.GOLD:
      return "border-blue-200 bg-blue-50 text-blue-800";
    default:
      return "border-slate-200 bg-white text-slate-700";
  }
}

export function DataProductMedallionBadge({
  medallionStage,
}: DataProductMedallionBadgeProps) {
  return (
    <Badge variant="outline" className={cn(getMedallionClassName(medallionStage))}>
      {deriveMedallionLabel(medallionStage)}
    </Badge>
  );
}
