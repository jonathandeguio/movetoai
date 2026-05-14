import "server-only";

import { prisma } from "@/lib/prisma";

export type ExecutiveQuickWin = {
  title: string;
  description: string;
  roi: string;
  timeframe: string;
  effort: "low" | "medium" | "high";
};

export type ExecutiveOnboardingData = {
  userId: string;
  firstName: string;
  lastName: string;
  jobTitle: string;
  linkedinUrl?: string;
  ambition: string;
  horizon: string;
  maturity: string;
  quickWins: ExecutiveQuickWin[];
  maturityScore: number;
};

export async function hasCompletedExecutiveOnboarding(userId: string): Promise<boolean> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { hasCompletedProcessFocusOnboarding: true }
    });
    return user?.hasCompletedProcessFocusOnboarding ?? true;
  } catch {
    return true;
  }
}

export async function saveExecutiveOnboardingData(input: ExecutiveOnboardingData) {
  const preferences = await prisma.user.findUnique({
    where: { id: input.userId },
    select: { preferences: true }
  });

  const existingPrefs = (preferences?.preferences as Record<string, unknown>) ?? {};

  await prisma.user.update({
    where: { id: input.userId },
    data: {
      name: `${input.firstName} ${input.lastName}`,
      hasCompletedProcessFocusOnboarding: true,
      preferences: {
        ...existingPrefs,
        executiveOnboarding: {
          firstName: input.firstName,
          lastName: input.lastName,
          jobTitle: input.jobTitle,
          ...(input.linkedinUrl ? { linkedinUrl: input.linkedinUrl } : {}),
          ambition: input.ambition,
          horizon: input.horizon,
          maturity: input.maturity,
          quickWins: input.quickWins,
          maturityScore: input.maturityScore,
          completedAt: new Date().toISOString()
        }
      }
    }
  });

  return { redirectTo: "/app/dashboard/executive" };
}

export async function getExecutiveDashboardData(userId: string, workspaceId: string) {
  const [user, processCount] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { preferences: true, name: true }
    }),
    prisma.process.count({ where: { workspaceId, deletedAt: null } })
  ]);

  const opportunityCount = 0;

  const prefs = (user?.preferences as Record<string, unknown>) ?? {};
  const execData = prefs.executiveOnboarding as Record<string, unknown> | undefined;

  return {
    maturityScore: (execData?.maturityScore as number) ?? 42,
    quickWins: (execData?.quickWins as ExecutiveQuickWin[]) ?? [],
    jobTitle: (execData?.jobTitle as string) ?? "",
    ambition: (execData?.ambition as string) ?? "",
    horizon: (execData?.horizon as string) ?? "",
    processCount,
    opportunityCount
  };
}
