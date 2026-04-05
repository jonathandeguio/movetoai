import type { DefaultSession } from "next-auth";

import type { Locale } from "@/lib/i18n/config";
import type { PermissionKey, RoleCode } from "@/lib/rbac";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      id: string;
      status: string;
      preferredLocale: Locale;
      needsOnboarding: boolean;
      currentWorkspaceId: string | null;
      currentWorkspaceName: string | null;
      currentWorkspaceSlug: string | null;
      tenantId: string | null;
      planType: string | null;
      planName: string | null;
      roleId: string | null;
      roleCode: RoleCode | null;
      roleName: string | null;
      permissions: PermissionKey[];
    };
  }

  interface User {
    preferredLocale?: Locale;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    userStatus?: string;
    preferredLocale?: Locale;
    needsOnboarding?: boolean;
    currentWorkspaceId?: string | null;
    currentWorkspaceName?: string | null;
    currentWorkspaceSlug?: string | null;
    tenantId?: string | null;
    planType?: string | null;
    planName?: string | null;
    roleId?: string | null;
    roleCode?: RoleCode | null;
    roleName?: string | null;
    permissions?: PermissionKey[];
  }
}
