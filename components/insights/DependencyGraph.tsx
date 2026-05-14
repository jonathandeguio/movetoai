"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import type { Route } from "next";
import Link from "next/link";
import { X } from "lucide-react";

export type GraphNode = {
  id: string;
  label: string;
  type: "application" | "capability" | "process";
  lifecycleState?: string | null;
  criticality?: string | null;
  aiReadinessScore?: number | null;
};

export type GraphEdge = {
  source: string;
  target: string;
  type: "app-capability" | "app-process";
};

interface SimNode extends GraphNode {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
}

interface SimEdge {
  source: SimNode;
  target: SimNode;
  type: "app-capability" | "app-process";
}

// ── Node styling ───────────────────────────────────────────────────────────────

const NODE_COLORS: Record<GraphNode["type"], string> = {
  application: "var(--blue)",
  capability:  "var(--green)",
  process:     "var(--amber)",
};

const NODE_BG: Record<GraphNode["type"], string> = {
  application: "var(--blue-dim)",
  capability:  "var(--green-dim)",
  process:     "var(--amber-dim)",
};

function nodeRadius(node: GraphNode): number {
  if (node.type === "application") {
    const score = node.aiReadinessScore ?? 50;
    return 10 + (score / 100) * 14;
  }
  return 8;
}

// ── Simple force-directed layout (no d3 dependency) ───────────────────────────

function runForceSimulation(
  nodes: SimNode[],
  edges: SimEdge[],
  W: number,
  H: number,
  iterations = 300
) {
  const k = Math.sqrt((W * H) / Math.max(nodes.length, 1));
  const LINK_DIST = k * 1.8;
  const REPULSION = k * k * 1.2;
  const CENTER_X = W / 2;
  const CENTER_Y = H / 2;

  for (let iter = 0; iter < iterations; iter++) {
    const cooling = 1 - iter / iterations;
    const temp = k * cooling * 0.6;

    // Repulsion between all pairs
    for (let i = 0; i < nodes.length; i++) {
      nodes[i].vx = 0;
      nodes[i].vy = 0;
    }

    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[j].x - nodes[i].x || 0.01;
        const dy = nodes[j].y - nodes[i].y || 0.01;
        const dist2 = dx * dx + dy * dy;
        const dist = Math.sqrt(dist2);
        const force = REPULSION / dist2;
        const fx = (dx / dist) * force;
        const fy = (dy / dist) * force;
        nodes[i].vx -= fx;
        nodes[i].vy -= fy;
        nodes[j].vx += fx;
        nodes[j].vy += fy;
      }
    }

    // Attraction along edges
    for (const edge of edges) {
      const dx = edge.target.x - edge.source.x;
      const dy = edge.target.y - edge.source.y;
      const dist = Math.sqrt(dx * dx + dy * dy) || 0.01;
      const force = (dist - LINK_DIST) / dist * 0.3;
      const fx = dx * force;
      const fy = dy * force;
      edge.source.vx += fx;
      edge.source.vy += fy;
      edge.target.vx -= fx;
      edge.target.vy -= fy;
    }

    // Gravity toward center
    for (const node of nodes) {
      node.vx += (CENTER_X - node.x) * 0.02;
      node.vy += (CENTER_Y - node.y) * 0.02;
    }

    // Apply velocity with cooling
    for (const node of nodes) {
      const speed = Math.sqrt(node.vx * node.vx + node.vy * node.vy) || 1;
      const capped = Math.min(speed, temp);
      node.x += (node.vx / speed) * capped;
      node.y += (node.vy / speed) * capped;

      // Clamp within bounds
      const pad = node.r + 4;
      node.x = Math.max(pad, Math.min(W - pad, node.x));
      node.y = Math.max(pad, Math.min(H - pad, node.y));
    }
  }
}

// ── Component ─────────────────────────────────────────────────────────────────

interface Props {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export function DependencyGraph({ nodes, edges }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [simNodes, setSimNodes] = useState<SimNode[]>([]);
  const [simEdges, setSimEdges] = useState<SimEdge[]>([]);
  const [selected, setSelected] = useState<SimNode | null>(null);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; node: SimNode } | null>(null);
  const [dims, setDims] = useState({ w: 800, h: 500 });

  // Build simulation once dimensions are known
  const buildSim = useCallback(
    (W: number, H: number) => {
      const nodeMap = new Map<string, SimNode>();
      const sNodes: SimNode[] = nodes.map((n) => {
        const sn: SimNode = {
          ...n,
          x: W / 2 + (Math.random() - 0.5) * W * 0.6,
          y: H / 2 + (Math.random() - 0.5) * H * 0.6,
          vx: 0,
          vy: 0,
          r: nodeRadius(n),
        };
        nodeMap.set(n.id, sn);
        return sn;
      });

      const sEdges: SimEdge[] = edges
        .map((e) => {
          const src = nodeMap.get(e.source);
          const tgt = nodeMap.get(e.target);
          if (!src || !tgt) return null;
          return { source: src, target: tgt, type: e.type };
        })
        .filter((e): e is SimEdge => e !== null);

      runForceSimulation(sNodes, sEdges, W, H, 400);
      setSimNodes(sNodes);
      setSimEdges(sEdges);
    },
    [nodes, edges]
  );

  // Observe container size
  useEffect(() => {
    if (!containerRef.current) return;
    const obs = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      const { width } = entry.contentRect;
      const W = Math.max(400, width);
      const H = Math.round(W * 0.6);
      setDims({ w: W, h: H });
      buildSim(W, H);
    });
    obs.observe(containerRef.current);
    return () => obs.disconnect();
  }, [buildSim]);

  // Drag state
  const dragging = useRef<{ node: SimNode; ox: number; oy: number } | null>(null);

  function onMouseDown(e: React.MouseEvent, node: SimNode) {
    e.preventDefault();
    const rect = (e.currentTarget as Element).closest("svg")?.getBoundingClientRect();
    if (!rect) return;
    dragging.current = {
      node,
      ox: e.clientX - rect.left - node.x,
      oy: e.clientY - rect.top - node.y,
    };
    setTooltip(null);
  }

  function onMouseMove(e: React.MouseEvent<SVGSVGElement>) {
    if (!dragging.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const nx = e.clientX - rect.left - dragging.current.ox;
    const ny = e.clientY - rect.top - dragging.current.oy;
    dragging.current.node.x = Math.max(
      dragging.current.node.r,
      Math.min(dims.w - dragging.current.node.r, nx)
    );
    dragging.current.node.y = Math.max(
      dragging.current.node.r,
      Math.min(dims.h - dragging.current.node.r, ny)
    );
    setSimNodes([...simNodes]);
  }

  function onMouseUp() {
    dragging.current = null;
  }

  function onNodeClick(node: SimNode) {
    if (selected?.id === node.id) setSelected(null);
    else setSelected(node);
  }

  // Highlight: connected node IDs when a node is selected
  const connectedIds = new Set<string>();
  if (selected) {
    connectedIds.add(selected.id);
    for (const e of simEdges) {
      if (e.source.id === selected.id) connectedIds.add(e.target.id);
      if (e.target.id === selected.id) connectedIds.add(e.source.id);
    }
  }

  const appDetailHref = (id: string) => `/app/knowledge/applications/${id}` as Route;

  return (
    <div className="relative" ref={containerRef}>
      <svg
        width={dims.w}
        height={dims.h}
        viewBox={`0 0 ${dims.w} ${dims.h}`}
        className="w-full"
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
      >
        {/* Edges */}
        {simEdges.map((e, i) => {
          const isHighlighted =
            !selected ||
            (connectedIds.has(e.source.id) && connectedIds.has(e.target.id));
          return (
            <line
              key={i}
              x1={e.source.x}
              y1={e.source.y}
              x2={e.target.x}
              y2={e.target.y}
              stroke={
                e.type === "app-capability" ? "var(--green-border)" : "var(--amber-border)"
              }
              strokeWidth={isHighlighted ? 1.5 : 0.5}
              strokeOpacity={isHighlighted ? 0.8 : 0.2}
              strokeDasharray={e.type === "app-process" ? "4 3" : undefined}
            />
          );
        })}

        {/* Nodes */}
        {simNodes.map((node) => {
          const isSelected = selected?.id === node.id;
          const isDimmed = selected && !connectedIds.has(node.id);
          const color = NODE_COLORS[node.type];
          const bg = NODE_BG[node.type];

          return (
            <g
              key={node.id}
              style={{ cursor: "pointer" }}
              onMouseDown={(e) => onMouseDown(e, node)}
              onClick={() => onNodeClick(node)}
              onMouseEnter={(e) => {
                const svg = e.currentTarget.closest("svg");
                if (!svg) return;
                const rect = svg.getBoundingClientRect();
                setTooltip({ x: node.x, y: node.y, node });
              }}
              onMouseLeave={() => setTooltip(null)}
            >
              <circle
                cx={node.x}
                cy={node.y}
                r={node.r}
                fill={bg}
                fillOpacity={isDimmed ? 0.15 : 0.85}
                stroke={color}
                strokeWidth={isSelected ? 2.5 : 1.5}
                strokeOpacity={isDimmed ? 0.2 : 1}
              />
              {/* Label (only for larger nodes or selected) */}
              {(node.r >= 14 || isSelected) && (
                <text
                  x={node.x}
                  y={node.y + node.r + 12}
                  textAnchor="middle"
                  fill="var(--text-secondary)"
                  fontSize="9"
                  fontWeight="500"
                  fillOpacity={isDimmed ? 0.3 : 0.9}
                  style={{ userSelect: "none", pointerEvents: "none" }}
                >
                  {node.label.length > 18 ? node.label.slice(0, 16) + "…" : node.label}
                </text>
              )}
              {/* Type indicator dot for small nodes */}
              {node.r < 14 && (
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={node.r * 0.4}
                  fill={color}
                  fillOpacity={isDimmed ? 0.15 : 0.7}
                  style={{ pointerEvents: "none" }}
                />
              )}
            </g>
          );
        })}
      </svg>

      {/* Tooltip */}
      {tooltip && !selected && (
        <div
          className="pointer-events-none absolute z-40 rounded-xl border border-[--border] bg-[--bg-card] p-3 shadow-lg text-xs"
          style={{
            left: tooltip.x + 16,
            top: tooltip.y - 40,
            maxWidth: 200,
          }}
        >
          <p className="font-semibold text-[--text-primary] mb-0.5">{tooltip.node.label}</p>
          <p className="text-[--text-muted] capitalize">{tooltip.node.type}</p>
          {tooltip.node.aiReadinessScore != null && (
            <p className="text-[--text-muted]">Score IA : {Math.round(tooltip.node.aiReadinessScore)}/100</p>
          )}
        </div>
      )}

      {/* Side detail panel */}
      {selected && (
        <div className="absolute right-3 top-3 z-50 w-60 rounded-2xl border border-[--border] bg-[--bg-card] p-4 shadow-lg">
          <div className="flex items-start justify-between mb-3">
            <div>
              <p
                className="text-[10px] font-semibold uppercase tracking-wider mb-0.5"
                style={{ color: NODE_COLORS[selected.type] }}
              >
                {selected.type}
              </p>
              <p className="text-sm font-bold text-[--text-primary] leading-tight">
                {selected.label}
              </p>
            </div>
            <button
              onClick={() => setSelected(null)}
              className="ml-2 shrink-0 rounded-lg p-1 hover:bg-[--bg-hover] text-[--text-muted] transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-2 text-xs text-[--text-secondary]">
            {selected.lifecycleState && (
              <div className="flex justify-between">
                <span className="text-[--text-muted]">Cycle de vie</span>
                <span className="font-medium">{selected.lifecycleState}</span>
              </div>
            )}
            {selected.criticality && (
              <div className="flex justify-between">
                <span className="text-[--text-muted]">Criticité</span>
                <span className="font-medium capitalize">{selected.criticality}</span>
              </div>
            )}
            {selected.aiReadinessScore != null && (
              <div className="flex justify-between">
                <span className="text-[--text-muted]">Score IA</span>
                <span className="font-medium">{Math.round(selected.aiReadinessScore)}/100</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-[--text-muted]">Relations</span>
              <span className="font-medium">
                {simEdges.filter((e) => e.source.id === selected.id || e.target.id === selected.id).length}
              </span>
            </div>
          </div>

          {selected.type === "application" && (
            <Link
              href={appDetailHref(selected.id)}
              className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl border border-[--blue-dim] bg-[--blue-dim] px-3 py-2 text-xs font-medium text-[--blue] hover:opacity-80 transition-opacity"
            >
              Voir la fiche →
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
