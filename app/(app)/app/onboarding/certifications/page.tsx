import { redirect } from "next/navigation";
import type { Route } from "next";

import { getCurrentWorkspaceContext } from "@/lib/current-workspace";
import { getCertsBySector } from "@/lib/certifications/sector-mapper";
import { prisma } from "@/lib/prisma";

import { CertSelector } from "./CertSelector";

export const dynamic = "force-dynamic";

export default async function OnboardingCertificationsPage() {
  const { workspace } = await getCurrentWorkspaceContext({ requireMembership: true });

  if (!workspace?.id) redirect("/app/onboarding/sector" as Route);

  const sectorCode  = workspace.sectorCode  ?? "";
  const companySize = workspace.companySize ?? "pme";

  const [{ mandatory, recommended }, existingCerts] = await Promise.all([
    getCertsBySector(sectorCode, companySize),
    prisma.workspaceCertification.findMany({
      where: { workspaceId: workspace.id },
      select: { catalogId: true },
    }),
  ]);

  const existingCertCatalogIds = existingCerts.map((c) => c.catalogId);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
      <div>
        <h1 style={{ fontSize: 26, fontWeight: 900, color: "var(--text-primary)", margin: 0 }}>
          Vos certifications
        </h1>
        <p style={{ fontSize: 14, color: "var(--text-muted)", marginTop: 6 }}>
          Sélectionnez les certifications que vous avez obtenues, en cours ou visées. Les certifications
          obligatoires pour votre secteur sont identifiées en rouge.
        </p>
      </div>

      <div style={{
        background: "var(--bg-card)",
        border: "1.5px solid var(--border)",
        borderRadius: 16,
        padding: "28px 24px",
      }}>
        <CertSelector
          mandatory={mandatory}
          recommended={recommended}
          existingCertCatalogIds={existingCertCatalogIds}
        />
      </div>

      <p style={{ fontSize: 12, color: "var(--text-muted)", textAlign: "center" }}>
        Étape 2 / 5 — Vous pourrez ajouter ou modifier vos certifications depuis le tableau de conformité.
      </p>
    </div>
  );
}
