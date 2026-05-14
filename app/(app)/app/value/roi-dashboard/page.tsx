export const dynamic = "force-dynamic";

import type { Route } from "next";
import Link from "next/link";
import { TrendingUp, CheckCircle } from "lucide-react";

import { useCaseRepo }           from "@/lib/repositories/use-case.repo";
import { governanceRepo }        from "@/lib/repositories/governance.repo";
import { requireAnyPermission }  from "@/server/permissions";

// ── Formatter ─────────────────────────────────────────────────────────────────

const fmt = (n: number) =>
  new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(n);

// ── Types ─────────────────────────────────────────────────────────────────────

type RoiEstimated = {
  netGain?: number;
  roi?: number;
  totalInvestment?: number;
  timeframeMonths?: number;
};

type UseCaseRow = {
  id: string;
  title: string;
  status: string;
  effortDays: number | null;
  roiEstimated: unknown;
  opportunity: { title: string } | null;
};

type BenefitMetricRow = {
  id: string;
  name: string;
  unit: string | null;
  targetValue: number | null;
  currentValue: number | null;
};

// ── Status config ─────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; border: string; pieColor: string }> = {
  backlog: { label: "Backlog", color: "var(--text-muted)", bg: "var(--bg-hover)", border: "var(--border)", pieColor: "#94a3b8" },
  analysis: { label: "Analyse", color: "var(--blue)", bg: "var(--blue-dim)", border: "var(--blue)", pieColor: "#3b82f6" },
  active: { label: "Actif", color: "var(--amber)", bg: "var(--amber-dim)", border: "var(--amber)", pieColor: "#f59e0b" },
  deployed: { label: "Déployé", color: "var(--green)", bg: "var(--green-dim)", border: "var(--green-border)", pieColor: "#22c55e" },
  paused: { label: "Pausé", color: "var(--red)", bg: "var(--red-dim)", border: "var(--red)", pieColor: "#ef4444" },
};

// ── SVG Pie chart ─────────────────────────────────────────────────────────────

function PieChart({ slices }: { slices: { label: string; value: number; color: string }[] }) {
  const total = slices.reduce((acc, s) => acc + s.value, 0);
  if (total === 0) return null;

  const SIZE = 140;
  const R = 56;
  const CX = SIZE / 2;
  const CY = SIZE / 2;

  let startAngle = -Math.PI / 2;
  const paths: { d: string; color: string; label: string; value: number }[] = [];

  for (const slice of slices) {
    if (slice.value === 0) continue;
    const angle = (slice.value / total) * 2 * Math.PI;
    const endAngle = startAngle + angle;
    const x1 = CX + R * Math.cos(startAngle);
    const y1 = CY + R * Math.sin(startAngle);
    const x2 = CX + R * Math.cos(endAngle);
    const y2 = CY + R * Math.sin(endAngle);
    const largeArc = angle > Math.PI ? 1 : 0;

    paths.push({
      d: `M ${CX} ${CY} L ${x1} ${y1} A ${R} ${R} 0 ${largeArc} 1 ${x2} ${y2} Z`,
      color: slice.color,
      label: slice.label,
      value: slice.value,
    });

    startAngle = endAngle;
  }

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "1.5rem", flexWrap: "wrap" }}>
      <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} style={{ flexShrink: 0 }}>
        {paths.map((p, i) => (
          <path key={i} d={p.d} fill={p.color} stroke="var(--bg-card)" strokeWidth={2} />
        ))}
        {/* Center hole */}
        <circle cx={CX} cy={CY} r={R * 0.45} fill="var(--bg-card)" />
        <text
          x={CX}
          y={CY + 1}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="11"
          fontWeight="700"
          fill="var(--text-primary)"
        >
          {total}
        </text>
        <text
          x={CX}
          y={CY + 13}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="8"
          fill="var(--text-muted)"
        >
          total
        </text>
      </svg>

      {/* Legend */}
      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        {paths.map((p, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div
              style={{
                width: "10px",
                height: "10px",
                borderRadius: "3px",
                background: p.color,
                flexShrink: 0,
              }}
            />
            <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
              {p.label}
            </span>
            <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", marginLeft: "auto" }}>
              {p.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function RoiDashboardPage() {
  const { workspace } = await requireAnyPermission(["opportunities.manage", "analytics.view"]);
  const wid = workspace!.id;

  // 1. All use cases with roiEstimated
  const useCasesRaw = (await useCaseRepo.findForRoi(wid)) as unknown as UseCaseRow[];

  // 2. Aggregate KPIs
  let totalGain = 0;
  let totalInvestment = 0;
  let roiSum = 0;
  let roiCount = 0;
  let timelineSum = 0;
  let timelineCount = 0;
  let activeCount = 0;

  const statusBreakdown: Record<string, number> = {};

  const enriched = useCasesRaw.map((uc) => {
    const roi = uc.roiEstimated as RoiEstimated | null;
    const netGain = roi?.netGain ?? 0;
    const invest = roi?.totalInvestment ?? 0;
    const roiPct = roi?.roi ?? null;
    const timeline = roi?.timeframeMonths ?? null;

    totalGain += netGain;
    totalInvestment += invest;
    if (roiPct !== null) { roiSum += roiPct; roiCount++; }
    if (timeline !== null) { timelineSum += timeline; timelineCount++; }
    if (uc.status === "active" || uc.status === "deployed") activeCount++;

    statusBreakdown[uc.status] = (statusBreakdown[uc.status] ?? 0) + 1;

    return { ...uc, netGain, invest, roiPct, timeline };
  });

  const avgRoi = roiCount > 0 ? roiSum / roiCount : null;
  const avgTimeline = timelineCount > 0 ? timelineSum / timelineCount : null;

  // 3. Top 5 by netGain
  const top5 = [...enriched].sort((a, b) => b.netGain - a.netGain).slice(0, 5);

  // 4. Benefit metrics
  const benefitMetricsRaw = await governanceRepo.findBenefitMetrics(wid);
  const benefitMetrics: BenefitMetricRow[] = benefitMetricsRaw.map((m) => ({
    id: m.id,
    name: m.name,
    unit: m.unit,
    targetValue: m.targetValue ? Number(m.targetValue) : null,
    currentValue: m.currentValue ? Number(m.currentValue) : null,
  }));

  // 5. Pie slices
  const pieSlices = Object.entries(statusBreakdown).map(([status, count]) => ({
    label: STATUS_CONFIG[status]?.label ?? status,
    value: count,
    color: STATUS_CONFIG[status]?.pieColor ?? "#94a3b8",
  }));

  // 6. Objectif barre
  const GOAL = 500_000;
  const goalPct = Math.min(100, (totalGain / GOAL) * 100);
  const goalReached = totalGain >= GOAL;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* Header */}
      <div
        style={{
          background: "var(--bg-card)",
          border: "1px solid var(--green-border)",
          borderRadius: "20px",
          padding: "1.75rem 2rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <span
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "44px",
              height: "44px",
              borderRadius: "14px",
              background: "var(--green-dim)",
              color: "var(--green)",
              flexShrink: 0,
            }}
          >
            <TrendingUp size={20} />
          </span>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
              <h1 style={{ fontSize: "22px", fontWeight: 700, color: "var(--text-primary)" }}>
                ROI Dashboard
              </h1>
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: 600,
                  color: "var(--green)",
                  background: "var(--green-dim)",
                  border: "1px solid var(--green-border)",
                  borderRadius: "999px",
                  padding: "2px 10px",
                }}
              >
                Valeur
              </span>
            </div>
            <p style={{ fontSize: "14px", color: "var(--text-muted)", lineHeight: 1.5 }}>
              Vue consolidée du retour sur investissement de vos initiatives IA.
            </p>
          </div>
        </div>
      </div>

      {/* KPI Bar */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem" }}>
        <KpiCard
          label="Gain total estimé"
          value={fmt(totalGain)}
          valueColor={totalGain > 0 ? "var(--green)" : undefined}
        />
        <KpiCard
          label="Investi total"
          value={fmt(totalInvestment)}
        />
        <KpiCard
          label="ROI moyen"
          value={avgRoi !== null ? `${avgRoi.toFixed(1)} %` : "—"}
          valueColor={avgRoi !== null ? (avgRoi >= 0 ? "var(--green)" : "var(--red)") : undefined}
          sub={avgTimeline !== null ? `Délai moyen ${avgTimeline.toFixed(0)} mois` : undefined}
        />
        <KpiCard
          label="Use cases actifs"
          value={String(activeCount)}
          sub={`sur ${useCasesRaw.length} total`}
        />
      </div>

      {/* Middle row: pie + goal */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
        {/* Pie chart */}
        <div
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border)",
            borderRadius: "16px",
            padding: "1.25rem 1.5rem",
          }}
        >
          <h2 style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-primary)", marginBottom: "1rem" }}>
            Répartition par statut
          </h2>
          {pieSlices.length > 0 ? (
            <PieChart slices={pieSlices} />
          ) : (
            <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>Aucun use case avec ROI estimé.</p>
          )}
        </div>

        {/* Goal progress */}
        <div
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border)",
            borderRadius: "16px",
            padding: "1.25rem 1.5rem",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            gap: "1rem",
          }}
        >
          <h2 style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-primary)" }}>
            Progression vers l'objectif
          </h2>

          {goalReached ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "12px 16px",
                borderRadius: "12px",
                background: "var(--green-dim)",
                border: "1px solid var(--green-border)",
              }}
            >
              <CheckCircle size={20} style={{ color: "var(--green)", flexShrink: 0 }} />
              <div>
                <p style={{ fontSize: "14px", fontWeight: 700, color: "var(--green)" }}>
                  Objectif 500 000 € atteint ✓
                </p>
                <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>
                  Gain total estimé : {fmt(totalGain)}
                </p>
              </div>
            </div>
          ) : (
            <>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <span style={{ fontSize: "13px", color: "var(--text-muted)" }}>
                  {fmt(totalGain)} / {fmt(GOAL)}
                </span>
                <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)" }}>
                  {goalPct.toFixed(1)} %
                </span>
              </div>
              <div
                style={{
                  height: "12px",
                  borderRadius: "6px",
                  background: "var(--bg-hover)",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${goalPct}%`,
                    borderRadius: "6px",
                    background: "var(--green)",
                    transition: "width 0.5s ease",
                  }}
                />
              </div>
              <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                Il manque {fmt(GOAL - totalGain)} pour atteindre l'objectif de {fmt(GOAL)}.
              </p>
            </>
          )}
        </div>
      </div>

      {/* Top 5 table */}
      <div
        style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border)",
          borderRadius: "16px",
          overflow: "hidden",
        }}
      >
        <div style={{ padding: "1rem 1.5rem", borderBottom: "1px solid var(--border)" }}>
          <h2 style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-primary)" }}>
            Top 5 use cases par gain net
          </h2>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
            <thead>
              <tr style={{ background: "var(--bg-hover)" }}>
                {["Use case", "Statut", "Gain net", "ROI", "Délai"].map((h) => (
                  <th
                    key={h}
                    style={{
                      padding: "10px 16px",
                      textAlign: "left",
                      fontSize: "11px",
                      fontWeight: 600,
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                      color: "var(--text-muted)",
                      borderBottom: "1px solid var(--border)",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {top5.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    style={{
                      padding: "2.5rem",
                      textAlign: "center",
                      color: "var(--text-muted)",
                      fontSize: "14px",
                    }}
                  >
                    Aucun use case avec ROI estimé.
                  </td>
                </tr>
              )}
              {top5.map((uc) => {
                const cfg = STATUS_CONFIG[uc.status] ?? STATUS_CONFIG.backlog;
                return (
                  <tr
                    key={uc.id}
                    style={{ borderBottom: "1px solid var(--border)" }}
                  >
                    <td style={{ padding: "10px 16px" }}>
                      <Link
                        href={`/app/use-cases/${uc.id}` as Route}
                        style={{ textDecoration: "none" }}
                      >
                        <p
                          style={{
                            fontSize: "13px",
                            fontWeight: 500,
                            color: "var(--text-primary)",
                            transition: "color 0.15s",
                          }}
                          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "var(--green)"; }}
                          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "var(--text-primary)"; }}
                        >
                          {uc.title}
                        </p>
                        {uc.opportunity && (
                          <p style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>
                            ↳ {uc.opportunity.title}
                          </p>
                        )}
                      </Link>
                    </td>
                    <td style={{ padding: "10px 16px" }}>
                      <span
                        style={{
                          fontSize: "11px",
                          fontWeight: 600,
                          color: cfg.color,
                          background: cfg.bg,
                          border: `1px solid ${cfg.border}`,
                          borderRadius: "999px",
                          padding: "2px 10px",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {cfg.label}
                      </span>
                    </td>
                    <td style={{ padding: "10px 16px", whiteSpace: "nowrap" }}>
                      <span
                        style={{
                          fontSize: "13px",
                          fontWeight: 700,
                          color: uc.netGain > 0 ? "var(--green)" : "var(--text-primary)",
                        }}
                      >
                        {fmt(uc.netGain)}
                      </span>
                    </td>
                    <td style={{ padding: "10px 16px", whiteSpace: "nowrap" }}>
                      <span
                        style={{
                          fontSize: "13px",
                          fontWeight: 600,
                          color:
                            uc.roiPct === null
                              ? "var(--text-muted)"
                              : uc.roiPct >= 0
                              ? "var(--green)"
                              : "var(--red)",
                        }}
                      >
                        {uc.roiPct !== null ? `${uc.roiPct.toFixed(1)} %` : "—"}
                      </span>
                    </td>
                    <td style={{ padding: "10px 16px", whiteSpace: "nowrap" }}>
                      <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
                        {uc.timeline !== null ? `${uc.timeline} mois` : "—"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Benefit Metrics */}
      {benefitMetrics.length > 0 && (
        <div
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border)",
            borderRadius: "16px",
            padding: "1.25rem 1.5rem",
          }}
        >
          <h2 style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-primary)", marginBottom: "1rem" }}>
            Métriques de valeur
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {benefitMetrics.map((metric) => {
              const current = metric.currentValue ?? 0;
              const target = metric.targetValue ?? 0;
              const pct = target > 0 ? Math.min(100, (current / target) * 100) : 0;

              return (
                <div key={metric.id}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "6px" }}>
                    <span style={{ fontSize: "13px", fontWeight: 500, color: "var(--text-primary)" }}>
                      {metric.name}
                    </span>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--green)" }}>
                        {current.toLocaleString("fr-FR")}{metric.unit ? ` ${metric.unit}` : ""}
                      </span>
                      <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                        / {target.toLocaleString("fr-FR")}{metric.unit ? ` ${metric.unit}` : ""}
                      </span>
                    </div>
                  </div>
                  <div
                    style={{
                      height: "8px",
                      borderRadius: "4px",
                      background: "var(--bg-hover)",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        width: `${pct}%`,
                        borderRadius: "4px",
                        background: "var(--green)",
                        transition: "width 0.4s ease",
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ── KPI Card ──────────────────────────────────────────────────────────────────

function KpiCard({
  label,
  value,
  valueColor,
  sub,
}: {
  label: string;
  value: string;
  valueColor?: string;
  sub?: string;
}) {
  return (
    <div
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border)",
        borderRadius: "14px",
        padding: "1rem 1.25rem",
        display: "flex",
        flexDirection: "column",
        gap: "6px",
      }}
    >
      <p style={{ fontSize: "12px", fontWeight: 500, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
        {label}
      </p>
      <p style={{ fontSize: "22px", fontWeight: 700, color: valueColor ?? "var(--text-primary)", lineHeight: 1 }}>
        {value}
      </p>
      {sub && (
        <p style={{ fontSize: "11px", color: "var(--text-muted)" }}>{sub}</p>
      )}
    </div>
  );
}
