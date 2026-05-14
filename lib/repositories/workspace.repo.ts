import "server-only";
import { prisma } from "@/lib/prisma";

export const workspaceRepo = {
  /** Infos de base du workspace */
  async findById(id: string) {
    return prisma.workspace.findUnique({
      where: { id },
      select: {
        id: true, name: true, slug: true,
        sectorCode: true, companySize: true,
        aiMaturity: true, planType: true,
        settings: true,
      },
    });
  },

  /** Membres actifs */
  async findActiveMembers(workspaceId: string) {
    return prisma.membership.findMany({
      where: { workspaceId, status: "ACTIVE", deletedAt: null },
      include: {
        user: { select: { id: true, name: true, email: true, jobTitle: true } },
        role: { select: { name: true, code: true } },
      },
      orderBy: { createdAt: "asc" },
    });
  },

  /** Compte des membres actifs */
  async countActiveMembers(workspaceId: string): Promise<number> {
    return prisma.membership.count({ where: { workspaceId, status: "ACTIVE", deletedAt: null } });
  },
};
