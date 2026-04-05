import Link from "next/link";

import { LocaleProvider } from "@/components/providers/locale-provider";
import { SiteHeader } from "@/components/marketing/site-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getMessages } from "@/lib/i18n";
import { getRequestLocale } from "@/lib/i18n/server";

export default async function UnauthorizedPage() {
  const locale = await getRequestLocale();
  const messages = getMessages(locale);

  return (
    <LocaleProvider locale={locale} messages={messages}>
      <main className="min-h-screen bg-slate-50">
        <SiteHeader />
        <section className="page-shell flex min-h-[calc(100vh-5rem)] items-center py-20">
          <Card className="mx-auto max-w-2xl border-primary/10 shadow-soft">
            <CardContent className="space-y-6 p-10 text-center">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">
                {messages.unauthorized.eyebrow}
              </p>
              <h1 className="text-4xl font-semibold tracking-tight text-slate-950 text-balance">
                {messages.unauthorized.title}
              </h1>
              <p className="text-base leading-8 text-slate-600">
                {messages.unauthorized.description}
              </p>
              <div className="flex flex-col justify-center gap-3 sm:flex-row">
                <Button asChild>
                  <Link href="/app">{messages.common.ctas.exploreApp}</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/pricing">{messages.common.ctas.comparePlans}</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>
    </LocaleProvider>
  );
}
