import { redirect } from "next/navigation";
import Link from "next/link";

import { Logo } from "@/components/brand/logo";
import { LanguageSwitcher } from "@/components/i18n/language-switcher";
import { LocaleProvider } from "@/components/providers/locale-provider";
import { AccountTypeSelector } from "@/components/onboarding/AccountTypeSelector";
import { getMessages } from "@/lib/i18n";
import { getRequestLocale } from "@/lib/i18n/server";
import { getCurrentWorkspaceContext } from "@/server/auth";

export default async function AccountTypePage() {
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

        <section className="page-shell flex flex-col items-center gap-10 py-20">
          <div className="max-w-3xl space-y-4 text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary-deep">
              Étape 0 / 4
            </p>
            <h1 className="text-4xl font-semibold tracking-tight text-slate-950 text-balance">
              Quel est votre profil ?
            </h1>
            <p className="text-lg leading-8 text-slate-600">
              Choisissez le type de compte qui correspond à votre situation.
              L'onboarding sera adapté à vos besoins.
            </p>
          </div>

          <AccountTypeSelector />

          <p className="text-sm text-slate-400">
            Déjà un workspace ?{" "}
            <Link href="/onboarding" className="font-medium text-primary hover:underline">
              Rejoindre un workspace existant
            </Link>
          </p>
        </section>
      </main>
    </LocaleProvider>
  );
}
