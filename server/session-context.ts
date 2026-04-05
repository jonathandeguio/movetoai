import "server-only";

import { prisma } from "@/lib/prisma";
import { fromLocaleCode } from "@/lib/i18n/config";
import { isPermissionKey, isRoleCode, type PermissionKey, type RoleCode } from "@/lib/rbac";

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

export type ResolvedSessionContext = {
  user: {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
    status: string;
    preferredLocale: "en" | "fr" | "es";
  };
  memberships: Array<{
    id: string;
    workspaceId: string;
    roleId: string;
    status: string;
  }>;
  currentMembership: {
    id: string;
    workspaceId: string;
    roleId: string;
    status: string;
  } | null;
  workspace: {
    id: string;
    name: string;
    slug: string;
    defaultLocale: string;
  } | null;
  tenant: {
    id: string;
    name: string;
    slug: string;
  } | null;
  subscriptionPlan: {
    id: string;
    name: string;
    planType: string;
  } | null;
  role: {
    id: string;
    code: RoleCode | null;
    name: string;
  } | null;
  permissions: PermissionKey[];
  needsOnboarding: boolean;
};

export async function resolveSessionContextForUserId(userId: string): Promise<ResolvedSessionContext | null> {
  const user = await prisma.user.findUnique({
    where: {
      id: userId
    },
    include: {
      memberships: {
        where: {
          status: "ACTIVE",
          deletedAt: null,
          workspace: {
            deletedAt: null,
            status: "ACTIVE"
          },
          role: {
            deletedAt: null
          }
        },
        include: {
          role: {
            include: {
              permissions: {
                include: {
                  permission: true
                }
              }
            }
          },
          workspace: {
            include: {
              tenant: {
                include: {
                  subscriptionPlan: true
                }
              }
            }
          }
        },
        orderBy: {
          createdAt: "asc"
        }
      }
    }
  });

  if (!user || user.deletedAt || user.status !== "ACTIVE") {
    return null;
  }

  const preferredWorkspaceId = getPreferredWorkspaceId(user.preferences);
  const activeMembership =
    user.memberships.find((membership) => membership.workspaceId === preferredWorkspaceId) ??
    user.memberships[0] ??
    null;

  const rawPermissions =
    activeMembership?.role.permissions.map((entry) => entry.permission.key) ?? [];
  const permissions = rawPermissions.filter(isPermissionKey);
  const roleCode =
    activeMembership?.role.code && isRoleCode(activeMembership.role.code)
      ? activeMembership.role.code
      : null;

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
      status: user.status,
      preferredLocale: fromLocaleCode(user.preferredLocale)
    },
    memberships: user.memberships.map((membership) => ({
      id: membership.id,
      workspaceId: membership.workspaceId,
      roleId: membership.roleId,
      status: membership.status
    })),
    currentMembership: activeMembership
      ? {
          id: activeMembership.id,
          workspaceId: activeMembership.workspaceId,
          roleId: activeMembership.roleId,
          status: activeMembership.status
        }
      : null,
    workspace: activeMembership
      ? {
          id: activeMembership.workspace.id,
          name: activeMembership.workspace.name,
          slug: activeMembership.workspace.slug,
          defaultLocale: activeMembership.workspace.defaultLocale
        }
      : null,
    tenant: activeMembership
      ? {
          id: activeMembership.workspace.tenant.id,
          name: activeMembership.workspace.tenant.name,
          slug: activeMembership.workspace.tenant.slug
        }
      : null,
    subscriptionPlan: activeMembership
      ? {
          id: activeMembership.workspace.tenant.subscriptionPlan.id,
          name: activeMembership.workspace.tenant.subscriptionPlan.name,
          planType: activeMembership.workspace.tenant.subscriptionPlan.planType
        }
      : null,
    role: activeMembership
      ? {
          id: activeMembership.role.id,
          code: roleCode,
          name: activeMembership.role.name
        }
      : null,
    permissions,
    needsOnboarding: activeMembership === null
  };
}
