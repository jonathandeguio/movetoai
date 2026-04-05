import { Badge } from "@/components/ui/badge";
import { getMessages } from "@/lib/i18n";
import { getRequestLocale } from "@/lib/i18n/server";
import {
  DataProductMedallionStage,
  DataProductReadinessStatus,
  type DataProductMedallionStage as DataProductMedallionStageValue,
  type DataProductReadinessStatus as DataProductReadinessStatusValue,
} from "@/modules/data-products/domain/data-product.enums";
import type { DataProductListFilters } from "@/modules/data-products/model/data-product-list.filters";
import { getDataProductList } from "@/modules/data-products/server/get-data-product-list";
import { DataProductFilters } from "@/modules/data-products/ui/data-product-filters";
import { DataProductTable } from "@/modules/data-products/ui/data-product-table";
import { requireAnyPermission } from "@/server/permissions";

function readParam(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
}

function parseMedallionStage(
  value: string | undefined,
): DataProductMedallionStageValue | undefined {
  if (value && Object.values(DataProductMedallionStage).includes(value as DataProductMedallionStageValue)) {
    return value as DataProductMedallionStageValue;
  }

  return undefined;
}

function parseReadinessStatus(
  value: string | undefined,
): DataProductListFilters["readinessStatus"] | undefined {
  const supportedStatuses: DataProductReadinessStatusValue[] = [
    DataProductReadinessStatus.DRAFT,
    DataProductReadinessStatus.IN_PROGRESS,
    DataProductReadinessStatus.READY,
  ];

  if (value && supportedStatuses.includes(value as DataProductReadinessStatusValue)) {
    return value as DataProductListFilters["readinessStatus"];
  }

  return undefined;
}

export default async function DataProductsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const locale = await getRequestLocale();
  const messages = getMessages(locale);
  const params = await searchParams;
  const { workspace } = await requireAnyPermission([
    "business-structure.manage",
    "opportunities.manage",
    "analytics.view",
  ]);

  const filters: DataProductListFilters = {
    search: readParam(params.search)?.trim() || undefined,
    medallionStage: parseMedallionStage(readParam(params.medallionStage)),
    readinessStatus: parseReadinessStatus(readParam(params.readiness)),
  };

  const items = await getDataProductList(workspace!.id, filters);
  const hasActiveFilters = Boolean(
    filters.search || filters.medallionStage || filters.readinessStatus,
  );

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-primary/10 bg-white p-8 shadow-soft-sm">
        <div className="space-y-4">
          <Badge>{messages.app.dataProductsModule.eyebrow}</Badge>
          <h2 className="max-w-4xl text-4xl font-semibold tracking-tight text-slate-950 text-balance">
            {messages.app.dataProductsModule.title}
          </h2>
          <p className="max-w-3xl text-base leading-8 text-slate-600">
            {messages.app.dataProductsModule.description}
          </p>
        </div>
      </section>

      <DataProductFilters
        values={filters}
        labels={{
          searchPlaceholder: messages.app.dataProductsModule.filters.searchPlaceholder,
          searchLabel: messages.app.dataProductsModule.filters.searchLabel,
          medallionStageLabel: messages.app.dataProductsModule.filters.medallionStage,
          readinessLabel: messages.app.dataProductsModule.filters.readiness,
          allMedallionStages: messages.app.dataProductsModule.filters.allMedallionStages,
          allReadinessStates: messages.app.dataProductsModule.filters.allReadinessStates,
          stageOptions: messages.app.dataProductsModule.filters.stageOptions,
          readinessOptions: messages.app.dataProductsModule.filters.readinessOptions,
          apply: messages.common.labels.applyFilters,
          clear: messages.common.labels.clearFilters,
        }}
      />

      <DataProductTable
        title={messages.app.dataProductsModule.table.title}
        description={messages.app.dataProductsModule.table.description}
        emptyTitle={
          hasActiveFilters
            ? messages.app.dataProductsModule.emptyFilteredTitle
            : messages.app.dataProductsModule.emptyTitle
        }
        emptyDescription={
          hasActiveFilters
            ? messages.app.dataProductsModule.emptyFilteredDescription
            : messages.app.dataProductsModule.emptyDescription
        }
        headers={messages.app.dataProductsModule.headers}
        detailActionLabel={messages.app.dataProductsModule.openDataProduct}
        items={items}
      />
    </div>
  );
}
