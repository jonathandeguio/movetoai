import type { DomainFilters } from "@/modules/business-structure/model/business-structure.types";
import {
  normalizeDomainScope,
  normalizeText,
  type SearchParamsRecord
} from "@/modules/business-structure/server/_shared";

export function parseDomainFilters(searchParams?: SearchParamsRecord): DomainFilters {
  return {
    q: normalizeText(searchParams?.q),
    businessUnitId: normalizeText(searchParams?.businessUnitId),
    scope: normalizeDomainScope(searchParams?.scope)
  };
}
