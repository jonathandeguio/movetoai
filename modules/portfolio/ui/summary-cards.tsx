import { MetricCard } from "@/components/app/metric-card";
import type { PortfolioSummaryMetric } from "@/modules/portfolio/model/portfolio.types";

type SummaryCardsProps = {
  metrics: PortfolioSummaryMetric[];
};

export function SummaryCards({ metrics }: SummaryCardsProps) {
  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {metrics.map((metric) => (
        <MetricCard key={metric.label} label={metric.label} value={metric.value} />
      ))}
    </section>
  );
}
