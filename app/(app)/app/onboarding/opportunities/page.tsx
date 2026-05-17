import { redirect } from "next/navigation";
import type { Route } from "next";

import { getCurrentWorkspaceContext } from "@/lib/current-workspace";
import { SECTOR_CONFIG } from "@/lib/onboarding/sector-config";
import { ONBOARDING_SECTORS } from "@/lib/onboarding/sector-mapping";
import type { Sector, CompanySize } from "@/lib/onboarding/sector-config";

import { OpportunitiesSelector } from "./OpportunitiesSelector";

export const dynamic = "force-dynamic";

export default async function OnboardingOpportunitiesPage() {
  const { workspace } = await getCurrentWorkspaceContext({ requireMembership: true });
  if (!workspace?.id) redirect("/app/onboarding/sector" as Route);

  const sectorCode  = workspace.sectorCode ?? "";
  const companySize = (workspace.companySize ?? "pme") as CompanySize;

  // Map from new onboarding sector code to legacy code used in SECTOR_CONFIG
  const sectorMapping = ONBOARDING_SECTORS.find((s) => s.code === sectorCode);
  const legacyCode = sectorMapping?.legacyCode ?? sectorCode;

  const sectorCfg = SECTOR_CONFIG[legacyCode as Sector];
  const opportunities = sectorCfg?.opportunities ?? [];

  // Limit by company size
  const bySize = sectorCfg?.bySize?.[companySize];
  const limit = bySize?.oppCount ?? 3;
  const topOpps = opportunities.slice(0, limit);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
      <div>
        <h1 style={{ fontSize: 26, fontWeight: 900, color: "var(--text-primary)", margin: 0 }}>
          Vos premières opportunités IA
        </h1>
        <p style={{ fontSize: 14, color: "var(--text-muted)", marginTop: 6 }}>
          Basées sur votre secteur{sectorCfg ? ` (${sectorCfg.label})` : ""}, voici les opportunités
          d&apos;automatisation les plus courantes. Créez celles qui correspondent à votre réalité.
        </p>
      </div>

      <div style={{
        background: "var(--bg-card)",
        border: "1.5px solid var(--border)",
        borderRadius: 16,
        padding: "28px 24px",
      }}>
        <OpportunitiesSelector opportunities={topOpps} />
      </div>

      <p style={{ fontSize: 12, color: "var(--text-muted)", textAlign: "center" }}>
        Étape 4 / 5 — Vous pourrez créer d&apos;autres opportunités depuis le module Opportunités.
      </p>
    </div>
  );
}
