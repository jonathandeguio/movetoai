import "server-only";
import { prisma } from "@/lib/prisma";

export const membershipRepo = {
  /** Toutes les memberships d'un workspace (avec user + role) */
  async findByWorkspace(workspaceId: string) {
    return prisma.membership.findMany({
      where:   { workspaceId, deletedAt: null },
      include: {
        user: { select: { id: true, name: true, email: true, image: true, jobTitle: true } },
        role: { select: { code: true, name: true } },
      },
      orderBy: { createdAt: "asc" },
    });
  },

  /** Rôles disponibles dans un workspace */
  async findRoles(workspaceId: string) {
    return prisma.role.findMany({
      where:   { workspaceId, deletedAt: null },
      select:  { code: true, name: true },
      orderBy: { name: "asc" },
    });
  },
};
