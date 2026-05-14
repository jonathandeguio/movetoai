import "server-only";
import { prisma } from "@/lib/prisma";

export const businessUnitRepo = {
  /** Liste des unités métier avec compteurs liés */
  async findByWorkspace(workspaceId: string) {
    return prisma.businessUnit.findMany({
      where:   { workspaceId, deletedAt: null },
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        description: true,
        code: true,
        parentId: true,
        updatedAt: true,
        _count: {
          select: {
            domains:      { where: { deletedAt: null } },
            capabilities: { where: { deletedAt: null } },
            processes:    { where: { deletedAt: null } },
          },
        },
      },
    });
  },
};
