import "server-only";

import type { Prisma, PrismaClient } from "@prisma/client";

import {
  defaultJoinRoleCode,
  defaultWorkspaceOwnerRoleCode
} from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { toLocaleCode, type Locale } from "@/lib/i18n/config";
import {
  ensureSubscriptionPlanCatalog,
  ensureWorkspaceSystemRoles,
  initializeUsageQuotas
} from "@/server/catalog";

type DbClient = PrismaClient | Prisma.TransactionClient;

function asRecord(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  return value as Record<string, unknown>;
}

function mergeUserPreferences(preferences: unknown, nextValues: Record<string, unknown>) {
  return {
    ...asRecord(preferences),
    ...nextValues
  } as Prisma.InputJsonValue;
}

function slugify(input: string) {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48) || "workspace";
}

async function createUniqueSlug(
  db: DbClient,
  model: "tenant" | "workspace",
  baseValue: string
) {
  const baseSlug = slugify(baseValue);

  for (let index = 0; index < 50; index += 1) {
    const candidate = index === 0 ? baseSlug : `${baseSlug}-${index + 1}`;
    const existing =
      model === "tenant"
        ? await db.tenant.findUnique({ where: { slug: candidate }, select: { id: true } })
        : await db.workspace.findFirst({
            where: { slug: candidate, deletedAt: null },
            select: { id: true }
          });

    if (!existing) {
      return candidate;
    }
  }

  return `${baseSlug}-${Date.now()}`;
}

function buildFreePlanSettings(locale: Locale) {
  return {
    onboardingLocale: locale.toUpperCase(),
    upgradePrompt:
      "Upgrade to Pro when you need custom scoring, governance, and collaboration. Upgrade to Enterprise for multi-BU rollout, SSO, SCIM, audit, and centralized admin.",
    firstValueChecklist: [
      "Map your first business processes",
      "Capture your highest-friction pain points",
      "Prioritize the first AI opportunities",
      "Upgrade only when governance and scale are needed"
    ]
  };
}

export async function createWorkspaceForUser(input: {
  userId: string;
  preferredLocale: Locale;
  firstName?: string;
  lastName?: string;
  jobTitle?: string;
  phone?: string;
  companyName: string;
  workspaceName: string;
  companySize?: string;
  sector?: string;
  decisionRole?: string;
  website?: string;
  accountType?: string;
}) {
  return prisma.$transaction(async (tx) => {
    const existingMembership = await tx.membership.findFirst({
      where: {
        userId: input.userId,
        status: "ACTIVE",
        deletedAt: null
      },
      select: {
        id: true
      }
    });

    if (existingMembership) {
      throw new Error("ALREADY_ONBOARDED");
    }

    const user = await tx.user.findUniqueOrThrow({
      where: {
        id: input.userId
      },
      select: {
        id: true,
        preferences: true
      }
    });

    const plans = await ensureSubscriptionPlanCatalog(tx);
    const freePlan = plans.FREE;
    const tenantSlug = await createUniqueSlug(tx, "tenant", input.companyName);
    const workspaceSlug = await createUniqueSlug(tx, "workspace", input.workspaceName);

    const tenant = await tx.tenant.create({
      data: {
        name: input.companyName,
        slug: tenantSlug,
        subscriptionPlanId: freePlan.id,
        subscriptionStatus: "ACTIVE",
        planActivatedAt: new Date(),
        settings: {
          currentPlan: "FREE",
          acquisitionSource: "self-serve-signup",
          ...(input.companySize ? { companySize: input.companySize } : {}),
          ...(input.sector ? { sector: input.sector } : {}),
          ...(input.website ? { website: input.website } : {}),
          ...(input.accountType ? { accountType: input.accountType } : {}),
          planShowcase: {
            free: "Start free with one workspace, five users, process mapping, and opportunity intake.",
            pro: "Unlock custom scoring, governance workflows, advanced exports, and portfolio collaboration.",
            enterprise: "Unlock SSO, SCIM, full audit, API access, multi-BU rollout, and centralized administration."
          }
        }
      }
    });

    const workspace = await tx.workspace.create({
      data: {
        tenantId: tenant.id,
        name: input.workspaceName,
        slug: workspaceSlug,
        defaultLocale: toLocaleCode(input.preferredLocale),
        status: "ACTIVE",
        settings: {
          currentPlan: "FREE",
          onboarding: buildFreePlanSettings(input.preferredLocale),
          freePreview: {
            usersUsed: 1,
            usersAllowed: 5,
            processesUsed: 0,
            processesAllowed: 15,
            opportunitiesUsed: 0,
            opportunitiesAllowed: 30,
            aiRequestsUsed: 0,
            aiRequestsAllowed: 30,
            upgradePrompt:
              "Upgrade to Pro to unlock custom scoring, governance, advanced workflows, and team collaboration."
          }
        }
      }
    });

    const roles = await ensureWorkspaceSystemRoles(tx, workspace.id);

    await tx.membership.create({
      data: {
        userId: input.userId,
        workspaceId: workspace.id,
        roleId: roles[defaultWorkspaceOwnerRoleCode].id,
        status: "ACTIVE",
        acceptedAt: new Date(),
        lastActiveAt: new Date()
      }
    });

    await initializeUsageQuotas(tx, {
      tenantId: tenant.id,
      workspaceId: workspace.id,
      plan: freePlan
    });

    // Build display name from firstName + lastName if provided
    const fullName =
      input.firstName && input.lastName
        ? `${input.firstName.trim()} ${input.lastName.trim()}`
        : input.firstName || input.lastName || undefined;

    await tx.user.update({
      where: {
        id: input.userId
      },
      data: {
        preferredLocale: toLocaleCode(input.preferredLocale),
        ...(fullName ? { name: fullName } : {}),
        ...(input.jobTitle ? { jobTitle: input.jobTitle } : {}),
        preferences: mergeUserPreferences(user.preferences, {
          currentWorkspaceId: workspace.id,
          ...(input.firstName ? { firstName: input.firstName } : {}),
          ...(input.lastName ? { lastName: input.lastName } : {}),
          ...(input.phone ? { phone: input.phone } : {}),
          ...(input.decisionRole ? { decisionRole: input.decisionRole } : {}),
          ...(input.accountType ? { accountType: input.accountType } : {}),
        })
      }
    });

    return {
      tenantId: tenant.id,
      workspaceId: workspace.id,
      workspaceSlug: workspace.slug
    };
  });
}

export async function joinWorkspaceForUser(input: {
  userId: string;
  preferredLocale: Locale;
  workspaceSlug: string;
}) {
  return prisma.$transaction(async (tx) => {
    const normalizedSlug = slugify(input.workspaceSlug);
    const workspace = await tx.workspace.findFirst({
      where: {
        slug: normalizedSlug,
        deletedAt: null,
        status: "ACTIVE"
      },
      include: {
        tenant: {
          include: {
            subscriptionPlan: true
          }
        }
      }
    });

    if (!workspace) {
      throw new Error("WORKSPACE_NOT_FOUND");
    }

    const user = await tx.user.findUniqueOrThrow({
      where: {
        id: input.userId
      },
      select: {
        id: true,
        preferences: true
      }
    });

    const roles = await ensureWorkspaceSystemRoles(tx, workspace.id);
    const existingMembership = await tx.membership.findUnique({
      where: {
        userId_workspaceId: {
          userId: input.userId,
          workspaceId: workspace.id
        }
      }
    });

    if (existingMembership) {
      await tx.membership.update({
        where: {
          id: existingMembership.id
        },
        data: {
          roleId: existingMembership.roleId || roles[defaultJoinRoleCode].id,
          status: "ACTIVE",
          acceptedAt: existingMembership.acceptedAt ?? new Date(),
          lastActiveAt: new Date(),
          deletedAt: null
        }
      });
    } else {
      await tx.membership.create({
        data: {
          userId: input.userId,
          workspaceId: workspace.id,
          roleId: roles[defaultJoinRoleCode].id,
          status: "ACTIVE",
          acceptedAt: new Date(),
          lastActiveAt: new Date()
        }
      });
    }

    await tx.user.update({
      where: {
        id: input.userId
      },
      data: {
        preferredLocale: toLocaleCode(input.preferredLocale),
        preferences: mergeUserPreferences(user.preferences, {
          currentWorkspaceId: workspace.id
        })
      }
    });

    return {
      tenantId: workspace.tenantId,
      workspaceId: workspace.id,
      workspaceSlug: workspace.slug
    };
  });
}
