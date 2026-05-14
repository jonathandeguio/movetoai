import "server-only";
import { getCurrentWorkspaceContext }        from "@/lib/current-workspace";
import { workspaceAdminDashboardService }    from "@/lib/services/workspace-admin-dashboard.service";

export async function getWorkspaceAdminDashboardData() {
  const { workspace, session } = await getCurrentWorkspaceContext({ requireMembership: true });
  if (!workspace) return { workspace: null, session, data: null };

  const data = await workspaceAdminDashboardService.getPageData(workspace.id);
  return { workspace, session, data };
}
