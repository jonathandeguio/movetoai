import "server-only";
import { prisma } from "@/lib/prisma";

export const dataSourceRepo = {
  /** Liste des sources de données avec compteurs liés */
  async findByWorkspace(workspaceId: string) {
    return prisma.dataSource.findMany({
      where:   { workspaceId, deletedAt: null },
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        systemName: true,
        classification: true,
        description: true,
        updatedAt: true,
        _count: {
          select: {
            processes:     true,
            opportunities: true,
          },
        },
      },
    });
  },
};
