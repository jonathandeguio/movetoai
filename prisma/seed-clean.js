/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Clean up test seed data — Move to AI
 *
 * Usage:
 *   node --env-file=.env.test prisma/seed-clean.js
 *   npm run db:seed:clean
 */

const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const TEST_SLUGS = [
  "technolab-industries-test",
  "boutiquemode-sas-test",
  "groupe-alpha-test",
  "leroy-consulting-test",
];

const TEST_EMAILS = [
  "admin@movetoai-test.dev",
  "ceo@movetoai-test.dev",
  "rh@movetoai-test.dev",
  "dsi@movetoai-test.dev",
  "consultant@movetoai-test.dev",
  "collab@movetoai-test.dev",
  "superadmin@movetoai-test.dev",
];

async function main() {
  console.log("🧹 Cleaning up Move to AI test data...\n");

  const testWorkspaces = await prisma.workspace.findMany({
    where: { tenant: { slug: { in: TEST_SLUGS } } },
    select: { id: true },
  });
  const wsIds = testWorkspaces.map((w) => w.id);

  if (wsIds.length > 0) {
    // ProcessDiagram doit être supprimé avant UseCase (FK)
    await prisma.processDiagram.deleteMany({
      where: { useCase: { workspaceId: { in: wsIds } } },
    });
    await prisma.useCase.deleteMany({ where: { workspaceId: { in: wsIds } } });
    console.log("  ✅ Use cases + diagrams deleted.");

    await prisma.opportunity.deleteMany({ where: { workspaceId: { in: wsIds } } });
    console.log("  ✅ Opportunities deleted.");

    await prisma.opportunityType.deleteMany({ where: { workspaceId: { in: wsIds } } });
    await prisma.process.deleteMany({ where: { workspaceId: { in: wsIds } } });
    await prisma.capability.deleteMany({ where: { workspaceId: { in: wsIds } } });
    await prisma.domain.deleteMany({ where: { workspaceId: { in: wsIds } } });
    console.log("  ✅ Business structure deleted.");

    await prisma.membership.deleteMany({ where: { workspaceId: { in: wsIds } } });
    await prisma.role.deleteMany({ where: { workspaceId: { in: wsIds } } });
    console.log("  ✅ Memberships and roles deleted.");

    await prisma.workspace.deleteMany({ where: { id: { in: wsIds } } });
    console.log("  ✅ Workspaces deleted.");
  }

  await prisma.tenant.deleteMany({ where: { slug: { in: TEST_SLUGS } } });
  console.log("  ✅ Tenants deleted.");

  await prisma.user.deleteMany({ where: { email: { in: TEST_EMAILS } } });
  console.log("  ✅ Users deleted.");

  console.log("\n🎉 Test data cleaned up successfully.");
}

main()
  .catch((e) => {
    console.error("❌ Clean failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
