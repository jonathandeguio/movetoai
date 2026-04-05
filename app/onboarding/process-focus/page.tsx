import { redirect } from "next/navigation";

import { Logo } from "@/components/brand/logo";
import { LanguageSwitcher } from "@/components/i18n/language-switcher";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getMessages } from "@/lib/i18n";
import { getRequestLocale } from "@/lib/i18n/server";
import { getCurrentWorkspaceContext } from "@/server/auth";
import { getProcessFocusOnboardingData } from "@/modules/workspace/server/process-focus-onboarding";
import { ProcessFocusSelectionForm } from "@/modules/workspace/ui/process-focus-selection-form";

export default async function ProcessFocusOnboardingPage() {
  const locale = await getRequestLocale();
  const messages = getMessages(locale);
  const { user, workspace } = await getCurrentWorkspaceContext({
    requireMembership: true,
  });

  if (!workspace?.id) {
    redirect("/onboarding");
  }

  const onboardingData = await getProcessFocusOnboardingData(user.id, workspace.id);

  if (onboardingData.isCompleted) {
    redirect("/app");
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-40 border-b border-white/70 bg-white/85 backdrop-blur-xl">
        <div className="page-shell flex h-20 items-center justify-between gap-4">
          <Logo />
          <LanguageSwitcher />
        </div>
      </header>

      <section className="page-shell grid gap-10 py-16 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
        <div className="space-y-6">
          <Badge>{messages.onboarding.badge}</Badge>
          <div className="space-y-4">
            <h1 className="text-5xl font-semibold tracking-tight text-slate-950 text-balance">
              {messages.onboarding.processFocus.title}
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-slate-600">
              {messages.onboarding.processFocus.subtitle}
            </p>
          </div>

          <Card className="border-primary/10 bg-white shadow-soft-sm">
            <CardHeader>
              <CardTitle>{messages.onboarding.processFocus.whyTitle}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-0">
              <p className="text-sm leading-7 text-slate-600">
                {messages.onboarding.processFocus.whyBody}
              </p>
              <div className="space-y-3">
                {messages.onboarding.processFocus.bullets.map((item) => (
                  <div
                    key={item}
                    className="rounded-2xl border border-border/80 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-700"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <ProcessFocusSelectionForm
          processes={onboardingData.processes}
          defaultSelectedProcessIds={onboardingData.selectedProcessIds}
          copy={{
            searchPlaceholder: messages.onboarding.processFocus.searchPlaceholder,
            selectedCountLabel: messages.onboarding.processFocus.selectedCountLabel,
            continue: messages.onboarding.processFocus.continue,
            helperText: messages.onboarding.processFocus.helperText,
            emptyTitle: messages.onboarding.processFocus.emptyTitle,
            emptyDescription: messages.onboarding.processFocus.emptyDescription,
            openProcesses: messages.onboarding.processFocus.openProcesses,
            noSearchResults: messages.onboarding.processFocus.noSearchResults,
            ownerFallback: messages.onboarding.processFocus.noOwner,
            errors: messages.onboarding.processFocus.errors,
          }}
        />
      </section>
    </main>
  );
}
