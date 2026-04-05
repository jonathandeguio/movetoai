import type { SearchParamsRecord } from "@/modules/shared/model/common.types";

export type OpportunityView = "table" | "kanban" | "matrix";
export type OpportunityScoreBand = "all" | "80-plus" | "60-79" | "under-60";

export type OpportunityFilters = {
  q: string;
  view: OpportunityView;
  domainId: string;
  processId: string;
  typeId: string;
  score: OpportunityScoreBand;
  ownerId: string;
  businessUnitId: string;
  status: string;
  badge: string;
  riskLevel: string;
};

export type OpportunitySearchParams = SearchParamsRecord;
