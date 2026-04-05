import { LocaleProvider } from "@/components/providers/locale-provider";
import { getMessages } from "@/lib/i18n";
import { getRequestLocale } from "@/lib/i18n/server";

export default async function AppRouteGroupLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const locale = await getRequestLocale();
  const messages = getMessages(locale);

  return (
    <LocaleProvider locale={locale} messages={messages}>
      {children}
    </LocaleProvider>
  );
}
