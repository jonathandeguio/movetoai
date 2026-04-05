import type { Route } from "next";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  getDecisionStatusLabel,
  getOpportunityBadgeLabel,
  getOpportunityWorkflowLabel
} from "@/lib/demo-labels";
import type { OpportunityWorkflowStatus } from "@/lib/demo-labels";
import type { Locale } from "@/lib/i18n/config";

import { ScoreBadge } from "@/components/opportunities/score-badge";
import { formatCompactCurrency, getWorkflowBadgeVariant } from "@/components/opportunities/utils";

const workflowOrder: OpportunityWorkflowStatus[] = [
  "DRAFT",
  "ASSESSED",
  "UNDER_REVIEW",
  "APPROVED",
  "IN_DELIVERY",
  "LIVE",
  "DEFERRED",
  "REJECTED",
  "ARCHIVED"
];

type OpportunityKanbanProps = {
  locale: Locale;
  title: string;
  description: string;
  scoreLabel: string;
  valueLabel: string;
  countLabel: string;
  opportunities: Array<{
    id: string;
    title: string;
    badge: string;
    overallScore: unknown;
    scoring?: {
      total: number;
    };
    expectedValue: unknown;
    workflowStatus: OpportunityWorkflowStatus;
    process: {
      name: string;
    };
    owner: {
      name: string | null;
    } | null;
    currentDecision: {
      status: string;
    } | null;
  }>;
};

export function OpportunityKanban({
  locale,
  title,
  description,
  scoreLabel,
  valueLabel,
  countLabel,
  opportunities
}: OpportunityKanbanProps) {
  const lanes = workflowOrder.map((workflowStatus) => ({
    workflowStatus,
    opportunities: opportunities.filter((opportunity) => opportunity.workflowStatus === workflowStatus)
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="overflow-x-auto pt-0">
        <div className="grid min-w-[1200px] gap-4 xl:grid-cols-3 2xl:grid-cols-5">
          {lanes.map((lane) => (
            <div
              key={lane.workflowStatus}
              className="rounded-2xl border border-border/80 bg-slate-50/80 p-4"
            >
              <div className="flex items-center justify-between gap-3">
                <Badge variant={getWorkflowBadgeVariant(lane.workflowStatus)}>
                  {getOpportunityWorkflowLabel(locale, lane.workflowStatus)}
                </Badge>
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  {lane.opportunities.length} {countLabel}
                </span>
              </div>
              <div className="mt-4 space-y-3">
                {lane.opportunities.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-border/80 bg-white px-3 py-5 text-sm text-slate-500">
                    {getOpportunityWorkflowLabel(locale, lane.workflowStatus)}
                  </div>
                ) : (
                  lane.opportunities.map((opportunity) => (
                    <Link
                      key={opportunity.id}
                      href={`/app/opportunities/${opportunity.id}` as Route}
                      className="block rounded-2xl border border-border/80 bg-white p-4 transition hover:border-primary/20 hover:bg-primary/5"
                    >
                      <div className="flex flex-wrap gap-2">
                        <Badge>{getOpportunityBadgeLabel(locale, opportunity.badge)}</Badge>
                        {opportunity.currentDecision ? (
                          <Badge variant="outline">
                            {getDecisionStatusLabel(locale, opportunity.currentDecision.status)}
                          </Badge>
                        ) : null}
                      </div>
                      <h3 className="mt-3 text-sm font-semibold text-slate-950">
                        {opportunity.title}
                      </h3>
                      <p className="mt-2 text-sm leading-6 text-slate-600">
                        {[opportunity.process.name, opportunity.owner?.name].filter(Boolean).join(" · ")}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <ScoreBadge
                          locale={locale}
                          score={opportunity.scoring?.total ?? Number(opportunity.overallScore ?? 0)}
                          label={scoreLabel}
                        />
                        <Badge variant="secondary">
                          {valueLabel}{" "}
                          {formatCompactCurrency(locale, Number(opportunity.expectedValue ?? 0))}
                        </Badge>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
