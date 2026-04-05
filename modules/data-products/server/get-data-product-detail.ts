import "server-only";

import { prisma } from "@/lib/prisma";
import {
  DataProductReadinessStatus,
  ReportingAssetType,
} from "@/modules/data-products/domain/data-product.enums";
import type { DataProductDetail } from "../model/data-products.types";

function mapReadinessStatus(
  readinessStatus: "NOT_READY" | "PARTIALLY_READY" | "READY",
): DataProductDetail["readinessStatus"] {
  switch (readinessStatus) {
    case "READY":
      return DataProductReadinessStatus.READY;
    case "PARTIALLY_READY":
      return DataProductReadinessStatus.IN_PROGRESS;
    case "NOT_READY":
    default:
      return DataProductReadinessStatus.DRAFT;
  }
}

function mapReportingAssetType(assetType: string | null) {
  if (
    assetType === ReportingAssetType.DASHBOARD ||
    assetType === ReportingAssetType.REPORT ||
    assetType === ReportingAssetType.SCORECARD ||
    assetType === ReportingAssetType.KPI_VIEW
  ) {
    return assetType;
  }

  return null;
}

async function queryDataProductDetail(
  workspaceId: string,
  dataProductId: string,
  includeIntegrationRefs: boolean,
) {
  return prisma.dataProduct.findFirst({
    where: {
      id: dataProductId,
      workspaceId,
      deletedAt: null,
    },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      medallionStage: true,
      readinessStatus: true,
      freshness: true,
      classification: true,
      sourceSystem: true,
      ...(includeIntegrationRefs
        ? {
            duckdbDatasetRef: true,
            reportingDatasetRef: true,
          }
        : {}),
      owner: {
        select: {
          id: true,
          name: true,
          jobTitle: true,
        },
      },
      processLinks: {
        select: {
          process: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
        orderBy: {
          process: {
            name: "asc",
          },
        },
      },
      opportunityLinks: {
        select: {
          opportunity: {
            select: {
              id: true,
              title: true,
              status: true,
            },
          },
        },
        orderBy: {
          opportunity: {
            title: "asc",
          },
        },
      },
      reportingAssets: {
        where: {
          deletedAt: null,
        },
        select: {
          id: true,
          name: true,
          slug: true,
          assetType: true,
          externalUrl: true,
          ...(includeIntegrationRefs ? { supersetDashboardUrl: true } : {}),
          process: {
            select: {
              name: true,
            },
          },
        },
        orderBy: {
          name: "asc",
        },
      },
      qualitySignals: {
        select: {
          id: true,
          label: true,
          signalType: true,
          status: true,
          value: true,
          measuredAt: true,
          notes: true,
        },
        orderBy: [
          {
            measuredAt: "desc",
          },
          {
            label: "asc",
          },
        ],
      },
      _count: {
        select: {
          processLinks: true,
          opportunityLinks: true,
          reportingAssets: true,
        },
      },
    },
  });
}

export async function getDataProductDetail(
  workspaceId: string,
  dataProductId: string,
): Promise<DataProductDetail | null> {
  let dataProduct: Awaited<ReturnType<typeof queryDataProductDetail>>;

  try {
    dataProduct = await queryDataProductDetail(workspaceId, dataProductId, true);
  } catch {
    dataProduct = await queryDataProductDetail(workspaceId, dataProductId, false);
  }

  if (!dataProduct) {
    return null;
  }

  return {
    id: dataProduct.id,
    name: dataProduct.name,
    slug: dataProduct.slug,
    description: dataProduct.description,
    businessPurpose: null,
    medallionStage: dataProduct.medallionStage,
    readinessStatus: mapReadinessStatus(dataProduct.readinessStatus),
    owner: dataProduct.owner
      ? {
          id: dataProduct.owner.id,
          name: dataProduct.owner.name ?? "Unknown",
          role: dataProduct.owner.jobTitle ?? null,
        }
      : null,
    freshness: dataProduct.freshness,
    classification: dataProduct.classification,
    sourceSystem: dataProduct.sourceSystem,
    duckdbDatasetRef:
      "duckdbDatasetRef" in dataProduct ? dataProduct.duckdbDatasetRef ?? null : null,
    reportingDatasetRef:
      "reportingDatasetRef" in dataProduct
        ? dataProduct.reportingDatasetRef ?? null
        : null,
    processCount: dataProduct._count.processLinks,
    opportunityCount: dataProduct._count.opportunityLinks,
    reportingAssetCount: dataProduct._count.reportingAssets,
    linkedProcesses: dataProduct.processLinks.map((item) => item.process),
    linkedOpportunities: dataProduct.opportunityLinks.map((item) => ({
      id: item.opportunity.id,
      title: item.opportunity.title,
      status: item.opportunity.status,
    })),
    linkedReportingAssets: dataProduct.reportingAssets.map((item) => ({
      id: item.id,
      name: item.name,
      type: mapReportingAssetType(item.assetType),
      externalUrl: item.externalUrl,
      supersetDashboardUrl:
        "supersetDashboardUrl" in item ? item.supersetDashboardUrl ?? null : null,
      processName: item.process?.name ?? null,
    })),
    qualitySignals: dataProduct.qualitySignals.map((item) => ({
      id: item.id,
      label: item.label,
      signalType: item.signalType,
      status: item.status,
      value: item.value,
      measuredAt: item.measuredAt,
      notes: item.notes,
    })),
    sourceSystemNames: dataProduct.sourceSystem ? [dataProduct.sourceSystem] : [],
    consumerNames: [],
  };
}
