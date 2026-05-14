"use client";

import { useState, useRef } from "react";
import type { Route } from "next";
import Link from "next/link";
import { X, ExternalLink } from "lucide-react";

export interface AssessmentApp {
  id: string;
  name: string;
  vendor: string | null;
  lifecycleState: string | null;
  criticality: string | null;
  annualCost: number | null;
  userCount: number | null;
  aiReadinessScore: number | null;
  techDebt: number;
  businessValue: number;
  quadrant: "invest" | "renovate" | "maintain" | "retire";
}

interface Tooltip {
  x: number;
  y: number;
  app: AssessmentApp;
}

const QUADRANT_META = {
  invest: {
    label: "Investir",
    color: "var(--green)",
    bg: "var(--green-dim)",
    border: "var(--green-border)",
    desc: "Valeur élevée · Dette faible",
  },
  renovate: {
    label: "Rénover",
    color: "var(--amber)",
    bg: "var(--amber-dim)",
    border: "var(--amber-border)",
    desc: "Valeur élevée · Dette élevée",
  },
  maintain: {
    label: "Maintenir",
    color: "var(--text-muted)",
    bg: "var(--bg-hover)",
    border: "var(--border)",
    desc: "Valeur faible · Dette faible",
  },
  retire: {
    label: "Retirer",
    color: "var(--red)",
    bg: "var(--red-dim)",
    border: "var(--red-dim)",
    desc: "Valeur faible · Dette élevée",
  },
} as const;

const CRITICALITY_LABELS: Record<string, string> = {
  critical: "Critique",
  high: "Élevée",
  medium: "Moyenne",
  low: "Faible",
};

const LIFECYCLE_LABELS: Record<string, string> = {
  plan: "Planifié",
  active: "Actif",
  tolerate: "Toléré",
  phaseout: "En retrait",
  retire: "Retiré",
};

// SVG dimensions
const W = 600;
const H = 500;
const PAD = 60;
const PLOT_W = W - PAD * 2;
const PLOT_H = H - PAD * 2;

function mapX(techDebt: number) {
  return PAD + (techDebt / 100) * PLOT_W;
}

function mapY(businessValue: number) {
  // Y axis: top = high value
  return PAD + ((100 - businessValue) / 100) * PLOT_H;
}

function circleRadius(annualCost: number | null): number {
  if (!annualCost) return 12;
  if (annualCost > 500000) return 22;
  if (annualCost > 100000) return 17;
  if (annualCost > 20000) return 14;
  return 10;
}

interface Props {
  apps: AssessmentApp[];
}

export function AssessmentMatrix({ apps }: Props) {
  const [tooltip, setTooltip] = useState<Tooltip | null>(null);
  const [selected, setSelected] = useState<AssessmentApp | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  function handleMouseEnter(e: React.MouseEvent<SVGCircleElement>, app: AssessmentApp) {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;
    setTooltip({
      x: e.clientX - rect.left + 12,
      y: e.clientY - rect.top - 10,
      app,
    });
  }

  function handleMouseMove(e: React.MouseEvent<SVGCircleElement>) {
    if (!tooltip) return;
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;
    setTooltip((prev) =>
      prev ? { ...prev, x: e.clientX - rect.left + 12, y: e.clientY - rect.top - 10 } : null
    );
  }

  function handleMouseLeave() {
    setTooltip(null);
  }

  return (
    <div className="relative flex gap-4">
      {/* Matrix */}
      <div className="relative flex-1 min-w-0">
        <svg
          ref={svgRef}
          width="100%"
          viewBox={`0 0 ${W} ${H}`}
          className="rounded-xl border border-[--border] bg-[--bg-primary] overflow-visible"
          style={{ maxWidth: W }}
        >
          {/* Quadrant backgrounds */}
          {/* Haut gauche — Investir */}
          <rect
            x={PAD}
            y={PAD}
            width={PLOT_W / 2}
            height={PLOT_H / 2}
            fill="var(--green-dim)"
            opacity="0.35"
          />
          {/* Haut droite — Rénover */}
          <rect
            x={PAD + PLOT_W / 2}
            y={PAD}
            width={PLOT_W / 2}
            height={PLOT_H / 2}
            fill="var(--amber-dim)"
            opacity="0.35"
          />
          {/* Bas gauche — Maintenir */}
          <rect
            x={PAD}
            y={PAD + PLOT_H / 2}
            width={PLOT_W / 2}
            height={PLOT_H / 2}
            fill="var(--bg-hover)"
            opacity="0.5"
          />
          {/* Bas droite — Retirer */}
          <rect
            x={PAD + PLOT_W / 2}
            y={PAD + PLOT_H / 2}
            width={PLOT_W / 2}
            height={PLOT_H / 2}
            fill="var(--red-dim)"
            opacity="0.35"
          />

          {/* Axis border */}
          <rect
            x={PAD}
            y={PAD}
            width={PLOT_W}
            height={PLOT_H}
            fill="none"
            stroke="var(--border)"
            strokeWidth="1"
          />

          {/* Dividing lines */}
          <line
            x1={PAD + PLOT_W / 2}
            y1={PAD}
            x2={PAD + PLOT_W / 2}
            y2={PAD + PLOT_H}
            stroke="var(--border)"
            strokeWidth="1.5"
            strokeDasharray="6 4"
          />
          <line
            x1={PAD}
            y1={PAD + PLOT_H / 2}
            x2={PAD + PLOT_W}
            y2={PAD + PLOT_H / 2}
            stroke="var(--border)"
            strokeWidth="1.5"
            strokeDasharray="6 4"
          />

          {/* Quadrant labels */}
          <text
            x={PAD + PLOT_W / 4}
            y={PAD + 20}
            textAnchor="middle"
            fill="var(--green)"
            fontSize="12"
            fontWeight="600"
            opacity="0.85"
          >
            Investir
          </text>
          <text
            x={PAD + (3 * PLOT_W) / 4}
            y={PAD + 20}
            textAnchor="middle"
            fill="var(--amber)"
            fontSize="12"
            fontWeight="600"
            opacity="0.85"
          >
            Rénover
          </text>
          <text
            x={PAD + PLOT_W / 4}
            y={PAD + PLOT_H - 10}
            textAnchor="middle"
            fill="var(--text-muted)"
            fontSize="12"
            fontWeight="600"
            opacity="0.85"
          >
            Maintenir
          </text>
          <text
            x={PAD + (3 * PLOT_W) / 4}
            y={PAD + PLOT_H - 10}
            textAnchor="middle"
            fill="var(--red)"
            fontSize="12"
            fontWeight="600"
            opacity="0.85"
          >
            Retirer
          </text>

          {/* X axis label */}
          <text
            x={W / 2}
            y={H - 8}
            textAnchor="middle"
            fill="var(--text-muted)"
            fontSize="11"
          >
            Dette Technique →
          </text>
          {/* X axis ticks */}
          {[0, 25, 50, 75, 100].map((v) => (
            <g key={v}>
              <line
                x1={mapX(v)}
                y1={PAD + PLOT_H}
                x2={mapX(v)}
                y2={PAD + PLOT_H + 4}
                stroke="var(--border)"
                strokeWidth="1"
              />
              <text
                x={mapX(v)}
                y={PAD + PLOT_H + 16}
                textAnchor="middle"
                fill="var(--text-muted)"
                fontSize="9"
              >
                {v}
              </text>
            </g>
          ))}

          {/* Y axis label */}
          <text
            x={14}
            y={H / 2}
            textAnchor="middle"
            fill="var(--text-muted)"
            fontSize="11"
            transform={`rotate(-90, 14, ${H / 2})`}
          >
            ← Valeur Métier
          </text>
          {/* Y axis ticks */}
          {[0, 25, 50, 75, 100].map((v) => (
            <g key={v}>
              <line
                x1={PAD - 4}
                y1={mapY(v)}
                x2={PAD}
                y2={mapY(v)}
                stroke="var(--border)"
                strokeWidth="1"
              />
              <text
                x={PAD - 8}
                y={mapY(v) + 4}
                textAnchor="end"
                fill="var(--text-muted)"
                fontSize="9"
              >
                {v}
              </text>
            </g>
          ))}

          {/* Circles */}
          {apps.map((app) => {
            const cx = mapX(app.techDebt);
            const cy = mapY(app.businessValue);
            const r = circleRadius(app.annualCost);
            const meta = QUADRANT_META[app.quadrant];
            const isSelected = selected?.id === app.id;
            return (
              <g key={app.id}>
                <circle
                  cx={cx}
                  cy={cy}
                  r={r}
                  fill={meta.color}
                  fillOpacity={isSelected ? 0.95 : 0.7}
                  stroke={isSelected ? meta.color : meta.border}
                  strokeWidth={isSelected ? 2.5 : 1.5}
                  style={{ cursor: "pointer", transition: "all 0.15s ease" }}
                  onMouseEnter={(e) => handleMouseEnter(e, app)}
                  onMouseMove={handleMouseMove}
                  onMouseLeave={handleMouseLeave}
                  onClick={() => setSelected(isSelected ? null : app)}
                />
                {r >= 14 && (
                  <text
                    x={cx}
                    y={cy + 4}
                    textAnchor="middle"
                    fill="white"
                    fontSize="8"
                    fontWeight="600"
                    pointerEvents="none"
                    style={{ userSelect: "none" }}
                  >
                    {app.name.slice(0, 3).toUpperCase()}
                  </text>
                )}
              </g>
            );
          })}
        </svg>

        {/* Tooltip */}
        {tooltip && (
          <div
            className="pointer-events-none absolute z-50 rounded-xl border border-[--border] bg-[--bg-card] p-3 shadow-lg text-xs"
            style={{ left: tooltip.x, top: tooltip.y, maxWidth: 220 }}
          >
            <p className="font-semibold text-[--text-primary] mb-1">{tooltip.app.name}</p>
            {tooltip.app.vendor && (
              <p className="text-[--text-muted] mb-1">par {tooltip.app.vendor}</p>
            )}
            <div className="space-y-0.5 text-[--text-secondary]">
              <p>
                Cycle de vie :{" "}
                <span className="font-medium">
                  {LIFECYCLE_LABELS[tooltip.app.lifecycleState ?? ""] ?? tooltip.app.lifecycleState ?? "—"}
                </span>
              </p>
              <p>
                Criticité :{" "}
                <span className="font-medium">
                  {CRITICALITY_LABELS[tooltip.app.criticality ?? ""] ?? tooltip.app.criticality ?? "—"}
                </span>
              </p>
              {tooltip.app.aiReadinessScore != null && (
                <p>
                  Score IA :{" "}
                  <span className="font-medium">{Math.round(tooltip.app.aiReadinessScore)}/100</span>
                </p>
              )}
              <p>
                Recommandation :{" "}
                <span
                  className="font-semibold"
                  style={{ color: QUADRANT_META[tooltip.app.quadrant].color }}
                >
                  {QUADRANT_META[tooltip.app.quadrant].label}
                </span>
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Side panel */}
      <div
        className={`transition-all duration-300 overflow-hidden ${
          selected ? "w-72 opacity-100" : "w-0 opacity-0"
        }`}
      >
        {selected && (
          <div className="w-72 rounded-2xl border border-[--border] bg-[--bg-card] p-5 shadow-sm h-fit">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1 min-w-0">
                <p
                  className="text-xs font-semibold uppercase tracking-wider mb-1"
                  style={{ color: QUADRANT_META[selected.quadrant].color }}
                >
                  {QUADRANT_META[selected.quadrant].label}
                </p>
                <h3 className="text-base font-bold text-[--text-primary] leading-tight">
                  {selected.name}
                </h3>
                {selected.vendor && (
                  <p className="text-xs text-[--text-muted] mt-0.5">par {selected.vendor}</p>
                )}
              </div>
              <button
                onClick={() => setSelected(null)}
                className="ml-2 shrink-0 rounded-lg p-1 hover:bg-[--bg-hover] text-[--text-muted] hover:text-[--text-primary] transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-lg bg-[--bg-hover] p-2.5">
                  <p className="text-xs text-[--text-muted] mb-0.5">Dette technique</p>
                  <p className="font-bold text-[--text-primary]">{Math.round(selected.techDebt)}</p>
                </div>
                <div className="rounded-lg bg-[--bg-hover] p-2.5">
                  <p className="text-xs text-[--text-muted] mb-0.5">Valeur métier</p>
                  <p className="font-bold text-[--text-primary]">{Math.round(selected.businessValue)}</p>
                </div>
              </div>

              <div className="space-y-2 text-xs text-[--text-secondary]">
                <div className="flex justify-between">
                  <span>Cycle de vie</span>
                  <span className="font-medium text-[--text-primary]">
                    {LIFECYCLE_LABELS[selected.lifecycleState ?? ""] ?? selected.lifecycleState ?? "—"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Criticité</span>
                  <span className="font-medium text-[--text-primary]">
                    {CRITICALITY_LABELS[selected.criticality ?? ""] ?? selected.criticality ?? "—"}
                  </span>
                </div>
                {selected.annualCost != null && (
                  <div className="flex justify-between">
                    <span>Coût annuel</span>
                    <span className="font-medium text-[--text-primary]">
                      {new Intl.NumberFormat("fr-FR", {
                        style: "currency",
                        currency: "EUR",
                        maximumFractionDigits: 0,
                      }).format(selected.annualCost)}
                    </span>
                  </div>
                )}
                {selected.userCount != null && (
                  <div className="flex justify-between">
                    <span>Utilisateurs</span>
                    <span className="font-medium text-[--text-primary]">
                      {selected.userCount.toLocaleString("fr-FR")}
                    </span>
                  </div>
                )}
                {selected.aiReadinessScore != null && (
                  <div className="flex justify-between">
                    <span>Score IA</span>
                    <span className="font-medium text-[--text-primary]">
                      {Math.round(selected.aiReadinessScore)}/100
                    </span>
                  </div>
                )}
              </div>

              <div
                className="rounded-lg border p-3 text-xs"
                style={{
                  borderColor: QUADRANT_META[selected.quadrant].border,
                  background: QUADRANT_META[selected.quadrant].bg,
                }}
              >
                <p
                  className="font-semibold mb-0.5"
                  style={{ color: QUADRANT_META[selected.quadrant].color }}
                >
                  Recommandation
                </p>
                <p className="text-[--text-secondary]">{QUADRANT_META[selected.quadrant].desc}</p>
              </div>

              <Link
                href={`/app/knowledge/applications/${selected.id}` as Route}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-[--green-border] bg-[--green-dim] px-4 py-2 text-xs font-medium text-[--green] hover:opacity-90 transition-opacity"
              >
                Voir la fiche
                <ExternalLink className="h-3 w-3" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
