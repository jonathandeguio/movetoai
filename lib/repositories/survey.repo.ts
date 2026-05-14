import "server-only";
import { prisma } from "@/lib/prisma";

export const surveyRepo = {
  /** Liste des enquêtes d'un workspace */
  async findByWorkspace(workspaceId: string) {
    return prisma.survey.findMany({
      where:   { workspaceId, deletedAt: null },
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { questions: true, responses: true } } },
    });
  },

  /** Détail d'une enquête avec ses questions */
  async findById(id: string, workspaceId: string) {
    return prisma.survey.findFirst({
      where:   { id, workspaceId, deletedAt: null },
      include: {
        questions: { orderBy: { order: "asc" } },
        _count:    { select: { responses: true } },
      },
    });
  },
};
