import { Badge } from "@/components/ui/badge";
import { getMessages } from "@/lib/i18n";
import { getRequestLocale } from "@/lib/i18n/server";
import { getPrioritizedOpportunities } from "@/modules/portfolio/server/get-prioritized-opportunities";
import { getPortfolioSummary } from "@/modules/portfolio/server/get-portfolio-summary";
import { PortfolioTable } from "@/modules/portfolio/ui/portfolio-table";
import { SummaryCards } from "@/modules/portfolio/ui/summary-cards";
import { requireAnyPermission } from "@/server/permissions";

export default async function PortfolioPage() {
  const locale = await getRequestLocale();
  const messages = getMessages(locale);
  const { workspace } = await requireAnyPermission(["opportunities.manage", "analytics.view"]);
  const groups = await getPrioritizedOpportunities(workspace!.id);
  const summaryMetrics = getPortfolioSummary(groups, messages.app.portfolioModule.summary);

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-[--green-border] bg-[--bg-card] p-8 shadow-soft-sm">
        <div className="space-y-4">
          <Badge>{messages.app.nav.portfolio.title}</Badge>
          <h2 className="max-w-4xl text-4xl font-semibold tracking-tight text-[--text-primary] text-balance">
            {messages.app.portfolioModule.title}
          </h2>
          <p className="max-w-3xl text-base leading-8 text-[--text-secondary]">
            {messages.app.portfolioModule.description}
          </p>
        </div>
      </section>

      <SummaryCards metrics={summaryMetrics} />

      <PortfolioTable
        locale={locale}
        title={messages.app.portfolioModule.table.title}
        description={messages.app.portfolioModule.table.description}
        emptyTitle={messages.app.portfolioModule.emptyTitle}
        emptyDescription={messages.app.portfolioModule.emptyDescription}
        groupLabels={messages.app.portfolioModule.groups}
        headers={messages.app.portfolioModule.headers}
        groups={groups}
      />
    </div>
  );
}
