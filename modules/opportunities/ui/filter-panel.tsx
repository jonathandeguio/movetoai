import type { Route } from "next";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type FilterOption = {
  label: string;
  value: string;
};

type ViewItem = {
  label: string;
  href: Route;
  active: boolean;
};

type OpportunityFilterPanelProps = {
  currentView: string;
  viewItems: ViewItem[];
  filters: {
    domainId: string;
    processId: string;
    status: string;
  };
  options: {
    domains: FilterOption[];
    processes: FilterOption[];
    statuses: FilterOption[];
  };
  labels: {
    domain: string;
    process: string;
    status: string;
    allDomains: string;
    allProcesses: string;
    allStatuses: string;
    applyFilters: string;
    clearFilters: string;
  };
  clearHref: Route;
};

export function OpportunityFilterPanel({
  currentView,
  viewItems,
  filters,
  options,
  labels,
  clearHref
}: OpportunityFilterPanelProps) {
  return (
    <>
      <Card className="border-primary/10">
        <CardContent className="p-5">
          <form action="/app/opportunities" className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            <input type="hidden" name="view" value={currentView} />

            <div className="space-y-2">
              <Label htmlFor="domainId">{labels.domain}</Label>
              <select
                id="domainId"
                name="domainId"
                defaultValue={filters.domainId}
                className="flex h-11 w-full rounded-lg border border-border bg-white px-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-primary/30"
              >
                <option value="">{labels.allDomains}</option>
                {options.domains.map((domain) => (
                  <option key={domain.value || "all-domains"} value={domain.value}>
                    {domain.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="processId">{labels.process}</Label>
              <select
                id="processId"
                name="processId"
                defaultValue={filters.processId}
                className="flex h-11 w-full rounded-lg border border-border bg-white px-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-primary/30"
              >
                <option value="">{labels.allProcesses}</option>
                {options.processes.map((process) => (
                  <option key={process.value || "all-processes"} value={process.value}>
                    {process.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">{labels.status}</Label>
              <select
                id="status"
                name="status"
                defaultValue={filters.status}
                className="flex h-11 w-full rounded-lg border border-border bg-white px-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-primary/30"
              >
                <option value="">{labels.allStatuses}</option>
                {options.statuses.map((statusOption) => (
                  <option key={statusOption.value || "all-statuses"} value={statusOption.value}>
                    {statusOption.label}
                  </option>
                ))}
              </select>
            </div>

            <Button className="self-end" type="submit">
              {labels.applyFilters}
            </Button>

            <Button className="self-end" variant="outline" asChild>
              <Link href={clearHref}>{labels.clearFilters}</Link>
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-3">
        {viewItems.map((viewItem) => (
          <Button
            key={viewItem.label}
            variant={viewItem.active ? "default" : "outline"}
            className={cn(viewItem.active ? "shadow-glow" : "")}
            asChild
          >
            <Link href={viewItem.href}>{viewItem.label}</Link>
          </Button>
        ))}
      </div>
    </>
  );
}
