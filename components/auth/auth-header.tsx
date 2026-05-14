import { BrandHeader } from "@/components/brand/brand-header";
import { AuthLanguageSwitcher } from "@/components/auth/auth-language-switcher";
import type { AuthMessages } from "@/lib/i18n/auth-messages";
import type { Locale } from "@/lib/i18n/config";

type AuthHeaderProps = {
  locale: Locale;
  messages: AuthMessages;
};

export function AuthHeader({ locale, messages }: AuthHeaderProps) {
  return (
    <BrandHeader
      variant="auth"
      logoSize="md"
      right={<AuthLanguageSwitcher locale={locale} messages={messages} />}
    />
  );
}
