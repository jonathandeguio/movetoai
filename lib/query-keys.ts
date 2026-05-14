/**
 * Centralised React Query key factory.
 * All keys are arrays to allow prefix-based invalidation.
 */

export type OpportunityFilters = {
  search?: string;
  domain?: string;
  status?: string;
  priority?: string;
  detectedBy?: string;
  sort?: string;
  page?: number;
};

export type UseCaseFilters = {
  search?: string;
  domain?: string;
  status?: string;
  priority?: string;
  assignedTo?: string;
  page?: number;
};

export const QK = {
  // ── Opportunities ────────────────────────────────────────
  opportunities: (filters?: OpportunityFilters) =>
    filters ? ["opportunities", filters] : ["opportunities"],
  opportunity: (id: string) => ["opportunity", id],
  opportunityComments: (id: string) => ["opportunity", id, "comments"],

  // ── Use Cases ────────────────────────────────────────────
  useCases: (filters?: UseCaseFilters) =>
    filters ? ["use-cases", filters] : ["use-cases"],
  useCase: (id: string) => ["use-case", id],
  useCaseSummary: (id: string) => ["use-case", id, "summary"],

  // ── Workspace members (used in assignee selects) ─────────
  workspaceMembers: () => ["workspace-members"],
} as const;
