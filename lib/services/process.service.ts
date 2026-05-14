import "server-only";
import { processRepo } from "@/lib/repositories/process.repo";

export const processService = {
  async getStats(workspaceId: string) {
    return processRepo.countStats(workspaceId);
  },

  async getList(workspaceId: string, opts?: { domainId?: string }) {
    const rows = await processRepo.findByWorkspace(workspaceId, opts);
    return rows.map((p) => ({
      id:           p.id,
      name:         p.name,
      slug:         p.slug,
      domain:       p.domain.name,
      domainId:     p.domain.id,
      aiPotential:  p.aiPotential,
      painLevel:    p.painLevel,
      status:       p.processStatus,
      hasDiagram:   !!p.diagram,
      createdAt:    p.createdAt,
    }));
  },
};
