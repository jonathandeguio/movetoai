import "server-only";
import { getCurrentWorkspaceContext } from "@/lib/current-workspace";
import { overviewService }            from "@/lib/services/overview.service";

export async function getOverviewPageData() {
  const { workspace } = await getCurrentWorkspaceContext();
  if (!workspace) return { workspace: null, data: null };

  const data = await overviewService.getPageData(workspace.id);
  return { workspace, data };
}
