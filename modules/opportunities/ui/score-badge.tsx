import { Badge } from "@/components/ui/badge";
import type { Locale } from "@/lib/i18n/config";
import {
  formatScoreValue,
  getScoreBadgeVariant
} from "@/modules/scoring/domain/scoring-display";

type ScoreBadgeProps = {
  locale: Locale;
  score: number | null | undefined;
  label: string;
};

export function ScoreBadge({ locale, score, label }: ScoreBadgeProps) {
  const resolvedScore = Number(score ?? 0);

  return (
    <Badge variant={getScoreBadgeVariant(resolvedScore)}>
      {label} {formatScoreValue(locale, resolvedScore)}
    </Badge>
  );
}
