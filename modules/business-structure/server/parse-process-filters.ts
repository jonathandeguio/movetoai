import type { ProcessFilters } from "@/modules/business-structure/model/business-structure.types";
import {
  normalizeProcessFocus,
  normalizeText,
  type SearchParamsRecord
} from "@/modules/business-structure/server/_shared";

export function parseProcessFilters(searchParams?: SearchParamsRecord): ProcessFilters {
  return {
    q: normalizeText(searchParams?.q),
    businessUnitId: normalizeText(searchParams?.businessUnitId),
    focus: normalizeProcessFocus(searchParams?.focus)
  };
}
