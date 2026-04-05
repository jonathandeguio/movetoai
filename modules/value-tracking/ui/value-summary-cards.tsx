import { MetricCard } from "@/components/app/metric-card";
import type { ValueSummary } from "@/modules/value-tracking/model/value.types";

type ValueSummaryCardsProps = {
  summary: ValueSummary;
  labels: {
    totalExpectedValue: string;
    totalRealizedValue: string;
    adoptionOverview: string;
  };
  formatCurrency: (value: number) => string;
  formatPercent: (value: number | null) => string;
};

export function ValueSummaryCards({
  summary,
  labels,
  formatCurrency,
  formatPercent
}: ValueSummaryCardsProps) {
  return (
    <section className="grid gap-4 md:grid-cols-3">
      <MetricCard
        label={labels.totalExpectedValue}
        value={formatCurrency(summary.totalExpectedValue)}
      />
      <MetricCard
        label={labels.totalRealizedValue}
        value={formatCurrency(summary.totalRealizedValue)}
      />
      <MetricCard
        label={labels.adoptionOverview}
        value={formatPercent(summary.adoptionOverview)}
      />
    </section>
  );
}
