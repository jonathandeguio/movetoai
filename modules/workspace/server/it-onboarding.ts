import "server-only";

import { prisma } from "@/lib/prisma";
import type { ITRoadmapResult } from "@/lib/claude-it";

/**
 * Persiste les données d'onboarding IT Manager et marque l'onboarding terminé.
 * Réutilise le flag hasCompletedProcessFocusOnboarding pour passer le garde
 * de l'app layout, qui est commun à toutes les personas.
 */
export async function saveITOnboardingData(input: {
  userId: string;
  itTitle: string;
  teamSize: string;
  selectedSystems: string[];
  mainConstraint: string;
  roadmap: ITRoadmapResult;
}) {
  return prisma.$transaction(async (tx) => {
    const userRecord = await tx.user.findUnique({
      where: { id: input.userId },
      select: { preferences: true },
    });

    const preferences =
      (userRecord?.preferences as Record<string, unknown> | null) ?? {};

    const mergedPreferences = {
      ...preferences,
      itOnboarding: {
        itTitle: input.itTitle,
        teamSize: input.teamSize,
        selectedSystems: input.selectedSystems,
        mainConstraint: input.mainConstraint,
        roadmap: input.roadmap,
        completedAt: new Date().toISOString(),
      },
    };

    await tx.user.update({
      where: { id: input.userId },
      data: {
        // Use the same flag so the app layout gate passes
        hasCompletedProcessFocusOnboarding: true,
        preferences: mergedPreferences,
      },
    });

    return { redirectTo: "/app/dashboard/tech/architecture" };
  });
}
