"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { localeCookieName, locales, type Locale } from "@/lib/i18n/config";
import type { AuthMessages } from "@/lib/i18n/auth-messages";

type AuthLanguageSwitcherProps = {
  locale: Locale;
  messages: AuthMessages;
};

export function AuthLanguageSwitcher({
  locale,
  messages
}: AuthLanguageSwitcherProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleLocaleChange = (nextLocale: Locale) => {
    startTransition(() => {
      document.cookie = `${localeCookieName}=${nextLocale}; path=/; max-age=31536000; samesite=lax`;
      router.refresh();
    });
  };

  return (
    <label className="inline-flex items-center gap-2 text-sm font-medium text-[--text-secondary]">
      <span>{messages.common.languages.label}</span>
      <select
        value={locale}
        onChange={(event) => handleLocaleChange(event.target.value as Locale)}
        disabled={isPending}
        className="h-10 rounded-lg border border-[--border] bg-[--bg-input] px-3 text-sm text-[--text-primary] shadow-sm outline-none transition focus:border-[--border-focus]"
      >
        {locales.map((item) => (
          <option key={item} value={item}>
            {messages.common.languages[item]}
          </option>
        ))}
      </select>
    </label>
  );
}
