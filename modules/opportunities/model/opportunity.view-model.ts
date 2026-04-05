import type { WorkspacePlanType } from "@/modules/plans/model/plans.types";
import type { OpportunityFilters } from "@/modules/opportunities/model/opportunity.filters";

export type OpportunityListPageViewModel = {
  planType: WorkspacePlanType;
  filters: OpportunityFilters;
};

export type OpportunityDetailPageViewModel = {
  opportunityId: string;
};
