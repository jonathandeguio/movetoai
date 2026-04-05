import { PlatformPage } from "@/components/marketing/platform-page";
import { SiteFooter } from "@/components/marketing/site-footer";
import { SiteHeader } from "@/components/marketing/site-header";
import { getRequestLocale } from "@/lib/i18n/server";
import { getMarketingSiteContent } from "@/lib/marketing-site";

export default async function PlateformePage() {
  const locale = await getRequestLocale();
  const content = getMarketingSiteContent(locale);

  return (
    <main className="min-h-screen">
      <SiteHeader />
      <PlatformPage content={content} />
      <SiteFooter />
    </main>
  );
}
