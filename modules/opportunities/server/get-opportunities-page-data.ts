import { getMessages } from "@/lib/i18n";
import { getRequestLocale } from "@/lib/i18n/server";
import { getOpportunityList } from "@/modules/opportunities/server/get-opportunity-list";
import { parseOpportunityFilters } from "@/modules/opportunities/server/parse-opportunity-filters";
import { normalizePlanType } from "@/modules/plans/domain/plan-checks";
import { requireAnyPermission } from "@/server/permissions";

type SearchParams = Record<string, string | string[] | undefined>;

export async function getOpportunitiesPageData(searchParams: SearchParams) {
  const locale = await getRequestLocale();
  const messages = getMessages(locale);
  const { workspace, subscriptionPlan } = await requireAnyPermission([
    "opportunities.manage",
    "analytics.view"
  ]);
  const filters = parseOpportunityFilters(searchParams);
  const data = await getOpportunityList(workspace!.id, filters);

  return {
    locale,
    messages,
    filters,
    data,
    planType: normalizePlanType(subscriptionPlan?.planType)
  };
}
