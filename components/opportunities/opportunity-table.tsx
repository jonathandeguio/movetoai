import type { Route } from "next";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  getDecisionStatusLabel,
  getOpportunityBadgeLabel,
  getOpportunityWorkflowLabel,
  getRiskSeverityLabel
} from "@/lib/demo-labels";
import type { Locale } from "@/lib/i18n/config";

import { ScoreBadge } from "@/components/opportunities/score-badge";
import { formatCurrency, getRiskBadgeVariant, getWorkflowBadgeVariant } from "@/components/opportunities/utils";

type OpportunityTableProps = {
  locale: Locale;
  title: string;
  description: string;
  headers: {
    opportunity: string;
    domain: string;
    process: string;
    type: string;
    owner: string;
    workflow: string;
    risk: string;
    score: string;
    value: string;
    decision: string;
  };
  emptyDecisionLabel: string;
  noSummaryLabel: string;
  opportunities: Array<{
    id: string;
    title: string;
    summary: string | null;
    badge: string;
    riskSeverity: string;
    overallScore: unknown;
    expectedValue: unknown;
    currencyCode?: string;
    workflowStatus: string;
    domain: {
      name: string;
    };
    process: {
      name: string;
    };
    opportunityType: {
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

export function OpportunityTable({
  locale,
  title,
  description,
  headers,
  emptyDecisionLabel,
  noSummaryLabel,
  opportunities
}: OpportunityTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{headers.opportunity}</TableHead>
              <TableHead>{headers.domain}</TableHead>
              <TableHead>{headers.process}</TableHead>
              <TableHead>{headers.type}</TableHead>
              <TableHead>{headers.owner}</TableHead>
              <TableHead>{headers.workflow}</TableHead>
              <TableHead>{headers.risk}</TableHead>
              <TableHead>{headers.score}</TableHead>
              <TableHead>{headers.value}</TableHead>
              <TableHead>{headers.decision}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {opportunities.map((opportunity) => (
              <TableRow key={opportunity.id}>
                <TableCell className="min-w-[300px]">
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Link
                        href={`/app/opportunities/${opportunity.id}` as Route}
                        className="text-base font-semibold text-slate-950 transition hover:text-primary"
                      >
                        {opportunity.title}
                      </Link>
                      <p className="max-w-xl text-sm leading-6 text-slate-600">
                        {opportunity.summary ?? noSummaryLabel}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Badge>{getOpportunityBadgeLabel(locale, opportunity.badge)}</Badge>
                      <ScoreBadge
                        locale={locale}
                        score={Number(opportunity.overallScore ?? 0)}
                        label={headers.score}
                      />
                    </div>
                  </div>
                </TableCell>
                <TableCell>{opportunity.domain.name}</TableCell>
                <TableCell>{opportunity.process.name}</TableCell>
                <TableCell>{opportunity.opportunityType.name}</TableCell>
                <TableCell>{opportunity.owner?.name ?? "-"}</TableCell>
                <TableCell>
                  <Badge
                    variant={getWorkflowBadgeVariant(opportunity.workflowStatus as never)}
                  >
                    {getOpportunityWorkflowLabel(
                      locale,
                      opportunity.workflowStatus,
                      opportunity.currentDecision?.status
                    )}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={getRiskBadgeVariant(opportunity.riskSeverity)}>
                    {getRiskSeverityLabel(locale, opportunity.riskSeverity)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <ScoreBadge
                    locale={locale}
                    score={Number(opportunity.overallScore ?? 0)}
                    label={headers.score}
                  />
                </TableCell>
                <TableCell>
                  {formatCurrency(
                    locale,
                    Number(opportunity.expectedValue ?? 0),
                    opportunity.currencyCode ?? "USD"
                  )}
                </TableCell>
                <TableCell>
                  {opportunity.currentDecision ? (
                    <Badge variant="outline">
                      {getDecisionStatusLabel(locale, opportunity.currentDecision.status)}
                    </Badge>
                  ) : (
                    <Badge variant="secondary">{emptyDecisionLabel}</Badge>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
