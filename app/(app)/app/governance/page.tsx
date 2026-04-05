import type { Route } from "next";

import { getMessages } from "@/lib/i18n";
import { getRequestLocale } from "@/lib/i18n/server";
import { getApprovalQueue } from "@/modules/governance/server/get-approval-queue";
import { getDecisions } from "@/modules/governance/server/get-decisions";
import { ApprovalQueue } from "@/modules/governance/ui/approval-queue";
import { DecisionList } from "@/modules/governance/ui/decision-list";
import { canUseAdvancedGovernance } from "@/modules/plans/domain/feature-gates";
import { normalizePlanType } from "@/modules/plans/domain/plan-checks";
import { LockedFeatureCard } from "@/modules/plans/ui/locked-feature-card";
import { Badge } from "@/components/ui/badge";
import { requireAnyPermission } from "@/server/permissions";

export default async function GovernancePage() {
  const locale = await getRequestLocale();
  const messages = getMessages(locale);
  const { workspace, subscriptionPlan } = await requireAnyPermission([
    "governance.manage",
    "analytics.view"
  ]);
  const planType = normalizePlanType(subscriptionPlan?.planType);
  const [decisions, approvalQueue] = await Promise.all([
    getDecisions(workspace!.id),
    getApprovalQueue(workspace!.id)
  ]);

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-primary/10 bg-white p-8 shadow-soft-sm">
        <div className="space-y-4">
          <Badge>{messages.app.nav.governance.title}</Badge>
          <h2 className="max-w-4xl text-4xl font-semibold tracking-tight text-slate-950 text-balance">
            {messages.app.governanceModule.title}
          </h2>
          <p className="max-w-3xl text-base leading-8 text-slate-600">
            {messages.app.governanceModule.description}
          </p>
        </div>
      </section>

      <DecisionList
        locale={locale}
        title={messages.app.governanceModule.decisions.title}
        description={messages.app.governanceModule.decisions.description}
        emptyTitle={messages.app.governanceModule.decisions.emptyTitle}
        emptyDescription={messages.app.governanceModule.decisions.emptyDescription}
        noDecisionLabel={messages.app.governanceModule.labels.noDecision}
        noOwnerLabel={messages.app.governanceModule.labels.noOwner}
        headers={messages.app.governanceModule.decisions.headers}
        items={decisions}
      />

      <ApprovalQueue
        locale={locale}
        title={messages.app.governanceModule.approvalQueue.title}
        description={messages.app.governanceModule.approvalQueue.description}
        emptyTitle={messages.app.governanceModule.approvalQueue.emptyTitle}
        emptyDescription={messages.app.governanceModule.approvalQueue.emptyDescription}
        noApproverLabel={messages.app.governanceModule.labels.noApprover}
        noDueDateLabel={messages.app.governanceModule.labels.noDueDate}
        headers={messages.app.governanceModule.approvalQueue.headers}
        items={approvalQueue}
      />

      {!canUseAdvancedGovernance(planType) ? (
        <LockedFeatureCard
          planLabel={messages.common.labels.enterprisePlan}
          previewLabel={messages.app.governanceModule.upgrade.previewLabel}
          title={messages.app.governanceModule.upgrade.title}
          description={messages.app.governanceModule.upgrade.description}
          bullets={messages.app.governanceModule.upgrade.bullets}
          ctaLabel={messages.common.ctas.talkSales}
          href={"/request-demo" as Route}
        />
      ) : null}
    </div>
  );
}
