import type { Route } from "next";
import Link from "next/link";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { DataProductListItemViewModel } from "@/modules/data-products/model/data-product-list.view-model";
import { DataProductsEmptyState } from "@/modules/data-products/ui/data-products-empty-state";
import { DataProductMedallionBadge } from "@/modules/data-products/ui/data-product-medallion-badge";
import { DataProductReadinessBadge } from "@/modules/data-products/ui/data-product-readiness-badge";

type DataProductTableProps = {
  title: string;
  description: string;
  emptyTitle: string;
  emptyDescription: string;
  headers: {
    name: string;
    medallionStage: string;
    readiness: string;
    processCount: string;
    opportunityCount: string;
    reportingAssetCount: string;
  };
  detailActionLabel: string;
  items: DataProductListItemViewModel[];
};

export function DataProductTable({
  title,
  description,
  emptyTitle,
  emptyDescription,
  headers,
  detailActionLabel,
  items,
}: DataProductTableProps) {
  if (items.length === 0) {
    return (
      <DataProductsEmptyState
        title={emptyTitle}
        description={emptyDescription}
      />
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
              <TableHead>{headers.name}</TableHead>
              <TableHead>{headers.medallionStage}</TableHead>
              <TableHead>{headers.readiness}</TableHead>
              <TableHead className="text-right">{headers.processCount}</TableHead>
              <TableHead className="text-right">{headers.opportunityCount}</TableHead>
              <TableHead className="text-right">{headers.reportingAssetCount}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="min-w-[280px]">
                  <div className="space-y-1">
                    <p className="font-semibold text-slate-950">{item.name}</p>
                    {item.description ? (
                      <p className="max-w-xl text-sm leading-6 text-slate-600">
                        {item.description}
                      </p>
                    ) : null}
                    <Link
                      href={`/app/data-products/${item.id}` as Route}
                      className="inline-flex text-sm font-medium text-blue-700 transition-colors hover:text-blue-900"
                    >
                      {detailActionLabel}
                    </Link>
                  </div>
                </TableCell>
                <TableCell>
                  <DataProductMedallionBadge medallionStage={item.medallionStage} />
                </TableCell>
                <TableCell>
                  <DataProductReadinessBadge readinessStatus={item.readinessStatus} />
                </TableCell>
                <TableCell className="text-right font-medium text-slate-700">
                  {item.processCount}
                </TableCell>
                <TableCell className="text-right font-medium text-slate-700">
                  {item.opportunityCount}
                </TableCell>
                <TableCell className="text-right font-medium text-slate-700">
                  {item.reportingAssetCount}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
