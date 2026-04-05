import { Logo } from "@/components/brand/logo";
import { AuthLanguageSwitcher } from "@/components/auth/auth-language-switcher";
import type { AuthMessages } from "@/lib/i18n/auth-messages";
import type { Locale } from "@/lib/i18n/config";

type AuthHeaderProps = {
  locale: Locale;
  messages: AuthMessages;
};

export function AuthHeader({ locale, messages }: AuthHeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-white/70 bg-white/85 backdrop-blur-xl">
      <div className="page-shell flex h-20 items-center justify-between gap-4">
        <Logo />
        <AuthLanguageSwitcher locale={locale} messages={messages} />
      </div>
    </header>
  );
}
