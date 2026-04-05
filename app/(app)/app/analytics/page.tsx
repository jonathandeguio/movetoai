import { EmptyShellPage } from "@/components/app/empty-shell-page";
import { getMessages } from "@/lib/i18n";
import { getRequestLocale } from "@/lib/i18n/server";

export default async function AnalyticsPage() {
  const locale = await getRequestLocale();
  const messages = getMessages(locale);

  return (
    <EmptyShellPage
      eyebrow={messages.app.nav.analytics.title}
      title={messages.app.nav.analytics.title}
      description={messages.app.modulePlaceholder}
      cardTitle={messages.common.labels.moduleShell}
      cardBody={messages.app.modulePlaceholder}
    />
  );
}
