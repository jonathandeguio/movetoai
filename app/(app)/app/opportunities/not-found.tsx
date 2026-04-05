import { BusinessStructureEmptyState } from "@/components/business-structure/empty-state";
import { getMessages } from "@/lib/i18n";
import { getRequestLocale } from "@/lib/i18n/server";

export default async function OpportunitiesNotFound() {
  const locale = await getRequestLocale();
  const messages = getMessages(locale);

  return (
    <BusinessStructureEmptyState
      title={messages.app.resourceStates.notFoundTitle}
      description={messages.app.resourceStates.notFoundDescription}
      actionLabel={messages.app.nav.opportunities.title}
      actionHref="/app/opportunities"
    />
  );
}
