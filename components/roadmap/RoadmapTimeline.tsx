"use client";

import { useState } from "react";

type MilestoneStatus = "PLANNED" | "IN_PROGRESS" | "DONE" | "MISSED";
type InitiativeStatus = "PLANNED" | "IN_PROGRESS" | "AT_RISK" | "COMPLETED" | "CANCELED";

interface Milestone {
  id: string;
  title: string;
  status: MilestoneStatus;
  dueDate: Date | string | null;
  completedAt: Date | string | null;
}

interface Initiative {
  id: string;
  title: string;
  status: InitiativeStatus;
  startDate: Date | string | null;
  endDate: Date | string | null;
  owner: { name: string | null } | null;
  milestones: Milestone[];
}

interface Props {
  initiatives: Initiative[];
}

const STATUS_COLORS: Record<InitiativeStatus, { bar: string; text: string; label: string }> = {
  PLANNED: { bar: "var(--blue)", text: "text-[--blue]", label: "Planifiée" },
  IN_PROGRESS: { bar: "var(--green)", text: "text-[--green]", label: "En cours" },
  AT_RISK: { bar: "var(--red)", text: "text-[--red]", label: "À risque" },
  COMPLETED: { bar: "var(--text-muted)", text: "text-[--text-muted]", label: "Complétée" },
  CANCELED: { bar: "var(--border)", text: "text-[--border]", label: "Annulée" },
};

const MILESTONE_STATUS_COLORS: Record<MilestoneStatus, string> = {
  PLANNED: "var(--blue)",
  IN_PROGRESS: "var(--green)",
  DONE: "var(--green)",
  MISSED: "var(--red)",
};

const BADGE_STYLES: Record<InitiativeStatus, string> = {
  PLANNED: "bg-[--blue-dim] text-[--blue] border-[--border]",
  IN_PROGRESS: "bg-[--green-dim] text-[--green] border-[--green-border]",
  AT_RISK: "bg-[--red-dim] text-[--red] border-[--red-dim]",
  COMPLETED: "bg-[--bg-hover] text-[--text-muted] border-[--border]",
  CANCELED: "bg-[--bg-hover] text-[--text-muted] border-[--border]",
};

function formatDate(d: Date | string | null): string {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
}

export function RoadmapTimeline({ initiatives }: Props) {
  const [tooltip, setTooltip] = useState<{
    x: number;
    y: number;
    initiative: Initiative;
  } | null>(null);

  // Determine timeline range: now-2mo to now+12mo
  const now = new Date();
  const rangeStart = new Date(now);
  rangeStart.setMonth(rangeStart.getMonth() - 2);
  rangeStart.setDate(1);
  const rangeEnd = new Date(now);
  rangeEnd.setMonth(rangeEnd.getMonth() + 12);
  rangeEnd.setDate(1);

  const totalMs = rangeEnd.getTime() - rangeStart.getTime();

  // Build month labels
  const months: { label: string; pct: number }[] = [];
  const cursor = new Date(rangeStart);
  while (cursor <= rangeEnd) {
    const pct = ((cursor.getTime() - rangeStart.getTime()) / totalMs) * 100;
    months.push({
      label: cursor.toLocaleDateString("fr-FR", { month: "short", year: "2-digit" }),
      pct,
    });
    cursor.setMonth(cursor.getMonth() + 1);
  }

  // Check if any initiative has dates
  const hasDates = initiatives.some((i) => i.startDate && i.endDate);

  function pctForDate(d: Date | string): number {
    const ms = new Date(d).getTime() - rangeStart.getTime();
    return Math.max(0, Math.min(100, (ms / totalMs) * 100));
  }

  function getBarBounds(initiative: Initiative): { left: number; width: number } {
    if (initiative.startDate && initiative.endDate) {
      const left = pctForDate(initiative.startDate);
      const right = pctForDate(initiative.endDate);
      return { left, width: Math.max(right - left, 1) };
    }
    // Fallback: spread evenly
    const idx = initiatives.indexOf(initiative);
    const step = 100 / (initiatives.length + 1);
    const left = step * (idx + 0.5);
    return { left: Math.max(0, left - 10), width: 20 };
  }

  // Today marker
  const todayPct = pctForDate(now);

  const CHART_HEIGHT = 56; // px per row
  const AXIS_HEIGHT = 28;
  const svgHeight = AXIS_HEIGHT + initiatives.length * CHART_HEIGHT + 16;

  return (
    <div className="rounded-2xl border border-[--border] bg-[--bg-card] shadow-sm">
      {/* Legend */}
      <div className="flex flex-wrap items-center gap-3 border-b border-[--border] px-6 py-4">
        <span className="text-xs font-medium text-[--text-muted]">Statut :</span>
        {(["PLANNED", "IN_PROGRESS", "AT_RISK", "COMPLETED"] as InitiativeStatus[]).map((s) => (
          <span key={s} className="flex items-center gap-1.5">
            <span
              className="inline-block h-2.5 w-6 rounded-full"
              style={{ backgroundColor: STATUS_COLORS[s].bar }}
            />
            <span className={`text-xs ${STATUS_COLORS[s].text}`}>{STATUS_COLORS[s].label}</span>
          </span>
        ))}
        <span className="flex items-center gap-1.5 ml-2">
          <span className="inline-block text-base leading-none" style={{ color: "var(--amber)" }}>♦</span>
          <span className="text-xs text-[--text-muted]">Jalon</span>
        </span>
      </div>

      {initiatives.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 py-16 text-[--text-muted]">
          <span className="text-4xl">📅</span>
          <p className="text-sm">Aucune initiative active.</p>
          <p className="text-xs">Créez des initiatives depuis la page Gouvernance.</p>
        </div>
      ) : !hasDates ? (
        /* Fallback: list view */
        <div className="divide-y divide-[--border]">
          {initiatives.map((initiative) => (
            <div key={initiative.id} className="flex items-center gap-4 px-6 py-4">
              <span
                className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-medium tracking-wide ${BADGE_STYLES[initiative.status]}`}
              >
                {STATUS_COLORS[initiative.status].label}
              </span>
              <span className="flex-1 font-medium text-[--text-primary]">{initiative.title}</span>
              {initiative.owner?.name && (
                <span className="text-xs text-[--text-muted]">{initiative.owner.name}</span>
              )}
              <span className="text-xs text-[--text-muted]">
                {initiative.milestones.length} jalon{initiative.milestones.length !== 1 ? "s" : ""}
              </span>
            </div>
          ))}
        </div>
      ) : (
        /* Gantt SVG */
        <div className="overflow-x-auto px-2 pb-4">
          <div style={{ minWidth: 700 }}>
            <svg
              width="100%"
              height={svgHeight}
              className="block"
              style={{ fontFamily: "inherit" }}
              onMouseLeave={() => setTooltip(null)}
            >
              {/* Month grid lines & labels */}
              {months.map((m, i) => (
                <g key={i}>
                  <line
                    x1={`${m.pct}%`}
                    y1={0}
                    x2={`${m.pct}%`}
                    y2={svgHeight}
                    stroke="var(--border-subtle)"
                    strokeWidth={1}
                  />
                  <text
                    x={`${m.pct + 0.5}%`}
                    y={AXIS_HEIGHT - 8}
                    fontSize={10}
                    fill="var(--text-muted)"
                  >
                    {m.label}
                  </text>
                </g>
              ))}

              {/* Today line */}
              {todayPct >= 0 && todayPct <= 100 && (
                <>
                  <line
                    x1={`${todayPct}%`}
                    y1={0}
                    x2={`${todayPct}%`}
                    y2={svgHeight}
                    stroke="var(--amber)"
                    strokeWidth={1.5}
                    strokeDasharray="4 3"
                  />
                  <text x={`${todayPct + 0.3}%`} y={12} fontSize={9} fill="var(--amber)">
                    Aujourd'hui
                  </text>
                </>
              )}

              {/* Initiative rows */}
              {initiatives.map((initiative, idx) => {
                const { left, width } = getBarBounds(initiative);
                const y = AXIS_HEIGHT + idx * CHART_HEIGHT;
                const barY = y + 12;
                const barH = 20;

                return (
                  <g key={initiative.id}>
                    {/* Row background (alternating) */}
                    {idx % 2 === 0 && (
                      <rect
                        x="0"
                        y={y}
                        width="100%"
                        height={CHART_HEIGHT}
                        fill="var(--bg-hover)"
                        opacity={0.35}
                      />
                    )}

                    {/* Title label */}
                    <text
                      x="0.5%"
                      y={barY + barH / 2 + 4}
                      fontSize={11}
                      fill="var(--text-secondary)"
                      clipPath={`url(#clip-label-${idx})`}
                    >
                      {initiative.title}
                    </text>
                    <clipPath id={`clip-label-${idx}`}>
                      <rect x="0" y={barY} width={`${left - 0.5}%`} height={barH + 8} />
                    </clipPath>

                    {/* Bar */}
                    <rect
                      x={`${left}%`}
                      y={barY}
                      width={`${width}%`}
                      height={barH}
                      rx={6}
                      fill={STATUS_COLORS[initiative.status].bar}
                      opacity={0.85}
                      className="cursor-pointer"
                      onMouseEnter={(e) => {
                        const svg = (e.target as SVGElement).closest("svg");
                        if (!svg) return;
                        const rect = svg.getBoundingClientRect();
                        setTooltip({
                          x: e.clientX - rect.left,
                          y: e.clientY - rect.top,
                          initiative,
                        });
                      }}
                      onMouseMove={(e) => {
                        const svg = (e.target as SVGElement).closest("svg");
                        if (!svg) return;
                        const rect = svg.getBoundingClientRect();
                        setTooltip((prev) =>
                          prev ? { ...prev, x: e.clientX - rect.left, y: e.clientY - rect.top } : null
                        );
                      }}
                    />

                    {/* Milestone diamonds */}
                    {initiative.milestones.map((ms) => {
                      if (!ms.dueDate) return null;
                      const mx = pctForDate(ms.dueDate);
                      const my = barY + barH / 2;
                      const size = 7;
                      const color = MILESTONE_STATUS_COLORS[ms.status];
                      return (
                        <polygon
                          key={ms.id}
                          points={`${mx}%,${my - size} calc(${mx}% + ${size}px),${my} ${mx}%,${my + size} calc(${mx}% - ${size}px),${my}`}
                          fill={color}
                          stroke="var(--bg-card)"
                          strokeWidth={1.5}
                          style={{ transformOrigin: `${mx}% ${my}px` }}
                        />
                      );
                    })}
                  </g>
                );
              })}
            </svg>

            {/* Tooltip (absolute over container) */}
            {tooltip && (
              <div
                className="pointer-events-none absolute z-50 max-w-xs rounded-xl border border-[--border] bg-[--bg-card] p-3 shadow-lg text-xs"
                style={{ left: tooltip.x + 8, top: tooltip.y - 8 }}
              >
                <p className="font-semibold text-[--text-primary] mb-1">{tooltip.initiative.title}</p>
                <p className={`mb-1 ${STATUS_COLORS[tooltip.initiative.status].text}`}>
                  {STATUS_COLORS[tooltip.initiative.status].label}
                </p>
                {tooltip.initiative.owner?.name && (
                  <p className="text-[--text-muted]">Owner : {tooltip.initiative.owner.name}</p>
                )}
                <p className="text-[--text-muted]">
                  {formatDate(tooltip.initiative.startDate)} → {formatDate(tooltip.initiative.endDate)}
                </p>
                {tooltip.initiative.milestones.length > 0 && (
                  <p className="mt-1 text-[--text-muted]">
                    {tooltip.initiative.milestones.length} jalon{tooltip.initiative.milestones.length !== 1 ? "s" : ""}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
