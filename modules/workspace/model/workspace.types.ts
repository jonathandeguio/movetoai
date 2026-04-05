export type WorkspaceSummary = {
  id: string;
  name: string;
  slug: string;
};

export type CurrentWorkspaceContext = {
  workspace: WorkspaceSummary | null;
  membershipId: string | null;
};
