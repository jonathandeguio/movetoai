import { redirect } from "next/navigation";

import { Logo } from "@/components/brand/logo";
import { OnboardingForm } from "@/components/auth/onboarding-form";
import { LanguageSwitcher } from "@/components/i18n/language-switcher";
import { LocaleProvider } from "@/components/providers/locale-provider";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getMessages } from "@/lib/i18n";
import { getRequestLocale } from "@/lib/i18n/server";
import { getCurrentWorkspaceContext } from "@/server/auth";

export default async function OnboardingPage() {
  const locale = await getRequestLocale();
  const messages = getMessages(locale);
  const { workspace } = await getCurrentWorkspaceContext();

  if (workspace) {
    redirect("/app");
  }

  return (
    <LocaleProvider locale={locale} messages={messages}>
      <main className="min-h-screen bg-slate-50">
        <header className="sticky top-0 z-40 border-b border-white/70 bg-white/85 backdrop-blur-xl">
          <div className="page-shell flex h-20 items-center justify-between gap-4">
            <Logo />
            <LanguageSwitcher />
          </div>
        </header>

        <section className="page-shell grid gap-10 py-16 lg:grid-cols-[1fr_1.05fr] lg:items-start">
          <div className="space-y-6">
            <Badge>{messages.onboarding.badge}</Badge>
            <div className="space-y-4">
              <h1 className="text-5xl font-semibold tracking-tight text-slate-950 text-balance">
                {messages.onboarding.title}
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-slate-600">
                {messages.onboarding.subtitle}
              </p>
            </div>

            <Card className="border-primary/10 bg-white shadow-soft-sm">
              <CardHeader>
                <CardTitle>{messages.onboarding.whatYouGetTitle}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-0">
                <p className="text-sm leading-7 text-slate-600">
                  {messages.onboarding.whatYouGetBody}
                </p>
                <div className="space-y-3">
                  {messages.onboarding.steps.map((step) => (
                    <div
                      key={step}
                      className="rounded-2xl border border-border/80 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-700"
                    >
                      {step}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <OnboardingForm defaultLocale={locale} />
        </section>
      </main>
    </LocaleProvider>
  );
}
