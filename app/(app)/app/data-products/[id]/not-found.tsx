import type { Route } from "next";

import { BusinessStructureEmptyState } from "@/components/business-structure/empty-state";
import { getMessages } from "@/lib/i18n";
import { getRequestLocale } from "@/lib/i18n/server";

export default async function DataProductNotFoundPage() {
  const locale = await getRequestLocale();
  const messages = getMessages(locale);

  return (
    <BusinessStructureEmptyState
      title={messages.app.resourceStates.notFoundTitle}
      description={messages.app.resourceStates.notFoundDescription}
      actionLabel={messages.app.nav.dataProducts.title}
      actionHref={"/app/data-products" as Route}
    />
  );
}
