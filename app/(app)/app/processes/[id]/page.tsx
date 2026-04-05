import type { Route } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { BusinessStructureEmptyState } from "@/components/business-structure/empty-state";
import { DetailSection } from "@/components/business-structure/detail-section";
import { OpportunityPreviewCard } from "@/components/business-structure/opportunity-preview-card";
import { MetricCard } from "@/components/app/metric-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { requirePermission } from "@/server/permissions";
import { getMessages } from "@/lib/i18n";
import { getRequestLocale } from "@/lib/i18n/server";
import { suggestOpportunitiesFromProcess } from "@/modules/ai-assistant/server/suggest-opportunities";
import { AssistantPanel } from "@/modules/ai-assistant/ui/assistant-panel";
import { getProcessDetail } from "@/modules/business-structure/server/get-process-detail";
import {
  DataProductReadinessStatus,
  type DataProductMedallionStage,
  type DataProductReadinessStatus as DataProductReadinessStatusValue,
} from "@/modules/data-products/domain/data-product.enums";
import { DataProductMedallionBadge } from "@/modules/data-products/ui/data-product-medallion-badge";
import { DataProductReadinessBadge } from "@/modules/data-products/ui/data-product-readiness-badge";

function getSeverityVariant(severity: string) {
  if (severity === "CRITICAL" || severity === "HIGH") {
    return "danger" as const;
  }

  if (severity === "MEDIUM") {
    return "warning" as const;
  }

  return "outline" as const;
}

function mapDataProductReadinessStatus(status: string): DataProductReadinessStatusValue {
  switch (status) {
    case "READY":
      return DataProductReadinessStatus.READY;
    case "PARTIALLY_READY":
      return DataProductReadinessStatus.IN_PROGRESS;
    default:
      return DataProductReadinessStatus.DRAFT;
  }
}

export default async function ProcessDetailPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const locale = await getRequestLocale();
  const messages = getMessages(locale);
  const { workspace } = await requirePermission("business-structure.manage");
  const { id } = await params;
  const process = await getProcessDetail(workspace!.id, id);

  if (!process) {
    notFound();
  }

  const assistant = suggestOpportunitiesFromProcess({
    processName: process.name,
    processDescription: process.description,
    domainName: process.domain.name,
    capabilityName: process.capability?.name ?? null,
    painPoints: process.painPoints,
    applicationCount: process.applications.length,
    dataSourceCount: process.dataSources.length,
    existingOpportunityTitles: process.opportunities.map((opportunity) => opportunity.title)
  });

  const nextActions = [];

  if (process.painPoints.length === 0) {
    nextActions.push({
      title: messages.app.processesModule.actions.capturePainPointTitle,
      body: messages.app.processesModule.actions.capturePainPointBody,
      href: `/app/processes/${process.id}`,
      label: messages.app.processesModule.actions.reviewProcessContext
    });
  }

  if (process.opportunities.length === 0) {
    nextActions.push({
      title: messages.app.processesModule.actions.identifyOpportunityTitle,
      body: messages.app.processesModule.actions.identifyOpportunityBody,
      href: "/app/opportunities",
      label: messages.app.processesModule.actions.openOpportunities
    });
  }

  if (process.applications.length === 0 || process.dataSources.length === 0) {
    nextActions.push({
      title: messages.app.processesModule.actions.linkSystemsTitle,
      body: messages.app.processesModule.actions.linkSystemsBody,
      href: `/app/domains/${process.domain.id}`,
      label: messages.app.processesModule.actions.reviewDomainContext
    });
  }

  if (process.opportunities.length > 0) {
    nextActions.push({
      title: messages.app.processesModule.actions.reviewPortfolioTitle,
      body: messages.app.processesModule.actions.reviewPortfolioBody,
      href: "/app/opportunities",
      label: messages.app.processesModule.actions.openOpportunities
    });
  }

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-primary/10 bg-white p-8 shadow-soft-sm">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge>{messages.app.nav.processes.title}</Badge>
              <Badge variant="outline">{process.domain.name}</Badge>
              {process.businessUnit?.name ? (
                <Badge variant="outline">{process.businessUnit.name}</Badge>
              ) : null}
            </div>
            <div className="space-y-3">
              <h2 className="max-w-4xl text-4xl font-semibold tracking-tight text-slate-950 text-balance">
                {process.name}
              </h2>
              <p className="max-w-3xl text-base leading-8 text-slate-600">
                {process.description ?? messages.app.processesModule.noDescription}
              </p>
            </div>
          </div>
          <Button asChild>
            <Link href="/app/opportunities">{messages.app.processesModule.actions.openOpportunities}</Link>
          </Button>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label={messages.app.processesModule.metrics.applications}
          value={process.applications.length.toString()}
        />
        <MetricCard
          label={messages.common.labels.dataSources}
          value={process.dataSources.length.toString()}
        />
        <MetricCard
          label={messages.app.processesModule.metrics.painPoints}
          value={process.painPoints.length.toString()}
        />
        <MetricCard
          label={messages.app.processesModule.metrics.opportunities}
          value={process.opportunities.length.toString()}
        />
      </section>

      <DetailSection
        title={messages.app.processesModule.contextTitle}
        description={messages.app.processesModule.contextDescription}
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-border/80 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              {messages.common.labels.owner}
            </p>
            <p className="mt-2 text-sm font-medium text-slate-950">
              {process.owner?.name ?? messages.app.processesModule.noOwner}
            </p>
          </div>
          <div className="rounded-2xl border border-border/80 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              {messages.common.labels.businessUnit}
            </p>
            <p className="mt-2 text-sm font-medium text-slate-950">
              {process.businessUnit?.name ?? messages.common.labels.noBusinessUnit}
            </p>
          </div>
          <div className="rounded-2xl border border-border/80 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              {messages.common.labels.domain}
            </p>
            <p className="mt-2 text-sm font-medium text-slate-950">{process.domain.name}</p>
          </div>
          <div className="rounded-2xl border border-border/80 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              {messages.common.labels.capability}
            </p>
            <p className="mt-2 text-sm font-medium text-slate-950">
              {process.capability?.name ?? messages.app.processesModule.noCapability}
            </p>
          </div>
        </div>
        {process.subProcesses.length > 0 || process.kpis.length > 0 ? (
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-2xl border border-border/80 p-4">
              <p className="text-sm font-semibold text-slate-950">
                {messages.app.processesModule.subProcessesTitle}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {process.subProcesses.map((item) => (
                  <Badge key={item.id} variant="outline">
                    {item.name}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="rounded-2xl border border-border/80 p-4">
              <p className="text-sm font-semibold text-slate-950">
                {messages.app.processesModule.kpisTitle}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {process.kpis.map((item) => (
                  <Badge key={item.id} variant="outline">
                    {item.name}
                    {item.unit ? ` (${item.unit})` : ""}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        ) : null}
      </DetailSection>

      <DetailSection
        title={messages.app.processesModule.supportingSystemsTitle}
        description={messages.app.processesModule.supportingSystemsDescription}
      >
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border border-border/80 p-4">
            <p className="text-sm font-semibold text-slate-950">
              {messages.common.labels.supportingApplications}
            </p>
            {process.applications.length === 0 ? (
              <p className="mt-3 text-sm leading-6 text-slate-600">
                {messages.app.processesModule.noApplications}
              </p>
            ) : (
              <div className="mt-3 space-y-3">
                {process.applications.map((item) => (
                  <div key={item.application.id} className="rounded-xl bg-slate-50 px-3 py-3">
                    <p className="text-sm font-medium text-slate-950">{item.application.name}</p>
                    <p className="text-sm text-slate-600">
                      {item.application.vendor ?? messages.app.processesModule.noVendor}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="rounded-2xl border border-border/80 p-4">
            <p className="text-sm font-semibold text-slate-950">
              {messages.common.labels.dataSources}
            </p>
            {process.dataSources.length === 0 ? (
              <p className="mt-3 text-sm leading-6 text-slate-600">
                {messages.app.processesModule.noDataSources}
              </p>
            ) : (
              <div className="mt-3 space-y-3">
                {process.dataSources.map((item) => (
                  <div key={item.dataSource.id} className="rounded-xl bg-slate-50 px-3 py-3">
                    <p className="text-sm font-medium text-slate-950">{item.dataSource.name}</p>
                    <p className="text-sm text-slate-600">
                      {item.dataSource.classification ??
                        item.dataSource.systemName ??
                        messages.app.processesModule.noDataClassification}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </DetailSection>

      <DetailSection
        title={messages.app.processesModule.painPointsTitle}
        description={messages.app.processesModule.painPointsDescription}
      >
        {process.painPoints.length === 0 ? (
          <BusinessStructureEmptyState
            title={messages.app.processesModule.noPainPoints}
            description={messages.app.processesModule.actions.capturePainPointBody}
          />
        ) : (
          <div className="space-y-3">
            {process.painPoints.map((item) => (
              <div key={item.id} className="rounded-2xl border border-border/80 p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant={getSeverityVariant(item.severity)}>{item.severity}</Badge>
                </div>
                <h3 className="mt-3 text-base font-semibold text-slate-950">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {item.description ?? messages.app.processesModule.noPainPointDescription}
                </p>
              </div>
            ))}
          </div>
        )}
      </DetailSection>

      <DetailSection
        title={messages.app.processesModule.opportunitiesTitle}
        description={messages.app.processesModule.opportunitiesDescription}
      >
        {process.opportunities.length === 0 ? (
          <BusinessStructureEmptyState
            title={messages.app.processesModule.noOpportunities}
            description={messages.app.processesModule.actions.identifyOpportunityBody}
            actionLabel={messages.app.processesModule.actions.openOpportunities}
            actionHref="/app/opportunities"
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {process.opportunities.map((opportunity) => (
              <OpportunityPreviewCard
                key={opportunity.id}
                locale={locale}
                title={opportunity.title}
                ownerName={opportunity.owner?.name ?? null}
                status={opportunity.status}
                badge={opportunity.badge}
                decisionStatus={opportunity.currentDecision?.status ?? null}
                score={Number(opportunity.overallScore ?? 0)}
                expectedValue={Number(opportunity.expectedValue ?? 0)}
                scoreLabel={messages.app.processesModule.scoreLabel}
                valueLabel={messages.app.processesModule.valueLabel}
              />
            ))}
          </div>
        )}
      </DetailSection>

      <DetailSection
        title={messages.app.processesModule.dataProductsTitle}
        description={messages.app.processesModule.dataProductsDescription}
      >
        {process.dataProducts.length === 0 ? (
          <BusinessStructureEmptyState
            title={messages.app.processesModule.noDataProducts}
            description={messages.app.processesModule.noDataProductsDescription}
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {process.dataProducts.map((item) => (
              <div
                key={item.dataProduct.id}
                className="rounded-2xl border border-border/80 bg-white p-4 shadow-soft-sm"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <DataProductMedallionBadge
                    medallionStage={item.dataProduct.medallionStage as DataProductMedallionStage}
                  />
                  <DataProductReadinessBadge
                    readinessStatus={mapDataProductReadinessStatus(
                      item.dataProduct.readinessStatus
                    )}
                  />
                </div>
                <h3 className="mt-3 text-base font-semibold text-slate-950">
                  {item.dataProduct.name}
                </h3>
                <Button className="mt-4" variant="outline" asChild>
                  <Link href={`/app/data-products/${item.dataProduct.id}` as Route}>
                    {messages.app.processesModule.openDataProduct}
                  </Link>
                </Button>
              </div>
            ))}
          </div>
        )}
      </DetailSection>

      <AssistantPanel
        title={messages.app.aiAssistant.title}
        description={messages.app.aiAssistant.description}
        badgeLabel={messages.app.aiAssistant.badge}
        confidenceLabel={messages.app.aiAssistant.confidence}
        useCaseTypeLabel={messages.app.aiAssistant.suggestedUseCaseType}
        painPointSummaryLabel={messages.app.aiAssistant.painPointSummary}
        opportunitiesLabel={messages.app.aiAssistant.suggestedOpportunities}
        mockNoteLabel={messages.app.aiAssistant.mockNote}
        emptyLabel={messages.app.aiAssistant.emptySuggestions}
        insights={assistant}
      />

      <DetailSection
        title={messages.common.labels.nextBestActions}
        description={messages.app.processesModule.nextBestActionsDescription}
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {nextActions.map((action) => (
            <div key={action.title} className="rounded-2xl border border-primary/10 bg-primary/5 p-4">
              <h3 className="text-base font-semibold text-slate-950">{action.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{action.body}</p>
              <Button className="mt-4" variant="outline" asChild>
                <Link href={action.href as Route}>{action.label}</Link>
              </Button>
            </div>
          ))}
        </div>
      </DetailSection>
    </div>
  );
}
