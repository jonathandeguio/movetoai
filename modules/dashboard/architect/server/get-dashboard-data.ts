import "server-only";
import { getCurrentWorkspaceContext }  from "@/lib/current-workspace";
import { architectDashboardService }   from "@/lib/services/architect-dashboard.service";

export async function getArchitectDashboardData() {
  const { workspace } = await getCurrentWorkspaceContext({ requireMembership: true });
  if (!workspace) return { workspace: null, data: null };

  const data = await architectDashboardService.getPageData(workspace.id);
  return { workspace, data };
}
