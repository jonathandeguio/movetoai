import "server-only";
import { prisma } from "@/lib/prisma";

export const insightsRepo = {
  /** Suggestions de relations */
  async findRelationshipSuggestions(workspaceId: string) {
    return prisma.relationshipSuggestion.findMany({
      where:   { workspaceId },
      orderBy: { createdAt: "desc" },
      take:    100,
    });
  },

  /** Dernier rapport de qualité des données */
  async findLatestDataQualityReport(workspaceId: string, entityType?: string) {
    return prisma.dataQualityReport.findFirst({
      where:   { workspaceId, ...(entityType ? { entityType } : {}) },
      orderBy: { generatedAt: "desc" },
    });
  },
};
