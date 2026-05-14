import { redirect } from "next/navigation";

import { Logo } from "@/components/brand/logo";
import { LanguageSwitcher } from "@/components/i18n/language-switcher";
import { LocaleProvider } from "@/components/providers/locale-provider";
import { Badge } from "@/components/ui/badge";
import { ConsultantProfileForm } from "@/components/onboarding/ConsultantProfileForm";
import { getMessages } from "@/lib/i18n";
import { getRequestLocale } from "@/lib/i18n/server";
import { getCurrentWorkspaceContext } from "@/server/auth";

export default async function ConsultantSetupPage() {
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
            {/* Global stepper (1=infos 2=workspace 3=process-focus 4=consultant-setup) */}
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4].map((s) => (
                <div key={s} className="flex items-center gap-2">
                  <span
                    className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold ${
                      s <= 4
                        ? "bg-orange-600 text-white"
                        : "bg-slate-100 text-slate-400"
                    }`}
                  >
                    {s}
                  </span>
                  {s < 4 && <div className="h-px w-6 bg-orange-600" />}
                </div>
              ))}
            </div>

            <Badge className="border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-800/40 dark:bg-orange-950/30 dark:text-orange-400">
              Consultant IA / Partenaire
            </Badge>

            <div className="space-y-4">
              <h1 className="text-balance text-4xl font-semibold tracking-tight text-slate-950 dark:text-slate-50">
                Créez votre espace consultant
              </h1>
              <p className="text-lg leading-8 text-slate-600 dark:text-slate-400">
                Claude analyse votre profil et génère 5 cas d'usage Move to AI
                que vous pouvez proposer immédiatement à vos clients, avec
                estimations de mission.
              </p>
            </div>

            <div className="space-y-3 rounded-2xl border border-border/80 bg-white p-6 text-sm leading-7 text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
              <p className="font-semibold text-slate-900 dark:text-slate-100">
                Votre espace consultant vous donne accès à
              </p>
              <ul className="space-y-2">
                {[
                  "5 cas d'usage personnalisés à proposer à vos clients",
                  "Un dashboard multi-clients pour gérer tous vos workspaces",
                  "Une bibliothèque de templates réutilisables",
                  "L'Academy Move to AI — formations et certifications",
                  "Le programme partenaire — commissions et co-marketing",
                  "Des ressources de vente (pitchs, cas clients, calculateurs ROI)",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-orange-500" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Partner tiers preview */}
            <div className="space-y-2 rounded-2xl border border-orange-100 bg-orange-50 p-5 dark:border-orange-900/30 dark:bg-orange-950/20">
              <p className="text-sm font-semibold text-orange-900 dark:text-orange-300">
                Niveaux partenaire Move to AI
              </p>
              {[
                { tier: "Explorer", desc: "Première certification, accès à la bibliothèque" },
                { tier: "Certified", desc: "Badge certifié, accès au réseau partenaires" },
                { tier: "Expert", desc: "Commissions, co-marketing, support dédié" },
              ].map((t) => (
                <div key={t.tier} className="flex items-center gap-3">
                  <span className="w-20 text-xs font-semibold text-orange-700 dark:text-orange-400">
                    {t.tier}
                  </span>
                  <span className="text-xs text-orange-600 dark:text-orange-500">{t.desc}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right — form */}
          <ConsultantProfileForm />
        </section>
      </main>
    </LocaleProvider>
  );
}
