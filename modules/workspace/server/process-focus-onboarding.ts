import "server-only";

import { prisma } from "@/lib/prisma";
import type { RecommendedProcess } from "@/lib/claude";
import { computeOnboardingRedirect } from "@/lib/onboarding-redirects";

export type ProcessFocusOption = {
  id: string;
  name: string;
  domainName: string | null;
  ownerName: string | null;
};

export async function hasCompletedProcessFocusOnboarding(userId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        hasCompletedProcessFocusOnboarding: true,
      },
    });

    return user?.hasCompletedProcessFocusOnboarding ?? true;
  } catch {
    return true;
  }
}

export async function getProcessFocusOnboardingData(userId: string, workspaceId: string) {
  try {
    const [user, workspace, processes, selections] = await prisma.$transaction([
      prisma.user.findUnique({
        where: {
          id: userId,
        },
        select: {
          hasCompletedProcessFocusOnboarding: true,
          preferences: true,
        },
      }),
      prisma.workspace.findUnique({
        where: { id: workspaceId },
        select: { tenant: { select: { settings: true } } },
      }),
      prisma.process.findMany({
        where: {
          workspaceId,
          deletedAt: null,
        },
        select: {
          id: true,
          name: true,
          domain: {
            select: {
              name: true,
            },
          },
          owner: {
            select: {
              name: true,
            },
          },
        },
        orderBy: {
          name: "asc",
        },
      }),
      prisma.userProcessFocusSelection.findMany({
        where: {
          userId,
          process: {
            workspaceId,
            deletedAt: null,
          },
        },
        select: {
          processId: true,
        },
      }),
    ]);

    const preferences = user?.preferences as Record<string, unknown> | null;
    const tenantSettings = workspace?.tenant?.settings as Record<string, unknown> | null;
    const userFunction = typeof preferences?.userFunction === "string" ? preferences.userFunction : "other";
    const companySize = typeof tenantSettings?.companySize === "string" ? tenantSettings.companySize : "pme";

    return {
      isCompleted: user?.hasCompletedProcessFocusOnboarding ?? false,
      processes: processes.map<ProcessFocusOption>((process) => ({
        id: process.id,
        name: process.name,
        domainName: process.domain?.name ?? null,
        ownerName: process.owner?.name ?? null,
      })),
      selectedProcessIds: selections.map((selection) => selection.processId),
      userFunction,
      companySize,
      schemaReady: true,
    };
  } catch {
    return {
      isCompleted: true,
      processes: [],
      selectedProcessIds: [],
      userFunction: "other",
      companySize: "pme",
      schemaReady: false,
    };
  }
}

/** Persiste les processus recommandés par l'IA et marque l'onboarding terminé. */
export async function saveAIProcessFocusSelection(input: {
  userId: string;
  workspaceId: string;
  selectedDomains: string[];
  selectedProcesses: RecommendedProcess[];
  profileSummary: string;
}) {
  return prisma.$transaction(async (tx) => {
    const [userRecord, workspaceRecord] = await Promise.all([
      tx.user.findUnique({
        where: { id: input.userId },
        select: { preferences: true },
      }),
      tx.workspace.findUnique({
        where: { id: input.workspaceId },
        select: { tenant: { select: { settings: true } } },
      }),
    ]);

    const preferences = userRecord?.preferences as Record<string, unknown> | null;
    const tenantSettings = workspaceRecord?.tenant?.settings as Record<string, unknown> | null;
    const userFunction = typeof preferences?.userFunction === "string" ? preferences.userFunction : null;
    const companySize = typeof tenantSettings?.companySize === "string" ? tenantSettings.companySize : null;
    const redirectTo = computeOnboardingRedirect(userFunction, companySize);

    const mergedPreferences = {
      ...(preferences ?? {}),
      aiOnboarding: {
        selectedDomains: input.selectedDomains,
        selectedProcesses: input.selectedProcesses,
        profileSummary: input.profileSummary,
        redirectPath: redirectTo,
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

    // Route to the correct post-onboarding step based on account type
    const accountType = typeof preferences?.accountType === "string" ? preferences.accountType : "enterprise";
    const finalRedirect =
      accountType === "it_manager"
        ? "/onboarding/it-setup"
        : accountType === "consultant"
        ? "/onboarding/consultant-setup"
        : "/onboarding/team-setup";

    return { redirectTo: finalRedirect };
  });
}

const USER_FUNCTION_ROUTES: Record<string, string> = {
  executive: "/app/portfolio",
  ai_lead: "/app/opportunities",
  business_owner: "/app/domains",
  data_it: "/app/knowledge/applications",
  consultant: "/app/opportunities",
  other: "/app"
};

function computePersonalizedRedirect(
  userFunction: string | null | undefined,
  companySize: string | null | undefined
): string {
  if (companySize === "pme") {
    return "/app";
  }
  return USER_FUNCTION_ROUTES[userFunction ?? ""] ?? "/app";
}

export async function saveProcessFocusSelection(input: {
  userId: string;
  workspaceId: string;
  selectedProcessIds: string[];
}) {
  return prisma.$transaction(async (tx) => {
    const [userRecord, workspaceRecord] = await Promise.all([
      tx.user.findUnique({
        where: { id: input.userId },
        select: { preferences: true }
      }),
      tx.workspace.findUnique({
        where: { id: input.workspaceId },
        select: { tenant: { select: { settings: true } } }
      })
    ]);

    const preferences = userRecord?.preferences as Record<string, unknown> | null;
    const tenantSettings = workspaceRecord?.tenant?.settings as Record<string, unknown> | null;
    const userFunction = typeof preferences?.userFunction === "string" ? preferences.userFunction : null;
    const companySize = typeof tenantSettings?.companySize === "string" ? tenantSettings.companySize : null;
    const personalizedRedirect = computePersonalizedRedirect(userFunction, companySize);

    const totalProcesses = await tx.process.count({
      where: {
        workspaceId: input.workspaceId,
        deletedAt: null,
      },
    });

    const uniqueProcessIds = [...new Set(input.selectedProcessIds)];

    if (totalProcesses === 0) {
      if (uniqueProcessIds.length !== 0) {
        throw new Error("INVALID_SELECTION");
      }

      await tx.user.update({
        where: {
          id: input.userId,
        },
        data: {
          hasCompletedProcessFocusOnboarding: true,
        },
      });

      return {
        redirectTo: personalizedRedirect,
      };
    }

    if (uniqueProcessIds.length !== 5) {
      throw new Error("INVALID_SELECTION");
    }

    const matchingProcesses = await tx.process.findMany({
      where: {
        id: {
          in: uniqueProcessIds,
        },
        workspaceId: input.workspaceId,
        deletedAt: null,
      },
      select: {
        id: true,
      },
    });

    if (matchingProcesses.length !== 5) {
      throw new Error("INVALID_PROCESS_SELECTION");
    }

    await tx.userProcessFocusSelection.deleteMany({
      where: {
        userId: input.userId,
      },
    });

    await tx.userProcessFocusSelection.createMany({
      data: uniqueProcessIds.map((processId) => ({
        userId: input.userId,
        processId,
      })),
      skipDuplicates: true,
    });

    await tx.user.update({
      where: {
        id: input.userId,
      },
      data: {
        hasCompletedProcessFocusOnboarding: true,
      },
    });

    return {
      redirectTo: personalizedRedirect,
    };
  });
}
