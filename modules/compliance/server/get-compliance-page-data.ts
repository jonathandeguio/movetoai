import "server-only";
import { getCurrentWorkspaceContext } from "@/lib/current-workspace";
import { complianceService }          from "@/lib/services/compliance.service";

export async function getCompliancePageData() {
  const { workspace } = await getCurrentWorkspaceContext({ requireMembership: true });
  if (!workspace?.id) return null;

  const data = await complianceService.getPageData(workspace.id);
  return { workspace, ...data };
}
