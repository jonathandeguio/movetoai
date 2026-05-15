import { MetricCard } from "@/components/app/metric-card";
import type { PortfolioSummaryMetric } from "@/modules/portfolio/model/portfolio.types";

type SummaryCardsProps = {
  metrics: PortfolioSummaryMetric[];
  inline?: boolean;
};

export function SummaryCards({ metrics, inline }: SummaryCardsProps) {
  if (inline) {
    return (
      <div className="mt-4 flex flex-wrap gap-4 pl-[1.2cm]">
        {metrics.map((metric) => (
          <MetricCard
            key={metric.label}
            label={metric.label}
            value={metric.value}
            className="h-[2cm] w-[8cm]"
            contentClassName="flex h-full flex-col justify-center gap-1 px-5 py-0"
          />
        ))}
      </div>
    );
  }

  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {metrics.map((metric) => (
        <MetricCard key={metric.label} label={metric.label} value={metric.value} />
      ))}
    </section>
  );
}
