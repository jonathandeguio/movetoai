import type { Route } from "next";

import { BusinessStructureEmptyState } from "@/components/business-structure/empty-state";
import { Badge } from "@/components/ui/badge";
import type { Messages } from "@/lib/i18n/en";
import type { Locale } from "@/lib/i18n/config";
import type { OpportunityFilters } from "@/modules/opportunities/model/opportunity.filters";
import { OpportunityFilterPanel } from "@/modules/opportunities/ui/filter-panel";
import { OpportunityTable } from "@/modules/opportunities/ui/opportunity-table";
import {
  canUseAdvancedPortfolioFeatures,
  canUseOpportunityKanban,
  canUseOpportunityMatrix
} from "@/modules/plans/domain/feature-gates";
import type { WorkspacePlanType } from "@/modules/plans/model/plans.types";
import { LockedFeatureCard } from "@/modules/plans/ui/locked-feature-card";
import { UpgradeCta } from "@/modules/plans/ui/upgrade-cta";

type OpportunityListData = Awaited<
  ReturnType<typeof import("@/modules/opportunities/server/get-opportunity-list").getOpportunityList>
>;

function buildViewHref(
  view: "table" | "kanban" | "matrix",
  filters: {
    domainId: string;
    processId: string;
    status: string;
  }
) {
  const params = new URLSearchParams();

  if (filters.domainId) {
    params.set("domainId", filters.domainId);
  }

  if (filters.processId) {
    params.set("processId", filters.processId);
  }

  if (filters.status) {
    params.set("status", filters.status);
  }

  if (view !== "table") {
    params.set("view", view);
  }

  const query = params.toString();
  return (query ? `/app/opportunities?${query}` : "/app/opportunities") as Route;
}

type OpportunitiesPageProps = {
  locale: Locale;
  messages: Messages;
  filters: OpportunityFilters;
  data: OpportunityListData;
  planType: WorkspacePlanType;
};

export async function OpportunitiesPage({
  locale,
  messages,
  filters,
  data,
  planType
}: OpportunitiesPageProps) {
  const currentView = filters.view;
  const canAccessAdvancedPortfolio = canUseAdvancedPortfolioFeatures(planType);
  const canAccessKanban = canUseOpportunityKanban(planType);
  const canAccessMatrix = canUseOpportunityMatrix(planType);

  let viewContent: React.ReactNode;

  if (currentView === "kanban") {
    if (canAccessKanban) {
      const { OpportunityKanban } = await import("@/modules/opportunities/ui/opportunity-kanban");

      viewContent = (
        <OpportunityKanban
          locale={locale}
          title={messages.app.opportunitiesModule.views.kanbanTitle}
          description={messages.app.opportunitiesModule.views.kanbanDescription}
          scoreLabel={messages.app.opportunitiesModule.table.score}
          valueLabel={messages.app.opportunitiesModule.table.value}
          countLabel={messages.app.opportunitiesModule.views.cards}
          opportunities={data.opportunities}
        />
      );
    } else {
      viewContent = (
        <LockedFeatureCard
          planLabel={messages.common.labels.proPlan}
          previewLabel={messages.app.opportunitiesModule.upgrade.previewLabel}
          title={messages.app.opportunitiesModule.upgrade.kanbanTitle}
          description={messages.app.opportunitiesModule.upgrade.kanbanDescription}
          bullets={messages.app.opportunitiesModule.upgrade.kanbanBullets}
          ctaLabel={messages.common.ctas.upgradePro}
          href={"/pricing" as Route}
        />
      );
    }
  } else if (currentView === "matrix") {
    if (canAccessMatrix) {
      const { OpportunityMatrix } = await import("@/modules/opportunities/ui/opportunity-matrix");

      viewContent = (
        <OpportunityMatrix
          locale={locale}
          title={messages.app.opportunitiesModule.views.matrixTitle}
          description={messages.app.opportunitiesModule.views.matrixDescription}
          xAxisTitle={messages.app.opportunitiesModule.matrix.xAxisTitle}
          yAxisTitle={messages.app.opportunitiesModule.matrix.yAxisTitle}
          scoreBands={messages.app.opportunitiesModule.matrix.scoreBands}
          valueBands={messages.app.opportunitiesModule.matrix.valueBands}
          countLabel={messages.app.opportunitiesModule.views.cards}
          opportunities={data.opportunities}
        />
      );
    } else {
      viewContent = (
        <LockedFeatureCard
          planLabel={messages.common.labels.enterprisePlan}
          previewLabel={messages.app.opportunitiesModule.upgrade.previewLabel}
          title={messages.app.opportunitiesModule.upgrade.matrixTitle}
          description={messages.app.opportunitiesModule.upgrade.matrixDescription}
          bullets={messages.app.opportunitiesModule.upgrade.matrixBullets}
          ctaLabel={messages.common.ctas.talkSales}
          href={"/request-demo" as Route}
        />
      );
    }
  } else {
    viewContent = (
      <OpportunityTable
        locale={locale}
        title={messages.app.opportunitiesModule.views.tableTitle}
        description={messages.app.opportunitiesModule.views.tableDescription}
        noSummaryLabel={messages.app.opportunitiesModule.noSummary}
        headers={{
          opportunity: messages.app.opportunitiesModule.table.opportunity,
          domain: messages.app.opportunitiesModule.table.domain,
          process: messages.app.opportunitiesModule.table.process,
          workflow: messages.app.opportunitiesModule.table.workflow,
          score: messages.app.opportunitiesModule.table.score
        }}
        opportunities={data.opportunities}
      />
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-primary/10 bg-white p-8 shadow-soft-sm">
        <div className="space-y-4">
          <Badge>{messages.app.nav.opportunities.title}</Badge>
          <h2 className="max-w-4xl text-4xl font-semibold tracking-tight text-slate-950 text-balance">
            {messages.app.opportunitiesModule.title}
          </h2>
          <p className="max-w-3xl text-base leading-8 text-slate-600">
            {messages.app.opportunitiesModule.description}
          </p>
        </div>
      </section>

      <OpportunityFilterPanel
        currentView={currentView}
        viewItems={[
          ["table", messages.app.opportunitiesModule.filters.views.table],
          ["kanban", messages.app.opportunitiesModule.filters.views.kanban],
          ["matrix", messages.app.opportunitiesModule.filters.views.matrix]
        ].map(([viewKey, label]) => ({
          label,
          href: buildViewHref(viewKey as "table" | "kanban" | "matrix", filters),
          active: currentView === viewKey
        }))}
        filters={{
          domainId: filters.domainId,
          processId: filters.processId,
          status: filters.status
        }}
        options={{
          domains: data.domains.map((domain) => ({
            value: domain.id,
            label: domain.name
          })),
          processes: data.processes.map((process) => ({
            value: process.id,
            label: process.name
          })),
          statuses: messages.app.opportunitiesModule.filters.statusOptions.map((statusOption) => ({
            value: statusOption.value,
            label: statusOption.label
          }))
        }}
        labels={{
          domain: messages.common.labels.domain,
          process: messages.common.labels.process,
          status: messages.app.opportunitiesModule.detail.status,
          allDomains: messages.app.opportunitiesModule.filters.allDomains,
          allProcesses: messages.app.opportunitiesModule.filters.allProcesses,
          allStatuses: messages.app.opportunitiesModule.filters.allStatuses,
          applyFilters: messages.common.labels.applyFilters,
          clearFilters: messages.common.labels.clearFilters
        }}
        clearHref={"/app/opportunities" as Route}
      />

      {currentView === "table" && !canAccessAdvancedPortfolio ? (
        <UpgradeCta
          eyebrow={messages.common.labels.proPlan}
          title={messages.app.opportunitiesModule.upgrade.advancedFiltersTitle}
          description={messages.app.opportunitiesModule.upgrade.advancedFiltersDescription}
          ctaLabel={messages.common.ctas.upgradePro}
          href={"/pricing" as Route}
        />
      ) : null}

      {data.opportunities.length === 0 ? (
        <BusinessStructureEmptyState
          title={messages.app.opportunitiesModule.emptyTitle}
          description={messages.app.opportunitiesModule.emptyDescription}
          actionLabel={messages.common.labels.clearFilters}
          actionHref={"/app/opportunities" as Route}
        />
      ) : (
        viewContent
      )}
    </div>
  );
}
