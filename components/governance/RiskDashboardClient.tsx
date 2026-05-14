"use client";

import { useState } from "react";

type Severity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
type RiskStatus = "OPEN" | "MITIGATED" | "ACCEPTED" | "CLOSED";

interface RiskItem {
  id: string;
  title: string;
  description: string | null;
  severity: Severity;
  status: RiskStatus;
  owner: { name: string | null } | null;
  opportunity: { title: string } | null;
}

interface Props {
  risks: RiskItem[];
  total: number;
}

const SEVERITY_STYLES: Record<Severity, string> = {
  CRITICAL: "bg-[--red-dim] text-[--red] border-[--red-dim]",
  HIGH: "bg-[--amber-dim] text-[--amber] border-[--amber-dim]",
  MEDIUM: "bg-[--blue-dim] text-[--blue] border-[--border]",
  LOW: "bg-[--bg-hover] text-[--text-muted] border-[--border]",
};

const STATUS_LABELS: Record<RiskStatus, string> = {
  OPEN: "Ouvert",
  MITIGATED: "Atténué",
  ACCEPTED: "Accepté",
  CLOSED: "Fermé",
};

const STATUS_STYLES: Record<RiskStatus, string> = {
  OPEN: "bg-[--red-dim] text-[--red] border-[--red-dim]",
  MITIGATED: "bg-[--green-dim] text-[--green] border-[--green-border]",
  ACCEPTED: "bg-[--amber-dim] text-[--amber] border-[--amber-dim]",
  CLOSED: "bg-[--bg-hover] text-[--text-muted] border-[--border]",
};

type TabFilter = "ALL" | RiskStatus;

// Matrix quadrant position approximations
// CRITICAL → top-right, HIGH → top-left or bottom-right, MEDIUM → bottom-right, LOW → bottom-left
const MATRIX_POSITIONS: Record<Severity, { cx: number; cy: number }[]> = {
  CRITICAL: [{ cx: 75, cy: 25 }],
  HIGH: [{ cx: 30, cy: 30 }, { cx: 70, cy: 60 }],
  MEDIUM: [{ cx: 65, cy: 65 }],
  LOW: [{ cx: 25, cy: 75 }],
};

const MATRIX_COLORS: Record<Severity, string> = {
  CRITICAL: "var(--red)",
  HIGH: "var(--amber)",
  MEDIUM: "var(--blue)",
  LOW: "var(--text-muted)",
};

function RiskMatrix({ risks }: { risks: RiskItem[] }) {
  const bySegment: Record<Severity, number> = { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0 };
  for (const r of risks) bySegment[r.severity]++;

  const points: { cx: number; cy: number; color: string; count: number; severity: Severity }[] = [];
  for (const [sev, positions] of Object.entries(MATRIX_POSITIONS) as [Severity, { cx: number; cy: number }[]][]) {
    const count = bySegment[sev];
    if (count === 0) continue;
    const pos = positions[0];
    points.push({ cx: pos.cx, cy: pos.cy, color: MATRIX_COLORS[sev], count, severity: sev });
  }

  return (
    <div className="rounded-2xl border border-[--border] bg-[--bg-card] p-6 shadow-sm">
      <h3 className="mb-4 font-semibold text-[--text-primary]">Matrice de risques</h3>
      <div className="relative">
        <svg width="100%" viewBox="0 0 100 100" className="block max-w-sm mx-auto" style={{ aspectRatio: "1" }}>
          {/* Quadrant backgrounds */}
          <rect x={0} y={0} width={50} height={50} fill="var(--amber-dim)" opacity={0.4} />
          <rect x={50} y={0} width={50} height={50} fill="var(--red-dim)" opacity={0.5} />
          <rect x={0} y={50} width={50} height={50} fill="var(--bg-hover)" opacity={0.4} />
          <rect x={50} y={50} width={50} height={50} fill="var(--blue-dim)" opacity={0.3} />

          {/* Grid lines */}
          <line x1={50} y1={0} x2={50} y2={100} stroke="var(--border)" strokeWidth={0.5} />
          <line x1={0} y1={50} x2={100} y2={50} stroke="var(--border)" strokeWidth={0.5} />

          {/* Quadrant labels */}
          <text x={25} y={48} textAnchor="middle" fontSize={5} fill="var(--text-muted)">Prob. faible</text>
          <text x={75} y={48} textAnchor="middle" fontSize={5} fill="var(--text-muted)">Prob. forte</text>
          <text x={3} y={28} fontSize={4.5} fill="var(--text-muted)" transform="rotate(-90 3 28)">Impact fort</text>
          <text x={3} y={78} fontSize={4.5} fill="var(--text-muted)" transform="rotate(-90 3 78)">Impact faible</text>

          {/* Risk bubbles */}
          {points.map((p) => (
            <g key={p.severity}>
              <circle
                cx={p.cx}
                cy={p.cy}
                r={Math.min(8, 4 + p.count * 1.5)}
                fill={p.color}
                opacity={0.8}
              />
              <text
                x={p.cx}
                y={p.cy + 1.5}
                textAnchor="middle"
                fontSize={4.5}
                fill="white"
                fontWeight="bold"
              >
                {p.count}
              </text>
            </g>
          ))}
        </svg>
        {/* Legend */}
        <div className="flex flex-wrap justify-center gap-3 mt-3">
          {(["CRITICAL", "HIGH", "MEDIUM", "LOW"] as Severity[]).map((s) => (
            <span key={s} className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full inline-block" style={{ backgroundColor: MATRIX_COLORS[s] }} />
              <span className="text-xs text-[--text-muted]">{s}</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export function RiskDashboardClient({ risks, total }: Props) {
  const [tab, setTab] = useState<TabFilter>("ALL");

  const TABS: { key: TabFilter; label: string }[] = [
    { key: "ALL", label: "Tous" },
    { key: "OPEN", label: "Ouverts" },
    { key: "MITIGATED", label: "Atténués" },
    { key: "ACCEPTED", label: "Acceptés" },
  ];

  const filtered = tab === "ALL" ? risks : risks.filter((r) => r.status === tab);

  return (
    <div className="space-y-6">
      {/* Matrix */}
      <RiskMatrix risks={risks} />

      {/* Table + filters */}
      <div className="rounded-2xl border border-[--border] bg-[--bg-card] shadow-sm">
        {/* Tabs */}
        <div className="flex gap-1 border-b border-[--border] px-4 pt-4 pb-0">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`rounded-t-lg px-4 py-2 text-sm font-medium transition-colors ${
                tab === t.key
                  ? "border border-b-0 border-[--border] bg-[--bg-card] text-[--text-primary]"
                  : "text-[--text-muted] hover:text-[--text-secondary]"
              }`}
            >
              {t.label}
            </button>
          ))}
          <div className="ml-auto flex items-center pb-2 text-xs text-[--text-muted]">
            {filtered.length} / {total} risques
          </div>
        </div>

        {/* Table */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-12 text-[--text-muted]">
            <p className="text-sm">Aucun risque dans cette catégorie.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[--border]">
                  <th className="px-4 py-3 text-left font-medium text-[--text-muted]">Titre</th>
                  <th className="px-4 py-3 text-left font-medium text-[--text-muted]">Sévérité</th>
                  <th className="px-4 py-3 text-left font-medium text-[--text-muted]">Statut</th>
                  <th className="px-4 py-3 text-left font-medium text-[--text-muted]">Opportunité liée</th>
                  <th className="px-4 py-3 text-left font-medium text-[--text-muted]">Owner</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[--border-subtle]">
                {filtered.map((risk) => (
                  <tr key={risk.id} className="hover:bg-[--bg-hover] transition-colors">
                    <td className="px-4 py-3 font-medium text-[--text-primary] max-w-xs">
                      <p className="truncate">{risk.title}</p>
                      {risk.description && (
                        <p className="truncate text-xs text-[--text-muted] mt-0.5">{risk.description}</p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-medium tracking-wide ${SEVERITY_STYLES[risk.severity]}`}
                      >
                        {risk.severity}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-medium tracking-wide ${STATUS_STYLES[risk.status]}`}
                      >
                        {STATUS_LABELS[risk.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[--text-secondary]">
                      {risk.opportunity?.title ?? <span className="text-[--text-muted]">—</span>}
                    </td>
                    <td className="px-4 py-3 text-[--text-secondary]">
                      {risk.owner?.name ?? <span className="text-[--text-muted]">—</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
