import { CheckCircle2 } from "lucide-react";

import { AriaBanner }          from "@/components/aria/AriaBanner";
import { FeatureGatingTable }  from "@/components/app/feature-gating-table";
import { MetricCard }          from "@/components/app/metric-card";
import { PipelineChart }       from "@/components/app/pipeline-chart";
import { Badge }               from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  getDecisionStatusLabel,
  getOpportunityBadgeLabel,
  getOpportunityStatusLabel,
} from "@/lib/demo-labels";
import { getMessages }         from "@/lib/i18n";
import { getRequestLocale }    from "@/lib/i18n/server";
import { getOverviewPageData } from "@/modules/overview/server/get-overview-page-data";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style:                "currency",
    currency:             "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export default async function AppHomePage() {
  const locale   = await getRequestLocale();
  const messages = getMessages(locale);

  const { workspace, data } = await getOverviewPageData();

  if (!workspace) {
    return (
      <Card className="border-dashed border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle>{messages.app.shell.noWorkspaceTitle}</CardTitle>
          <CardDescription>{messages.app.shell.noWorkspaceDescription}</CardDescription>
        </CardHeader>
        <CardContent className="pt-0 text-sm leading-7 text-[--text-secondary]">
          {messages.app.shell.noWorkspaceHint}
        </CardContent>
      </Card>
    );
  }

  const { metrics, spotlightRows, chartData } = data!;

  const freePreview = (
    workspace.settings as
      | {
          freePreview?: {
            usersUsed:             number;
            usersAllowed:          number;
            opportunitiesUsed:     number;
            opportunitiesAllowed:  number;
            aiRequestsUsed:        number;
            aiRequestsAllowed:     number;
            upgradePrompt:         string;
          };
        }
      | null
  )?.freePreview;

  const featureRows = [
    {
      feature:    messages.common.labels.multilingual,
      free:       messages.common.featureGating.freeLabel,
      pro:        messages.common.featureGating.proLabel,
      enterprise: messages.common.featureGating.enterpriseLabel,
    },
    {
      feature:    messages.app.nav.governance.title,
      free:       messages.common.labels.placeholder,
      pro:        messages.common.featureGating.proLabel,
      enterprise: messages.common.featureGating.enterpriseLabel,
    },
    {
      feature:    messages.app.nav.analytics.title,
      free:       messages.common.featureGating.freeLabel,
      pro:        messages.common.featureGating.proLabel,
      enterprise: messages.common.featureGating.enterpriseLabel,
    },
    {
      feature:    messages.app.nav.opportunities.title,
      free:       messages.common.featureGating.freeLabel,
      pro:        messages.common.featureGating.proLabel,
      enterprise: messages.common.featureGating.enterpriseLabel,
    },
  ];

  return (
    <div className="space-y-6">
      <AriaBanner />

      <section className="rounded-3xl border border-[--green-border] bg-[--bg-card] p-8 shadow-soft-sm">
        <div className="space-y-4">
          <Badge>{messages.app.overview.eyebrow}</Badge>
          <h2 className="max-w-4xl text-4xl font-semibold tracking-tight text-[--text-primary] text-balance">
            {messages.app.overview.title}
          </h2>
          <p className="max-w-3xl text-base leading-8 text-[--text-secondary]">
            {messages.app.overview.subtitle}
          </p>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label={messages.app.overview.metrics.processesMapped}
          value={metrics.processCount.toString()}
        />
        <MetricCard
          label={messages.app.overview.metrics.portfolioOpportunities}
          value={metrics.opportunityCount.toString()}
        />
        <MetricCard
          label={messages.app.overview.metrics.approvedOrLive}
          value={metrics.approvedOrLiveCount.toString()}
        />
        <MetricCard
          label={messages.app.overview.metrics.realizedValue}
          value={formatCurrency(metrics.realizedValue)}
        />
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
        <PipelineChart
          title={messages.app.overview.topProcessesTitle}
          description={messages.app.overview.topProcessesDescription}
          data={chartData}
        />
        <Card>
          <CardHeader>
            <CardTitle>{messages.app.overview.spotlightTitle}</CardTitle>
            <CardDescription>{messages.app.overview.spotlightDescription}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 pt-0">
            {spotlightRows.map((opp) => (
              <div key={opp.title} className="rounded-2xl border border-[--border] p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline">
                    {getOpportunityStatusLabel(locale, opp.status)}
                  </Badge>
                  <Badge>{getOpportunityBadgeLabel(locale, opp.badge ?? "")}</Badge>
                  {opp.decisionStatus ? (
                    <Badge variant="secondary">
                      {getDecisionStatusLabel(locale, opp.decisionStatus)}
                    </Badge>
                  ) : null}
                </div>
                <h3 className="mt-3 text-base font-semibold text-[--text-primary]">
                  {opp.title}
                </h3>
                <p className="mt-1 text-sm text-[--text-secondary]">
                  {opp.processName}
                  {opp.ownerName ? ` · ${opp.ownerName}` : ""}
                </p>
                <p className="mt-2 text-sm text-[--text-muted]">
                  {messages.app.opportunitiesModule.table.score} {opp.overallScore.toFixed(0)} ·{" "}
                  {messages.app.opportunitiesModule.table.value}{" "}
                  {formatCurrency(opp.expectedValue)}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
        <Card>
          <CardHeader>
            <CardTitle>{messages.app.overview.checklistTitle}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-0">
            {messages.app.overview.checklist.map((item) => (
              <div
                key={item}
                className="flex items-start gap-3 rounded-2xl border border-[--border] p-4"
              >
                <span className="rounded-full bg-[--green-dim] p-1 text-[--green]">
                  <CheckCircle2 className="h-4 w-4" />
                </span>
                <span className="text-sm leading-6 text-[--text-secondary]">{item}</span>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card className="border-dashed border-[--green-border] bg-[--green-dim]">
          <CardHeader>
            <CardTitle>{messages.app.overview.freePreviewTitle}</CardTitle>
            <CardDescription>{messages.app.overview.freePreviewDescription}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 pt-0 text-sm leading-6 text-[--text-secondary]">
            <p>
              {messages.app.overview.freePreviewLabels.users} {freePreview?.usersUsed}/
              {freePreview?.usersAllowed}
            </p>
            <p>
              {messages.app.overview.freePreviewLabels.opportunities}{" "}
              {freePreview?.opportunitiesUsed}/{freePreview?.opportunitiesAllowed}
            </p>
            <p>
              {messages.app.overview.freePreviewLabels.aiRequests}{" "}
              {freePreview?.aiRequestsUsed}/{freePreview?.aiRequestsAllowed}
            </p>
            <p className="text-[--text-secondary]">{freePreview?.upgradePrompt}</p>
          </CardContent>
        </Card>
      </section>

      <FeatureGatingTable
        title={messages.common.labels.featureGate}
        description={messages.common.featureGating.upgradeHint}
        headers={{
          feature:    messages.common.labels.feature,
          free:       messages.common.labels.free,
          pro:        messages.common.labels.pro,
          enterprise: messages.common.labels.enterprise,
        }}
        rows={featureRows}
      />

      <Card className="border-dashed border-[--green-border] bg-[--green-dim]">
        <CardHeader>
          <CardTitle>{messages.app.overview.emptyTitle}</CardTitle>
        </CardHeader>
        <CardContent className="pt-0 text-sm leading-7 text-[--text-secondary]">
          {messages.app.overview.emptyDescription}
        </CardContent>
      </Card>
    </div>
  );
}
