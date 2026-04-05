import type { Route } from "next";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getInitiativeStatusLabel } from "@/lib/demo-labels";
import type { Locale } from "@/lib/i18n/config";
import type { ValueTableItem } from "@/modules/value-tracking/model/value.types";

function getStatusVariant(status: string) {
  if (status === "COMPLETED") {
    return "success" as const;
  }

  if (status === "AT_RISK" || status === "CANCELED") {
    return "danger" as const;
  }

  if (status === "IN_PROGRESS") {
    return "warning" as const;
  }

  return "outline" as const;
}

type ValueTableProps = {
  locale: Locale;
  title: string;
  description: string;
  emptyTitle: string;
  emptyDescription: string;
  noOpportunityLabel: string;
  noRoiLabel: string;
  noAdoptionLabel: string;
  headers: {
    initiative: string;
    expectedRoi: string;
    realizedRoi: string;
    adoption: string;
    status: string;
  };
  items: ValueTableItem[];
  formatPercent: (value: number | null) => string;
};

export function ValueTable({
  locale,
  title,
  description,
  emptyTitle,
  emptyDescription,
  noOpportunityLabel,
  noRoiLabel,
  noAdoptionLabel,
  headers,
  items,
  formatPercent
}: ValueTableProps) {
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
              <TableHead>{headers.initiative}</TableHead>
              <TableHead>{headers.expectedRoi}</TableHead>
              <TableHead>{headers.realizedRoi}</TableHead>
              <TableHead>{headers.adoption}</TableHead>
              <TableHead>{headers.status}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="min-w-[320px]">
                  <div className="space-y-1">
                    <p className="font-semibold text-slate-950">{item.initiativeName}</p>
                    {item.opportunityId ? (
                      <Link
                        href={`/app/opportunities/${item.opportunityId}` as Route}
                        className="text-sm text-slate-600 transition hover:text-primary"
                      >
                        {item.opportunityTitle}
                      </Link>
                    ) : (
                      <p className="text-sm text-slate-500">{noOpportunityLabel}</p>
                    )}
                  </div>
                </TableCell>
                <TableCell>{item.expectedRoi === null ? noRoiLabel : formatPercent(item.expectedRoi)}</TableCell>
                <TableCell>{item.realizedRoi === null ? noRoiLabel : formatPercent(item.realizedRoi)}</TableCell>
                <TableCell>{item.adoption === null ? noAdoptionLabel : formatPercent(item.adoption)}</TableCell>
                <TableCell>
                  <Badge variant={getStatusVariant(item.status)}>
                    {getInitiativeStatusLabel(locale, item.status)}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
