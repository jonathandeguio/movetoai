import "server-only";

import { prisma } from "@/lib/prisma";
import type { ValueTableItem } from "@/modules/value-tracking/model/value.types";

function toNumber(value: unknown) {
  const resolved = Number(value);
  return Number.isFinite(resolved) ? resolved : 0;
}

function clampPercent(value: number | null) {
  if (value === null || !Number.isFinite(value)) {
    return null;
  }

  return Math.min(100, Math.max(0, value));
}

function getAdoptionPercent(
  metrics: Array<{
    targetValue: unknown;
    currentValue: unknown;
  }>
) {
  const resolved = metrics
    .map((metric) => {
      const targetValue = toNumber(metric.targetValue);
      const currentValue = toNumber(metric.currentValue);

      if (targetValue > 0) {
        return clampPercent((currentValue / targetValue) * 100);
      }

      if (currentValue > 0 && currentValue <= 100) {
        return clampPercent(currentValue);
      }

      return null;
    })
    .filter((value): value is number => value !== null);

  if (resolved.length === 0) {
    return null;
  }

  const total = resolved.reduce((sum, value) => sum + value, 0);
  return clampPercent(total / resolved.length);
}

export async function getInitiativeMetrics(workspaceId: string): Promise<ValueTableItem[]> {
  const initiatives = await prisma.initiative.findMany({
    where: {
      workspaceId,
      deletedAt: null
    },
    select: {
      id: true,
      name: true,
      status: true,
      budgetAmount: true,
      currencyCode: true,
      opportunity: {
        select: {
          id: true,
          title: true,
          expectedValue: true,
          realizedValue: true,
          currencyCode: true
        }
      },
      benefitMetrics: {
        where: {
          deletedAt: null
        },
        select: {
          targetValue: true,
          currentValue: true,
          realizedValues: {
            select: {
              value: true
            },
            orderBy: {
              capturedAt: "desc"
            },
            take: 1
          }
        }
      },
      adoptionMetrics: {
        where: {
          deletedAt: null
        },
        select: {
          targetValue: true,
          currentValue: true
        }
      }
    },
    orderBy: [
      {
        updatedAt: "desc"
      }
    ]
  });

  return initiatives
    .map<ValueTableItem>((initiative) => {
      const budgetAmount = toNumber(initiative.budgetAmount);
      const benefitExpectedValue = initiative.benefitMetrics.reduce(
        (sum, metric) => sum + toNumber(metric.targetValue),
        0
      );
      const benefitRealizedValue = initiative.benefitMetrics.reduce((sum, metric) => {
        const latestRealizedValue = metric.realizedValues[0]?.value;
        return sum + (latestRealizedValue ? toNumber(latestRealizedValue) : toNumber(metric.currentValue));
      }, 0);
      const expectedValue = toNumber(initiative.opportunity?.expectedValue) || benefitExpectedValue;
      const realizedValue = toNumber(initiative.opportunity?.realizedValue) || benefitRealizedValue;
      const expectedRoi =
        budgetAmount > 0 && expectedValue > 0 ? (expectedValue / budgetAmount) * 100 : null;
      const realizedRoi =
        budgetAmount > 0 && realizedValue > 0 ? (realizedValue / budgetAmount) * 100 : null;

      return {
        id: initiative.id,
        initiativeName: initiative.name,
        opportunityId: initiative.opportunity?.id ?? null,
        opportunityTitle: initiative.opportunity?.title ?? null,
        expectedValue,
        realizedValue,
        expectedRoi: clampPercent(expectedRoi),
        realizedRoi: clampPercent(realizedRoi),
        adoption: getAdoptionPercent(initiative.adoptionMetrics),
        status: initiative.status,
        currencyCode:
          initiative.currencyCode ?? initiative.opportunity?.currencyCode ?? "USD"
      };
    })
    .sort((left, right) => {
      if (left.realizedValue !== right.realizedValue) {
        return right.realizedValue - left.realizedValue;
      }

      if (left.expectedValue !== right.expectedValue) {
        return right.expectedValue - left.expectedValue;
      }

      return left.initiativeName.localeCompare(right.initiativeName);
    });
}
