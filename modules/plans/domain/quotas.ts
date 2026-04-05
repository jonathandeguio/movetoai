import type { QuotaSnapshot } from "@/modules/plans/model/plans.types";

export function getQuotaProgress(quota: QuotaSnapshot) {
  if (!quota.allowedValue || quota.allowedValue <= 0) {
    return 0;
  }

  return Math.min(100, Math.max(0, Math.round((quota.consumedValue / quota.allowedValue) * 100)));
}

export function isQuotaExceeded(quota: QuotaSnapshot) {
  if (quota.allowedValue === null) {
    return false;
  }

  return quota.consumedValue >= quota.allowedValue;
}
