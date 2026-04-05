import { Badge } from "@/components/ui/badge";
import type { DataProductReadinessStatus } from "@/modules/data-products/domain/data-product.enums";
import {
  deriveReadinessBadgeVariant,
  deriveReadinessLabel,
} from "@/modules/data-products/domain/readiness";

type DataProductReadinessBadgeProps = {
  readinessStatus: DataProductReadinessStatus;
};

export function DataProductReadinessBadge({
  readinessStatus,
}: DataProductReadinessBadgeProps) {
  return (
    <Badge variant={deriveReadinessBadgeVariant(readinessStatus)}>
      {deriveReadinessLabel(readinessStatus)}
    </Badge>
  );
}
