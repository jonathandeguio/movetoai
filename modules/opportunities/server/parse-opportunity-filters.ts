import type {
  OpportunityFilters,
  OpportunityScoreBand,
  OpportunitySearchParams,
  OpportunityView
} from "@/modules/opportunities/model/opportunity.filters";

function getFirstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

function normalizeText(value: string | string[] | undefined) {
  return getFirstValue(value).trim();
}

function normalizeEnum<T extends string>(
  value: string | string[] | undefined,
  allowed: readonly T[],
  fallback: T
) {
  const nextValue = getFirstValue(value);
  return allowed.includes(nextValue as T) ? (nextValue as T) : fallback;
}

export function parseOpportunityFilters(
  searchParams?: OpportunitySearchParams
): OpportunityFilters {
  return {
    q: normalizeText(searchParams?.q),
    view: normalizeEnum(searchParams?.view, ["table", "kanban", "matrix"] as const, "table") as OpportunityView,
    domainId: normalizeText(searchParams?.domainId),
    processId: normalizeText(searchParams?.processId),
    typeId: normalizeText(searchParams?.typeId),
    score: normalizeEnum(searchParams?.score, ["all", "80-plus", "60-79", "under-60"] as const, "all") as OpportunityScoreBand,
    ownerId: normalizeText(searchParams?.ownerId),
    businessUnitId: normalizeText(searchParams?.businessUnitId),
    status: normalizeText(searchParams?.status),
    badge: normalizeText(searchParams?.badge),
    riskLevel: normalizeText(searchParams?.riskLevel)
  };
}
