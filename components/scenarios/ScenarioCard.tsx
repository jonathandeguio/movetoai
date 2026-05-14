"use client";

import type { Route } from "next";
import Link from "next/link";

// ── Types ─────────────────────────────────────────────────────────────────────

type ScenarioCardProps = {
  id: string;
  title: string;
  description?: string | null;
  status: "draft" | "active" | "archived";
  totalInvestment?: number | null;
  totalExpectedGain?: number | null;
  roi?: number | null;
};

// ── Helpers ───────────────────────────────────────────────────────────────────

const fmt = (n: number) =>
  new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(n);

const STATUS_CONFIG: Record<
  "draft" | "active" | "archived",
  { label: string; color: string; bg: string; border: string }
> = {
  draft: {
    label: "Brouillon",
    color: "var(--amber)",
    bg: "var(--amber-dim)",
    border: "var(--amber)",
  },
  active: {
    label: "Actif",
    color: "var(--green)",
    bg: "var(--green-dim)",
    border: "var(--green-border)",
  },
  archived: {
    label: "Archivé",
    color: "var(--text-muted)",
    bg: "var(--bg-hover)",
    border: "var(--border)",
  },
};

// ── Component ─────────────────────────────────────────────────────────────────

export function ScenarioCard({
  id,
  title,
  description,
  status,
  totalInvestment,
  totalExpectedGain,
  roi,
}: ScenarioCardProps) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.draft;
  const invest = totalInvestment ?? 0;
  const gain = totalExpectedGain ?? 0;
  const roiVal = roi ?? null;

  // ROI progress bar: clamp between -100% and +200%
  const roiClamped = roiVal !== null ? Math.max(-100, Math.min(200, roiVal)) : 0;
  const barWidth = roiVal !== null ? `${Math.abs(roiClamped) / 2}%` : "0%"; // relative to 0 mid
  const barPositive = roiVal !== null && roiVal >= 0;

  return (
    <Link
      href={`/app/scenarios/${id}` as Route}
      style={{
        display: "block",
        textDecoration: "none",
      }}
    >
      <article
        style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border)",
          borderRadius: "16px",
          padding: "1.25rem",
          transition: "border-color 0.2s, box-shadow 0.2s",
          cursor: "pointer",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          gap: "12px",
        }}
        onMouseEnter={(e) => {
          const el = e.currentTarget as HTMLElement;
          el.style.borderColor = "var(--green-border)";
          el.style.boxShadow = "0 0 0 3px var(--green-dim)";
        }}
        onMouseLeave={(e) => {
          const el = e.currentTarget as HTMLElement;
          el.style.borderColor = "var(--border)";
          el.style.boxShadow = "none";
        }}
      >
        {/* Top row */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "8px" }}>
          <h3
            style={{
              fontSize: "15px",
              fontWeight: 600,
              color: "var(--text-primary)",
              lineHeight: 1.35,
              flex: 1,
            }}
          >
            {title}
          </h3>
          <span
            style={{
              flexShrink: 0,
              fontSize: "11px",
              fontWeight: 600,
              color: cfg.color,
              background: cfg.bg,
              border: `1px solid ${cfg.border}`,
              borderRadius: "999px",
              padding: "2px 10px",
            }}
          >
            {cfg.label}
          </span>
        </div>

        {/* Description */}
        {description && (
          <p
            style={{
              fontSize: "13px",
              color: "var(--text-muted)",
              lineHeight: 1.55,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {description}
          </p>
        )}

        {/* Metrics */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "8px",
            marginTop: "auto",
          }}
        >
          <div
            style={{
              background: "var(--bg-hover)",
              borderRadius: "10px",
              padding: "8px 10px",
            }}
          >
            <p style={{ fontSize: "10px", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "2px" }}>
              Investissement
            </p>
            <p style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)" }}>
              {fmt(invest)}
            </p>
          </div>

          <div
            style={{
              background: "var(--bg-hover)",
              borderRadius: "10px",
              padding: "8px 10px",
            }}
          >
            <p style={{ fontSize: "10px", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "2px" }}>
              Gain attendu
            </p>
            <p style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)" }}>
              {fmt(gain)}
            </p>
          </div>
        </div>

        {/* ROI row */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
            <span style={{ fontSize: "12px", fontWeight: 500, color: "var(--text-muted)" }}>
              ROI global
            </span>
            <span
              style={{
                fontSize: "14px",
                fontWeight: 700,
                color:
                  roiVal === null
                    ? "var(--text-muted)"
                    : roiVal >= 0
                    ? "var(--green)"
                    : "var(--red)",
              }}
            >
              {roiVal !== null ? `${roiVal.toFixed(1)} %` : "—"}
            </span>
          </div>

          {/* Progress bar */}
          <div
            style={{
              height: "6px",
              borderRadius: "3px",
              background: "var(--bg-hover)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                width: roiVal !== null ? `${Math.min(100, Math.abs(roiClamped / 2))}%` : "0%",
                borderRadius: "3px",
                background: barPositive ? "var(--green)" : "var(--red)",
                transition: "width 0.4s ease",
              }}
            />
          </div>
        </div>
      </article>
    </Link>
  );
}

