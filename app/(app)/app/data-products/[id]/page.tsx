import { notFound } from "next/navigation";

import { getMessages } from "@/lib/i18n";
import { getRequestLocale } from "@/lib/i18n/server";
import { getDataProductDetail } from "@/modules/data-products/server/get-data-product-detail";
import { DataProductDetail } from "@/modules/data-products/ui/data-product-detail";
import { requireAnyPermission } from "@/server/permissions";

export default async function DataProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const locale = await getRequestLocale();
  const messages = getMessages(locale);
  const { workspace } = await requireAnyPermission([
    "business-structure.manage",
    "opportunities.manage",
    "analytics.view",
  ]);
  const { id } = await params;
  const dataProduct = await getDataProductDetail(workspace!.id, id);

  if (!dataProduct) {
    notFound();
  }

  return <DataProductDetail dataProduct={dataProduct} messages={messages} />;
}
