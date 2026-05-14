"use client";

import { useMemo, useState } from "react";
import type { Route } from "next";
import Link from "next/link";

import type {
  MarketingSiteContent,
  ScenarioIndustryKey,
  ScenarioSizeKey
} from "@/lib/marketing-site";
import { buildMarketingScenario, companySizeOptions, industryOptions } from "@/lib/marketing-site";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type ScenarioBrowserProps = {
  content: MarketingSiteContent;
};

export function ScenarioBrowser({ content }: ScenarioBrowserProps) {
  const [selectedSize, setSelectedSize] = useState<ScenarioSizeKey>("pme");
  const [selectedIndustry, setSelectedIndustry] =
    useState<ScenarioIndustryKey>("industrie");

  const scenario = useMemo(
    () => buildMarketingScenario(selectedSize, selectedIndustry),
    [selectedIndustry, selectedSize]
  );

  return (
    <div className="grid gap-6">
      <div className="grid gap-5 rounded-[28px] border border-primary/10 bg-white/90 p-6 shadow-soft-sm lg:grid-cols-2">
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary-deep">
            {content.labels.companySize}
          </p>
          <div className="flex flex-wrap gap-3">
            {companySizeOptions.map((option) => (
              <button
                key={option.key}
                type="button"
                onClick={() => setSelectedSize(option.key)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  selectedSize === option.key
                    ? "bg-primary text-white shadow-sm"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary-deep">
            {content.labels.industry}
          </p>
          <div className="flex flex-wrap gap-3">
            {industryOptions.map((option) => (
              <button
                key={option.key}
                type="button"
                onClick={() => setSelectedIndustry(option.key)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  selectedIndustry === option.key
                    ? "bg-slate-950 text-white shadow-sm"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <Card className="overflow-hidden border-primary/10 shadow-soft">
        <CardHeader className="space-y-4 border-b border-border/70 bg-gradient-to-br from-primary/5 via-white to-slate-50">
          <div className="flex flex-wrap items-center gap-3">
            <Badge>{companySizeOptions.find((item) => item.key === selectedSize)?.label}</Badge>
            <Badge variant="secondary">
              {industryOptions.find((item) => item.key === selectedIndustry)?.label}
            </Badge>
          </div>
          <CardTitle className="text-2xl">{scenario.context}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6 p-6 lg:grid-cols-2">
          <div className="space-y-5">
            <div className="space-y-3">
              <p className="text-sm font-semibold text-slate-950">{content.labels.painPoints}</p>
              <ul className="space-y-2 text-sm leading-7 text-slate-600">
                {scenario.painPoints.map((item) => (
                  <li key={item} className="rounded-2xl border border-border/70 bg-slate-50 px-4 py-3">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="space-y-3">
              <p className="text-sm font-semibold text-slate-950">
                {content.labels.priorityProcesses}
              </p>
              <div className="flex flex-wrap gap-2">
                {scenario.priorityProcesses.map((item) => (
                  <span
                    key={item}
                    className="rounded-full border border-primary/10 bg-primary/5 px-3 py-1.5 text-xs font-medium text-primary-deep"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
            <div className="rounded-3xl border border-border/70 bg-white/90 p-5">
              <p className="text-sm font-semibold text-slate-950">
                {content.labels.diagnostic}
              </p>
              <p className="mt-2 text-sm leading-7 text-slate-600">
                {scenario.diagnostic}
              </p>
            </div>
          </div>

          <div className="space-y-5">
            <div className="rounded-3xl border border-primary/10 bg-primary/5 p-5">
              <p className="text-sm font-semibold text-primary-deep">{content.labels.moveToAi}</p>
              <p className="mt-2 text-sm leading-7 text-slate-700">{scenario.moveToAi}</p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-slate-950 p-5 text-white">
              <p className="text-sm font-semibold text-slate-100">{content.labels.platform}</p>
              <p className="mt-2 text-sm leading-7 text-slate-200">{scenario.platform}</p>
            </div>
            <div className="space-y-3">
              <p className="text-sm font-semibold text-slate-950">
                {content.labels.expectedBenefits}
              </p>
              <ul className="space-y-2 text-sm leading-7 text-slate-600">
                {scenario.expectedBenefits.map((item) => (
                  <li key={item} className="rounded-2xl border border-border/70 px-4 py-3">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild>
                <Link href={"/signup" as Route}>{content.shared.primaryCta}</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href={"/plateforme" as Route}>{content.shared.secondaryCta}</Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
