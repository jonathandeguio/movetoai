import "server-only";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

export type ProcessSummary = Prisma.ProcessGetPayload<{
  select: {
    id: true; name: true; slug: true; aiPotential: true;
    painLevel: true; processStatus: true; createdAt: true;
    domain: { select: { id: true; name: true } };
    diagram: { select: { id: true } };
  };
}>;

export const processRepo = {
  /** Liste paginée des processus */
  async findByWorkspace(
    workspaceId: string,
    opts?: { domainId?: string; limit?: number; offset?: number }
  ): Promise<ProcessSummary[]> {
    return prisma.process.findMany({
      where: {
        workspaceId,
        deletedAt: null,
        ...(opts?.domainId ? { domainId: opts.domainId } : {}),
      },
      select: {
        id: true, name: true, slug: true, aiPotential: true,
        painLevel: true, processStatus: true, createdAt: true,
        domain: { select: { id: true, name: true } },
        diagram: { select: { id: true } },
      },
      orderBy: { name: "asc" },
      take:   opts?.limit  ?? 200,
      skip:   opts?.offset ?? 0,
    });
  },

  /** Un processus complet avec étapes */
  async findById(id: string, workspaceId: string) {
    return prisma.process.findFirst({
      where: { id, workspaceId, deletedAt: null },
      include: {
        domain:     { select: { id: true, name: true } },
        capability: { select: { id: true, name: true } },
        steps:      { orderBy: { order: "asc" } },
        diagram:    true,
        kpis:       true,
      },
    });
  },

  /** Détail complet pour la page knowledge/processes/[id] */
  async findByIdForDetail(id: string, workspaceId: string) {
    return prisma.process.findFirst({
      where: { id, workspaceId, deletedAt: null },
      include: {
        domain:       { select: { id: true, name: true } },
        capability:   { select: { id: true, name: true } },
        owner:        { select: { id: true, name: true, email: true } },
        businessUnit: { select: { id: true, name: true } },
        steps: {
          orderBy: { order: "asc" },
          select: {
            id: true, name: true, order: true,
            actor: true, durationMin: true, automatable: true, tool: true,
          },
        },
        opportunities: {
          where:   { deletedAt: null },
          select:  { id: true, title: true, status: true },
          take:    6,
          orderBy: { createdAt: "desc" },
        },
        diagram: { select: { id: true, versionCount: true, updatedAt: true } },
        _count:  { select: { steps: true, opportunities: true } },
      },
    });
  },

  /** Compteurs pour les métriques */
  async countStats(workspaceId: string) {
    const [total, withDiagram, highPain] = await Promise.all([
      prisma.process.count({ where: { workspaceId, deletedAt: null } }),
      prisma.process.count({ where: { workspaceId, deletedAt: null, diagram: { isNot: null } } }),
      prisma.process.count({ where: { workspaceId, deletedAt: null, painLevel: { gte: 4 } } }),
    ]);
    return { total, withDiagram, withoutDiagram: total - withDiagram, highPain };
  },

  /** Derniers processus mis à jour (pour dashboards membres) */
  async findRecent(workspaceId: string, limit = 5) {
    return prisma.process.findMany({
      where:   { workspaceId, deletedAt: null },
      select:  { id: true, name: true, domain: { select: { name: true } } },
      orderBy: { updatedAt: "desc" },
      take:    limit,
    });
  },

  /** Liste pour la page admin/processes (avec domain + owner) */
  async findForAdmin(workspaceId: string) {
    return prisma.process.findMany({
      where:   { workspaceId, deletedAt: null },
      include: {
        domain: { select: { name: true } },
        owner:  { select: { name: true } },
      },
      orderBy: { updatedAt: "desc" },
    });
  },

  /** Liste enrichie pour la page Knowledge/Processus */
  async findForKnowledge(workspaceId: string) {
    return prisma.process.findMany({
      where:   { workspaceId, deletedAt: null, processStatus: { not: "archived" } },
      orderBy: { name: "asc" },
      select: {
        id: true, name: true, description: true, slug: true,
        aiPotential: true, frequency: true, manualEffortH: true,
        painLevel: true, automationRate: true,
        capability: { select: { id: true, name: true } },
        domain:     { select: { id: true, name: true } },
        owner:      { select: { id: true, name: true } },
        _count:     { select: { steps: true, opportunities: true, applications: true } },
      },
    });
  },
};
