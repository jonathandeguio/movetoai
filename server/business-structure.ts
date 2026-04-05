export type {
  DomainFilters,
  DomainScope,
  ProcessFilters,
  ProcessFocus
} from "@/modules/business-structure/model/business-structure.types";
export { getDomainDetail as getDomainDetailData } from "@/modules/business-structure/server/get-domain-detail";
export { getDomainList as getDomainListData } from "@/modules/business-structure/server/get-domains";
export { getProcessDetail as getProcessDetailData } from "@/modules/business-structure/server/get-process-detail";
export { getProcessList as getProcessListData } from "@/modules/business-structure/server/get-processes";
export { parseDomainFilters } from "@/modules/business-structure/server/parse-domain-filters";
export { parseProcessFilters } from "@/modules/business-structure/server/parse-process-filters";
