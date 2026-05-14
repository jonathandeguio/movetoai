import "server-only";
import { prisma } from "@/lib/prisma";

export const domainRepo = {
  /** Liste des domaines d'un workspace */
  async findByWorkspace(workspaceId: string) {
    return prisma.domain.findMany({
      where:   { workspaceId, deletedAt: null },
      select:  { id: true, name: true },
      orderBy: { name: "asc" },
    });
  },
};
