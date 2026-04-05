import type { Route } from "next";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getApprovalStatusLabel, getDecisionStatusLabel } from "@/lib/demo-labels";
import type { Locale } from "@/lib/i18n/config";
import type { GovernanceApprovalQueueItem } from "@/modules/governance/model/governance.types";

function formatGovernanceDate(locale: Locale, value: Date | null) {
  if (!value) {
    return null;
  }

  const intlLocale = locale === "fr" ? "fr-FR" : locale === "es" ? "es-ES" : "en-US";

  return new Intl.DateTimeFormat(intlLocale, {
    year: "numeric",
    month: "short",
    day: "numeric"
  }).format(value);
}

type ApprovalQueueProps = {
  locale: Locale;
  title: string;
  description: string;
  emptyTitle: string;
  emptyDescription: string;
  noApproverLabel: string;
  noDueDateLabel: string;
  headers: {
    opportunity: string;
    decision: string;
    approval: string;
    approver: string;
    dueDate: string;
  };
  items: GovernanceApprovalQueueItem[];
};

export function ApprovalQueue({
  locale,
  title,
  description,
  emptyTitle,
  emptyDescription,
  noApproverLabel,
  noDueDateLabel,
  headers,
  items
}: ApprovalQueueProps) {
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
              <TableHead>{headers.decision}</TableHead>
              <TableHead>{headers.approval}</TableHead>
              <TableHead>{headers.approver}</TableHead>
              <TableHead>{headers.dueDate}</TableHead>
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
                    {getDecisionStatusLabel(locale, item.decisionStatus)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="warning">{getApprovalStatusLabel(locale, "PENDING")}</Badge>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <p className="text-sm text-slate-950">
                      {item.approverName ?? noApproverLabel}
                    </p>
                    {item.approverRoleLabel ? (
                      <p className="text-xs text-slate-500">{item.approverRoleLabel}</p>
                    ) : null}
                  </div>
                </TableCell>
                <TableCell>{formatGovernanceDate(locale, item.dueDate) ?? noDueDateLabel}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
