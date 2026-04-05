import { EmptyShellPage } from "@/components/app/empty-shell-page";
import { getMessages } from "@/lib/i18n";
import { getRequestLocale } from "@/lib/i18n/server";
import { requirePermission } from "@/server/permissions";

export default async function SettingsPage() {
  await requirePermission("settings.manage");

  const locale = await getRequestLocale();
  const messages = getMessages(locale);

  return (
    <EmptyShellPage
      eyebrow={messages.app.nav.settings.title}
      title={messages.app.nav.settings.title}
      description={messages.app.modulePlaceholder}
      cardTitle={messages.common.labels.moduleShell}
      cardBody={messages.app.modulePlaceholder}
    />
  );
}
