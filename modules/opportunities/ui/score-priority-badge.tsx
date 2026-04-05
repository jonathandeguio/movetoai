import { Badge } from "@/components/ui/badge";
import type { Locale } from "@/lib/i18n/config";
import type { OpportunityScorePriorityBadge } from "@/modules/scoring/model/scoring.types";
import {
  getScorePriorityBadgeLabel,
  getScorePriorityBadgeVariant
} from "@/modules/scoring/domain/scoring-display";

type ScorePriorityBadgeProps = {
  locale: Locale;
  badge: OpportunityScorePriorityBadge;
};

export function ScorePriorityBadge({ locale, badge }: ScorePriorityBadgeProps) {
  return (
    <Badge variant={getScorePriorityBadgeVariant(badge)}>
      {getScorePriorityBadgeLabel(locale, badge)}
    </Badge>
  );
}
