import "server-only";
import { prisma } from "@/lib/prisma";

export const ingestionRepo = {
  /** Jobs d'ingestion récents */
  async findRecentJobs(workspaceId: string, limit = 20) {
    return prisma.ingestionJob.findMany({
      where:   { workspaceId },
      orderBy: { createdAt: "desc" },
      take:    limit,
    });
  },
};
