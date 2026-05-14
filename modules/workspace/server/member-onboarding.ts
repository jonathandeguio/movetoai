import "server-only";

import { prisma } from "@/lib/prisma";

export async function saveMemberOnboardingData(input: {
  userId: string;
  firstName: string;
  lastName: string;
  jobTitle?: string;
  avatarUrl?: string;
}) {
  const user = await prisma.user.findUnique({
    where: { id: input.userId },
    select: { preferences: true },
  });

  const prefs = (user?.preferences as Record<string, unknown>) ?? {};

  const fullName = `${input.firstName.trim()} ${input.lastName.trim()}`.trim();

  await prisma.user.update({
    where: { id: input.userId },
    data: {
      name: fullName,
      ...(input.avatarUrl ? { image: input.avatarUrl } : {}),
      hasCompletedProcessFocusOnboarding: true,
      preferences: {
        ...prefs,
        memberOnboarding: {
          firstName: input.firstName,
          lastName: input.lastName,
          jobTitle: input.jobTitle ?? null,
          completedAt: new Date().toISOString(),
        },
      },
    },
  });

  return { redirectTo: "/app/dashboard/member" };
}
