import "server-only";
import type { Route } from "next";
import { redirect }          from "next/navigation";
import { requirePermission } from "@/server/permissions";
import { knowledgeProcessesService } from "@/lib/services/knowledge-processes.service";

export async function getKnowledgeProcessesPageData() {
  const { workspace } = await requirePermission("business-structure.manage");
  if (!workspace?.id) redirect("/onboarding" as Route);

  const data = await knowledgeProcessesService.getPageData(workspace.id);
  return { workspace, ...data };
}
