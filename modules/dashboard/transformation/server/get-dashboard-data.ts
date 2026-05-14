import "server-only";
import { getCurrentWorkspaceContext }       from "@/lib/current-workspace";
import { transformationDashboardService }   from "@/lib/services/transformation-dashboard.service";

export async function getTransformationDashboardData() {
  const { workspace } = await getCurrentWorkspaceContext({ requireMembership: true });
  if (!workspace) return { workspace: null, data: null };

  const data = await transformationDashboardService.getPageData(workspace.id);
  return { workspace, data };
}
