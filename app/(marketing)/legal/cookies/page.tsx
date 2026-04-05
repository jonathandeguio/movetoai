import { SiteFooter } from "@/components/marketing/site-footer";
import { SiteHeader } from "@/components/marketing/site-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getMessages } from "@/lib/i18n";
import { getRequestLocale } from "@/lib/i18n/server";

export default async function CookiesPage() {
  const locale = await getRequestLocale();
  const messages = getMessages(locale);

  return (
    <main className="min-h-screen">
      <SiteHeader />
      <section className="page-shell py-20">
        <Badge>{messages.common.legal.cookies}</Badge>
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>{messages.common.legal.placeholderTitle}</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 text-sm leading-7 text-slate-600">
            {messages.common.legal.placeholderBody}
          </CardContent>
        </Card>
      </section>
      <SiteFooter />
    </main>
  );
}
