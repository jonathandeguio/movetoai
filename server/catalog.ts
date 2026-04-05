import "server-only";

import type { LimitPeriod, LimitScope, Prisma, PrismaClient, PlanType } from "@prisma/client";
import { FeatureKey } from "@prisma/client";

import { permissionCatalog, systemRoleCatalog, type RoleCode } from "@/lib/rbac";

type DbClient = PrismaClient | Prisma.TransactionClient;

const subscriptionPlanCatalog = [
  {
    planType: "FREE" as const,
    name: "Free",
    description: "Freemium entry point for process-first AI opportunity discovery.",
    displayOrder: 1,
    features: [
      ["CUSTOM_SCORING", "Custom scoring", false],
      ["ADVANCED_WORKFLOWS", "Advanced workflows", false],
      ["ADVANCED_EXPORTS", "Advanced exports", false],
      ["PORTFOLIO_GOVERNANCE", "Portfolio governance", false],
      ["ADVANCED_GOVERNANCE", "Advanced governance", false],
      ["MULTI_BUSINESS_UNIT", "Multiple business units", false],
      ["SSO", "SSO", false],
      ["SCIM", "SCIM", false],
      ["FULL_AUDIT", "Full audit trail", false],
      ["API_ACCESS", "API access", false],
      ["CENTRALIZED_ADMIN", "Centralized admin", false]
    ] as const,
    limits: [
      ["WORKSPACES", "TENANT", "TOTAL", 1, "One workspace included"],
      ["USERS", "WORKSPACE", "TOTAL", 5, "Five users included"],
      ["PROCESSES", "WORKSPACE", "TOTAL", 15, "Up to fifteen processes"],
      ["OPPORTUNITIES", "WORKSPACE", "TOTAL", 30, "Up to thirty AI opportunities"],
      ["AI_REQUESTS_PER_MONTH", "WORKSPACE", "MONTHLY", 30, "Thirty AI requests per month"],
      ["BUSINESS_UNITS", "WORKSPACE", "TOTAL", 1, "Single business unit"]
    ] as const
  },
  {
    planType: "PRO" as const,
    name: "Pro",
    description: "Shared portfolio workspace with governance and collaboration.",
    displayOrder: 2,
    features: [
      ["CUSTOM_SCORING", "Custom scoring", true],
      ["ADVANCED_WORKFLOWS", "Advanced workflows", true],
      ["ADVANCED_EXPORTS", "Advanced exports", true],
      ["PORTFOLIO_GOVERNANCE", "Portfolio governance", true],
      ["ADVANCED_GOVERNANCE", "Advanced governance", false],
      ["MULTI_BUSINESS_UNIT", "Multiple business units", false],
      ["SSO", "SSO", false],
      ["SCIM", "SCIM", false],
      ["FULL_AUDIT", "Full audit trail", false],
      ["API_ACCESS", "API access", false],
      ["CENTRALIZED_ADMIN", "Centralized admin", false]
    ] as const,
    limits: [
      ["WORKSPACES", "TENANT", "TOTAL", 3, "Three workspaces included"],
      ["USERS", "WORKSPACE", "TOTAL", 50, "Fifty users included"],
      ["PROCESSES", "WORKSPACE", "TOTAL", 150, "Up to one hundred fifty processes"],
      ["OPPORTUNITIES", "WORKSPACE", "TOTAL", 300, "Up to three hundred opportunities"],
      ["AI_REQUESTS_PER_MONTH", "WORKSPACE", "MONTHLY", 1500, "Fifteen hundred AI requests per month"],
      ["BUSINESS_UNITS", "WORKSPACE", "TOTAL", 5, "Up to five business units"]
    ] as const
  },
  {
    planType: "ENTERPRISE" as const,
    name: "Enterprise",
    description: "Centralized governance, trust controls, and scale across business units.",
    displayOrder: 3,
    features: [
      ["CUSTOM_SCORING", "Custom scoring", true],
      ["ADVANCED_WORKFLOWS", "Advanced workflows", true],
      ["ADVANCED_EXPORTS", "Advanced exports", true],
      ["PORTFOLIO_GOVERNANCE", "Portfolio governance", true],
      ["ADVANCED_GOVERNANCE", "Advanced governance", true],
      ["MULTI_BUSINESS_UNIT", "Multiple business units", true],
      ["SSO", "SSO", true],
      ["SCIM", "SCIM", true],
      ["FULL_AUDIT", "Full audit trail", true],
      ["API_ACCESS", "API access", true],
      ["CENTRALIZED_ADMIN", "Centralized admin", true]
    ] as const,
    limits: [
      ["WORKSPACES", "TENANT", "TOTAL", 10, "Multi-workspace enterprise tenant"],
      ["USERS", "WORKSPACE", "TOTAL", 250, "Large operating team"],
      ["PROCESSES", "WORKSPACE", "TOTAL", 500, "Portfolio-wide process coverage"],
      ["OPPORTUNITIES", "WORKSPACE", "TOTAL", 1500, "Large opportunity portfolio"],
      ["AI_REQUESTS_PER_MONTH", "WORKSPACE", "MONTHLY", 12000, "High AI request allowance"],
      ["BUSINESS_UNITS", "WORKSPACE", "TOTAL", 50, "Multi-business-unit rollout"]
    ] as const
  }
] as const;

type SubscriptionPlanRecord = Awaited<ReturnType<typeof ensureSubscriptionPlanCatalog>>[PlanType];

function getQuotaWindow(period: LimitPeriod) {
  const now = new Date();

  if (period === "MONTHLY") {
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    end.setMilliseconds(-1);

    return {
      periodStart: start,
      periodEnd: end,
      resetAt: new Date(now.getFullYear(), now.getMonth() + 1, 1)
    };
  }

  return {
    periodStart: now,
    periodEnd: new Date("2099-12-31T23:59:59.999Z"),
    resetAt: null
  };
}

export async function ensureSubscriptionPlanCatalog(db: DbClient) {
  const plans = {} as Record<PlanType, {
    id: string;
    planType: PlanType;
    name: string;
    limits: Array<{
      id: string;
      scope: LimitScope;
      period: LimitPeriod;
      limitKey: string;
      limitValue: number | null;
    }>;
  }>;

  for (const definition of subscriptionPlanCatalog) {
    const plan = await db.subscriptionPlan.upsert({
      where: {
        planType: definition.planType
      },
      update: {
        name: definition.name,
        description: definition.description,
        isPublic: true,
        displayOrder: definition.displayOrder,
        isActive: true
      },
      create: {
        planType: definition.planType,
        name: definition.name,
        description: definition.description,
        isPublic: true,
        displayOrder: definition.displayOrder,
        isActive: true
      }
    });

    for (const [featureKey, label, enabled] of definition.features) {
      await db.planFeature.upsert({
        where: {
          planId_featureKey: {
            planId: plan.id,
            featureKey: featureKey as FeatureKey
          }
        },
        update: {
          label,
          enabled
        },
        create: {
          planId: plan.id,
          featureKey: featureKey as FeatureKey,
          label,
          enabled
        }
      });
    }

    for (const [limitKey, scope, period, limitValue, description] of definition.limits) {
      await db.planLimit.upsert({
        where: {
          planId_limitKey_scope_period: {
            planId: plan.id,
            limitKey,
            scope,
            period
          }
        },
        update: {
          limitValue,
          description
        },
        create: {
          planId: plan.id,
          limitKey,
          scope,
          period,
          limitValue,
          description
        }
      });
    }

    const hydrated = await db.subscriptionPlan.findUniqueOrThrow({
      where: {
        id: plan.id
      },
      include: {
        limits: true
      }
    });

    plans[definition.planType] = {
      id: hydrated.id,
      planType: hydrated.planType,
      name: hydrated.name,
      limits: hydrated.limits.map((limit) => ({
        id: limit.id,
        scope: limit.scope,
        period: limit.period,
        limitKey: limit.limitKey,
        limitValue: limit.limitValue
      }))
    };
  }

  return plans;
}

export async function ensurePermissionCatalog(db: DbClient) {
  const permissions = {} as Record<string, { id: string; key: string }>;

  for (const definition of permissionCatalog) {
    const permission = await db.permission.upsert({
      where: {
        key: definition.key
      },
      update: {
        name: definition.name,
        description: `${definition.name} permission for BluePilot AI.`
      },
      create: {
        key: definition.key,
        name: definition.name,
        description: `${definition.name} permission for BluePilot AI.`
      }
    });

    permissions[definition.key] = {
      id: permission.id,
      key: permission.key
    };
  }

  return permissions;
}

export async function ensureWorkspaceSystemRoles(db: DbClient, workspaceId: string) {
  const permissions = await ensurePermissionCatalog(db);
  const roles = {} as Record<RoleCode, { id: string; code: RoleCode; name: string }>;

  for (const definition of systemRoleCatalog) {
    const role = await db.role.upsert({
      where: {
        workspaceId_code: {
          workspaceId,
          code: definition.code
        }
      },
      update: {
        name: definition.name,
        description: definition.description,
        isSystem: true,
        deletedAt: null,
        permissions: {
          deleteMany: {},
          create: definition.permissionKeys.map((permissionKey) => ({
            permissionId: permissions[permissionKey].id
          }))
        }
      },
      create: {
        workspaceId,
        code: definition.code,
        name: definition.name,
        description: definition.description,
        isSystem: true,
        permissions: {
          create: definition.permissionKeys.map((permissionKey) => ({
            permissionId: permissions[permissionKey].id
          }))
        }
      }
    });

    roles[definition.code] = {
      id: role.id,
      code: role.code as RoleCode,
      name: role.name
    };
  }

  return roles;
}

export async function initializeUsageQuotas(
  db: DbClient,
  input: {
    tenantId: string;
    workspaceId: string;
    plan: SubscriptionPlanRecord;
  }
) {
  for (const limit of input.plan.limits) {
    const window = getQuotaWindow(limit.period);

    await db.usageQuota.create({
      data: {
        tenantId: input.tenantId,
        workspaceId: limit.scope === "WORKSPACE" ? input.workspaceId : null,
        planLimitId: limit.id,
        limitKey: limit.limitKey as never,
        scope: limit.scope,
        period: limit.period,
        periodStart: window.periodStart,
        periodEnd: window.periodEnd,
        allowedValue: limit.limitValue,
        consumedValue: 0,
        resetAt: window.resetAt
      }
    });
  }
}
