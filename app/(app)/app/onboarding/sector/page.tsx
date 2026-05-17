import { getCurrentWorkspaceContext } from "@/lib/current-workspace";

import { SectorSelector } from "./SectorSelector";

export const dynamic = "force-dynamic";

export default async function OnboardingSectorPage() {
  const { workspace } = await getCurrentWorkspaceContext({ requireMembership: true });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: 26, fontWeight: 900, color: "var(--text-primary)", margin: 0 }}>
          Configurez votre espace de travail
        </h1>
        <p style={{ fontSize: 14, color: "var(--text-muted)", marginTop: 6 }}>
          Ces informations permettent de pré-configurer les certifications, processus et
          opportunités IA pertinents pour votre organisation.
        </p>
      </div>

      {/* Card */}
      <div style={{
        background: "var(--bg-card)",
        border: "1.5px solid var(--border)",
        borderRadius: 16,
        padding: "28px 24px",
      }}>
        <SectorSelector
          initialSector={workspace?.sectorCode}
          initialSize={workspace?.companySize}
        />
      </div>

      {/* Step info */}
      <p style={{ fontSize: 12, color: "var(--text-muted)", textAlign: "center" }}>
        Étape 1 / 5 — Vous pourrez modifier ces informations plus tard dans les paramètres.
      </p>
    </div>
  );
}
