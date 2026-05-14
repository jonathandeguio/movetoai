import type { ReactNode } from "react";
import { Syne } from "next/font/google";

import { LocaleProvider } from "@/components/providers/locale-provider";
import { getMessages } from "@/lib/i18n";
import { getRequestLocale } from "@/lib/i18n/server";

const syne = Syne({
  subsets: ["latin"],
  weight: ["400", "500", "700", "800"],
  variable: "--font-syne",
  display: "swap",
});

export default async function MarketingLayout({ children }: { children: ReactNode }) {
  const locale = await getRequestLocale();
  const messages = getMessages(locale);

  return (
    <LocaleProvider locale={locale} messages={messages}>
      {/* .mkt scopes all marketing dark-theme CSS variables — isolated from /app */}
      <div className={`mkt ${syne.variable}`} style={{ background: "#060810", color: "#fff", minHeight: "100vh" }}>
        {children}
      </div>
    </LocaleProvider>
  );
}
