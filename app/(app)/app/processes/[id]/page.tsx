import type { Route } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { BusinessStructureEmptyState } from "@/components/business-structure/empty-state";
import { DetailSection } from "@/components/business-structure/detail-section";
import { ProcessEditForm } from "@/components/business-structure/process-edit-form";
import { PainPointCreateForm } from "@/components/business-structure/pain-point-create-form";
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
import { MaturityGauge } from "@/components/processes/MaturityGauge";
import { MaturityBadge } from "@/components/processes/MaturityBadge";
import { ProcessKpiPanel } from "@/components/processes/ProcessKpiPanel";
import { ProcessDepsPanel } from "@/components/processes/ProcessDepsPanel";
import { ProcessHistoryPanel } from "@/components/processes/ProcessHistoryPanel";
import { GenerateBpmnButton } from "@/components/processes/GenerateBpmnButton";
import { getLinkedCertsForProcess } from "@/lib/certifications/process-linker";
import { prisma } from "@/lib/prisma";

function getSeverityVariant(severity: string) {
  if (severity === "CRITICAL" || severity === "HIGH") {
    return "danger" as const;
  }

  if (severity === "MEDIUM") {
    return "warning" as const;
  }

  return "outline" as const;
}

export default async function ProcessDetailPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const locale = await getRequestLocale();
  const messages = getMessages(locale);
  const { workspace, roleCode } = await requirePermission("business-structure.manage");
  const canManage = ["WORKSPACE_ADMIN","ENTERPRISE_ARCHITECT","TRANSFORMATION_MANAGER"].includes(roleCode ?? "");
  const { id } = await params;
  const process = await getProcessDetail(workspace!.id, id);

  if (!process) {
    notFound();
  }

  // Certifications liées au processus via linkedProcessCodes
  const linkedCerts = process.catalogCode ? getLinkedCertsForProcess(process.catalogCode) : [];

  // Fetch workspace certification statuses for those certs
  const workspaceCertStatuses = linkedCerts.length > 0
    ? await prisma.workspaceCertification.findMany({
        where: {
          workspaceId: workspace!.id,
          catalog: { code: { in: linkedCerts.map((c) => c.code) } },
        },
        include: { catalog: { select: { code: true } } },
      })
    : [];

  const certStatusMap = new Map(
    workspaceCertStatuses.map((wc) => [wc.catalog.code, wc.status])
  );

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
      <section className="rounded-3xl border border-[--green-border] bg-[--bg-card] p-8 shadow-soft-sm">
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
              <h2 className="max-w-4xl text-4xl font-semibold tracking-tight text-[--text-primary] text-balance">
                {process.name}
              </h2>
              <p className="max-w-3xl text-base leading-8 text-[--text-secondary]">
                {process.description ?? messages.app.processesModule.noDescription}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <ProcessEditForm
              processId={process.id}
              initialName={process.name}
              initialDescription={process.description ?? null}
            />
            <GenerateBpmnButton processId={process.id} />
            <Button asChild>
              <Link href="/app/opportunities">{messages.app.processesModule.actions.openOpportunities}</Link>
            </Button>
          </div>
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

      <DetailSection title="Maturité du processus" description="Score CMMI adapté — 5 critères de 20 pts chacun.">
        <div className="flex flex-wrap items-center gap-8">
          <MaturityGauge score={process.maturityScore ?? 0} size={120} />
          <div className="space-y-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[--text-muted] mb-1">Niveau</p>
              <MaturityBadge score={process.maturityScore ?? 0} size="md" />
            </div>
            {process.isCertified && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[--text-muted] mb-1">Certification</p>
                <p className="text-sm text-[--text-primary]">{process.certificationRef ?? "Certifié"}</p>
              </div>
            )}
            {process.steward && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[--text-muted] mb-1">Process Steward</p>
                <p className="text-sm text-[--text-primary]">{process.steward.name}</p>
              </div>
            )}
            {process.sla && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[--text-muted] mb-1">SLA</p>
                <p className="text-sm text-[--text-primary]">{process.sla}</p>
              </div>
            )}
          </div>
          {(process.scope ?? process.objective) && (
            <div className="flex-1 min-w-[220px] space-y-3">
              {process.scope && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[--text-muted] mb-1">Périmètre</p>
                  <p className="text-sm leading-6 text-[--text-secondary]">{process.scope}</p>
                </div>
              )}
              {process.objective && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[--text-muted] mb-1">Objectif</p>
                  <p className="text-sm leading-6 text-[--text-secondary]">{process.objective}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </DetailSection>

      <DetailSection
        title={messages.app.processesModule.contextTitle}
        description={messages.app.processesModule.contextDescription}
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-[--border] p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[--text-muted]">
              {messages.common.labels.owner}
            </p>
            <p className="mt-2 text-sm font-medium text-[--text-primary]">
              {process.owner?.name ?? messages.app.processesModule.noOwner}
            </p>
          </div>
          <div className="rounded-2xl border border-[--border] p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[--text-muted]">
              {messages.common.labels.businessUnit}
            </p>
            <p className="mt-2 text-sm font-medium text-[--text-primary]">
              {process.businessUnit?.name ?? messages.common.labels.noBusinessUnit}
            </p>
          </div>
          <div className="rounded-2xl border border-[--border] p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[--text-muted]">
              {messages.common.labels.domain}
            </p>
            <p className="mt-2 text-sm font-medium text-[--text-primary]">{process.domain.name}</p>
          </div>
          <div className="rounded-2xl border border-[--border] p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[--text-muted]">
              {messages.common.labels.capability}
            </p>
            <p className="mt-2 text-sm font-medium text-[--text-primary]">
              {process.capability?.name ?? messages.app.processesModule.noCapability}
            </p>
          </div>
        </div>
        {process.subProcesses.length > 0 || process.kpis.length > 0 ? (
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-2xl border border-[--border] p-4">
              <p className="text-sm font-semibold text-[--text-primary]">
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
            <div className="rounded-2xl border border-[--border] p-4">
              <p className="text-sm font-semibold text-[--text-primary]">
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
          <div className="rounded-2xl border border-[--border] p-4">
            <p className="text-sm font-semibold text-[--text-primary]">
              {messages.common.labels.supportingApplications}
            </p>
            {process.applications.length === 0 ? (
              <p className="mt-3 text-sm leading-6 text-[--text-secondary]">
                {messages.app.processesModule.noApplications}
              </p>
            ) : (
              <div className="mt-3 space-y-3">
                {process.applications.map((item) => (
                  <div key={item.application.id} className="rounded-xl bg-[--bg-hover] px-3 py-3">
                    <p className="text-sm font-medium text-[--text-primary]">{item.application.name}</p>
                    <p className="text-sm text-[--text-secondary]">
                      {item.application.vendor ?? messages.app.processesModule.noVendor}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="rounded-2xl border border-[--border] p-4">
            <p className="text-sm font-semibold text-[--text-primary]">
              {messages.common.labels.dataSources}
            </p>
            {process.dataSources.length === 0 ? (
              <p className="mt-3 text-sm leading-6 text-[--text-secondary]">
                {messages.app.processesModule.noDataSources}
              </p>
            ) : (
              <div className="mt-3 space-y-3">
                {process.dataSources.map((item) => (
                  <div key={item.dataSource.id} className="rounded-xl bg-[--bg-hover] px-3 py-3">
                    <p className="text-sm font-medium text-[--text-primary]">{item.dataSource.name}</p>
                    <p className="text-sm text-[--text-secondary]">
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

      {/* ── Certifications liées ──────────────────────────────────────────── */}
      {linkedCerts.length > 0 && (
        <DetailSection
          title="Certifications liées"
          description="Certifications dont ce processus fait partie du périmètre d'audit."
        >
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {linkedCerts.map((cert) => {
              const wsStatus = certStatusMap.get(cert.code);
              const isMandatory = cert.mandatorySectors.length > 0;

              const statusColor = wsStatus === "obtained"    ? "var(--green)"
                               : wsStatus === "in_progress"  ? "var(--blue)"
                               : wsStatus === "planned"      ? "var(--purple)"
                               : wsStatus === "expired"      ? "var(--red)"
                               : "var(--text-muted)";
              const statusLabel = wsStatus === "obtained"    ? "Certifié"
                               : wsStatus === "in_progress"  ? "En cours"
                               : wsStatus === "planned"      ? "Planifié"
                               : wsStatus === "expired"      ? "Expirée"
                               : "Non déclaré";
              const statusIcon = wsStatus === "obtained" ? "✅"
                              : wsStatus === "in_progress" ? "🔄"
                              : wsStatus === "planned" ? "🎯"
                              : wsStatus === "expired" ? "❌"
                              : "○";

              return (
                <div key={cert.code} style={{
                  padding: "14px 16px", borderRadius: 12,
                  border: "1px solid var(--border)", background: "var(--bg-card)",
                }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", marginBottom: 4 }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>
                          {cert.shortName}
                        </span>
                        {isMandatory && (
                          <span style={{
                            fontSize: 9, padding: "1px 5px", borderRadius: 999,
                            background: "var(--red-dim)", color: "var(--red)", fontWeight: 700,
                          }}>Obligatoire</span>
                        )}
                      </div>
                      <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{cert.family}</span>
                    </div>
                    <span style={{ fontSize: 16, flexShrink: 0 }}>{statusIcon}</span>
                  </div>
                  <div style={{
                    marginTop: 10, display: "flex", alignItems: "center",
                    justifyContent: "space-between", flexWrap: "wrap", gap: 6,
                  }}>
                    <span style={{
                      fontSize: 10, padding: "2px 8px", borderRadius: 999, fontWeight: 600,
                      background: `color-mix(in srgb, ${statusColor} 12%, transparent)`,
                      color: statusColor, border: `1px solid ${statusColor}`,
                    }}>
                      {statusLabel}
                    </span>
                    <span style={{ fontSize: 10, color: "var(--text-muted)" }}>
                      IA : {cert.aiAutomationPotential}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
          {linkedCerts.length > 0 && (
            <div style={{ marginTop: 12 }}>
              <Link href={"/app/knowledge/certifications" as Route} style={{
                fontSize: 12, color: "var(--blue)", textDecoration: "none",
              }}>
                Gérer mes certifications →
              </Link>
            </div>
          )}
        </DetailSection>
      )}

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
              <div key={item.id} className="rounded-2xl border border-[--border] p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant={getSeverityVariant(item.severity)}>{item.severity}</Badge>
                </div>
                <h3 className="mt-3 text-base font-semibold text-[--text-primary]">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-[--text-secondary]">
                  {item.description ?? messages.app.processesModule.noPainPointDescription}
                </p>
              </div>
            ))}
          </div>
        )}
        {canManage && (
          <div className="mt-4">
            <PainPointCreateForm processId={process.id} />
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

      <DetailSection title="KPIs" description="Indicateurs clés de performance suivis pour ce processus.">
        <ProcessKpiPanel processId={process.id} canManage={canManage} />
      </DetailSection>

      <DetailSection title="Dépendances" description="Processus liés en amont et en aval.">
        <ProcessDepsPanel processId={process.id} canManage={canManage} />
      </DetailSection>

      <DetailSection title="Historique" description="Les 20 derniers événements liés à ce processus.">
        <ProcessHistoryPanel processId={process.id} />
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
            <div key={action.title} className="rounded-2xl border border-[--green-border] bg-[--green-dim] p-4">
              <h3 className="text-base font-semibold text-[--text-primary]">{action.title}</h3>
              <p className="mt-2 text-sm leading-6 text-[--text-secondary]">{action.body}</p>
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
