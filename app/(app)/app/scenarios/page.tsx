export const dynamic = "force-dynamic";

import { Plus, BarChart3, TrendingUp, Layers } from "lucide-react";
import { AriaBanner } from "@/components/aria/AriaBanner";
import type { Route } from "next";
import Link from "next/link";

import { scenarioRepo }           from "@/lib/repositories/scenario.repo";
import { requireAnyPermission }  from "@/server/permissions";
import { ScenarioCard } from "@/components/scenarios/ScenarioCard";

// ── Formatters ─────────────────────────────────────────────────────────────────

const fmt = (n: number) =>
  new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(n);

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function ScenariosPage() {
  const { workspace } = await requireAnyPermission(["opportunities.manage", "analytics.view"]);

  const scenarios = await scenarioRepo.findByWorkspace(workspace!.id);

  // Stat computations
  const totalCount = scenarios.length;
  const bestRoi = scenarios.reduce<number | null>((best, s) => {
    if (s.roi === null || s.roi === undefined) return best;
    return best === null ? s.roi : Math.max(best, s.roi);
  }, null);
  const cumulativeInvestment = scenarios.reduce((acc, s) => acc + (s.totalInvestment ?? 0), 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <AriaBanner />
      {/* Header */}
      <div
        style={{
          background: "var(--bg-card)",
          border: "1px solid var(--green-border)",
          borderRadius: "20px",
          padding: "1.75rem 2rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
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
              <Layers size={20} />
            </span>
            <div>
              <h1 style={{ fontSize: "22px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "4px" }}>
                Scenario Engine
              </h1>
              <p style={{ fontSize: "14px", color: "var(--text-muted)", lineHeight: 1.5 }}>
                Modélisez et comparez vos scénarios de transformation IA avec leur impact financier.
              </p>
            </div>
          </div>

          <Link
            href={"/app/scenarios/new" as Route}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              height: "38px",
              padding: "0 18px",
              borderRadius: "12px",
              background: "var(--green)",
              color: "#fff",
              fontSize: "13px",
              fontWeight: 600,
              textDecoration: "none",
              border: "none",
              cursor: "pointer",
              flexShrink: 0,
            }}
          >
            <Plus size={15} />
            Nouveau scénario
          </Link>
        </div>
      </div>

      {/* Stat cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem" }}>
        <StatCard
          icon={<Layers size={18} />}
          label="Total scénarios"
          value={String(totalCount)}
        />
        <StatCard
          icon={<TrendingUp size={18} />}
          label="Meilleur ROI"
          value={bestRoi !== null ? `${bestRoi.toFixed(1)} %` : "—"}
          valueColor={bestRoi !== null ? (bestRoi >= 0 ? "var(--green)" : "var(--red)") : undefined}
        />
        <StatCard
          icon={<BarChart3 size={18} />}
          label="Investi total cumulé"
          value={fmt(cumulativeInvestment)}
        />
      </div>

      {/* Grid of cards */}
      {scenarios.length === 0 ? (
        <EmptyState />
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: "1rem",
          }}
        >
          {scenarios.map((s) => (
            <ScenarioCard
              key={s.id}
              id={s.id}
              title={s.title}
              description={s.description}
              status={s.status as "draft" | "active" | "archived"}
              totalInvestment={s.totalInvestment}
              totalExpectedGain={s.totalExpectedGain}
              roi={s.roi}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function StatCard({
  icon,
  label,
  value,
  valueColor,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  valueColor?: string;
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
        gap: "8px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--text-muted)" }}>
        {icon}
        <span style={{ fontSize: "12px", fontWeight: 500, color: "var(--text-muted)" }}>{label}</span>
      </div>
      <p
        style={{
          fontSize: "24px",
          fontWeight: 700,
          color: valueColor ?? "var(--text-primary)",
          lineHeight: 1,
        }}
      >
        {value}
      </p>
    </div>
  );
}

function EmptyState() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "12px",
        borderRadius: "16px",
        border: "2px dashed var(--border)",
        padding: "4rem 2rem",
        textAlign: "center",
      }}
    >
      <div
        style={{
          width: "48px",
          height: "48px",
          borderRadius: "50%",
          background: "var(--bg-hover)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--text-muted)",
        }}
      >
        <Layers size={22} />
      </div>
      <p style={{ fontSize: "15px", fontWeight: 600, color: "var(--text-secondary)" }}>
        Aucun scénario créé
      </p>
      <p style={{ fontSize: "13px", color: "var(--text-muted)", maxWidth: "360px", lineHeight: 1.55 }}>
        Créez votre premier scénario pour modéliser l'impact financier de vos projets IA et comparer
        différentes stratégies d'investissement.
      </p>
      <Link
        href={"/app/scenarios/new" as Route}
        style={{
          marginTop: "8px",
          display: "inline-flex",
          alignItems: "center",
          gap: "6px",
          height: "36px",
          padding: "0 18px",
          borderRadius: "10px",
          background: "var(--green-dim)",
          border: "1px solid var(--green-border)",
          color: "var(--green)",
          fontSize: "13px",
          fontWeight: 600,
          textDecoration: "none",
        }}
      >
        <Plus size={14} />
        Créer un scénario
      </Link>
    </div>
  );
}
