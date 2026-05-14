import type { Route } from "next";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { Locale } from "@/lib/i18n/config";

import { formatCompactCurrency } from "@/components/opportunities/utils";

type OpportunityMatrixProps = {
  locale: Locale;
  title: string;
  description: string;
  xAxisTitle: string;
  yAxisTitle: string;
  scoreBands: string[];
  valueBands: string[];
  countLabel: string;
  opportunities: Array<{
    id: string;
    title: string;
    overallScore: unknown;
    scoring?: {
      total: number;
    };
    expectedValue: unknown;
    process: {
      name: string;
    };
    businessUnit: {
      name: string;
    } | null;
  }>;
};

function resolveScoreBand(score: number) {
  if (score >= 80) {
    return 2;
  }

  if (score >= 60) {
    return 1;
  }

  return 0;
}

function resolveValueBand(value: number) {
  if (value >= 750000) {
    return 2;
  }

  if (value >= 250000) {
    return 1;
  }

  return 0;
}

export function OpportunityMatrix({
  locale,
  title,
  description,
  xAxisTitle,
  yAxisTitle,
  scoreBands,
  valueBands,
  countLabel,
  opportunities
}: OpportunityMatrixProps) {
  const cells = Array.from({ length: 3 }, (_, valueBandIndex) =>
    Array.from({ length: 3 }, (_, scoreBandIndex) => {
      const items = opportunities.filter((opportunity) => {
        const score = opportunity.scoring?.total ?? Number(opportunity.overallScore ?? 0);
        const value = Number(opportunity.expectedValue ?? 0);

        return (
          resolveScoreBand(score) === scoreBandIndex &&
          resolveValueBand(value) === valueBandIndex
        );
      });

      return {
        items
      };
    })
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 pt-0">
        <div className="grid gap-4 xl:grid-cols-[160px_1fr]">
          <div className="rounded-2xl border border-[--border] bg-[--bg-hover] px-4 py-5 text-sm font-semibold text-[--text-secondary]">
            {yAxisTitle}
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {scoreBands.map((label) => (
              <div
                key={label}
                className="rounded-2xl border border-[--border] bg-[--bg-hover] px-4 py-5 text-sm font-semibold text-[--text-secondary]"
              >
                {xAxisTitle}: {label}
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          {[2, 1, 0].map((valueBandIndex) => (
            <div key={valueBandIndex} className="grid gap-4 xl:grid-cols-[160px_1fr]">
              <div className="rounded-2xl border border-[--border] bg-[--bg-card] px-4 py-5 text-sm font-semibold text-[--text-primary]">
                {valueBands[valueBandIndex]}
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                {[0, 1, 2].map((scoreBandIndex) => {
                  const cell = cells[valueBandIndex][scoreBandIndex];

                  return (
                    <div
                      key={`${valueBandIndex}-${scoreBandIndex}`}
                      className="rounded-2xl border border-[--border] bg-[--bg-card] p-4"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <Badge>{cell.items.length} {countLabel}</Badge>
                        {cell.items[0]?.expectedValue ? (
                          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[--text-muted]">
                            {formatCompactCurrency(locale, Number(cell.items[0].expectedValue ?? 0))}
                          </span>
                        ) : null}
                      </div>
                      <div className="mt-4 space-y-3">
                        {cell.items.slice(0, 3).map((item) => (
                          <Link
                            key={item.id}
                            href={`/app/opportunities/${item.id}` as Route}
                            className="block rounded-xl bg-[--bg-hover] px-3 py-3 transition hover:bg-[--green-dim]"
                          >
                            <p className="text-sm font-semibold text-[--text-primary]">{item.title}</p>
                            <p className="mt-1 text-sm text-[--text-secondary]">
                              {[item.process.name, item.businessUnit?.name].filter(Boolean).join(" · ")}
                            </p>
                          </Link>
                        ))}
                        {cell.items.length === 0 ? (
                          <p className="rounded-xl bg-[--bg-hover] px-3 py-4 text-sm text-[--text-muted]">
                            {valueBands[valueBandIndex]} · {scoreBands[scoreBandIndex]}
                          </p>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
