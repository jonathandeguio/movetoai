import type { Route } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { BusinessStructureEmptyState } from "@/components/business-structure/empty-state";
import { DetailSection } from "@/components/business-structure/detail-section";
import { DomainEditForm } from "@/components/business-structure/domain-edit-form";
import { CapabilityCreateForm } from "@/components/business-structure/capability-create-form";
import { CapabilityEditForm } from "@/components/business-structure/capability-edit-form";
import { OpportunityPreviewCard } from "@/components/business-structure/opportunity-preview-card";
import { MetricCard } from "@/components/app/metric-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { requirePermission } from "@/server/permissions";
import { getMessages } from "@/lib/i18n";
import { getRequestLocale } from "@/lib/i18n/server";
import { getDomainDetail } from "@/modules/business-structure/server/get-domain-detail";

export default async function DomainDetailPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const locale = await getRequestLocale();
  const messages = getMessages(locale);
  const { workspace, roleCode } = await requirePermission("business-structure.manage");
  const canManage = ["WORKSPACE_ADMIN", "ENTERPRISE_ARCHITECT", "TRANSFORMATION_MANAGER"].includes(roleCode ?? "");
  const { id } = await params;
  const domain = await getDomainDetail(workspace!.id, id);

  if (!domain) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-[--green-border] bg-[--bg-card] p-8 shadow-soft-sm">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge>{messages.app.nav.domains.title}</Badge>
              {domain.businessUnit?.name ? (
                <Badge variant="outline">{domain.businessUnit.name}</Badge>
              ) : null}
            </div>
            <div className="space-y-3">
              <h2 className="max-w-4xl text-4xl font-semibold tracking-tight text-[--text-primary] text-balance">
                {domain.name}
              </h2>
              <p className="max-w-3xl text-base leading-8 text-[--text-secondary]">
                {domain.description ?? messages.app.domainsModule.noDescription}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <DomainEditForm
              domainId={domain.id}
              initialName={domain.name}
              initialDescription={domain.description ?? null}
            />
            <Button variant="outline" asChild>
              <Link href="/app/opportunities">{messages.common.ctas.exploreApp}</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <MetricCard
          label={messages.app.domainsModule.metrics.capabilities}
          value={domain._count.capabilities.toString()}
        />
        <MetricCard
          label={messages.app.domainsModule.metrics.processes}
          value={domain._count.processes.toString()}
        />
        <MetricCard
          label={messages.app.domainsModule.metrics.opportunities}
          value={domain._count.opportunities.toString()}
        />
      </section>

      <DetailSection
        title={messages.app.domainsModule.capabilitiesTitle}
        description={messages.app.domainsModule.capabilitiesDescription}
      >
        {domain.capabilities.length === 0 ? (
          <BusinessStructureEmptyState
            title={messages.app.domainsModule.noCapabilities}
            description={messages.app.domainsModule.businessUnitHint}
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {domain.capabilities.map((capability) => (
              <div key={capability.id} className="rounded-2xl border border-[--border] p-4">
                <h3 className="text-base font-semibold text-[--text-primary]">{capability.name}</h3>
                <p className="mt-2 text-sm leading-6 text-[--text-secondary]">
                  {capability.description ?? messages.app.domainsModule.noDescription}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Badge variant="outline">
                    {messages.common.labels.processes}: {capability._count.processes}
                  </Badge>
                  <Badge variant="outline">
                    {messages.common.labels.linkedOpportunities}: {capability._count.opportunities}
                  </Badge>
                </div>
                {canManage && (
                  <div className="mt-4">
                    <CapabilityEditForm
                      capabilityId={capability.id}
                      initialName={capability.name}
                      initialDescription={capability.description ?? null}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        {canManage && (
          <div className="mt-4">
            <CapabilityCreateForm domainId={domain.id} />
          </div>
        )}
      </DetailSection>

      <DetailSection
        title={messages.app.domainsModule.processesTitle}
        description={messages.app.domainsModule.processesDescription}
      >
        {domain.processes.length === 0 ? (
          <BusinessStructureEmptyState
            title={messages.app.domainsModule.noProcesses}
            description={messages.app.domainsModule.emptyDescription}
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {domain.processes.map((process) => (
              <div key={process.id} className="rounded-2xl border border-[--border] p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-2">
                    <Link
                      href={`/app/processes/${process.id}` as Route}
                      className="text-base font-semibold text-[--text-primary] transition hover:text-[--green]"
                    >
                      {process.name}
                    </Link>
                    <p className="text-sm leading-6 text-[--text-secondary]">
                      {process.description ?? messages.app.processesModule.noDescription}
                    </p>
                  </div>
                  <Badge variant="outline">
                    {process.businessUnit?.name ?? messages.common.labels.noBusinessUnit}
                  </Badge>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Badge variant="outline">
                    {messages.common.labels.owner}:{" "}
                    {process.owner?.name ?? messages.app.processesModule.noOwner}
                  </Badge>
                  <Badge variant="outline">
                    {messages.common.labels.painPoints}: {process._count.painPoints}
                  </Badge>
                  <Badge variant="outline">
                    {messages.common.labels.linkedOpportunities}: {process._count.opportunities}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </DetailSection>

      <DetailSection
        title={messages.app.domainsModule.opportunitiesTitle}
        description={messages.app.domainsModule.opportunitiesDescription}
      >
        {domain.opportunities.length === 0 ? (
          <BusinessStructureEmptyState
            title={messages.app.domainsModule.noOpportunities}
            description={messages.app.domainsModule.emptyDescription}
            actionLabel={messages.app.processesModule.actions.openOpportunities}
            actionHref="/app/opportunities"
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {domain.opportunities.map((opportunity) => (
              <OpportunityPreviewCard
                key={opportunity.id}
                locale={locale}
                title={opportunity.title}
                processName={opportunity.process.name}
                capabilityName={opportunity.capability.name}
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
    </div>
  );
}
