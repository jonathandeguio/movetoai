import Link from "next/link";
import type { Route } from "next";
import { redirect } from "next/navigation";

import { getCurrentWorkspaceContext } from "@/lib/current-workspace";
import { prisma } from "@/lib/prisma";
import { ONBOARDING_SECTORS } from "@/lib/onboarding/sector-mapping";

export const dynamic = "force-dynamic";

export default async function OnboardingCompletePage() {
  const { workspace } = await getCurrentWorkspaceContext({ requireMembership: true });
  if (!workspace?.id) redirect("/app/onboarding/sector" as Route);

  // Mark onboarding as completed
  await prisma.workspace.update({
    where: { id: workspace.id },
    data: { onboardingCompleted: true },
  });

  // Gather summary stats
  const [certCount, processCount, opportunityCount] = await Promise.all([
    prisma.workspaceCertification.count({ where: { workspaceId: workspace.id } }),
    prisma.process.count({ where: { workspaceId: workspace.id, deletedAt: null } }),
    prisma.opportunity.count({ where: { workspaceId: workspace.id } }),
  ]);

  const sectorLabel = ONBOARDING_SECTORS.find((s) => s.code === workspace.sectorCode)?.label
    ?? workspace.sectorCode
    ?? "Non défini";

  const SIZE_LABELS: Record<string, string> = {
    tpe: "TPE (< 10 salariés)",
    pme: "PME (10 – 250 salariés)",
    eti: "ETI (250 – 5 000 salariés)",
    ge:  "GE (> 5 000 salariés)",
  };
  const sizeLabel = workspace.companySize ? SIZE_LABELS[workspace.companySize] ?? workspace.companySize : "Non défini";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32, alignItems: "center", textAlign: "center" }}>
      {/* Celebration */}
      <div>
        <div style={{ fontSize: 64, marginBottom: 16 }}>🎉</div>
        <h1 style={{ fontSize: 28, fontWeight: 900, color: "var(--text-primary)", margin: 0 }}>
          Votre espace est configuré !
        </h1>
        <p style={{ fontSize: 15, color: "var(--text-muted)", marginTop: 8, maxWidth: 480, margin: "8px auto 0" }}>
          Move to AI est prêt à vous accompagner dans votre transformation IA.
          Voici un résumé de ce que nous avons configuré ensemble.
        </p>
      </div>

      {/* Summary card */}
      <div style={{
        background: "var(--bg-card)",
        border: "1.5px solid var(--border)",
        borderRadius: 16,
        padding: "28px 32px",
        width: "100%",
        textAlign: "left",
      }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", marginBottom: 20 }}>
          Résumé de la configuration
        </h2>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 16 }}>
          {[
            { icon: "🏭", label: "Secteur",             value: sectorLabel },
            { icon: "📏", label: "Taille",               value: sizeLabel   },
            { icon: "🛡️", label: "Certifications",      value: `${certCount} déclarée${certCount !== 1 ? "s" : ""}` },
            { icon: "⚙️", label: "Processus importés",  value: `${processCount} processus`  },
            { icon: "💡", label: "Opportunités IA",      value: `${opportunityCount} créée${opportunityCount !== 1 ? "s" : ""}` },
          ].map((item) => (
            <div key={item.label} style={{
              padding: "16px 18px",
              borderRadius: 12,
              border: "1px solid var(--border)",
              background: "var(--bg-primary)",
            }}>
              <div style={{ fontSize: 22, marginBottom: 6 }}>{item.icon}</div>
              <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 2 }}>{item.label}</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>{item.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Next steps */}
      <div style={{
        background: "var(--bg-card)",
        border: "1.5px solid var(--border)",
        borderRadius: 16,
        padding: "24px 32px",
        width: "100%",
        textAlign: "left",
      }}>
        <h2 style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", marginBottom: 16 }}>
          Prochaines étapes recommandées
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {[
            { href: "/app/compliance",          label: "Compléter votre tableau de conformité", desc: "Ajoutez des dates, responsables et statuts pour vos certifications" },
            { href: "/app/knowledge/processes", label: "Enrichir vos processus",                desc: "Ajoutez des points de douleur, applications et KPIs" },
            { href: "/app/opportunities",       label: "Prioriser vos opportunités IA",         desc: "Qualifiez et priorisez pour identifier les quick wins" },
          ].map((step) => (
            <Link
              key={step.href}
              href={step.href as Route}
              style={{
                display: "flex", alignItems: "flex-start", gap: 12,
                padding: "12px 14px", borderRadius: 10,
                border: "1px solid var(--border)", background: "var(--bg-primary)",
                textDecoration: "none", transition: "border-color 0.15s",
              }}
            >
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>{step.label}</div>
                <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>{step.desc}</div>
              </div>
              <span style={{ marginLeft: "auto", color: "var(--text-muted)", fontSize: 16 }}>→</span>
            </Link>
          ))}
        </div>
      </div>

      {/* CTA */}
      <Link
        href={"/app" as Route}
        style={{
          padding: "14px 40px", borderRadius: 12,
          background: "var(--blue)", color: "#fff",
          fontSize: 15, fontWeight: 800,
          textDecoration: "none", display: "inline-block",
        }}
      >
        Accéder au tableau de bord →
      </Link>

      <p style={{ fontSize: 12, color: "var(--text-muted)" }}>
        Étape 5 / 5 — Configuration terminée
      </p>
    </div>
  );
}
