import "server-only";
import { prisma } from "@/lib/prisma";

export const initiativeRepo = {
  /** Toutes les initiatives actives d'un workspace */
  async findByWorkspace(workspaceId: string, opts?: { excludeCanceled?: boolean }) {
    return prisma.initiative.findMany({
      where: {
        workspaceId,
        deletedAt: null,
        ...(opts?.excludeCanceled ? { status: { not: "CANCELED" } } : {}),
      },
      include: {
        milestones: true,
        owner: { select: { name: true } },
      },
      orderBy: { startDate: "asc" },
    });
  },

  /** Compteurs par statut */
  async countStats(workspaceId: string) {
    const initiatives = await prisma.initiative.findMany({
      where:  { workspaceId, deletedAt: null },
      select: { status: true },
    });
    const total      = initiatives.length;
    const inProgress = initiatives.filter((i) => i.status === "IN_PROGRESS").length;
    const atRisk     = initiatives.filter((i) => i.status === "AT_RISK").length;
    const completed  = initiatives.filter((i) => i.status === "COMPLETED").length;
    return { total, inProgress, atRisk, completed };
  },
};
