import { redirect } from "next/navigation";
import type { Route } from "next";

import { getCurrentWorkspaceContext } from "@/lib/current-workspace";
import { prisma } from "@/lib/prisma";
import { CERT_CATALOGUE_EXTENDED } from "@/lib/seed/certification-catalogue";
import { CERTIFICATION_CATALOG } from "@/lib/seed/certifications";
import { PROCESS_CATALOGUE } from "@/lib/seed/process-catalogue";

import { ProcessSelector, type ProcessGroup } from "./ProcessSelector";

export const dynamic = "force-dynamic";

// Flatten process catalogue into a quick lookup
function buildProcessLookup(): Map<string, { code: string; name: string; domain: string; description: string }> {
  const map = new Map<string, { code: string; name: string; domain: string; description: string }>();

  for (const l1 of PROCESS_CATALOGUE) {
    for (const l2 of l1.children ?? []) {
      for (const l3 of l2.children ?? []) {
        map.set(l3.code, {
          code: l3.code,
          name: l3.name_fr,
          domain: l1.name_fr,
          description: l3.description_fr,
        });
      }
    }
  }

  return map;
}

export default async function OnboardingProcessesPage() {
  const { workspace } = await getCurrentWorkspaceContext({ requireMembership: true });
  if (!workspace?.id) redirect("/app/onboarding/sector" as Route);

  // Get workspace certifications
  const workspaceCerts = await prisma.workspaceCertification.findMany({
    where: { workspaceId: workspace.id },
    include: { catalog: { select: { code: true, name: true } } },
  });

  // Get already imported catalog processes
  const importedProcesses = await prisma.process.findMany({
    where: { workspaceId: workspace.id, deletedAt: null, catalogCode: { not: null } },
    select: { catalogCode: true },
  });
  const alreadyImportedCodes = importedProcesses
    .map((p) => p.catalogCode)
    .filter((c): c is string => c !== null);

  const processLookup = buildProcessLookup();

  // Build process groups per certification
  const groups: ProcessGroup[] = [];
  const seenProcessCodes = new Set<string>();

  for (const wc of workspaceCerts) {
    const catalogCode = wc.catalog.code;
    const entry = CERT_CATALOGUE_EXTENDED.find((e) => e.code === catalogCode);
    if (!entry) continue;

    const certDisplay = CERTIFICATION_CATALOG.find((c) => c.code === catalogCode);
    const processes: ProcessGroup["processes"] = [];

    for (const procCode of entry.linkedProcessCodes) {
      if (seenProcessCodes.has(procCode)) continue;
      seenProcessCodes.add(procCode);

      const proc = processLookup.get(procCode);
      if (!proc) continue;
      processes.push(proc);
    }

    if (processes.length > 0) {
      groups.push({
        certCode: catalogCode,
        certName: certDisplay?.shortName ?? catalogCode,
        processes,
      });
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
      <div>
        <h1 style={{ fontSize: 26, fontWeight: 900, color: "var(--text-primary)", margin: 0 }}>
          Importez vos processus métier
        </h1>
        <p style={{ fontSize: 14, color: "var(--text-muted)", marginTop: 6 }}>
          Ces processus sont associés à vos certifications. Sélectionnez ceux que vous souhaitez
          cartographier dans votre espace de travail.
        </p>
      </div>

      <div style={{
        background: "var(--bg-card)",
        border: "1.5px solid var(--border)",
        borderRadius: 16,
        padding: "28px 24px",
      }}>
        <ProcessSelector
          groups={groups}
          alreadyImportedCodes={alreadyImportedCodes}
        />
      </div>

      <p style={{ fontSize: 12, color: "var(--text-muted)", textAlign: "center" }}>
        Étape 3 / 5 — Les processus importés seront disponibles dans votre cartographie métier.
      </p>
    </div>
  );
}
