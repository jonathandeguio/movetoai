import { redirect } from "next/navigation";

import { Logo } from "@/components/brand/logo";
import { LanguageSwitcher } from "@/components/i18n/language-switcher";
import { LocaleProvider } from "@/components/providers/locale-provider";
import { Badge } from "@/components/ui/badge";
import { ITProfileForm } from "@/components/onboarding/ITProfileForm";
import { getMessages } from "@/lib/i18n";
import { getRequestLocale } from "@/lib/i18n/server";
import { getCurrentWorkspaceContext } from "@/server/auth";

export default async function ITSetupPage() {
  const locale = await getRequestLocale();
  const messages = getMessages(locale);
  const { workspace } = await getCurrentWorkspaceContext({ requireMembership: true });

  if (!workspace?.id) redirect("/onboarding");

  return (
    <LocaleProvider locale={locale} messages={messages}>
      <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
        <header className="sticky top-0 z-40 border-b border-white/70 bg-white/85 backdrop-blur-xl dark:border-slate-800/70 dark:bg-slate-950/85">
          <div className="page-shell flex h-20 items-center justify-between gap-4">
            <Logo />
            <LanguageSwitcher />
          </div>
        </header>

        <section className="page-shell grid gap-10 py-16 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
          {/* Left — context */}
          <div className="space-y-6">
            {/* Stepper (onboarding global : 1=infos 2=workspace 3=IT setup) */}
            <div className="flex items-center gap-2">
              {[1, 2, 3].map((s) => (
                <div key={s} className="flex items-center gap-2">
                  <span
                    className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold ${
                      s <= 3
                        ? "bg-cyan-600 text-white"
                        : "bg-slate-100 text-slate-400"
                    }`}
                  >
                    {s}
                  </span>
                  {s < 3 && <div className="h-px w-6 bg-cyan-600" />}
                </div>
              ))}
            </div>

            <Badge className="border-cyan-200 bg-cyan-50 text-cyan-700">
              DSI / IT Manager
            </Badge>

            <div className="space-y-4">
              <h1 className="text-balance text-4xl font-semibold tracking-tight text-slate-950 dark:text-slate-50">
                Configurez votre stack d'intégration
              </h1>
              <p className="text-lg leading-8 text-slate-600 dark:text-slate-400">
                Move to AI analyse votre stack technique et génère une roadmap
                d'intégration IA personnalisée en 3 phases, avec prérequis,
                risques et points de vigilance RGPD.
              </p>
            </div>

            <div className="space-y-3 rounded-2xl border border-border/80 bg-white p-6 text-sm leading-7 text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
              <p className="font-semibold text-slate-900 dark:text-slate-100">
                Ce que vous obtenez
              </p>
              <ul className="space-y-2">
                {[
                  "Roadmap d'intégration IA en 3 phases adaptée à votre stack",
                  "Prérequis techniques et risques identifiés par phase",
                  "Points de vigilance RGPD spécifiques à vos systèmes",
                  "Action prioritaire concrète pour démarrer immédiatement",
                  "Dashboard technique centralisé dans Move to AI",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-500" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* RGPD reassurance */}
            <div className="flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-800 dark:border-blue-900/40 dark:bg-blue-950/30 dark:text-blue-300">
              <span className="mt-0.5 text-lg">🔒</span>
              <p>
                Vos données techniques ne sont jamais transmises à des tiers.
                L'analyse est effectuée de manière sécurisée et chiffrée.
              </p>
            </div>
          </div>

          {/* Right — form */}
          <ITProfileForm />
        </section>
      </main>
    </LocaleProvider>
  );
}
