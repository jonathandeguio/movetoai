export type DomainScope = "all" | "with-opportunities" | "without-opportunities";

export type ProcessFocus =
  | "all"
  | "linked-opportunities"
  | "with-pain-points"
  | "opportunity-whitespace";

export type DomainFilters = {
  q: string;
  businessUnitId: string;
  scope: DomainScope;
};

export type ProcessFilters = {
  q: string;
  businessUnitId: string;
  focus: ProcessFocus;
};
