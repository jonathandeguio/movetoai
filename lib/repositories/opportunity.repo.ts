import "server-only";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

export const opportunityRepo = {
  /** Stats pour dashboard */
  async countStats(workspaceId: string) {
    const [total, draft, validated, converted] = await Promise.all([
      prisma.opportunity.count({ where: { workspaceId, deletedAt: null } }),
      prisma.opportunity.count({ where: { workspaceId, deletedAt: null, status: "DRAFT" } }),
      prisma.opportunity.count({ where: { workspaceId, deletedAt: null, status: "VALIDATED" } }),
      prisma.opportunity.count({ where: { workspaceId, deletedAt: null, status: "CONVERTED" } }),
    ]);
    return { total, draft, validated, converted };
  },

  /** Top opportunités par priorité */
  async findTopPriority(workspaceId: string, limit = 5) {
    return prisma.opportunity.findMany({
      where:   { workspaceId, deletedAt: null, status: { notIn: ["ARCHIVED", "REJECTED"] } },
      orderBy: [{ priorityLevel: "asc" }, { createdAt: "desc" }],
      take:    limit,
      select:  {
        id: true, title: true, status: true, priorityLevel: true,
        gainEstimate: true, complexity: true,
        domain:   { select: { name: true } },
        process:  { select: { name: true } },
      },
    });
  },

  /** Nombre d'opportunités actives (APPROVED / IN_PROGRESS / LIVE) */
  async countActive(workspaceId: string) {
    return prisma.opportunity.count({
      where: { workspaceId, status: { in: ["APPROVED", "IN_PROGRESS", "LIVE"] } },
    });
  },

  /** Somme de la valeur réalisée */
  async sumRealizedValue(workspaceId: string): Promise<number> {
    const agg = await prisma.opportunity.aggregate({
      where: { workspaceId },
      _sum:  { realizedValue: true },
    });
    return Number(agg._sum.realizedValue ?? 0);
  },

  /** Détail allégé d'une opportunité (pour la page convert) */
  async findByIdForConvert(id: string, workspaceId: string) {
    return prisma.opportunity.findFirst({
      where:  { id, workspaceId, deletedAt: null },
      select: { id: true, title: true, domainLabel: true, gainEstimate: true, status: true },
    });
  },

  /** Compte les opportunités détectées par IA */
  async countAiDetected(workspaceId: string): Promise<number> {
    return prisma.opportunity.count({ where: { workspaceId, detectedBy: "ai", deletedAt: null } });
  },

  /** Toutes les opportunités pour le pipeline / spotlight */
  async findForOverview(workspaceId: string) {
    return prisma.opportunity.findMany({
      where: { workspaceId },
      select: {
        title:         true,
        status:        true,
        badge:         true,
        overallScore:  true,
        expectedValue: true,
        realizedValue: true,
        process:       { select: { name: true } },
        owner:         { select: { name: true } },
        currentDecision: { select: { status: true } },
      },
    });
  },
};
