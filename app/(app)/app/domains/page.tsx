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
import { getDomainList } from "@/modules/business-structure/server/get-domains";
import { parseDomainFilters } from "@/modules/business-structure/server/parse-domain-filters";

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

export default async function DomainsPage({
  searchParams
}: {
  searchParams: SearchParams;
}) {
  const locale = await getRequestLocale();
  const messages = getMessages(locale);
  const { workspace } = await requirePermission("business-structure.manage");
  const filters = parseDomainFilters(await searchParams);
  const data = await getDomainList(workspace!.id, filters);

  const chips = [
    {
      label: messages.app.domainsModule.filters.scopeAll,
      href: buildHref("/app/domains", {
        q: filters.q,
        businessUnitId: filters.businessUnitId,
        scope: "all"
      }),
      active: filters.scope === "all"
    },
    {
      label: messages.app.domainsModule.filters.scopeWithOpportunities,
      href: buildHref("/app/domains", {
        q: filters.q,
        businessUnitId: filters.businessUnitId,
        scope: "with-opportunities"
      }),
      active: filters.scope === "with-opportunities"
    },
    {
      label: messages.app.domainsModule.filters.scopeWithoutOpportunities,
      href: buildHref("/app/domains", {
        q: filters.q,
        businessUnitId: filters.businessUnitId,
        scope: "without-opportunities"
      }),
      active: filters.scope === "without-opportunities"
    }
  ];

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-[--green-border] bg-[--bg-card] p-8 shadow-soft-sm">
        <div className="space-y-4">
          <Badge>{messages.app.nav.domains.title}</Badge>
          <h2 className="max-w-4xl text-4xl font-semibold tracking-tight text-[--text-primary] text-balance">
            {messages.app.domainsModule.title}
          </h2>
          <p className="max-w-3xl text-base leading-8 text-[--text-secondary]">
            {messages.app.domainsModule.description}
          </p>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label={messages.app.domainsModule.metrics.domains}
          value={data.metrics.domains.toString()}
        />
        <MetricCard
          label={messages.app.domainsModule.metrics.capabilities}
          value={data.metrics.capabilities.toString()}
        />
        <MetricCard
          label={messages.app.domainsModule.metrics.processes}
          value={data.metrics.processes.toString()}
        />
        <MetricCard
          label={messages.app.domainsModule.metrics.opportunities}
          value={data.metrics.opportunities.toString()}
        />
      </section>

      <BusinessStructureFilterPanel
        action="/app/domains"
        searchValue={filters.q}
        searchPlaceholder={messages.app.domainsModule.filters.searchPlaceholder}
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
        clearHref={"/app/domains" as Route}
      />

      {data.domains.length === 0 ? (
        <BusinessStructureEmptyState
          title={messages.app.domainsModule.emptyTitle}
          description={messages.app.domainsModule.emptyDescription}
          actionLabel={messages.app.domainsModule.filters.scopeAll}
          actionHref={"/app/domains" as Route}
        />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>{messages.app.domainsModule.title}</CardTitle>
            <CardDescription>{messages.app.domainsModule.detailSubtitle}</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{messages.app.domainsModule.table.domain}</TableHead>
                  <TableHead>{messages.app.domainsModule.table.businessUnit}</TableHead>
                  <TableHead>{messages.app.domainsModule.table.capabilities}</TableHead>
                  <TableHead>{messages.app.domainsModule.table.processes}</TableHead>
                  <TableHead>{messages.app.domainsModule.table.opportunities}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.domains.map((domain) => (
                  <TableRow key={domain.id}>
                    <TableCell className="min-w-[280px]">
                      <div className="space-y-2">
                        <Link
                          href={`/app/domains/${domain.id}` as Route}
                          className="text-base font-semibold text-[--text-primary] transition hover:text-[--green]"
                        >
                          {domain.name}
                        </Link>
                        <p className="max-w-xl text-sm leading-6 text-[--text-secondary]">
                          {domain.description ?? messages.app.domainsModule.noDescription}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      {domain.businessUnit?.name ?? messages.common.labels.noBusinessUnit}
                    </TableCell>
                    <TableCell>{domain._count.capabilities}</TableCell>
                    <TableCell>{domain._count.processes}</TableCell>
                    <TableCell>{domain._count.opportunities}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
