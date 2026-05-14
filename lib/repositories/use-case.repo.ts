import "server-only";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

export interface UseCaseFilters {
  search?:   string;
  status?:   string;
  priority?: string;
}

export const useCaseRepo = {
  /** Liste filtrée pour la page use-cases */
  async findByWorkspace(workspaceId: string, filters: UseCaseFilters = {}) {
    const where: Prisma.UseCaseWhereInput = { workspaceId, deletedAt: null };

    if (filters.search) {
      where.OR = [
        { title:              { contains: filters.search } },
        { processDescription: { contains: filters.search } },
      ];
    }
    if (filters.status)   where.status        = filters.status;
    if (filters.priority) where.priorityLevel = filters.priority;

    return prisma.useCase.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take:    100,
      select: {
        id: true, title: true, solutionType: true, status: true,
        priorityLevel: true, effortDays: true, roiEstimated: true, createdAt: true,
        opportunity: { select: { id: true, title: true, domainLabel: true } },
      },
    });
  },

  /** Pour le ROI dashboard */
  async findForRoi(workspaceId: string) {
    return prisma.useCase.findMany({
      where:   { workspaceId, deletedAt: null },
      select: {
        id: true, title: true, status: true, effortDays: true, roiEstimated: true,
        opportunity: { select: { title: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  },
};
