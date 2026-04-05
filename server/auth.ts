import "server-only";

import type { Route } from "next";
import type { Session } from "next-auth";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { fromLocaleCode } from "@/lib/i18n/config";

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  return value as Record<string, unknown>;
}

function getPreferredWorkspaceId(preferences: unknown) {
  const record = asRecord(preferences);
  const workspaceId = record?.currentWorkspaceId;

  return typeof workspaceId === "string" && workspaceId.length > 0 ? workspaceId : null;
}

export async function getCurrentSession(): Promise<Session | null> {
  return auth();
}

export async function getCurrentUser() {
  const session = await getCurrentSession();

  if (!session?.user?.id) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: {
      id: session.user.id
    },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      status: true,
      preferredLocale: true,
      preferences: true
    }
  });

  if (!user || user.status !== "ACTIVE") {
    return null;
  }

  return {
    ...user,
    preferredLocale: fromLocaleCode(user.preferredLocale)
  };
}

export async function requireAuthenticatedUser() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login" as Route);
  }

  return user;
}

export async function getCurrentWorkspaceContext(options?: { requireMembership?: boolean }) {
  const session = await getCurrentSession();

  if (!session?.user?.id) {
    redirect("/login" as Route);
  }

  const user = await requireAuthenticatedUser();
  const preferredWorkspaceId = getPreferredWorkspaceId(user.preferences);
  const membershipQuery = {
    include: {
      role: true,
      workspace: {
        include: {
          tenant: {
            include: {
              subscriptionPlan: true
            }
          }
        }
      }
    }
  } as const;

  const preferredMembership = preferredWorkspaceId
    ? await prisma.membership.findFirst({
        where: {
          userId: user.id,
          workspaceId: preferredWorkspaceId,
          status: "ACTIVE",
          deletedAt: null,
          workspace: {
            deletedAt: null,
            status: "ACTIVE"
          }
        },
        ...membershipQuery
      })
    : null;

  const membership =
    preferredMembership ??
    (await prisma.membership.findFirst({
      where: {
        userId: user.id,
        status: "ACTIVE",
        deletedAt: null,
        workspace: {
          deletedAt: null,
          status: "ACTIVE"
        }
      },
      ...membershipQuery,
      orderBy: {
        createdAt: "asc"
      }
    }));

  if (!membership && options?.requireMembership === true) {
    redirect("/onboarding" as Route);
  }

  return {
    session,
    user,
    membership,
    workspace: membership?.workspace ?? null,
    tenant: membership?.workspace.tenant ?? null,
    subscriptionPlan: membership?.workspace.tenant.subscriptionPlan ?? null,
    role: membership?.role ?? null
  };
}
