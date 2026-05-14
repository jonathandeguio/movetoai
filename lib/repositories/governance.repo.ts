import "server-only";
import { prisma } from "@/lib/prisma";

export const governanceRepo = {
  /** Risques liés aux opportunités d'un workspace */
  async findRisks(workspaceId: string) {
    return prisma.riskItem.findMany({
      where: { deletedAt: null, opportunity: { workspaceId } },
      include: {
        owner:       { select: { name: true } },
        opportunity: { select: { title: true } },
      },
      orderBy: [{ severity: "desc" }, { createdAt: "desc" }],
    });
  },

  /** Métriques de bénéfice */
  async findBenefitMetrics(workspaceId: string, limit = 10) {
    return prisma.benefitMetric.findMany({
      where:  { workspaceId, deletedAt: null },
      select: { id: true, name: true, unit: true, targetValue: true, currentValue: true },
      take:   limit,
    });
  },

  /** Attestations de conformité */
  async findAttestations(workspaceId: string) {
    return prisma.attestation.findMany({
      where:   { workspaceId },
      orderBy: { createdAt: "desc" },
    });
  },

  /** Architecture Decision Records */
  async findDecisions(workspaceId: string) {
    return prisma.architectureDecision.findMany({
      where:   { workspaceId, deletedAt: null },
      orderBy: { decisionDate: "desc" },
      include: { author: { select: { id: true, name: true, email: true } } },
    });
  },

  /** Un ADR complet */
  async findDecisionById(id: string, workspaceId: string) {
    return prisma.architectureDecision.findFirst({
      where:   { id, workspaceId, deletedAt: null },
      include: { author: { select: { id: true, name: true, email: true } } },
    });
  },
};
