import { Badge } from "@/components/ui/badge";
import { getDecisionStatusLabel, getOpportunityBadgeLabel, getOpportunityStatusLabel } from "@/lib/demo-labels";
import type { Locale } from "@/lib/i18n/config";

type OpportunityPreviewCardProps = {
  locale: Locale;
  title: string;
  processName?: string | null;
  capabilityName?: string | null;
  ownerName?: string | null;
  status: string;
  badge: string;
  decisionStatus?: string | null;
  score?: number | null;
  expectedValue?: number | null;
  valueLabel: string;
  scoreLabel: string;
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  }).format(value);
}

export function OpportunityPreviewCard({
  locale,
  title,
  processName,
  capabilityName,
  ownerName,
  status,
  badge,
  decisionStatus,
  score,
  expectedValue,
  valueLabel,
  scoreLabel
}: OpportunityPreviewCardProps) {
  return (
    <div className="rounded-2xl border border-border/80 p-4">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="outline">{getOpportunityStatusLabel(locale, status)}</Badge>
        <Badge>{getOpportunityBadgeLabel(locale, badge)}</Badge>
        {decisionStatus ? (
          <Badge variant="secondary">{getDecisionStatusLabel(locale, decisionStatus)}</Badge>
        ) : null}
      </div>
      <h3 className="mt-3 text-base font-semibold text-[--text-primary]">{title}</h3>
      <p className="mt-1 text-sm text-[--text-secondary]">
        {[processName, capabilityName, ownerName].filter(Boolean).join(" · ")}
      </p>
      <p className="mt-2 text-sm text-[--text-muted]">
        {scoreLabel} {score ? score.toFixed(0) : "0"} · {valueLabel}{" "}
        {expectedValue ? formatCurrency(expectedValue) : formatCurrency(0)}
      </p>
    </div>
  );
}
