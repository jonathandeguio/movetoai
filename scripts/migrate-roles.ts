/**
 * Data migration script — 7 roles → 4 roles
 *
 * Run once after the schema migration:
 *   npx tsx scripts/migrate-roles.ts
 *
 * What it does:
 * 1. Backfills `User.userFunction` from `User.preferences.userFunction`
 *    using the legacy → new mapping below.
 * 2. Sets `User.isPlatformAdmin = true` for users whose workspace role
 *    is SUPER_ADMIN and removes that membership (SUPER_ADMIN no longer
 *    exists as a workspace role).
 * 3. Renames workspace roles in the Role table:
 *    SUPER_ADMIN           → removed (isPlatformAdmin flag instead)
 *    ARCHITECT             → ENTERPRISE_ARCHITECT
 *    AI_PORTFOLIO_MANAGER  → TRANSFORMATION_MANAGER
 *    BUSINESS_OWNER        → TRANSFORMATION_MANAGER
 *    REVIEWER              → TRANSFORMATION_MANAGER
 *    VIEWER                → TRANSFORMATION_MANAGER
 * 4. Merges permissions: ENTERPRISE_ARCHITECT and TRANSFORMATION_MANAGER
 *    get the permission sets defined in the new systemRoleCatalog.
 */

import { PrismaClient } from "@prisma/client";
import { systemRoleCatalog, defaultJoinRoleCode } from "../lib/rbac";

const prisma = new PrismaClient();

const LEGACY_FUNCTION_MAP: Record<string, string> = {
  executive:      "transformation_manager",
  ai_lead:        "transformation_manager",
  business_owner: "transformation_manager",
  other:          "transformation_manager",
  data_it:        "enterprise_architect",
  it_manager:     "enterprise_architect",
  consultant:     "enterprise_architect",
};

const LEGACY_ROLE_MAP: Record<string, string> = {
  ARCHITECT:            "ENTERPRISE_ARCHITECT",
  AI_PORTFOLIO_MANAGER: "TRANSFORMATION_MANAGER",
  BUSINESS_OWNER:       "TRANSFORMATION_MANAGER",
  REVIEWER:             "TRANSFORMATION_MANAGER",
  VIEWER:               "TRANSFORMATION_MANAGER",
};

async function main() {
  console.log("=== Role migration: 7 → 4 ===\n");

  // ── 1. Backfill User.userFunction ──────────────────────────────────────────
  console.log("Step 1: Backfilling User.userFunction from preferences JSON…");
  const users = await prisma.user.findMany({
    where: { userFunction: null },
    select: { id: true, preferences: true },
  });

  let backfilled = 0;
  for (const user of users) {
    const prefs = user.preferences as Record<string, unknown> | null;
    const raw = typeof prefs?.userFunction === "string" ? prefs.userFunction : null;
    if (!raw) continue;
    const fn = LEGACY_FUNCTION_MAP[raw] ?? raw;
    const validFns = ["transformation_manager", "enterprise_architect"];
    if (!validFns.includes(fn)) continue;
    await prisma.user.update({
      where: { id: user.id },
      data: { userFunction: fn },
    });
    backfilled++;
  }
  console.log(`  ✓ Backfilled ${backfilled} users.\n`);

  // ── 2. Promote SUPER_ADMIN members to isPlatformAdmin ─────────────────────
  console.log("Step 2: Promoting SUPER_ADMIN role members to isPlatformAdmin…");
  const superAdminRoles = await prisma.role.findMany({
    where: { code: "SUPER_ADMIN" },
    include: { memberships: { select: { userId: true, id: true } } },
  });

  let promoted = 0;
  for (const role of superAdminRoles) {
    for (const membership of role.memberships) {
      await prisma.user.update({
        where: { id: membership.userId },
        data: { isPlatformAdmin: true },
      });
      await prisma.membership.delete({ where: { id: membership.id } });
      promoted++;
    }
    // Delete the SUPER_ADMIN role itself (and its permissions via cascade)
    await prisma.role.delete({ where: { id: role.id } });
  }
  console.log(`  ✓ Promoted ${promoted} users; deleted SUPER_ADMIN role(s).\n`);

  // ── 3. Rename / merge legacy workspace roles ───────────────────────────────
  console.log("Step 3: Renaming legacy workspace roles…");
  const allRoles = await prisma.role.findMany();

  for (const role of allRoles) {
    const newCode = LEGACY_ROLE_MAP[role.code];
    if (!newCode) continue;

    const newDef = systemRoleCatalog.find((r) => r.code === newCode);
    if (!newDef) continue;

    // Check if a role with the new code already exists in this workspace
    const existing = await prisma.role.findFirst({
      where: { code: newCode, workspaceId: role.workspaceId },
    });

    if (existing) {
      // Migrate memberships to the existing role and delete the old one
      await prisma.membership.updateMany({
        where: { roleId: role.id },
        data: { roleId: existing.id },
      });
      await prisma.rolePermission.deleteMany({ where: { roleId: role.id } });
      await prisma.role.delete({ where: { id: role.id } });
      console.log(`  ✓ Merged ${role.code} → ${newCode} (workspace ${role.workspaceId})`);
    } else {
      // Rename in place
      await prisma.role.update({
        where: { id: role.id },
        data: {
          code: newCode,
          name: newDef.name,
          description: newDef.description,
        },
      });
      console.log(`  ✓ Renamed ${role.code} → ${newCode} (workspace ${role.workspaceId})`);
    }
  }
  console.log();

  // ── 4. Sync permissions for all renamed roles ──────────────────────────────
  console.log("Step 4: Syncing permissions for all workspace roles…");
  const updatedRoles = await prisma.role.findMany();

  for (const role of updatedRoles) {
    const def = systemRoleCatalog.find((r) => r.code === role.code);
    if (!def) continue;

    // Rebuild permissions from scratch
    await prisma.rolePermission.deleteMany({ where: { roleId: role.id } });

    const permissions = await prisma.permission.findMany({
      where: { key: { in: [...def.permissionKeys] } },
    });

    if (permissions.length > 0) {
      await prisma.rolePermission.createMany({
        data: permissions.map((p) => ({ roleId: role.id, permissionId: p.id })),
        skipDuplicates: true,
      });
    }
    console.log(`  ✓ Synced permissions for ${role.code} (workspace ${role.workspaceId})`);
  }

  console.log("\n=== Migration complete ===");
}

main()
  .catch((e) => {
    console.error("Migration failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
