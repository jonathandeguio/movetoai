import { DiagnosticPage } from "@/components/marketing/diagnostic-page";
import { SiteFooter } from "@/components/marketing/site-footer";
import { SiteHeader } from "@/components/marketing/site-header";
import { getRequestLocale } from "@/lib/i18n/server";
import { getMarketingSiteContent } from "@/lib/marketing-site";

export default async function DiagnosticIaPage() {
  const locale = await getRequestLocale();
  const content = getMarketingSiteContent(locale);

  return (
    <main className="min-h-screen">
      <SiteHeader />
      <DiagnosticPage content={content} />
      <SiteFooter />
    </main>
  );
}
