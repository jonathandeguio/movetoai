import "server-only";

import { prisma } from "@/lib/prisma";

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
    const [user, processes, selections] = await prisma.$transaction([
      prisma.user.findUnique({
        where: {
          id: userId,
        },
        select: {
          hasCompletedProcessFocusOnboarding: true,
        },
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

    return {
      isCompleted: user?.hasCompletedProcessFocusOnboarding ?? false,
      processes: processes.map<ProcessFocusOption>((process) => ({
        id: process.id,
        name: process.name,
        domainName: process.domain?.name ?? null,
        ownerName: process.owner?.name ?? null,
      })),
      selectedProcessIds: selections.map((selection) => selection.processId),
      schemaReady: true,
    };
  } catch {
    return {
      isCompleted: true,
      processes: [],
      selectedProcessIds: [],
      schemaReady: false,
    };
  }
}

export async function saveProcessFocusSelection(input: {
  userId: string;
  workspaceId: string;
  selectedProcessIds: string[];
}) {
  return prisma.$transaction(async (tx) => {
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
        redirectTo: "/app/processes",
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
      redirectTo: "/app",
    };
  });
}
