import { getMessages } from "@/lib/i18n";
import { getRequestLocale } from "@/lib/i18n/server";
import { suggestOpportunitiesFromProcess } from "@/modules/ai-assistant/server/suggest-opportunities";
import { getOpportunityDetail } from "@/modules/opportunities/server/get-opportunity-detail";
import { normalizePlanType } from "@/modules/plans/domain/plan-checks";
import { requireAnyPermission } from "@/server/permissions";

export async function getOpportunityDetailPageData(opportunityId: string) {
  const locale = await getRequestLocale();
  const messages = getMessages(locale);
  const { workspace, subscriptionPlan } = await requireAnyPermission([
    "opportunities.manage",
    "analytics.view"
  ]);
  const opportunity = await getOpportunityDetail(workspace!.id, opportunityId);
  const assistant = opportunity
    ? suggestOpportunitiesFromProcess({
        processName: opportunity.process.name,
        processDescription: opportunity.summary ?? opportunity.problemStatement,
        domainName: opportunity.domain.name,
        capabilityName: opportunity.capability.name,
        painPoints: opportunity.painPoint ? [opportunity.painPoint] : [],
        applicationCount: opportunity.applications.length,
        dataSourceCount: opportunity.dataSources.length,
        existingOpportunityTitles: [opportunity.title]
      })
    : null;

  return {
    locale,
    messages,
    opportunity,
    assistant,
    planType: normalizePlanType(subscriptionPlan?.planType)
  };
}
