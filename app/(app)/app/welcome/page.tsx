import { redirect } from "next/navigation";
import type { Route } from "next";

import { WelcomeSummary }              from "@/components/onboarding/WelcomeSummary";
import { getCurrentWorkspaceContext }  from "@/server/auth";
import { workspaceRepo }               from "@/lib/repositories/workspace.repo";
import { processRepo }                 from "@/lib/repositories/process.repo";
import { opportunityRepo }             from "@/lib/repositories/opportunity.repo";
import { capabilityRepo }             from "@/lib/repositories/capability.repo";
import type { Sector, CompanySize }    from "@/lib/onboarding/sector-config";

export const dynamic = "force-dynamic";

export default async function WelcomePage() {
  const { user, workspace } = await getCurrentWorkspaceContext({ requireMembership: true });
  if (!workspace) redirect("/onboarding" as Route);

  // Load workspace sector data + settings
  const ws = await workspaceRepo.findById(workspace.id);
  if (!ws) redirect("/app" as Route);

  // Parse seeded counts from settings (stored by createWorkspaceFromOnboarding)
  const settings = (ws.settings as Record<string, unknown> | null) ?? {};
  const certifications = (settings.certifications as unknown[] | null) ?? [];

  // Query actual counts from the DB for accuracy
  const [capCount, procStats, oppCount] = await Promise.all([
    capabilityRepo.countFromCatalog(ws.id),
    processRepo.countStats(ws.id),
    opportunityRepo.countAiDetected(ws.id),
  ]);
  const procCount = procStats.total;

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
      </div>

      <WelcomeSummary
        userName={user.name ?? user.email ?? ""}
        workspaceName={ws.name}
        sector={(ws.sectorCode as Sector | null) ?? null}
        companySize={(ws.companySize as CompanySize | null) ?? null}
        seeded={{
          capabilities:  capCount,
          processes:     procCount,
          opportunities: oppCount,
          certifications: certifications.length,
        }}
      />
    </main>
  );
}
