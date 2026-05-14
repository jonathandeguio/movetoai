import "server-only";
import { prisma } from "@/lib/prisma";

export const applicationRepo = {
  /** Liste pour le graphe de dépendances */
  async findForDependencyGraph(workspaceId: string) {
    return prisma.application.findMany({
      where: { workspaceId, deletedAt: null },
      select: {
        id: true, name: true, lifecycleState: true, criticality: true, aiReadinessScore: true,
        capabilities: { select: { capability: { select: { id: true, name: true } } } },
        processes:    { select: { process:    { select: { id: true, name: true } } } },
      },
    });
  },

  /** Liste enrichie pour la page knowledge/applications */
  async findForKnowledge(workspaceId: string) {
    return prisma.application.findMany({
      where:   { workspaceId, deletedAt: null },
      orderBy: { name: "asc" },
      select: {
        id: true, name: true, vendor: true, description: true,
        lifecycleState: true, criticality: true, deploymentType: true,
        annualCost: true, userCount: true, aiReadinessScore: true,
        businessOwner: { select: { name: true } },
        itOwner:       { select: { name: true } },
        _count: { select: { processes: true, capabilities: true, opportunities: true } },
      },
    });
  },

  /** Détail complet pour la page knowledge/applications/[id] */
  async findByIdForDetail(id: string, workspaceId: string) {
    return prisma.application.findFirst({
      where: { id, workspaceId, deletedAt: null },
      include: {
        businessOwner: { select: { name: true, email: true } },
        itOwner:       { select: { name: true, email: true } },
        capabilities:  { include: { capability: { select: { name: true } } } },
        processes:     { include: { process:    { select: { name: true, id: true } } } },
        technologies:  { include: { technology: { select: { name: true, category: true } } } },
        opportunities: { include: { opportunity: { select: { id: true, title: true, status: true } } } },
      },
    });
  },

  /** Liste complète pour l'administration */
  async findByWorkspace(workspaceId: string) {
    return prisma.application.findMany({
      where:   { workspaceId, deletedAt: null },
      orderBy: { name: "asc" },
    });
  },

  /** Liste pour la page admin/applications (avec compteurs) */
  async findForAdmin(workspaceId: string) {
    return prisma.application.findMany({
      where:   { workspaceId, deletedAt: null },
      orderBy: { name: "asc" },
      select: {
        id: true, name: true, vendor: true, description: true, updatedAt: true,
        _count: { select: { processes: true, opportunities: true } },
      },
    });
  },

  /** Liste pour la matrice d'assessment portfolio */
  async findForAssessment(workspaceId: string) {
    return prisma.application.findMany({
      where:   { workspaceId, deletedAt: null },
      select: {
        id: true, name: true, vendor: true,
        lifecycleState: true, criticality: true,
        annualCost: true, userCount: true, aiReadinessScore: true,
        _count: { select: { capabilities: true, processes: true } },
      },
    });
  },
};
