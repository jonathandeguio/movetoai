import { TrendingUp } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { getMessages } from "@/lib/i18n";
import { getRequestLocale } from "@/lib/i18n/server";
import { getInitiativeMetrics } from "@/modules/value-tracking/server/get-initiative-metrics";
import { getValueSummary } from "@/modules/value-tracking/server/get-value-summary";
import { ValueSummaryCards } from "@/modules/value-tracking/ui/value-summary-cards";
import { ValueTable } from "@/modules/value-tracking/ui/value-table";
import { requireAnyPermission } from "@/server/permissions";

function getIntlLocale(locale: "en" | "fr" | "es") {
  if (locale === "fr") {
    return "fr-FR";
  }

  if (locale === "es") {
    return "es-ES";
  }

  return "en-US";
}

export default async function ValuePage() {
  const locale = await getRequestLocale();
  const messages = getMessages(locale);
  const { workspace } = await requireAnyPermission(["initiatives.manage", "analytics.view"]);
  const items = await getInitiativeMetrics(workspace!.id);
  const summary = getValueSummary(items);
  const currencyCode = items[0]?.currencyCode ?? "USD";
  const formatCurrency = (value: number) =>
    new Intl.NumberFormat(getIntlLocale(locale), {
      style: "currency",
      currency: currencyCode,
      maximumFractionDigits: 0
    }).format(value);
  const formatPercent = (value: number | null) =>
    value === null
      ? messages.app.valueModule.labels.noAdoption
      : new Intl.NumberFormat(getIntlLocale(locale), {
          style: "percent",
          maximumFractionDigits: 0
        }).format(value / 100);

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-primary/10 bg-white p-8 shadow-soft-sm">
        <div className="space-y-4">
          <Badge>{messages.app.nav.value.title}</Badge>
          <div className="flex items-center gap-3">
            <span className="rounded-2xl bg-primary/10 p-3 text-primary-deep">
              <TrendingUp className="h-5 w-5" />
            </span>
            <div className="space-y-1">
              <h2 className="text-4xl font-semibold tracking-tight text-slate-950 text-balance">
                {messages.app.valueModule.title}
              </h2>
              <p className="max-w-3xl text-base leading-8 text-slate-600">
                {messages.app.valueModule.description}
              </p>
            </div>
          </div>
        </div>
      </section>

      <ValueSummaryCards
        summary={summary}
        labels={messages.app.valueModule.summary}
        formatCurrency={formatCurrency}
        formatPercent={formatPercent}
      />

      <ValueTable
        locale={locale}
        title={messages.app.valueModule.table.title}
        description={messages.app.valueModule.table.description}
        emptyTitle={messages.app.valueModule.emptyTitle}
        emptyDescription={messages.app.valueModule.emptyDescription}
        noOpportunityLabel={messages.app.valueModule.labels.noOpportunity}
        noRoiLabel={messages.app.valueModule.labels.noRoi}
        noAdoptionLabel={messages.app.valueModule.labels.noAdoption}
        headers={messages.app.valueModule.headers}
        items={items}
        formatPercent={formatPercent}
      />
    </div>
  );
}
