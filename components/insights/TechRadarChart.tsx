"use client";

import { useState } from "react";

type Technology = {
  id: string;
  name: string;
  category: string;
  lifecycleState: string;
  vendor: string | null;
  riskLevel: string | null;
};

type QuadrantDef = {
  key: string;
  label: string;
  categories: string[];
  angle: number; // center angle in degrees
};

const QUADRANTS: QuadrantDef[] = [
  { key: "cloud", label: "Cloud & Infra", categories: ["cloud", "infra"], angle: 45 },
  { key: "data", label: "Data & IA", categories: ["database", "os"], angle: 135 },
  { key: "lang", label: "Langages & Frameworks", categories: ["runtime", "framework"], angle: 225 },
  { key: "security", label: "Sécurité & Ops", categories: ["security"], angle: 315 },
];

const RINGS = [
  { key: "adopt", label: "ADOPT", r: 80, color: "var(--green)" },
  { key: "trial", label: "TRIAL", r: 155, color: "var(--blue)" },
  { key: "hold", label: "HOLD", r: 220, color: "var(--amber)" },
  { key: "emerging", label: "EMERGING", r: 280, color: "var(--text-muted)" },
];

const RING_MAP: Record<string, string> = {
  adopt: "adopt",
  trial: "trial",
  hold: "hold",
  phaseout: "hold",
  emerging: "emerging",
};

function getQuadrant(category: string): QuadrantDef {
  for (const q of QUADRANTS) {
    if (q.categories.includes(category)) return q;
  }
  return QUADRANTS[3]; // default to security/ops
}

function getRingDef(state: string) {
  const key = RING_MAP[state] ?? "hold";
  return RINGS.find((r) => r.key === key) ?? RINGS[2];
}

// Deterministic position using hash of id
function hashCode(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) - h + str.charCodeAt(i)) >>> 0;
  }
  return h;
}

function blipPosition(tech: Technology, index: number) {
  const quadrant = getQuadrant(tech.category);
  const ring = getRingDef(tech.lifecycleState);
  const prevRing = RINGS[RINGS.indexOf(ring) - 1];
  const innerR = prevRing ? prevRing.r : 0;
  const outerR = ring.r;

  // Spread within ring using hash
  const hash = hashCode(tech.id + String(index));
  const spread = 0.35; // radians on each side of center
  const angleCenter = (quadrant.angle * Math.PI) / 180;
  const angle = angleCenter + (((hash % 1000) / 1000) * 2 - 1) * spread;
  const r = innerR + 10 + ((hash % 100) / 100) * (outerR - innerR - 20);

  return {
    x: Math.cos(angle) * r,
    y: Math.sin(angle) * r,
    quadrant,
    ring,
  };
}

interface Props {
  technologies: Technology[];
}

export function TechRadarChart({ technologies }: Props) {
  const [hovered, setHovered] = useState<string | null>(null);
  const [activeQuadrant, setActiveQuadrant] = useState<string | null>(null);

  const SIZE = 600;
  const CENTER = SIZE / 2;

  const filteredTechs = activeQuadrant
    ? technologies.filter((t) => getQuadrant(t.category).key === activeQuadrant)
    : technologies;

  const blips = filteredTechs.map((tech, i) => ({
    tech,
    ...blipPosition(tech, i),
  }));

  const hoveredTech = technologies.find((t) => t.id === hovered);

  return (
    <div className="space-y-4">
      {/* Quadrant filters */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setActiveQuadrant(null)}
          className={`rounded-lg border px-3 py-1 text-xs font-medium transition-colors ${
            !activeQuadrant
              ? "border-[--green-border] bg-[--green-dim] text-[--green]"
              : "border-[--border] bg-[--bg-card] text-[--text-secondary] hover:bg-[--bg-hover]"
          }`}
        >
          Tous
        </button>
        {QUADRANTS.map((q) => (
          <button
            key={q.key}
            onClick={() => setActiveQuadrant(q.key === activeQuadrant ? null : q.key)}
            className={`rounded-lg border px-3 py-1 text-xs font-medium transition-colors ${
              activeQuadrant === q.key
                ? "border-[--blue-border] bg-[--blue-dim] text-[--blue]"
                : "border-[--border] bg-[--bg-card] text-[--text-secondary] hover:bg-[--bg-hover]"
            }`}
          >
            {q.label}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-6 lg:flex-row">
        {/* SVG Radar */}
        <div className="flex-1">
          <div className="rounded-2xl border border-[--border] bg-[--bg-card] p-4 overflow-auto">
            <svg
              viewBox={`0 0 ${SIZE} ${SIZE}`}
              width="100%"
              style={{ maxWidth: SIZE }}
              className="mx-auto block"
            >
              {/* Rings */}
              {RINGS.map((ring) => (
                <g key={ring.key}>
                  <circle
                    cx={CENTER}
                    cy={CENTER}
                    r={ring.r}
                    fill="none"
                    stroke="var(--border)"
                    strokeWidth={1}
                    strokeDasharray="4 4"
                    opacity={0.5}
                  />
                  <text
                    x={CENTER + ring.r - 4}
                    y={CENTER + 4}
                    textAnchor="end"
                    fontSize={9}
                    fill="var(--text-muted)"
                    fontWeight={600}
                    letterSpacing={1}
                  >
                    {ring.label}
                  </text>
                </g>
              ))}

              {/* Axis lines */}
              <line x1={CENTER} y1={CENTER - 290} x2={CENTER} y2={CENTER + 290} stroke="var(--border)" strokeWidth={1} opacity={0.4} />
              <line x1={CENTER - 290} y1={CENTER} x2={CENTER + 290} y2={CENTER} stroke="var(--border)" strokeWidth={1} opacity={0.4} />

              {/* Quadrant labels */}
              {QUADRANTS.map((q) => {
                const rad = (q.angle * Math.PI) / 180;
                const labelR = 295;
                return (
                  <text
                    key={q.key}
                    x={CENTER + Math.cos(rad) * labelR}
                    y={CENTER + Math.sin(rad) * labelR}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize={11}
                    fontWeight={600}
                    fill={activeQuadrant === q.key ? "var(--blue)" : "var(--text-muted)"}
                  >
                    {q.label}
                  </text>
                );
              })}

              {/* Blips */}
              {blips.map(({ tech, x, y, ring }) => {
                const isHovered = hovered === tech.id;
                return (
                  <g
                    key={tech.id}
                    transform={`translate(${CENTER + x}, ${CENTER + y})`}
                    onMouseEnter={() => setHovered(tech.id)}
                    onMouseLeave={() => setHovered(null)}
                    style={{ cursor: "pointer" }}
                  >
                    <circle
                      r={isHovered ? 8 : 6}
                      fill={ring.color}
                      opacity={isHovered ? 1 : 0.85}
                      style={{ transition: "r 0.15s, opacity 0.15s" }}
                    />
                    {isHovered && (
                      <>
                        <rect
                          x={8}
                          y={-18}
                          width={tech.name.length * 6.5 + 12}
                          height={22}
                          rx={4}
                          fill="var(--bg-card)"
                          stroke="var(--border)"
                          strokeWidth={1}
                        />
                        <text
                          x={14}
                          y={-2}
                          fontSize={11}
                          fontWeight={600}
                          fill="var(--text-primary)"
                        >
                          {tech.name}
                        </text>
                      </>
                    )}
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Legend */}
          <div className="mt-3 flex flex-wrap gap-4">
            {RINGS.map((ring) => (
              <div key={ring.key} className="flex items-center gap-1.5">
                <span
                  className="inline-block h-3 w-3 rounded-full"
                  style={{ backgroundColor: ring.color }}
                />
                <span className="text-xs text-[--text-muted] font-medium">{ring.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Side panel */}
        <div className="w-full lg:w-72 space-y-3">
          {hoveredTech ? (
            <div className="rounded-2xl border border-[--blue-border] bg-[--blue-dim] p-4 space-y-2">
              <p className="text-sm font-bold text-[--text-primary]">{hoveredTech.name}</p>
              {hoveredTech.vendor && (
                <p className="text-xs text-[--text-muted]">Éditeur : {hoveredTech.vendor}</p>
              )}
              <div className="flex flex-wrap gap-1.5 mt-1">
                <span className="inline-flex rounded-full border border-[--border] bg-[--bg-card] px-2 py-0.5 text-[10px] font-medium text-[--text-secondary]">
                  {hoveredTech.category}
                </span>
                <span
                  className="inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold"
                  style={{
                    background: getRingDef(hoveredTech.lifecycleState).color + "22",
                    color: getRingDef(hoveredTech.lifecycleState).color,
                    border: `1px solid ${getRingDef(hoveredTech.lifecycleState).color}44`,
                  }}
                >
                  {hoveredTech.lifecycleState.toUpperCase()}
                </span>
                {hoveredTech.riskLevel && (
                  <span className="inline-flex rounded-full border border-[--border] bg-[--bg-card] px-2 py-0.5 text-[10px] font-medium text-[--text-secondary]">
                    Risque : {hoveredTech.riskLevel}
                  </span>
                )}
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-[--border] bg-[--bg-card] p-4 text-center">
              <p className="text-xs text-[--text-muted]">Survolez un point pour voir les détails</p>
            </div>
          )}

          {/* Blip list by ring */}
          {RINGS.map((ring) => {
            const ringTechs = filteredTechs.filter(
              (t) => RING_MAP[t.lifecycleState] === ring.key || (ring.key === "hold" && t.lifecycleState === "phaseout")
            );
            if (ringTechs.length === 0) return null;
            return (
              <div key={ring.key} className="rounded-2xl border border-[--border] bg-[--bg-card] p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: ring.color }} />
                  <p className="text-xs font-semibold text-[--text-secondary]">{ring.label}</p>
                  <span className="ml-auto text-[10px] text-[--text-muted]">{ringTechs.length}</span>
                </div>
                <ul className="space-y-1">
                  {ringTechs.map((t) => (
                    <li
                      key={t.id}
                      onMouseEnter={() => setHovered(t.id)}
                      onMouseLeave={() => setHovered(null)}
                      className={`cursor-default rounded-lg px-2 py-1 text-xs transition-colors ${
                        hovered === t.id ? "bg-[--bg-hover]" : ""
                      }`}
                    >
                      <span className="font-medium text-[--text-primary]">{t.name}</span>
                      {t.vendor && (
                        <span className="ml-1 text-[--text-muted]">· {t.vendor}</span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
