import { CheckCircle2 } from "lucide-react";

import { FeatureGatingTable } from "@/components/app/feature-gating-table";
import { MetricCard } from "@/components/app/metric-card";
import { PipelineChart } from "@/components/app/pipeline-chart";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentWorkspaceContext } from "@/lib/current-workspace";
import {
  getDecisionStatusLabel,
  getOpportunityBadgeLabel,
  getOpportunityStatusLabel
} from "@/lib/demo-labels";
import { getMessages } from "@/lib/i18n";
import { getRequestLocale } from "@/lib/i18n/server";
import { prisma } from "@/lib/prisma";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  }).format(value);
}

export default async function AppHomePage() {
  const locale = await getRequestLocale();
  const messages = getMessages(locale);
  const workspaceContext = await getCurrentWorkspaceContext();
  const workspace = workspaceContext.workspace;

  if (!workspace) {
    return (
      <Card className="border-dashed border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle>{messages.app.shell.noWorkspaceTitle}</CardTitle>
          <CardDescription>{messages.app.shell.noWorkspaceDescription}</CardDescription>
        </CardHeader>
        <CardContent className="pt-0 text-sm leading-7 text-slate-600">
          {messages.app.shell.noWorkspaceHint}
        </CardContent>
      </Card>
    );
  }

  const [processCount, opportunityCount, approvedOrLiveCount, realizedValueAggregate, opportunities] =
    await Promise.all([
      prisma.process.count({ where: { workspaceId: workspace.id } }),
      prisma.opportunity.count({ where: { workspaceId: workspace.id } }),
      prisma.opportunity.count({
        where: {
          workspaceId: workspace.id,
          status: {
            in: ["APPROVED", "IN_PROGRESS", "LIVE"]
          }
        }
      }),
      prisma.opportunity.aggregate({
        where: { workspaceId: workspace.id },
        _sum: {
          realizedValue: true
        }
      }),
      prisma.opportunity.findMany({
        where: { workspaceId: workspace.id },
        select: {
          title: true,
          status: true,
          badge: true,
          overallScore: true,
          expectedValue: true,
          realizedValue: true,
          process: {
            select: {
              name: true
            }
          },
          owner: {
            select: {
              name: true
            }
          },
          currentDecision: {
            select: {
              status: true
            }
          }
        }
      })
    ]);

  const processGroups = new Map<string, { totalScore: number; count: number }>();
  for (const opportunity of opportunities) {
    const key = opportunity.process.name;
    const existing = processGroups.get(key) ?? { totalScore: 0, count: 0 };
    processGroups.set(key, {
      totalScore: existing.totalScore + Number(opportunity.overallScore ?? 0),
      count: existing.count + 1
    });
  }

  const chartData = Array.from(processGroups.entries())
    .map(([name, value]) => ({
      name: name.length > 20 ? `${name.slice(0, 20)}…` : name,
      score: Number((value.totalScore / value.count).toFixed(0))
    }))
    .sort((left, right) => right.score - left.score)
    .slice(0, 6);

  const spotlightRows = [...opportunities]
    .sort((left, right) => Number(right.overallScore ?? 0) - Number(left.overallScore ?? 0))
    .slice(0, 6);

  const freePreview = (
    workspace.settings as
      | {
          freePreview?: {
            usersUsed: number;
            usersAllowed: number;
            opportunitiesUsed: number;
            opportunitiesAllowed: number;
            aiRequestsUsed: number;
            aiRequestsAllowed: number;
            upgradePrompt: string;
          };
        }
      | null
  )?.freePreview;

  const featureRows = [
    {
      feature: messages.common.labels.multilingual,
      free: messages.common.featureGating.freeLabel,
      pro: messages.common.featureGating.proLabel,
      enterprise: messages.common.featureGating.enterpriseLabel
    },
    {
      feature: messages.app.nav.governance.title,
      free: messages.common.labels.placeholder,
      pro: messages.common.featureGating.proLabel,
      enterprise: messages.common.featureGating.enterpriseLabel
    },
    {
      feature: messages.app.nav.analytics.title,
      free: messages.common.featureGating.freeLabel,
      pro: messages.common.featureGating.proLabel,
      enterprise: messages.common.featureGating.enterpriseLabel
    },
    {
      feature: messages.app.nav.opportunities.title,
      free: messages.common.featureGating.freeLabel,
      pro: messages.common.featureGating.proLabel,
      enterprise: messages.common.featureGating.enterpriseLabel
    }
  ];

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-primary/10 bg-white p-8 shadow-soft-sm">
        <div className="space-y-4">
          <Badge>{messages.app.overview.eyebrow}</Badge>
          <h2 className="max-w-4xl text-4xl font-semibold tracking-tight text-slate-950 text-balance">
            {messages.app.overview.title}
          </h2>
          <p className="max-w-3xl text-base leading-8 text-slate-600">
            {messages.app.overview.subtitle}
          </p>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label={messages.app.overview.metrics.processesMapped}
          value={processCount.toString()}
        />
        <MetricCard
          label={messages.app.overview.metrics.portfolioOpportunities}
          value={opportunityCount.toString()}
        />
        <MetricCard
          label={messages.app.overview.metrics.approvedOrLive}
          value={approvedOrLiveCount.toString()}
        />
        <MetricCard
          label={messages.app.overview.metrics.realizedValue}
          value={formatCurrency(Number(realizedValueAggregate._sum.realizedValue ?? 0))}
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
            {spotlightRows.map((opportunity) => (
              <div
                key={opportunity.title}
                className="rounded-2xl border border-border/80 p-4"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline">
                    {getOpportunityStatusLabel(locale, opportunity.status)}
                  </Badge>
                  <Badge>{getOpportunityBadgeLabel(locale, opportunity.badge)}</Badge>
                  {opportunity.currentDecision ? (
                    <Badge variant="secondary">
                      {getDecisionStatusLabel(locale, opportunity.currentDecision.status)}
                    </Badge>
                  ) : null}
                </div>
                <h3 className="mt-3 text-base font-semibold text-slate-950">
                  {opportunity.title}
                </h3>
                <p className="mt-1 text-sm text-slate-600">
                  {opportunity.process.name}
                  {opportunity.owner?.name ? ` · ${opportunity.owner.name}` : ""}
                </p>
                <p className="mt-2 text-sm text-slate-500">
                  {messages.app.opportunitiesModule.table.score}{" "}
                  {Number(opportunity.overallScore ?? 0).toFixed(0)} · {messages.app.opportunitiesModule.table.value}{" "}
                  {formatCurrency(Number(opportunity.expectedValue ?? 0))}
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
                className="flex items-start gap-3 rounded-2xl border border-border/80 p-4"
              >
                <span className="rounded-full bg-primary/10 p-1 text-primary">
                  <CheckCircle2 className="h-4 w-4" />
                </span>
                <span className="text-sm leading-6 text-slate-700">{item}</span>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card className="border-dashed border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle>{messages.app.overview.freePreviewTitle}</CardTitle>
            <CardDescription>{messages.app.overview.freePreviewDescription}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 pt-0 text-sm leading-6 text-slate-700">
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
            <p className="text-slate-600">{freePreview?.upgradePrompt}</p>
          </CardContent>
        </Card>
      </section>

      <FeatureGatingTable
        title={messages.common.labels.featureGate}
        description={messages.common.featureGating.upgradeHint}
        headers={{
          feature: messages.common.labels.feature,
          free: messages.common.labels.free,
          pro: messages.common.labels.pro,
          enterprise: messages.common.labels.enterprise
        }}
        rows={featureRows}
      />

      <Card className="border-dashed border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle>{messages.app.overview.emptyTitle}</CardTitle>
        </CardHeader>
        <CardContent className="pt-0 text-sm leading-7 text-slate-600">
          {messages.app.overview.emptyDescription}
        </CardContent>
      </Card>
    </div>
  );
}
