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
    code: "SUPER_ADMIN",
    name: "Super admin",
    description: "Full platform administration across the tenant.",
    permissionKeys: permissionCatalog.map((permission) => permission.key)
  },
  {
    code: "WORKSPACE_ADMIN",
    name: "Workspace admin",
    description: "Operational owner of the workspace and team access.",
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
      "settings.manage"
    ]
  },
  {
    code: "ARCHITECT",
    name: "Architect",
    description: "Owns process, application, and data mapping.",
    permissionKeys: [
      "workspace.view",
      "business-structure.manage",
      "opportunities.manage",
      "scoring.manage",
      "analytics.view",
      "integrations.manage"
    ]
  },
  {
    code: "AI_PORTFOLIO_MANAGER",
    name: "AI portfolio manager",
    description: "Runs intake, prioritization, and governance preparation.",
    permissionKeys: [
      "workspace.view",
      "business-structure.manage",
      "opportunities.manage",
      "scoring.manage",
      "governance.manage",
      "initiatives.manage",
      "analytics.view"
    ]
  },
  {
    code: "BUSINESS_OWNER",
    name: "Business owner",
    description: "Sponsors value hypotheses and delivery outcomes.",
    permissionKeys: [
      "workspace.view",
      "opportunities.manage",
      "analytics.view",
      "initiatives.manage"
    ]
  },
  {
    code: "REVIEWER",
    name: "Reviewer",
    description: "Participates in decisions, approvals, and risk reviews.",
    permissionKeys: [
      "workspace.view",
      "governance.manage",
      "analytics.view",
      "audit.view"
    ]
  },
  {
    code: "VIEWER",
    name: "Viewer",
    description: "Read-only access to portfolio dashboards and summaries.",
    permissionKeys: ["workspace.view", "analytics.view"]
  }
] as const satisfies ReadonlyArray<{
  code: string;
  name: string;
  description: string;
  permissionKeys: readonly PermissionKey[];
}>;

export type RoleCode = (typeof systemRoleCatalog)[number]["code"];

export const defaultJoinRoleCode: RoleCode = "VIEWER";
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
