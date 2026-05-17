import { Server, GitBranch, Shield, Layers, ArrowRight } from "lucide-react";
import Link from "next/link";

import { AriaBanner } from "@/components/aria/AriaBanner";

import { getArchitectDashboardData } from "@/modules/dashboard/architect/server/get-dashboard-data";

export const dynamic = "force-dynamic";

const LIFECYCLE_LABELS: Record<string, string> = {
  adopt:    "Adopt",
  trial:    "Trial",
  emerging: "Emerging",
  hold:     "Hold",
  phaseout: "Phase-out",
};

function lifecycleColor(key: string): string {
  if (key === "adopt")    return "var(--green)";
  if (key === "phaseout") return "var(--red)";
  if (key === "hold")     return "var(--amber)";
  return "var(--blue)";
}

export default async function EnterpriseArchitectDashboardPage() {
  const { workspace, data } = await getArchitectDashboardData();
  if (!workspace || !data) return null;

  const { counts, techRadar } = data;
  const stateMap = Object.fromEntries(techRadar.map((t) => [t.state, t.count]));

  const stats = [
    { icon: Server,    label: "Applications",    value: counts.applications,          href: "/app/knowledge/applications", color: "var(--blue)"   },
    { icon: Layers,    label: "Capacités",        value: counts.capabilities,          href: "/app/knowledge/capabilities", color: "var(--green)"  },
    { icon: GitBranch, label: "Processus",        value: counts.processes,             href: "/app/processes",              color: "var(--purple)" },
    { icon: Shield,    label: "Décisions archi.", value: counts.architectureDecisions, href: "/app/insights/tech-radar",    color: "var(--red)"    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
      <AriaBanner />
      {/* Header */}
      <div>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
          Tableau de bord — Architecte d&apos;entreprise
        </h1>
        <p style={{ fontSize: 14, color: "var(--text-muted)", marginTop: 4 }}>
          Vue d&apos;ensemble de l&apos;architecture, des capacités et du patrimoine applicatif
        </p>
      </div>

      {/* KPI grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 12 }}>
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href as Parameters<typeof Link>[0]["href"]}
            style={{ textDecoration: "none" }}
          >
            <div style={{
              padding: "18px 20px", borderRadius: 12,
              border: "1.5px solid var(--border)", background: "var(--bg-card)",
              cursor: "pointer", transition: "border-color 0.15s",
            }}>
              <stat.icon style={{ width: 20, height: 20, color: stat.color, marginBottom: 10 }} />
              <div style={{ fontSize: 28, fontWeight: 800, color: "var(--text-primary)", lineHeight: 1 }}>
                {stat.value}
              </div>
              <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>{stat.label}</div>
            </div>
          </Link>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {/* Tech radar overview */}
        <div style={{ padding: "20px 24px", borderRadius: 14, border: "1.5px solid var(--border)", background: "var(--bg-card)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: "var(--text-primary)" }}>
              Tech Radar
            </h2>
            <Link
              href={"/app/insights/tech-radar" as Parameters<typeof Link>[0]["href"]}
              style={{ fontSize: 12, color: "var(--text-muted)", textDecoration: "none", display: "flex", alignItems: "center", gap: 4 }}
            >
              Voir tout <ArrowRight style={{ width: 12, height: 12 }} />
            </Link>
          </div>
          {counts.technologies === 0 ? (
            <p style={{ fontSize: 13, color: "var(--text-muted)" }}>
              Aucune technologie cartographiée.{" "}
              <Link href={"/app/insights/tech-radar" as Parameters<typeof Link>[0]["href"]} style={{ color: "var(--blue)" }}>
                Commencer →
              </Link>
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {Object.entries(LIFECYCLE_LABELS).map(([key, label]) => {
                const count = stateMap[key] ?? 0;
                const pct   = counts.technologies > 0 ? Math.round((count / counts.technologies) * 100) : 0;
                return (
                  <div key={key} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 12, color: "var(--text-secondary)", width: 64 }}>{label}</span>
                    <div style={{ flex: 1, height: 6, borderRadius: 3, background: "var(--bg-primary)" }}>
                      <div style={{ width: `${pct}%`, height: "100%", borderRadius: 3, background: lifecycleColor(key) }} />
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-primary)", width: 24, textAlign: "right" }}>
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Architecture decisions */}
        <div style={{ padding: "20px 24px", borderRadius: 14, border: "1.5px solid var(--border)", background: "var(--bg-card)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: "var(--text-primary)" }}>
              Décisions architecture
            </h2>
            <Link
              href={"/app/insights/tech-radar" as Parameters<typeof Link>[0]["href"]}
              style={{ fontSize: 12, color: "var(--text-muted)", textDecoration: "none", display: "flex", alignItems: "center", gap: 4 }}
            >
              ADR <ArrowRight style={{ width: 12, height: 12 }} />
            </Link>
          </div>
          <div style={{ fontSize: 36, fontWeight: 800, color: "var(--text-primary)", lineHeight: 1, marginBottom: 4 }}>
            {counts.architectureDecisions}
          </div>
          <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 16 }}>
            Architecture Decision Records
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {[
              { href: "/app/knowledge/applications",  label: "Cartographier les applications" },
              { href: "/app/knowledge/capabilities",   label: "Valider les capacités"          },
              { href: "/app/insights/dependency-graph", label: "Graphe de dépendances"         },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href as Parameters<typeof Link>[0]["href"]}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "8px 12px", borderRadius: 8,
                  border: "1px solid var(--border)", background: "var(--bg-primary)",
                  textDecoration: "none", fontSize: 13, color: "var(--text-secondary)",
                  fontWeight: 500,
                }}
              >
                {item.label}
                <ArrowRight style={{ width: 13, height: 13, color: "var(--text-muted)" }} />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
