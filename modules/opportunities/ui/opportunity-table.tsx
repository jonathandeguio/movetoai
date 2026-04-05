import type { Route } from "next";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getOpportunityStatusLabel, getOpportunityWorkflowLabel } from "@/lib/demo-labels";
import type { Locale } from "@/lib/i18n/config";
import { ScoreBadge } from "@/modules/opportunities/ui/score-badge";
import { ScorePriorityBadge } from "@/modules/opportunities/ui/score-priority-badge";
import { getWorkflowBadgeVariant } from "@/modules/opportunities/ui/opportunity-ui.utils";
import type { OpportunityWorkflowStatus } from "@/modules/scoring/model/scoring.types";

type OpportunityTableProps = {
  locale: Locale;
  title: string;
  description: string;
  noSummaryLabel: string;
  headers: {
    opportunity: string;
    domain: string;
    process: string;
    workflow: string;
    score: string;
  };
  opportunities: Array<{
    id: string;
    title: string;
    summary: string | null;
    status: string;
    domain: {
      name: string;
    };
    process: {
      name: string;
    };
    currentDecision: {
      status: string;
    } | null;
    workflowStatus: OpportunityWorkflowStatus;
    scoring: {
      total: number;
      badge: Parameters<typeof ScorePriorityBadge>[0]["badge"];
    };
  }>;
};

export function OpportunityTable({
  locale,
  title,
  description,
  noSummaryLabel,
  headers,
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
              <TableHead>{headers.workflow}</TableHead>
              <TableHead>{headers.score}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {opportunities.map((opportunity) => (
              <TableRow key={opportunity.id}>
                <TableCell className="min-w-[280px]">
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
                </TableCell>
                <TableCell>{opportunity.domain.name}</TableCell>
                <TableCell>{opportunity.process.name}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant={getWorkflowBadgeVariant(opportunity.workflowStatus)}>
                      {getOpportunityWorkflowLabel(
                        locale,
                        opportunity.status,
                        opportunity.currentDecision?.status
                      )}
                    </Badge>
                    <Badge variant="outline">
                      {getOpportunityStatusLabel(locale, opportunity.status)}
                    </Badge>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-2">
                    <ScoreBadge
                      locale={locale}
                      score={opportunity.scoring.total}
                      label={headers.score}
                    />
                    <ScorePriorityBadge
                      locale={locale}
                      badge={opportunity.scoring.badge}
                    />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
