import type { Route } from "next";
import Link from "next/link";

import { MetricCard } from "@/components/app/metric-card";
import { DetailSection } from "@/components/business-structure/detail-section";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { Messages } from "@/lib/i18n/en";
import { DataQualitySignalStatus } from "@/modules/data-products/domain/data-product.enums";
import type { DataProductDetail as DataProductDetailViewModel } from "@/modules/data-products/model/data-products.types";
import { DataProductMedallionBadge } from "@/modules/data-products/ui/data-product-medallion-badge";
import { DataProductReadinessBadge } from "@/modules/data-products/ui/data-product-readiness-badge";

type DataProductDetailProps = {
  dataProduct: DataProductDetailViewModel;
  messages: Messages;
};

function getQualitySignalVariant(status: string) {
  if (status === DataQualitySignalStatus.HEALTHY) {
    return "success" as const;
  }

  if (status === DataQualitySignalStatus.WARNING) {
    return "warning" as const;
  }

  if (status === DataQualitySignalStatus.CRITICAL) {
    return "danger" as const;
  }

  return "outline" as const;
}

function formatSignalDate(value: Date | null) {
  if (!value) {
    return null;
  }

  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(value);
}

export function DataProductDetail({
  dataProduct,
  messages,
}: DataProductDetailProps) {
  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-primary/10 bg-white p-8 shadow-soft-sm">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge>{messages.app.dataProductsModule.eyebrow}</Badge>
              <DataProductMedallionBadge medallionStage={dataProduct.medallionStage} />
              <DataProductReadinessBadge readinessStatus={dataProduct.readinessStatus} />
            </div>

            <div className="space-y-3">
              <h2 className="max-w-4xl text-4xl font-semibold tracking-tight text-slate-950 text-balance">
                {dataProduct.name}
              </h2>
              <p className="max-w-3xl text-base leading-8 text-slate-600">
                {dataProduct.description ??
                  messages.app.dataProductsModule.detail.noDescription}
              </p>
            </div>
          </div>

          <Button variant="outline" asChild>
            <Link href={"/app/data-products" as Route}>
              {messages.app.dataProductsModule.detail.backToList}
            </Link>
          </Button>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label={messages.app.dataProductsModule.headers.processCount}
          value={dataProduct.processCount.toString()}
        />
        <MetricCard
          label={messages.app.dataProductsModule.headers.opportunityCount}
          value={dataProduct.opportunityCount.toString()}
        />
        <MetricCard
          label={messages.app.dataProductsModule.headers.reportingAssetCount}
          value={dataProduct.reportingAssetCount.toString()}
        />
        <MetricCard
          label={messages.app.dataProductsModule.detail.qualitySignals}
          value={dataProduct.qualitySignals.length.toString()}
        />
      </section>

      <DetailSection
        title={messages.app.dataProductsModule.detail.summaryTitle}
        description={messages.app.dataProductsModule.detail.summaryDescription}
      >
        <Card className="border-border/80">
          <CardContent className="space-y-4 p-6">
            <p className="text-sm leading-7 text-slate-600">
              {dataProduct.description ??
                messages.app.dataProductsModule.detail.noDescription}
            </p>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-2xl border border-border/80 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  {messages.common.labels.owner}
                </p>
                <p className="mt-2 text-sm font-medium text-slate-950">
                  {dataProduct.owner?.name ??
                    messages.app.dataProductsModule.detail.noOwner}
                </p>
              </div>
              <div className="rounded-2xl border border-border/80 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  {messages.app.dataProductsModule.detail.freshness}
                </p>
                <p className="mt-2 text-sm font-medium text-slate-950">
                  {dataProduct.freshness ??
                    messages.app.dataProductsModule.detail.noFreshness}
                </p>
              </div>
              <div className="rounded-2xl border border-border/80 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  {messages.app.dataProductsModule.detail.classification}
                </p>
                <p className="mt-2 text-sm font-medium text-slate-950">
                  {dataProduct.classification ??
                    messages.app.dataProductsModule.detail.noClassification}
                </p>
              </div>
              <div className="rounded-2xl border border-border/80 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  {messages.app.dataProductsModule.detail.sourceSystem}
                </p>
                <p className="mt-2 text-sm font-medium text-slate-950">
                  {dataProduct.sourceSystem ??
                    messages.app.dataProductsModule.detail.noSourceSystem}
                </p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-border/80 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  {messages.app.dataProductsModule.detail.duckdbDatasetRef}
                </p>
                <p className="mt-2 text-sm font-medium text-slate-950">
                  {dataProduct.duckdbDatasetRef ??
                    messages.app.dataProductsModule.detail.noDuckdbDatasetRef}
                </p>
              </div>
              <div className="rounded-2xl border border-border/80 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  {messages.app.dataProductsModule.detail.reportingDatasetRef}
                </p>
                <p className="mt-2 text-sm font-medium text-slate-950">
                  {dataProduct.reportingDatasetRef ??
                    messages.app.dataProductsModule.detail.noReportingDatasetRef}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </DetailSection>

      <DetailSection
        title={messages.app.dataProductsModule.detail.linkedProcessesTitle}
        description={messages.app.dataProductsModule.detail.linkedProcessesDescription}
      >
        {dataProduct.linkedProcesses.length === 0 ? (
          <p className="text-sm leading-6 text-slate-600">
            {messages.app.dataProductsModule.detail.noLinkedProcesses}
          </p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {dataProduct.linkedProcesses.map((process) => (
              <Card key={process.id} className="border-border/80">
                <CardContent className="space-y-3 p-5">
                  <p className="text-base font-semibold text-slate-950">{process.name}</p>
                  <Button variant="outline" asChild>
                    <Link href={`/app/processes/${process.id}` as Route}>
                      {messages.app.dataProductsModule.detail.openProcess}
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </DetailSection>

      <DetailSection
        title={messages.app.dataProductsModule.detail.linkedOpportunitiesTitle}
        description={messages.app.dataProductsModule.detail.linkedOpportunitiesDescription}
      >
        {dataProduct.linkedOpportunities.length === 0 ? (
          <p className="text-sm leading-6 text-slate-600">
            {messages.app.dataProductsModule.detail.noLinkedOpportunities}
          </p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {dataProduct.linkedOpportunities.map((opportunity) => (
              <Card key={opportunity.id} className="border-border/80">
                <CardContent className="space-y-3 p-5">
                  <div className="space-y-2">
                    <p className="text-base font-semibold text-slate-950">
                      {opportunity.title}
                    </p>
                    {opportunity.status ? (
                      <Badge variant="outline">{opportunity.status}</Badge>
                    ) : null}
                  </div>
                  <Button variant="outline" asChild>
                    <Link href={`/app/opportunities/${opportunity.id}` as Route}>
                      {messages.app.dataProductsModule.detail.openOpportunity}
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </DetailSection>

      <DetailSection
        title={messages.app.dataProductsModule.detail.linkedReportingAssetsTitle}
        description={
          messages.app.dataProductsModule.detail.linkedReportingAssetsDescription
        }
      >
        {dataProduct.linkedReportingAssets.length === 0 ? (
          <p className="text-sm leading-6 text-slate-600">
            {messages.app.dataProductsModule.detail.noLinkedReportingAssets}
          </p>
        ) : (
          <div className="space-y-3">
            {dataProduct.linkedReportingAssets.map((asset) => (
              <Card key={asset.id} className="border-border/80">
                <CardContent className="flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-base font-semibold text-slate-950">{asset.name}</p>
                      {asset.type ? (
                        <Badge variant="outline">{asset.type}</Badge>
                      ) : null}
                    </div>
                    <p className="text-sm text-slate-600">
                      {asset.processName ??
                        messages.app.dataProductsModule.detail.noLinkedProcess}
                    </p>
                    <p className="text-sm text-slate-600">
                      {messages.app.dataProductsModule.detail.externalUrl}:{" "}
                      {asset.externalUrl ??
                        messages.app.dataProductsModule.detail.noExternalUrl}
                    </p>
                    <p className="text-sm text-slate-600">
                      {messages.app.dataProductsModule.detail.supersetDashboardUrl}:{" "}
                      {asset.supersetDashboardUrl ??
                        messages.app.dataProductsModule.detail.noSupersetDashboardUrl}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {asset.externalUrl ? (
                      <Button variant="outline" asChild>
                        <a href={asset.externalUrl} target="_blank" rel="noreferrer">
                          {messages.app.dataProductsModule.detail.openReportingAsset}
                        </a>
                      </Button>
                    ) : null}
                    {asset.supersetDashboardUrl ? (
                      <Button variant="outline" asChild>
                        <a
                          href={asset.supersetDashboardUrl}
                          target="_blank"
                          rel="noreferrer"
                        >
                          {messages.app.dataProductsModule.detail.openSupersetDashboard}
                        </a>
                      </Button>
                    ) : null}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </DetailSection>

      <DetailSection
        title={messages.app.dataProductsModule.detail.qualitySignalsTitle}
        description={messages.app.dataProductsModule.detail.qualitySignalsDescription}
      >
        {dataProduct.qualitySignals.length === 0 ? (
          <p className="text-sm leading-6 text-slate-600">
            {messages.app.dataProductsModule.detail.noQualitySignals}
          </p>
        ) : (
          <div className="space-y-3">
            {dataProduct.qualitySignals.map((signal) => (
              <Card key={signal.id} className="border-border/80">
                <CardContent className="space-y-3 p-5">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-base font-semibold text-slate-950">
                      {signal.label}
                    </p>
                    <Badge variant={getQualitySignalVariant(signal.status)}>
                      {signal.status}
                    </Badge>
                    <Badge variant="outline">{signal.signalType}</Badge>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-600">
                    <span>
                      {messages.app.dataProductsModule.detail.value}:{" "}
                      {signal.value ?? messages.app.dataProductsModule.detail.noValue}
                    </span>
                    <span>
                      {messages.app.dataProductsModule.detail.measuredAt}:{" "}
                      {formatSignalDate(signal.measuredAt) ??
                        messages.app.dataProductsModule.detail.notMeasured}
                    </span>
                  </div>
                  {signal.notes ? (
                    <p className="text-sm leading-6 text-slate-600">{signal.notes}</p>
                  ) : null}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </DetailSection>
    </div>
  );
}
