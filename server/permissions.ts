import "server-only";

import type { Route } from "next";
import { redirect } from "next/navigation";

import type { PermissionKey, RoleCode } from "@/lib/rbac";
import {
  getPermissionKeysForRole,
  hasAnyPermission,
  hasPermission,
  hasRole
} from "@/lib/rbac";
import { getCurrentWorkspaceContext } from "@/server/auth";

export async function getCurrentPermissionContext() {
  const context = await getCurrentWorkspaceContext({ requireMembership: true });
  const roleCode = context.role?.code ?? null;
  const permissions = getPermissionKeysForRole(roleCode);

  return {
    ...context,
    roleCode,
    permissions
  };
}

export async function canCurrentUser(permission: PermissionKey) {
  const context = await getCurrentPermissionContext();
  return hasPermission(context.permissions, permission);
}

export async function requirePermission(permission: PermissionKey) {
  const context = await getCurrentPermissionContext();

  if (!hasPermission(context.permissions, permission)) {
    redirect("/unauthorized" as Route);
  }

  return context;
}

export async function requireAnyPermission(permissions: readonly PermissionKey[]) {
  const context = await getCurrentPermissionContext();

  if (!hasAnyPermission(context.permissions, permissions)) {
    redirect("/unauthorized" as Route);
  }

  return context;
}

export async function requireRole(role: RoleCode | readonly RoleCode[]) {
  const context = await getCurrentPermissionContext();

  if (!hasRole(context.roleCode, role)) {
    redirect("/unauthorized" as Route);
  }

  return context;
}
