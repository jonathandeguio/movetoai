import { requireAnyPermission } from "@/server/permissions";
import { BriefingPanel } from "@/components/insights/BriefingPanel";

export const dynamic = "force-dynamic";

export default async function BriefingPage() {
  await requireAnyPermission(["analytics.view", "opportunities.manage"]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div
        style={{
          borderRadius: "1.5rem",
          border: "1px solid var(--border)",
          background: "var(--bg-card)",
          padding: "2rem",
          boxShadow: "0 1px 4px 0 rgb(0 0 0 / .04)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <span
            style={{
              display: "inline-flex",
              borderRadius: "9999px",
              border: "1px solid var(--amber-dim)",
              background: "var(--amber-dim)",
              padding: "2px 12px",
              fontSize: "0.75rem",
              fontWeight: 600,
              color: "var(--amber)",
            }}
          >
            Insights
          </span>
        </div>
        <h1
          style={{
            marginTop: "0.75rem",
            fontSize: "1.875rem",
            fontWeight: 700,
            color: "var(--text-primary)",
            letterSpacing: "-0.02em",
          }}
        >
          Briefing hebdomadaire IA
        </h1>
        <p
          style={{
            marginTop: "0.5rem",
            maxWidth: "640px",
            fontSize: "0.875rem",
            lineHeight: "1.75",
            color: "var(--text-secondary)",
          }}
        >
          Rapport synthétique généré par IA chaque semaine sur l&apos;avancement de votre
          transformation. Métriques clés, opportunités prioritaires et recommandations actionnables.
        </p>
      </div>

      {/* Briefing panel */}
      <BriefingPanel />
    </div>
  );
}
