import "server-only";

import { prisma } from "@/lib/prisma";
import type { ConsultantRecommendationResult } from "@/lib/claude-consultant";

/**
 * Persiste les données d'onboarding Consultant IA et marque l'onboarding terminé.
 * Réutilise le flag hasCompletedProcessFocusOnboarding (commun à toutes les personas).
 */
export async function saveConsultantOnboardingData(input: {
  userId: string;
  consultantType: string;
  specialization: string;
  yearsExperience: string;
  linkedinUrl: string;
  website: string;
  simultaneousClients: string;
  sectors: string[];
  tools: string[];
  recommendation: ConsultantRecommendationResult;
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
      consultantOnboarding: {
        consultantType: input.consultantType,
        specialization: input.specialization,
        yearsExperience: input.yearsExperience,
        linkedinUrl: input.linkedinUrl,
        website: input.website,
        simultaneousClients: input.simultaneousClients,
        sectors: input.sectors,
        tools: input.tools,
        recommendation: input.recommendation,
        partnerTier: input.recommendation.partner_tier_suggestion,
        completedAt: new Date().toISOString(),
      },
    };

    await tx.user.update({
      where: { id: input.userId },
      data: {
        hasCompletedProcessFocusOnboarding: true,
        preferences: mergedPreferences,
      },
    });

    return { redirectTo: "/app/dashboard/consulting" };
  });
}
