export const permissionCatalog = [
  { key: "workspace.view", name: "View workspace" },
  { key: "workspace.manage", name: "Manage workspace" },
  { key: "users.manage", name: "Manage users" },
  { key: "roles.manage", name: "Manage roles" },
  { key: "business-structure.manage", name: "Manage business structure" },
  { key: "opportunities.manage", name: "Manage opportunities" },
  { key: "scoring.manage", name: "Manage scoring" },
  { key: "governance.manage", name: "Manage governance" },
  { key: "initiatives.manage", name: "Manage initiatives" },
  { key: "analytics.view", name: "View analytics" },
  { key: "audit.view", name: "View audit trail" },
  { key: "settings.manage", name: "Manage settings" },
  { key: "integrations.manage", name: "Manage integrations" },
  { key: "billing.manage", name: "Manage billing" }
] as const;

export type PermissionKey = (typeof permissionCatalog)[number]["key"];

export const systemRoleCatalog = [
  {
    code: "WORKSPACE_ADMIN",
    name: "Workspace Admin",
    description: "Operational owner of the workspace — manages team, settings and billing.",
    permissionKeys: [
      "workspace.view",
      "workspace.manage",
      "users.manage",
      "roles.manage",
      "business-structure.manage",
      "opportunities.manage",
      "scoring.manage",
      "governance.manage",
      "initiatives.manage",
      "analytics.view",
      "audit.view",
      "settings.manage",
      "integrations.manage",
      "billing.manage"
    ]
  },
  {
    code: "ENTERPRISE_ARCHITECT",
    name: "Enterprise Architect",
    description: "Owns process, application and data mapping — technical authority for the transformation.",
    permissionKeys: [
      "workspace.view",
      "business-structure.manage",
      "opportunities.manage",
      "scoring.manage",
      "governance.manage",
      "analytics.view",
      "audit.view",
      "integrations.manage"
    ]
  },
  {
    code: "TRANSFORMATION_MANAGER",
    name: "Transformation Manager",
    description: "Drives intake, prioritization, governance and value tracking for the AI portfolio.",
    permissionKeys: [
      "workspace.view",
      "business-structure.manage",
      "opportunities.manage",
      "scoring.manage",
      "governance.manage",
      "initiatives.manage",
      "analytics.view"
    ]
  }
] as const satisfies ReadonlyArray<{
  code: string;
  name: string;
  description: string;
  permissionKeys: readonly PermissionKey[];
}>;

export type RoleCode = (typeof systemRoleCatalog)[number]["code"];

export const defaultJoinRoleCode: RoleCode = "TRANSFORMATION_MANAGER";
export const defaultWorkspaceOwnerRoleCode: RoleCode = "WORKSPACE_ADMIN";

export function isPermissionKey(value: string): value is PermissionKey {
  return permissionCatalog.some((permission) => permission.key === value);
}

export function isRoleCode(value: string): value is RoleCode {
  return systemRoleCatalog.some((role) => role.code === value);
}

export function getRoleDefinition(roleCode: string | null | undefined) {
  if (!roleCode || !isRoleCode(roleCode)) {
    return null;
  }

  return systemRoleCatalog.find((role) => role.code === roleCode) ?? null;
}

export function getPermissionKeysForRole(roleCode: string | null | undefined): PermissionKey[] {
  const definition = getRoleDefinition(roleCode);
  return definition ? [...definition.permissionKeys] : [];
}

export function hasPermission(
  permissions: readonly string[] | null | undefined,
  permission: PermissionKey
) {
  return Boolean(permissions?.includes(permission));
}

export function hasAnyPermission(
  permissions: readonly string[] | null | undefined,
  requiredPermissions: readonly PermissionKey[]
) {
  return requiredPermissions.some((permission) => hasPermission(permissions, permission));
}

export function hasEveryPermission(
  permissions: readonly string[] | null | undefined,
  requiredPermissions: readonly PermissionKey[]
) {
  return requiredPermissions.every((permission) => hasPermission(permissions, permission));
}

export function hasRole(
  currentRole: string | null | undefined,
  expectedRole: RoleCode | readonly RoleCode[]
) {
  const roles = Array.isArray(expectedRole) ? expectedRole : [expectedRole];
  return currentRole ? roles.includes(currentRole as RoleCode) : false;
}
