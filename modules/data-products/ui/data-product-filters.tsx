import type { Route } from "next";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { DataProductListFilters } from "@/modules/data-products/model/data-product-list.filters";

type DataProductFiltersProps = {
  values: DataProductListFilters;
  labels: {
    searchPlaceholder: string;
    searchLabel: string;
    medallionStageLabel: string;
    readinessLabel: string;
    allMedallionStages: string;
    allReadinessStates: string;
    stageOptions: {
      bronze: string;
      silver: string;
      gold: string;
    };
    readinessOptions: {
      draft: string;
      inProgress: string;
      ready: string;
    };
    apply: string;
    clear: string;
  };
};

export function DataProductFilters({ values, labels }: DataProductFiltersProps) {
  const hasActiveFilters = Boolean(
    values.search || values.medallionStage || values.readinessStatus
  );

  return (
    <Card>
      <CardContent className="p-6">
        <form className="grid gap-4 lg:grid-cols-[minmax(0,1.3fr)_220px_220px_auto] lg:items-end" method="get">
          <label className="grid gap-2">
            <span className="text-sm font-medium text-slate-700">{labels.searchLabel}</span>
            <Input
              name="search"
              defaultValue={values.search ?? ""}
              placeholder={labels.searchPlaceholder}
            />
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-medium text-slate-700">
              {labels.medallionStageLabel}
            </span>
            <select
              name="medallionStage"
              defaultValue={values.medallionStage ?? ""}
              className="flex h-11 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="">{labels.allMedallionStages}</option>
              <option value="BRONZE">{labels.stageOptions.bronze}</option>
              <option value="SILVER">{labels.stageOptions.silver}</option>
              <option value="GOLD">{labels.stageOptions.gold}</option>
            </select>
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-medium text-slate-700">{labels.readinessLabel}</span>
            <select
              name="readiness"
              defaultValue={values.readinessStatus ?? ""}
              className="flex h-11 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="">{labels.allReadinessStates}</option>
              <option value="DRAFT">{labels.readinessOptions.draft}</option>
              <option value="IN_PROGRESS">{labels.readinessOptions.inProgress}</option>
              <option value="READY">{labels.readinessOptions.ready}</option>
            </select>
          </label>

          <div className="flex flex-wrap gap-3 lg:justify-end">
            <Button type="submit" variant="outline">
              {labels.apply}
            </Button>
            {hasActiveFilters ? (
              <Button asChild variant="ghost">
                <Link href={"/app/data-products" as Route}>{labels.clear}</Link>
              </Button>
            ) : null}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
