import type { Route } from "next";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getOpportunityStatusLabel } from "@/lib/demo-labels";
import type { Locale } from "@/lib/i18n/config";
import type {
  PortfolioPriorityGroup,
  PrioritizedOpportunityGroup
} from "@/modules/portfolio/model/portfolio.types";
import { ScoreBadge } from "@/modules/opportunities/ui/score-badge";
import { ScorePriorityBadge } from "@/modules/opportunities/ui/score-priority-badge";

type PortfolioTableProps = {
  locale: Locale;
  title: string;
  description: string;
  emptyTitle: string;
  emptyDescription: string;
  groupLabels: Record<PortfolioPriorityGroup, string>;
  headers: {
    name: string;
    process: string;
    score: string;
    badge: string;
    status: string;
  };
  groups: PrioritizedOpportunityGroup[];
};

export function PortfolioTable({
  locale,
  title,
  description,
  emptyTitle,
  emptyDescription,
  groupLabels,
  headers,
  groups
}: PortfolioTableProps) {
  const visibleGroups = groups.filter((group) => group.items.length > 0);

  if (visibleGroups.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{emptyTitle}</CardTitle>
          <CardDescription>{emptyDescription}</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-xl font-semibold tracking-tight text-slate-950">{title}</h3>
        <p className="text-sm leading-6 text-slate-600">{description}</p>
      </div>

      {visibleGroups.map((group) => (
        <Card key={group.key}>
          <CardHeader>
            <CardTitle>{groupLabels[group.key]}</CardTitle>
            <CardDescription>{group.items.length.toString()}</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{headers.name}</TableHead>
                  <TableHead>{headers.process}</TableHead>
                  <TableHead>{headers.score}</TableHead>
                  <TableHead>{headers.badge}</TableHead>
                  <TableHead>{headers.status}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {group.items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="min-w-[280px]">
                      <Link
                        href={`/app/opportunities/${item.id}` as Route}
                        className="font-semibold text-slate-950 transition hover:text-primary"
                      >
                        {item.title}
                      </Link>
                    </TableCell>
                    <TableCell>{item.processName}</TableCell>
                    <TableCell>
                      <ScoreBadge locale={locale} score={item.score} label={headers.score} />
                    </TableCell>
                    <TableCell>
                      <ScorePriorityBadge locale={locale} badge={item.badge} />
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {getOpportunityStatusLabel(locale, item.status)}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
