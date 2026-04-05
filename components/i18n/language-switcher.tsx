"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { localeCookieName, locales, type Locale } from "@/lib/i18n/config";
import { useLocaleContext } from "@/components/providers/locale-provider";

type LanguageSwitcherProps = {
  className?: string;
};

export function LanguageSwitcher({ className }: LanguageSwitcherProps) {
  const router = useRouter();
  const { locale, messages } = useLocaleContext();
  const [isPending, startTransition] = useTransition();

  const handleLocaleChange = (nextLocale: Locale) => {
    startTransition(() => {
      void (async () => {
        try {
          const response = await fetch("/api/preferences/locale", {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              locale: nextLocale
            })
          });

          if (!response.ok) {
            throw new Error("Failed to persist locale");
          }
        } catch {
          document.cookie = `${localeCookieName}=${nextLocale}; path=/; max-age=31536000; samesite=lax`;
        }

        router.refresh();
      })();
    });
  };

  return (
    <label
      className={className ?? "inline-flex items-center gap-2 text-sm font-medium text-slate-600"}
    >
      <span>{messages.common.languages.label}</span>
      <select
        value={locale}
        onChange={(event) => handleLocaleChange(event.target.value as Locale)}
        disabled={isPending}
        className="h-10 rounded-lg border border-border bg-white px-3 text-sm text-slate-900 shadow-sm outline-none ring-0 transition focus:border-primary/30"
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
