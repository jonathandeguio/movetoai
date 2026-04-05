import type { Route } from "next";
import Link from "next/link";

import { MetricCard } from "@/components/app/metric-card";
import { DetailSection } from "@/components/business-structure/detail-section";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  getDataReadinessLabel,
  getOpportunityStatusLabel,
  getOpportunityWorkflowLabel
} from "@/lib/demo-labels";
import type { Messages } from "@/lib/i18n/en";
import type { Locale } from "@/lib/i18n/config";
import type { AssistantInsights } from "@/modules/ai-assistant/model/assistant.types";
import { AssistantPanel } from "@/modules/ai-assistant/ui/assistant-panel";
import { CommentsPanel } from "@/modules/opportunities/ui/comments-panel";
import { ScoreBadge } from "@/modules/opportunities/ui/score-badge";
import { ScorePriorityBadge } from "@/modules/opportunities/ui/score-priority-badge";
import { canUseCustomScoring } from "@/modules/plans/domain/feature-gates";
import type { WorkspacePlanType } from "@/modules/plans/model/plans.types";
import { LockedFeatureCard } from "@/modules/plans/ui/locked-feature-card";
import { ScoreBreakdown } from "@/modules/scoring/ui/score-breakdown";
import {
  formatCurrency,
  getWorkflowBadgeVariant
} from "@/modules/opportunities/ui/opportunity-ui.utils";

type OpportunityDetailData = NonNullable<
  Awaited<ReturnType<typeof import("@/modules/opportunities/server/get-opportunity-detail").getOpportunityDetail>>
>;

type OpportunityDetailProps = {
  locale: Locale;
  messages: Messages;
  opportunity: OpportunityDetailData;
  assistant: AssistantInsights | null;
  planType: WorkspacePlanType;
};

export function OpportunityDetail({
  locale,
  messages,
  opportunity,
  assistant,
  planType
}: OpportunityDetailProps) {
  const canAccessCustomScoring = canUseCustomScoring(planType);

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-primary/10 bg-white p-8 shadow-soft-sm">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge>{messages.app.nav.opportunities.title}</Badge>
              <Badge variant={getWorkflowBadgeVariant(opportunity.workflowStatus)}>
                {getOpportunityWorkflowLabel(
                  locale,
                  opportunity.status,
                  opportunity.currentDecision?.status
                )}
              </Badge>
              <Badge variant="outline">
                {getOpportunityStatusLabel(locale, opportunity.status)}
              </Badge>
              <ScoreBadge
                locale={locale}
                score={opportunity.scoring.total}
                label={messages.app.opportunitiesModule.detail.score}
              />
              <ScorePriorityBadge locale={locale} badge={opportunity.scoring.badge} />
            </div>

            <div className="space-y-3">
              <h2 className="max-w-4xl text-4xl font-semibold tracking-tight text-slate-950 text-balance">
                {opportunity.title}
              </h2>
              <p className="max-w-3xl text-base leading-8 text-slate-600">
                {opportunity.summary ?? messages.app.opportunitiesModule.noSummary}
              </p>
            </div>
          </div>

          <Button variant="outline" asChild>
            <Link href={"/app/opportunities" as Route}>
              {messages.app.opportunitiesModule.actions.backToPortfolio}
            </Link>
          </Button>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label={messages.app.opportunitiesModule.detail.workflow}
          value={getOpportunityWorkflowLabel(
            locale,
            opportunity.status,
            opportunity.currentDecision?.status
          )}
        />
        <MetricCard
          label={messages.app.opportunitiesModule.detail.status}
          value={getOpportunityStatusLabel(locale, opportunity.status)}
        />
        <MetricCard
          label={messages.app.opportunitiesModule.detail.score}
          value={opportunity.scoring.total.toFixed(0)}
        />
        <MetricCard
          label={messages.app.opportunitiesModule.detail.expectedValue}
          value={formatCurrency(
            locale,
            Number(opportunity.expectedValue ?? 0),
            opportunity.currencyCode
          )}
        />
      </section>

      <DetailSection
        title={messages.app.opportunitiesModule.sections.summary}
        description={messages.app.opportunitiesModule.detail.summaryDescription}
      >
        <Card className="border-border/80">
          <CardContent className="space-y-4 p-6">
            <p className="text-sm leading-7 text-slate-600">
              {opportunity.summary ?? messages.app.opportunitiesModule.noSummary}
            </p>
          </CardContent>
        </Card>
      </DetailSection>

      <DetailSection
        title={messages.app.opportunitiesModule.sections.businessContext}
        description={messages.app.opportunitiesModule.detail.businessContextDescription}
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Card className="border-border/80">
            <CardContent className="space-y-2 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                {messages.common.labels.domain}
              </p>
              <p className="text-sm font-medium text-slate-950">{opportunity.domain.name}</p>
            </CardContent>
          </Card>

          <Card className="border-border/80">
            <CardContent className="space-y-2 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                {messages.common.labels.capability}
              </p>
              <p className="text-sm font-medium text-slate-950">{opportunity.capability.name}</p>
            </CardContent>
          </Card>

          <Card className="border-border/80">
            <CardContent className="space-y-2 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                {messages.common.labels.process}
              </p>
              <p className="text-sm font-medium text-slate-950">{opportunity.process.name}</p>
            </CardContent>
          </Card>

          <Card className="border-border/80">
            <CardContent className="space-y-2 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                {messages.common.labels.businessUnit}
              </p>
              <p className="text-sm font-medium text-slate-950">
                {opportunity.businessUnit?.name ?? messages.common.labels.noBusinessUnit}
              </p>
            </CardContent>
          </Card>
        </div>
      </DetailSection>

      <DetailSection
        title={messages.app.opportunitiesModule.sections.aiProposal}
        description={messages.app.opportunitiesModule.detail.aiProposalDescription}
      >
        <div className="grid gap-4 xl:grid-cols-2">
          <Card className="border-border/80">
            <CardContent className="space-y-4 p-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  {messages.app.opportunitiesModule.detail.problemStatement}
                </p>
                <p className="mt-2 text-sm leading-7 text-slate-600">
                  {opportunity.problemStatement ?? messages.app.opportunitiesModule.noProblemStatement}
                </p>
              </div>

              <div className="border-t border-border/80 pt-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  {messages.app.opportunitiesModule.detail.aiHypothesis}
                </p>
                <p className="mt-2 text-sm leading-7 text-slate-600">
                  {opportunity.aiHypothesis ?? messages.app.opportunitiesModule.noAiHypothesis}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/80">
            <CardContent className="space-y-4 p-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  {messages.app.opportunitiesModule.detail.aiType}
                </p>
                <p className="mt-2 text-sm font-medium text-slate-950">
                  {opportunity.opportunityType.name}
                </p>
              </div>

              <div className="border-t border-border/80 pt-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  {messages.app.opportunitiesModule.detail.dataReadiness}
                </p>
                <p className="mt-2 text-sm font-medium text-slate-950">
                  {getDataReadinessLabel(locale, opportunity.dataReadiness)}
                </p>
              </div>

              {opportunity.owner?.name ? (
                <div className="border-t border-border/80 pt-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    {messages.common.labels.owner}
                  </p>
                  <p className="mt-2 text-sm font-medium text-slate-950">
                    {opportunity.owner.name}
                  </p>
                </div>
              ) : null}
            </CardContent>
          </Card>
        </div>
      </DetailSection>

      {assistant ? (
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
      ) : null}

      <DetailSection
        title={messages.app.opportunitiesModule.sections.detailedScoring}
        description={messages.app.opportunitiesModule.detail.detailedScoringDescription}
      >
        <ScoreBreakdown
          locale={locale}
          scoreLabel={messages.app.opportunitiesModule.detail.score}
          score={opportunity.scoring.total}
          badge={opportunity.scoring.badge}
          dimensions={opportunity.scoring.dimensions}
        />
        <p className="text-sm leading-7 text-slate-600">
          {messages.app.opportunitiesModule.detail.scoringHint}
        </p>
        {!canAccessCustomScoring ? (
          <LockedFeatureCard
            planLabel={messages.common.labels.proPlan}
            previewLabel={messages.app.opportunitiesModule.upgrade.previewLabel}
            title={messages.app.opportunitiesModule.upgrade.customScoringTitle}
            description={messages.app.opportunitiesModule.upgrade.customScoringDescription}
            bullets={messages.app.opportunitiesModule.upgrade.customScoringBullets}
            ctaLabel={messages.common.ctas.upgradePro}
            href={"/pricing" as Route}
          />
        ) : null}
      </DetailSection>

      <CommentsPanel
        locale={locale}
        title={messages.app.opportunitiesModule.sections.comments}
        description={messages.app.opportunitiesModule.detail.commentsDescription}
        emptyTitle={messages.app.opportunitiesModule.noComments}
        emptyDescription={messages.app.opportunitiesModule.detail.commentsHint}
        comments={opportunity.comments}
      />
    </div>
  );
}
