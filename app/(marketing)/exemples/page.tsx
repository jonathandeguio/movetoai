import { ExamplesPage } from "@/components/marketing/examples-page";
import { getMarketingSiteContent } from "@/lib/marketing-site";
import { getRequestLocale } from "@/lib/i18n/server";

export default async function Examples() {
  const locale = await getRequestLocale();
  const content = getMarketingSiteContent(locale);

  return <ExamplesPage content={content} />;
}
