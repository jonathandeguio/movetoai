import "server-only";
import { processRepo } from "@/lib/repositories/process.repo";

export const knowledgeProcessesService = {
  async getPageData(workspaceId: string) {
    const processes = await processRepo.findForKnowledge(workspaceId);

    const total          = processes.length;
    const highAiPotential = processes.filter((p) => p.aiPotential?.toLowerCase() === "high").length;
    const withSteps       = processes.filter((p) => p._count.steps > 0).length;

    return {
      processes,
      stats: { total, highAiPotential, withSteps },
    };
  },
};
