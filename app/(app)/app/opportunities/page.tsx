import { getOpportunitiesPageData } from "@/modules/opportunities/server/get-opportunities-page-data";
import { OpportunitiesPage }        from "@/modules/opportunities/ui/opportunities-page";
import { AriaBanner }               from "@/components/aria/AriaBanner";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function OpportunitiesRoute({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { locale, messages, filters, data, planType } = await getOpportunitiesPageData(
    await searchParams
  );

  return (
    <>
      <AriaBanner />
      <OpportunitiesPage
        locale={locale}
        messages={messages}
        filters={filters}
        data={data}
        planType={planType}
      />
    </>
  );
}
