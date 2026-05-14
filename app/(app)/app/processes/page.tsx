import type { Route } from "next";
import Link from "next/link";

import { BusinessStructureEmptyState } from "@/components/business-structure/empty-state";
import { BusinessStructureFilterPanel } from "@/components/business-structure/filter-panel";
import { MetricCard } from "@/components/app/metric-card";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { requirePermission } from "@/server/permissions";
import { getMessages } from "@/lib/i18n";
import { getRequestLocale } from "@/lib/i18n/server";
import { getProcessList } from "@/modules/business-structure/server/get-processes";
import { parseProcessFilters } from "@/modules/business-structure/server/parse-process-filters";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function buildHref(basePath: string, nextValues: Record<string, string>): Route {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(nextValues)) {
    if (value) {
      params.set(key, value);
    }
  }

  const query = params.toString();
  return (query ? `${basePath}?${query}` : basePath) as Route;
}

function renderPreview(items: string[]) {
  const visibleItems = items.slice(0, 2);
  return {
    visibleItems,
    extraCount: Math.max(items.length - visibleItems.length, 0)
  };
}

export default async function ProcessesPage({
  searchParams
}: {
  searchParams: SearchParams;
}) {
  const locale = await getRequestLocale();
  const messages = getMessages(locale);
  const { workspace } = await requirePermission("business-structure.manage");
  const filters = parseProcessFilters(await searchParams);
  const data = await getProcessList(workspace!.id, filters);

  const chips = [
    {
      label: messages.app.processesModule.filters.focusAll,
      href: buildHref("/app/processes", {
        q: filters.q,
        businessUnitId: filters.businessUnitId,
        focus: "all"
      }),
      active: filters.focus === "all"
    },
    {
      label: messages.app.processesModule.filters.focusLinkedOpportunities,
      href: buildHref("/app/processes", {
        q: filters.q,
        businessUnitId: filters.businessUnitId,
        focus: "linked-opportunities"
      }),
      active: filters.focus === "linked-opportunities"
    },
    {
      label: messages.app.processesModule.filters.focusWithPainPoints,
      href: buildHref("/app/processes", {
        q: filters.q,
        businessUnitId: filters.businessUnitId,
        focus: "with-pain-points"
      }),
      active: filters.focus === "with-pain-points"
    },
    {
      label: messages.app.processesModule.filters.focusOpportunityWhitespace,
      href: buildHref("/app/processes", {
        q: filters.q,
        businessUnitId: filters.businessUnitId,
        focus: "opportunity-whitespace"
      }),
      active: filters.focus === "opportunity-whitespace"
    }
  ];

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-[--green-border] bg-[--bg-card] p-8 shadow-soft-sm">
        <div className="space-y-4">
          <Badge>{messages.app.nav.processes.title}</Badge>
          <h2 className="max-w-4xl text-4xl font-semibold tracking-tight text-[--text-primary] text-balance">
            {messages.app.processesModule.title}
          </h2>
          <p className="max-w-3xl text-base leading-8 text-[--text-secondary]">
            {messages.app.processesModule.description}
          </p>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label={messages.app.processesModule.metrics.processes}
          value={data.metrics.processes.toString()}
        />
        <MetricCard
          label={messages.app.processesModule.metrics.painPoints}
          value={data.metrics.painPoints.toString()}
        />
        <MetricCard
          label={messages.app.processesModule.metrics.opportunities}
          value={data.metrics.opportunities.toString()}
        />
        <MetricCard
          label={messages.app.processesModule.metrics.applications}
          value={data.metrics.applications.toString()}
        />
      </section>

      <BusinessStructureFilterPanel
        action="/app/processes"
        searchValue={filters.q}
        searchPlaceholder={messages.app.processesModule.filters.searchPlaceholder}
        selectLabel={messages.common.labels.businessUnit}
        selectName="businessUnitId"
        selectValue={filters.businessUnitId}
        selectOptions={[
          {
            label: messages.common.labels.allBusinessUnits,
            value: ""
          },
          ...data.businessUnits.map((unit) => ({
            label: unit.name,
            value: unit.id
          }))
        ]}
        chips={chips}
        submitLabel={messages.common.labels.applyFilters}
        clearLabel={messages.common.labels.clearFilters}
        clearHref="/app/processes"
      />

      {data.processes.length === 0 ? (
        <BusinessStructureEmptyState
          title={messages.app.processesModule.emptyTitle}
          description={messages.app.processesModule.emptyDescription}
          actionLabel={messages.app.processesModule.filters.focusAll}
          actionHref="/app/processes"
        />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>{messages.app.processesModule.title}</CardTitle>
            <CardDescription>{messages.app.processesModule.detailSubtitle}</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{messages.app.processesModule.table.process}</TableHead>
                  <TableHead>{messages.app.processesModule.table.domain}</TableHead>
                  <TableHead>{messages.app.processesModule.table.owner}</TableHead>
                  <TableHead>{messages.app.processesModule.table.businessUnit}</TableHead>
                  <TableHead>{messages.app.processesModule.table.applications}</TableHead>
                  <TableHead>{messages.app.processesModule.table.dataSources}</TableHead>
                  <TableHead>{messages.app.processesModule.table.painPoints}</TableHead>
                  <TableHead>{messages.app.processesModule.table.opportunities}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.processes.map((process) => {
                  const applicationNames = process.applications.map((item) => item.application.name);
                  const dataSourceNames = process.dataSources.map((item) => item.dataSource.name);
                  const applicationPreview = renderPreview(applicationNames);
                  const dataSourcePreview = renderPreview(dataSourceNames);

                  return (
                    <TableRow key={process.id}>
                      <TableCell className="min-w-[280px]">
                        <div className="space-y-2">
                          <Link
                            href={`/app/processes/${process.id}` as Route}
                            className="text-base font-semibold text-[--text-primary] transition hover:text-[--green]"
                          >
                            {process.name}
                          </Link>
                          <p className="max-w-xl text-sm leading-6 text-[--text-secondary]">
                            {process.description ?? messages.app.processesModule.noDescription}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>{process.domain.name}</TableCell>
                      <TableCell>{process.owner?.name ?? messages.app.processesModule.noOwner}</TableCell>
                      <TableCell>
                        {process.businessUnit?.name ?? messages.common.labels.noBusinessUnit}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-2">
                          {applicationPreview.visibleItems.map((item) => (
                            <Badge key={item} variant="outline">
                              {item}
                            </Badge>
                          ))}
                          {applicationPreview.extraCount > 0 ? (
                            <Badge variant="secondary">+{applicationPreview.extraCount}</Badge>
                          ) : null}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-2">
                          {dataSourcePreview.visibleItems.map((item) => (
                            <Badge key={item} variant="outline">
                              {item}
                            </Badge>
                          ))}
                          {dataSourcePreview.extraCount > 0 ? (
                            <Badge variant="secondary">+{dataSourcePreview.extraCount}</Badge>
                          ) : null}
                        </div>
                      </TableCell>
                      <TableCell>{process._count.painPoints}</TableCell>
                      <TableCell>{process._count.opportunities}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
