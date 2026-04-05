import type { Route } from "next";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getDecisionStatusLabel, getOpportunityStatusLabel } from "@/lib/demo-labels";
import type { Locale } from "@/lib/i18n/config";
import type { GovernanceDecisionListItem } from "@/modules/governance/model/governance.types";

function formatGovernanceDate(locale: Locale, value: Date) {
  const intlLocale = locale === "fr" ? "fr-FR" : locale === "es" ? "es-ES" : "en-US";

  return new Intl.DateTimeFormat(intlLocale, {
    year: "numeric",
    month: "short",
    day: "numeric"
  }).format(value);
}

function getDecisionVariant(status: string | null) {
  if (status === "APPROVED") {
    return "success" as const;
  }

  if (status === "REJECTED") {
    return "danger" as const;
  }

  if (status === "DEFERRED" || status === "NEEDS_INFO") {
    return "warning" as const;
  }

  if (!status) {
    return "outline" as const;
  }

  return "default" as const;
}

type DecisionListProps = {
  locale: Locale;
  title: string;
  description: string;
  emptyTitle: string;
  emptyDescription: string;
  noDecisionLabel: string;
  noOwnerLabel: string;
  headers: {
    opportunity: string;
    currentStatus: string;
    decision: string;
    owner: string;
    updatedAt: string;
  };
  items: GovernanceDecisionListItem[];
};

export function DecisionList({
  locale,
  title,
  description,
  emptyTitle,
  emptyDescription,
  noDecisionLabel,
  noOwnerLabel,
  headers,
  items
}: DecisionListProps) {
  if (items.length === 0) {
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
              <TableHead>{headers.currentStatus}</TableHead>
              <TableHead>{headers.decision}</TableHead>
              <TableHead>{headers.owner}</TableHead>
              <TableHead>{headers.updatedAt}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="min-w-[280px]">
                  <Link
                    href={`/app/opportunities/${item.opportunityId}` as Route}
                    className="font-semibold text-slate-950 transition hover:text-primary"
                  >
                    {item.opportunityTitle}
                  </Link>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">
                    {getOpportunityStatusLabel(locale, item.currentStatus)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={getDecisionVariant(item.decisionStatus)}>
                    {item.decisionStatus
                      ? getDecisionStatusLabel(locale, item.decisionStatus)
                      : noDecisionLabel}
                  </Badge>
                </TableCell>
                <TableCell>{item.ownerName ?? noOwnerLabel}</TableCell>
                <TableCell>{formatGovernanceDate(locale, item.updatedAt)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
