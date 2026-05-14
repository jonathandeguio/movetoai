import "server-only";
import { opportunityRepo } from "@/lib/repositories/opportunity.repo";

export const opportunityService = {
  async getStats(workspaceId: string) {
    return opportunityRepo.countStats(workspaceId);
  },

  async getTopPriority(workspaceId: string, limit = 5) {
    return opportunityRepo.findTopPriority(workspaceId, limit);
  },
};
