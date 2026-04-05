"use client";

import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef
} from "@tanstack/react-table";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";

type FeatureRow = {
  feature: string;
  free: string;
  pro: string;
  enterprise: string;
};

type FeatureGatingTableProps = {
  title: string;
  description: string;
  headers: {
    feature: string;
    free: string;
    pro: string;
    enterprise: string;
  };
  rows: FeatureRow[];
};

export function FeatureGatingTable({
  title,
  description,
  headers,
  rows
}: FeatureGatingTableProps) {
  const tableColumns: ColumnDef<FeatureRow>[] = [
    {
      accessorKey: "feature",
      header: headers.feature
    },
    {
      accessorKey: "free",
      header: headers.free,
      cell: ({ row }) => <Badge variant="outline">{row.original.free}</Badge>
    },
    {
      accessorKey: "pro",
      header: headers.pro,
      cell: ({ row }) => <Badge>{row.original.pro}</Badge>
    },
    {
      accessorKey: "enterprise",
      header: headers.enterprise,
      cell: ({ row }) => <Badge variant="secondary">{row.original.enterprise}</Badge>
    }
  ];

  const table = useReactTable({
    data: rows,
    columns: tableColumns,
    getCoreRowModel: getCoreRowModel()
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
