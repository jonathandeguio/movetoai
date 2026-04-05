import { Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { AssistantInsights } from "@/modules/ai-assistant/model/assistant.types";

type AssistantPanelProps = {
  title: string;
  description: string;
  badgeLabel: string;
  confidenceLabel: string;
  useCaseTypeLabel: string;
  painPointSummaryLabel: string;
  opportunitiesLabel: string;
  mockNoteLabel: string;
  emptyLabel: string;
  insights: AssistantInsights;
};

export function AssistantPanel({
  title,
  description,
  badgeLabel,
  confidenceLabel,
  useCaseTypeLabel,
  painPointSummaryLabel,
  opportunitiesLabel,
  mockNoteLabel,
  emptyLabel,
  insights
}: AssistantPanelProps) {
  return (
    <Card className="border-primary/15 bg-gradient-to-br from-primary/5 via-white to-sky-50/70">
      <CardHeader className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <Badge>{badgeLabel}</Badge>
          <Badge variant="outline">{mockNoteLabel}</Badge>
        </div>
        <div className="flex items-start gap-3">
          <span className="rounded-2xl bg-primary/10 p-3 text-primary-deep">
            <Sparkles className="h-5 w-5" />
          </span>
          <div className="space-y-1">
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 lg:grid-cols-[1.1fr,0.9fr]">
          <div className="rounded-2xl border border-border/80 bg-white/80 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              {painPointSummaryLabel}
            </p>
            <p className="mt-3 text-sm leading-7 text-slate-700">{insights.painPointSummary}</p>
          </div>
          <div className="rounded-2xl border border-border/80 bg-white/80 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              {useCaseTypeLabel}
            </p>
            <p className="mt-3 text-sm font-semibold text-slate-950">
              {insights.suggestedUseCaseType}
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            {opportunitiesLabel}
          </p>
          {insights.opportunities.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border/80 bg-white/70 p-4 text-sm text-slate-600">
              {emptyLabel}
            </div>
          ) : (
            <div className="grid gap-4 xl:grid-cols-3">
              {insights.opportunities.map((suggestion) => (
                <div key={suggestion.title} className="rounded-2xl border border-border/80 bg-white/85 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="text-sm font-semibold text-slate-950">{suggestion.title}</h3>
                    <Badge variant="outline">
                      {confidenceLabel} {Math.round(suggestion.confidence)}%
                    </Badge>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-slate-600">{suggestion.summary}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
