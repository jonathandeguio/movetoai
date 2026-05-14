"use client";

import { useState } from "react";
import { ChevronRight, ChevronDown, GitBranch, Sparkles, Monitor, Plus } from "lucide-react";

export type CapabilityNode = {
  id: string;
  name: string;
  description?: string | null;
  level: number;
  parentId?: string | null;
  strategicValue?: string | null;
  aiPotential?: string | null;
  maturityScore?: number | null;
  owner?: { name: string | null } | null;
  _count: {
    processes: number;
    appCapabilities: number;
  };
  children: CapabilityNode[];
};

const AI_POTENTIAL_STYLES: Record<string, string> = {
  high:   "bg-[--green-dim] text-[--green] border border-[--green-border]",
  medium: "bg-[--amber-dim] text-[--amber] border border-[--amber-border]",
  low:    "bg-[--bg-hover] text-[--text-muted] border border-[--border]",
};

const STRATEGIC_VALUE_STYLES: Record<string, string> = {
  critical:      "bg-[--red-dim] text-[--red] border border-[--red-dim]",
  differentiating: "bg-[--blue-dim] text-[--blue] border border-[--blue-dim]",
  commodity:     "bg-[--bg-hover] text-[--text-muted] border border-[--border]",
};

const STRATEGIC_VALUE_LABELS: Record<string, string> = {
  critical:        "Critique",
  differentiating: "Différenciante",
  commodity:       "Commodity",
};

const AI_POTENTIAL_LABELS: Record<string, string> = {
  high:   "IA élevé",
  medium: "IA moyen",
  low:    "IA faible",
};

function CapabilityNodeCard({ node, depth = 0 }: { node: CapabilityNode; depth?: number }) {
  const [expanded, setExpanded] = useState(true);
  const hasChildren = node.children.length > 0;
  const indent = depth * 24;
  const canAddChild = node.level < 3;

  const aiKey = node.aiPotential?.toLowerCase();
  const svKey = node.strategicValue?.toLowerCase();

  return (
    <div>
      <div
        className="group flex items-start gap-3 rounded-xl border border-[--border] bg-[--bg-card] p-4 transition-all duration-150 hover:border-[--green-border] hover:shadow-sm"
        style={{ marginLeft: `${indent}px` }}
      >
        {/* Toggle button */}
        <button
          onClick={() => setExpanded(!expanded)}
          className={`mt-0.5 shrink-0 rounded p-0.5 text-[--text-muted] hover:text-[--text-primary] transition-colors ${!hasChildren ? "invisible" : ""}`}
        >
          {expanded ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="font-semibold text-[--text-primary] text-sm">{node.name}</span>

            {aiKey && AI_POTENTIAL_STYLES[aiKey] && (
              <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${AI_POTENTIAL_STYLES[aiKey]}`}>
                {AI_POTENTIAL_LABELS[aiKey] ?? node.aiPotential}
              </span>
            )}

            {svKey && STRATEGIC_VALUE_STYLES[svKey] && (
              <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STRATEGIC_VALUE_STYLES[svKey]}`}>
                {STRATEGIC_VALUE_LABELS[svKey] ?? node.strategicValue}
              </span>
            )}

            {node.maturityScore != null && (
              <span className="rounded-full border border-[--border] bg-[--bg-hover] px-2 py-0.5 text-xs text-[--text-muted]">
                Maturité {node.maturityScore}/5
              </span>
            )}
          </div>

          {node.description && (
            <p className="text-xs text-[--text-muted] line-clamp-1 mb-2">{node.description}</p>
          )}

          <div className="flex items-center gap-4 text-xs text-[--text-muted]">
            <span className="flex items-center gap-1">
              <GitBranch className="h-3 w-3" />
              <span>{node._count.processes} processus</span>
            </span>
            <span className="flex items-center gap-1">
              <Monitor className="h-3 w-3" />
              <span>{node._count.appCapabilities} apps</span>
            </span>
            {node.owner && (
              <>
                <span className="text-[--border]">·</span>
                <span>{node.owner.name}</span>
              </>
            )}
          </div>
        </div>

        {/* Add child button */}
        {canAddChild && (
          <button
            disabled
            title={node.level >= 3 ? "Niveau max atteint" : "Ajouter une sous-capability"}
            className="shrink-0 flex items-center gap-1 rounded-lg border border-[--border] px-2 py-1 text-xs text-[--text-muted] opacity-0 group-hover:opacity-100 transition-opacity hover:border-[--green-border] hover:text-[--green] disabled:cursor-not-allowed"
          >
            <Plus className="h-3 w-3" />
            Sous-capability
          </button>
        )}
      </div>

      {/* Children */}
      {hasChildren && expanded && (
        <div className="mt-1.5 space-y-1.5 border-l border-[--border-subtle] ml-[calc(12px)]" style={{ marginLeft: `${indent + 12}px` }}>
          <div className="pl-4 space-y-1.5">
            {node.children.map((child) => (
              <CapabilityNodeCard key={child.id} node={child} depth={0} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function CapabilityTree({ nodes }: { nodes: CapabilityNode[] }) {
  if (nodes.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-[--border] bg-[--bg-hover] py-16 text-center">
        <Sparkles className="h-10 w-10 text-[--text-disabled]" />
        <div>
          <p className="font-medium text-[--text-secondary]">Aucune capability définie</p>
          <p className="mt-1 text-sm text-[--text-muted]">
            Structurez vos capacités métier pour cartographier votre potentiel IA.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      {nodes.map((node) => (
        <CapabilityNodeCard key={node.id} node={node} depth={0} />
      ))}
    </div>
  );
}
