import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { Locale } from "@/lib/i18n/config";
import {
  formatScoreValue,
  getScoreBadgeVariant,
  getScoreDimensionLabel,
  getScorePriorityBadgeLabel,
  getScorePriorityBadgeVariant
} from "@/modules/scoring/domain/scoring-display";
import type {
  OpportunityScoreDimensions,
  OpportunityScorePriorityBadge,
  ScoreDimensionKey
} from "@/modules/scoring/model/scoring.types";

const scoreDimensionOrder: ScoreDimensionKey[] = [
  "businessValue",
  "dataReadiness",
  "technicalFeasibility",
  "risk",
  "timeToValue"
];

type ScoreBreakdownProps = {
  locale: Locale;
  scoreLabel: string;
  score: number;
  badge: OpportunityScorePriorityBadge;
  dimensions: OpportunityScoreDimensions;
};

export function ScoreBreakdown({
  locale,
  scoreLabel,
  score,
  badge,
  dimensions
}: ScoreBreakdownProps) {
  return (
    <div className="space-y-4">
      <Card className="border-primary/10 bg-primary/5">
        <CardContent className="flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              {scoreLabel}
            </p>
            <p className="text-4xl font-semibold tracking-tight text-slate-950">
              {formatScoreValue(locale, score)}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant={getScoreBadgeVariant(score)}>
              {scoreLabel} {formatScoreValue(locale, score)}
            </Badge>
            <Badge variant={getScorePriorityBadgeVariant(badge)}>
              {getScorePriorityBadgeLabel(locale, badge)}
            </Badge>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {scoreDimensionOrder.map((dimension) => (
          <Card key={dimension} className="border-border/80">
            <CardContent className="space-y-3 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                {getScoreDimensionLabel(locale, dimension)}
              </p>
              <p className="text-3xl font-semibold tracking-tight text-slate-950">
                {formatScoreValue(locale, dimensions[dimension])}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
