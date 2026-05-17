import { TrendingUp, Target, Zap, BarChart3, Calendar, ArrowRight, CheckCircle } from "lucide-react";
import Link from "next/link";

import { AriaBanner } from "@/components/aria/AriaBanner";

import { getTransformationDashboardData } from "@/modules/dashboard/transformation/server/get-dashboard-data";

export const dynamic = "force-dynamic";

const STATUS_COLOR: Record<string, string> = {
  DRAFT:       "var(--text-muted)",
  IDENTIFIED:  "var(--blue)",
  ASSESSING:   "var(--amber)",
  APPROVED:    "var(--green)",
  IN_PROGRESS: "var(--purple)",
  LIVE:        "var(--green)",
  PLANNED:     "var(--blue)",
  AT_RISK:     "var(--red)",
  COMPLETED:   "var(--green)",
};

export default async function TransformationManagerDashboardPage() {
  const { workspace, data } = await getTransformationDashboardData();
  if (!workspace || !data) return null;

  const { portfolio, initiatives, topP0Opps, recentInitiatives } = data;
  const ws = data.workspace;

  const portfolioCards = [
    { label: "Opportunités totales", value: portfolio.total,      color: "var(--text-primary)" },
    { label: "Approuvées",           value: portfolio.approved,   color: "var(--green)"        },
    { label: "En cours",             value: portfolio.inProgress, color: "var(--purple)"       },
    { label: "En production",        value: portfolio.live,       color: "var(--green)"        },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
      <AriaBanner />
      {/* Header */}
      <div>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
          Tableau de bord — Responsable Transformation
        </h1>
        <p style={{ fontSize: 14, color: "var(--text-muted)", marginTop: 4 }}>
          Portfolio IA, initiatives et valeur réalisée pour <strong>{ws.name}</strong>
          {ws.horizon && (
            <span style={{ marginLeft: 8, fontSize: 12, color: "var(--text-muted)" }}>
              • Horizon : {ws.horizon.replace("_", " ")}
            </span>
          )}
        </p>
      </div>

      {/* Maturity banner */}
      {ws.aiMaturity && (
        <div style={{
          padding: "12px 18px", borderRadius: 12,
          border: "1.5px solid var(--purple-border)", background: "var(--purple-dim)",
          display: "flex", alignItems: "center", gap: 12,
        }}>
          <TrendingUp style={{ width: 18, height: 18, color: "var(--purple)" }} />
          <span style={{ fontSize: 14, color: "var(--purple)", fontWeight: 600 }}>
            Maturité IA : {ws.aiMaturity}
          </span>
          <Link
            href={"/app/insights/maturity" as Parameters<typeof Link>[0]["href"]}
            style={{ marginLeft: "auto", fontSize: 12, color: "var(--text-muted)", textDecoration: "none", display: "flex", alignItems: "center", gap: 4 }}
          >
            Évaluation complète <ArrowRight style={{ width: 12, height: 12 }} />
          </Link>
        </div>
      )}

      {/* Portfolio KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
        {portfolioCards.map((item) => (
          <div key={item.label} style={{
            padding: "18px 20px", borderRadius: 12,
            border: "1.5px solid var(--border)", background: "var(--bg-card)",
          }}>
            <div style={{ fontSize: 30, fontWeight: 800, color: item.color, lineHeight: 1 }}>
              {item.value}
            </div>
            <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>{item.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: 20 }}>
        {/* Top P0 opportunities */}
        <div style={{ padding: "20px 24px", borderRadius: 14, border: "1.5px solid var(--border)", background: "var(--bg-card)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: "var(--text-primary)" }}>
              🔴 Priorité P0 — Top opportunités
            </h2>
            <Link
              href={"/app/opportunities" as Parameters<typeof Link>[0]["href"]}
              style={{ fontSize: 12, color: "var(--text-muted)", textDecoration: "none", display: "flex", alignItems: "center", gap: 4 }}
            >
              Tout voir <ArrowRight style={{ width: 12, height: 12 }} />
            </Link>
          </div>
          {topP0Opps.length === 0 ? (
            <div style={{ textAlign: "center", padding: "20px 0" }}>
              <Zap style={{ width: 32, height: 32, color: "var(--text-muted)", margin: "0 auto 8px" }} />
              <p style={{ fontSize: 13, color: "var(--text-muted)" }}>
                Aucune opportunité P0 identifiée.{" "}
                <Link href={"/app/opportunities/new" as Parameters<typeof Link>[0]["href"]} style={{ color: "var(--blue)" }}>
                  Ajouter →
                </Link>
              </p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {topP0Opps.map((opp) => (
                <Link
                  key={opp.id}
                  href={`/app/opportunities/${opp.id}` as Parameters<typeof Link>[0]["href"]}
                  style={{
                    display: "flex", alignItems: "flex-start", justifyContent: "space-between",
                    padding: "10px 12px", borderRadius: 8,
                    border: "1px solid var(--border)", background: "var(--bg-primary)",
                    textDecoration: "none", gap: 12,
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: "var(--text-primary)", lineHeight: 1.3 }}>
                      {opp.title}
                    </div>
                    {opp.gainEstimate && (
                      <div style={{ fontSize: 11, color: "var(--green)", marginTop: 3 }}>
                        {opp.gainEstimate}
                      </div>
                    )}
                  </div>
                  <span style={{
                    fontSize: 11, fontWeight: 600, padding: "2px 7px", borderRadius: 999,
                    background: "var(--bg-card)", color: STATUS_COLOR[opp.status] ?? "var(--text-muted)",
                    border: `1px solid ${STATUS_COLOR[opp.status] ?? "var(--border)"}`,
                    whiteSpace: "nowrap",
                  }}>
                    {opp.status}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Initiatives */}
        <div style={{ padding: "20px 24px", borderRadius: 14, border: "1.5px solid var(--border)", background: "var(--bg-card)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: "var(--text-primary)" }}>
              Initiatives
            </h2>
            <Link
              href={"/app/roadmap" as Parameters<typeof Link>[0]["href"]}
              style={{ fontSize: 12, color: "var(--text-muted)", textDecoration: "none", display: "flex", alignItems: "center", gap: 4 }}
            >
              Roadmap <ArrowRight style={{ width: 12, height: 12 }} />
            </Link>
          </div>

          <div style={{ display: "flex", gap: 16, marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: 28, fontWeight: 800, color: "var(--text-primary)", lineHeight: 1 }}>
                {initiatives.total}
              </div>
              <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Total</div>
            </div>
            <div>
              <div style={{ fontSize: 28, fontWeight: 800, color: "var(--purple)", lineHeight: 1 }}>
                {initiatives.inProgress}
              </div>
              <div style={{ fontSize: 11, color: "var(--text-muted)" }}>En cours</div>
            </div>
          </div>

          {recentInitiatives.length === 0 ? (
            <p style={{ fontSize: 13, color: "var(--text-muted)" }}>
              Aucune initiative.{" "}
              <Link href={"/app/roadmap" as Parameters<typeof Link>[0]["href"]} style={{ color: "var(--blue)" }}>
                Créer →
              </Link>
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
              {recentInitiatives.map((init) => (
                <div key={init.id} style={{
                  display: "flex", alignItems: "center", gap: 8,
                  padding: "8px 10px", borderRadius: 8,
                  border: "1px solid var(--border)", background: "var(--bg-primary)",
                }}>
                  <CheckCircle
                    style={{
                      width: 14, height: 14, flexShrink: 0,
                      color: init.status === "COMPLETED" ? "var(--green)" : (STATUS_COLOR[init.status] ?? "var(--text-muted)"),
                    }}
                  />
                  <span style={{ fontSize: 13, color: "var(--text-primary)", flex: 1, lineHeight: 1.3 }}>
                    {init.name}
                  </span>
                  <span style={{
                    fontSize: 10, fontWeight: 600, padding: "1px 6px", borderRadius: 999,
                    color: STATUS_COLOR[init.status] ?? "var(--text-muted)",
                    background: "var(--bg-card)",
                  }}>
                    {init.status}
                  </span>
                </div>
              ))}
            </div>
          )}

          <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid var(--border)" }}>
            <Link
              href={"/app/analytics" as Parameters<typeof Link>[0]["href"]}
              style={{
                display: "flex", alignItems: "center", gap: 8,
                padding: "9px 12px", borderRadius: 8,
                border: "1.5px solid var(--green-border)", background: "var(--green-dim)",
                textDecoration: "none", fontSize: 13, fontWeight: 600, color: "var(--green)",
              }}
            >
              <BarChart3 style={{ width: 15, height: 15 }} />
              Analytics & ROI
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
