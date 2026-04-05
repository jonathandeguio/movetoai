import { notFound } from "next/navigation";

import { getOpportunityDetailPageData } from "@/modules/opportunities/server/get-opportunity-detail-page-data";
import { OpportunityDetail } from "@/modules/opportunities/ui/opportunity-detail";

export default async function OpportunityDetailRoute({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { locale, messages, opportunity, assistant, planType } = await getOpportunityDetailPageData(id);

  if (!opportunity) {
    notFound();
  }

  return (
    <OpportunityDetail
      locale={locale}
      messages={messages}
      opportunity={opportunity}
      assistant={assistant}
      planType={planType}
    />
  );
}
