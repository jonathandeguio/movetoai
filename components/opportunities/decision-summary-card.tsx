import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  getApprovalStatusLabel,
  getDecisionStatusLabel
} from "@/lib/demo-labels";
import type { Locale } from "@/lib/i18n/config";

import { formatCurrency, formatDate } from "@/components/opportunities/utils";

type DecisionSummaryCardProps = {
  locale: Locale;
  title: string;
  description: string;
  noDecisionTitle: string;
  noDecisionDescription: string;
  budgetLabel: string;
  boardLabel: string;
  meetingLabel: string;
  decidedByLabel: string;
  approvalStepsLabel: string;
  followUpLabel: string;
  decision: {
    status: string;
    summary: string | null;
    rationale: string | null;
    approvedBudget: unknown;
    currencyCode: string | null;
    decidedAt: Date | null;
    decisionBoard: {
      name: string;
    } | null;
    reviewMeeting: {
      title: string;
      scheduledAt: Date;
    } | null;
    decidedBy: {
      name: string | null;
    } | null;
    approvalSteps: Array<{
      id: string;
      stepOrder: number;
      approverRoleLabel: string | null;
      status: string;
      dueDate: Date | null;
      actedAt: Date | null;
      notes: string | null;
      approver: {
        name: string | null;
      } | null;
    }>;
    actionItems: Array<{
      id: string;
      title: string;
      status: string;
      dueDate: Date | null;
      owner: {
        name: string | null;
      } | null;
    }>;
  } | null;
};

export function DecisionSummaryCard({
  locale,
  title,
  description,
  noDecisionTitle,
  noDecisionDescription,
  budgetLabel,
  boardLabel,
  meetingLabel,
  decidedByLabel,
  approvalStepsLabel,
  followUpLabel,
  decision
}: DecisionSummaryCardProps) {
  if (!decision) {
    return (
      <Card className="border-dashed border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle>{noDecisionTitle}</CardTitle>
          <CardDescription>{noDecisionDescription}</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge>{getDecisionStatusLabel(locale, decision.status)}</Badge>
          {decision.decidedAt ? (
            <Badge variant="outline">{formatDate(locale, decision.decidedAt)}</Badge>
          ) : null}
        </div>
        <div className="space-y-2">
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-6 pt-0">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-border/80 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              {boardLabel}
            </p>
            <p className="mt-2 text-sm font-medium text-slate-950">
              {decision.decisionBoard?.name ?? "-"}
            </p>
          </div>
          <div className="rounded-2xl border border-border/80 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              {meetingLabel}
            </p>
            <p className="mt-2 text-sm font-medium text-slate-950">
              {decision.reviewMeeting?.title ?? "-"}
            </p>
          </div>
          <div className="rounded-2xl border border-border/80 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              {decidedByLabel}
            </p>
            <p className="mt-2 text-sm font-medium text-slate-950">
              {decision.decidedBy?.name ?? "-"}
            </p>
          </div>
          <div className="rounded-2xl border border-border/80 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              {budgetLabel}
            </p>
            <p className="mt-2 text-sm font-medium text-slate-950">
              {decision.approvedBudget
                ? formatCurrency(locale, Number(decision.approvedBudget), decision.currencyCode ?? "USD")
                : "-"}
            </p>
          </div>
        </div>

        <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded-2xl border border-border/80 p-4">
            <p className="text-sm font-semibold text-slate-950">{title}</p>
            {decision.summary ? (
              <p className="mt-3 text-sm leading-7 text-slate-600">{decision.summary}</p>
            ) : null}
            {decision.rationale ? (
              <p className="mt-3 text-sm leading-7 text-slate-500">{decision.rationale}</p>
            ) : null}
          </div>
          <div className="space-y-4">
            <div className="rounded-2xl border border-border/80 p-4">
              <p className="text-sm font-semibold text-slate-950">{approvalStepsLabel}</p>
              <div className="mt-3 space-y-3">
                {decision.approvalSteps.map((step) => (
                  <div key={step.id} className="rounded-xl bg-slate-50 px-3 py-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-sm font-medium text-slate-950">
                        {step.stepOrder}. {step.approverRoleLabel ?? step.approver?.name ?? "-"}
                      </p>
                      <Badge variant="outline">
                        {getApprovalStatusLabel(locale, step.status)}
                      </Badge>
                    </div>
                    {step.notes ? (
                      <p className="mt-2 text-sm leading-6 text-slate-600">{step.notes}</p>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>

            {decision.actionItems.length > 0 ? (
              <div className="rounded-2xl border border-border/80 p-4">
                <p className="text-sm font-semibold text-slate-950">{followUpLabel}</p>
                <div className="mt-3 space-y-3">
                  {decision.actionItems.map((item) => (
                    <div key={item.id} className="rounded-xl bg-slate-50 px-3 py-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-sm font-medium text-slate-950">{item.title}</p>
                        <Badge variant="secondary">{item.status}</Badge>
                      </div>
                      <p className="mt-2 text-sm text-slate-600">
                        {[item.owner?.name, formatDate(locale, item.dueDate)].filter(Boolean).join(" · ")}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
