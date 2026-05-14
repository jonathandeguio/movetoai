import type { Route } from "next";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
  locked: boolean;
  tierLabel?: string;
};

type OpportunityFilterPanelProps = {
  action: string;
  viewItems: ViewItem[];
  searchValue: string;
  searchPlaceholder: string;
  filters: {
    domainId: string;
    processId: string;
    status: string;
    typeId: string;
    score: string;
    ownerId: string;
    badge: string;
    riskLevel: string;
    businessUnitId: string;
  };
  labels: {
    domain: string;
    process: string;
    status: string;
    aiType: string;
    score: string;
    owner: string;
    badge: string;
    risk: string;
    businessUnit: string;
  };
  options: {
    domains: FilterOption[];
    processes: FilterOption[];
    statuses: FilterOption[];
    aiTypes: FilterOption[];
    scores: FilterOption[];
    owners: FilterOption[];
    badges: FilterOption[];
    risks: FilterOption[];
    businessUnits: FilterOption[];
  };
  advancedUnlocked: boolean;
  enterpriseUnlocked: boolean;
  advancedLock: {
    badge: string;
    title: string;
    description: string;
    ctaLabel: string;
    href: Route;
  };
  enterpriseLock: {
    badge: string;
    title: string;
    description: string;
    ctaLabel: string;
    href: Route;
  };
  submitLabel: string;
  clearLabel: string;
  clearHref: Route;
};

function renderSelect(
  id: string,
  label: string,
  value: string,
  options: FilterOption[]
) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <select
        id={id}
        name={id}
        defaultValue={value}
        className="flex h-11 w-full rounded-lg border border-[--border] bg-[--bg-card] px-3 text-sm text-[--text-primary] shadow-sm outline-none transition focus:border-[--border-focus]"
      >
        {options.map((option) => (
          <option key={option.value || `${id}-all`} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export function OpportunityFilterPanel({
  action,
  viewItems,
  searchValue,
  searchPlaceholder,
  filters,
  labels,
  options,
  advancedUnlocked,
  enterpriseUnlocked,
  advancedLock,
  enterpriseLock,
  submitLabel,
  clearLabel,
  clearHref
}: OpportunityFilterPanelProps) {
  return (
    <Card className="border-[--green-border]">
      <CardContent className="space-y-6 p-5">
        <div className="flex flex-wrap gap-2">
          {viewItems.map((view) => (
            <Link key={view.label} href={view.href}>
              <Badge
                variant={view.active ? "default" : view.locked ? "secondary" : "outline"}
                className={cn(
                  "cursor-pointer",
                  view.active ? "" : "hover:border-[--green-border]"
                )}
              >
                {view.label}
                {view.tierLabel ? ` · ${view.tierLabel}` : ""}
              </Badge>
            </Link>
          ))}
        </div>

        <form action={action} className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <Input name="q" defaultValue={searchValue} placeholder={searchPlaceholder} />
            {renderSelect("domainId", labels.domain, filters.domainId, options.domains)}
            {renderSelect("processId", labels.process, filters.processId, options.processes)}
            {renderSelect("status", labels.status, filters.status, options.statuses)}
          </div>

          {advancedUnlocked ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
              {renderSelect("typeId", labels.aiType, filters.typeId, options.aiTypes)}
              {renderSelect("score", labels.score, filters.score, options.scores)}
              {renderSelect("ownerId", labels.owner, filters.ownerId, options.owners)}
              {renderSelect("badge", labels.badge, filters.badge, options.badges)}
              {renderSelect("riskLevel", labels.risk, filters.riskLevel, options.risks)}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-[--green-border] bg-[--green-dim] p-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline">{advancedLock.badge}</Badge>
              </div>
              <p className="mt-3 text-base font-semibold text-[--text-primary]">{advancedLock.title}</p>
              <p className="mt-2 text-sm leading-6 text-[--text-secondary]">{advancedLock.description}</p>
              <Button className="mt-4" variant="outline" asChild>
                <Link href={advancedLock.href}>{advancedLock.ctaLabel}</Link>
              </Button>
            </div>
          )}

          {enterpriseUnlocked ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {renderSelect(
                "businessUnitId",
                labels.businessUnit,
                filters.businessUnitId,
                options.businessUnits
              )}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-[--blue-border] bg-[--blue-dim] p-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline">{enterpriseLock.badge}</Badge>
              </div>
              <p className="mt-3 text-base font-semibold text-[--text-primary]">{enterpriseLock.title}</p>
              <p className="mt-2 text-sm leading-6 text-[--text-secondary]">{enterpriseLock.description}</p>
              <Button className="mt-4" variant="outline" asChild>
                <Link href={enterpriseLock.href}>{enterpriseLock.ctaLabel}</Link>
              </Button>
            </div>
          )}

          <div className="flex flex-wrap gap-3">
            <Button type="submit">{submitLabel}</Button>
            <Button variant="outline" asChild>
              <Link href={clearHref}>{clearLabel}</Link>
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
