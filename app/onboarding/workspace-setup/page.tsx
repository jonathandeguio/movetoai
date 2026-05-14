import type { Route } from "next";
import { redirect } from "next/navigation";

import { WorkspaceSetupWizard } from "@/components/onboarding/WorkspaceSetupWizard";
import { requireAuthenticatedUser } from "@/server/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function WorkspaceSetupPage() {
  const user = await requireAuthenticatedUser();

  // If user already has an active workspace → go to app
  const existingMembership = await prisma.membership.findFirst({
    where: { userId: user.id, status: "ACTIVE", deletedAt: null },
    select: { id: true },
  });
  if (existingMembership) {
    redirect("/app" as Route);
  }

  return (
    <main style={{
      minHeight: "100vh",
      background: "var(--bg-secondary)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      padding: "3rem 1rem 5rem",
    }}>
      {/* Logo */}
      <div style={{ marginBottom: "2.5rem", textAlign: "center" }}>
        <span style={{
          fontFamily: "var(--font-display)",
          fontSize: 26,
          fontWeight: 800,
          color: "var(--text-primary)",
          letterSpacing: "-0.02em",
        }}>
          blue<span style={{ color: "var(--green)" }}>pilot</span>
          <span style={{ color: "var(--text-muted)", fontSize: 22 }}>.ai</span>
        </span>
        <div style={{ marginTop: 6, fontSize: 13, color: "var(--text-muted)" }}>
          Configuration de votre espace de travail
        </div>
      </div>

      <WorkspaceSetupWizard
        userId={user.id}
        locale={user.preferredLocale}
        userName={user.name ?? user.email ?? ""}
      />
    </main>
  );
}
