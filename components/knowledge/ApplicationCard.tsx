"use client";

import type { Route } from "next";
import Link from "next/link";
import { Monitor, GitBranch, Users, DollarSign } from "lucide-react";
import { LifecycleBadge } from "./LifecycleBadge";

type ApplicationCardProps = {
  id: string;
  name: string;
  vendor?: string | null;
  description?: string | null;
  lifecycleState?: string | null;
  criticality?: string | null;
  deploymentType?: string | null;
  annualCost?: number | null;
  userCount?: number | null;
  aiReadinessScore?: number | null;
  businessOwner?: { name: string | null } | null;
  itOwner?: { name: string | null } | null;
  _count: {
    processes: number;
    capabilities: number;
    opportunities: number;
  };
};

const CRITICALITY_STYLES: Record<string, string> = {
  critical: "bg-[--red-dim] text-[--red] border-[--red-dim]",
  high:     "bg-[--amber-dim] text-[--amber] border-[--amber-border]",
  medium:   "bg-[--blue-dim] text-[--blue] border-[--blue-dim]",
  low:      "bg-[--bg-hover] text-[--text-muted] border-[--border]",
};

const CRITICALITY_LABELS: Record<string, string> = {
  critical: "Critique",
  high:     "Élevée",
  medium:   "Moyenne",
  low:      "Faible",
};

function AiReadinessGauge({ score }: { score: number }) {
  const pct = Math.min(Math.max(score, 0), 100);
  const r = 20;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;

  const color = pct >= 70 ? "var(--green)" : pct >= 40 ? "var(--amber)" : "var(--red)";

  return (
    <div className="flex flex-col items-center gap-1">
      <svg width="52" height="52" viewBox="0 0 52 52">
        <circle cx="26" cy="26" r={r} fill="none" stroke="var(--border)" strokeWidth="4" />
        <circle
          cx="26"
          cy="26"
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="4"
          strokeDasharray={`${dash} ${circ - dash}`}
          strokeLinecap="round"
          transform="rotate(-90 26 26)"
        />
        <text x="26" y="30" textAnchor="middle" fill="var(--text-primary)" fontSize="11" fontWeight="600">
          {pct}
        </text>
      </svg>
      <span className="text-xs text-[--text-muted]">Score IA</span>
    </div>
  );
}

export function ApplicationCard({
  id,
  name,
  vendor,
  description,
  lifecycleState,
  criticality,
  deploymentType,
  annualCost,
  userCount,
  aiReadinessScore,
  _count,
}: ApplicationCardProps) {
  const critKey = criticality?.toLowerCase();
  const critStyle = critKey ? (CRITICALITY_STYLES[critKey] ?? CRITICALITY_STYLES.low) : null;
  const critLabel = critKey ? (CRITICALITY_LABELS[critKey] ?? criticality) : null;

  return (
    <Link
      href={`/app/knowledge/applications/${id}` as Route}
      className="group flex flex-col rounded-2xl border border-[--border] bg-[--bg-card] p-5 shadow-sm transition-all duration-200 hover:border-[--green-border] hover:shadow-md hover:-translate-y-0.5"
    >
      {/* Header */}
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-bold text-[--text-primary] group-hover:text-[--green] transition-colors leading-tight truncate">
            {name}
          </h3>
          {vendor && (
            <span className="inline-block mt-1 rounded-full border border-[--border] bg-[--bg-hover] px-2 py-0.5 text-xs text-[--text-muted]">
              {vendor}
            </span>
          )}
        </div>
        {aiReadinessScore != null && <AiReadinessGauge score={aiReadinessScore} />}
      </div>

      {/* Badges */}
      <div className="mb-3 flex flex-wrap gap-2">
        <LifecycleBadge lifecycle={lifecycleState} />
        {critLabel && critStyle && (
          <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium ${critStyle}`}>
            {critLabel}
          </span>
        )}
        {deploymentType && (
          <span className="inline-flex rounded-full border border-[--border] bg-[--bg-hover] px-2.5 py-0.5 text-xs text-[--text-muted]">
            {deploymentType}
          </span>
        )}
      </div>

      {/* Description */}
      {description && (
        <p className="mb-3 text-sm text-[--text-muted] line-clamp-2 leading-relaxed flex-1">
          {description}
        </p>
      )}

      {/* Stats */}
      {(annualCost != null || userCount != null) && (
        <div className="mb-3 flex flex-wrap gap-4 text-xs text-[--text-muted]">
          {annualCost != null && (
            <div className="flex items-center gap-1">
              <DollarSign className="h-3 w-3" />
              <span>{new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(annualCost)}/an</span>
            </div>
          )}
          {userCount != null && (
            <div className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              <span>{userCount.toLocaleString("fr-FR")} utilisateurs</span>
            </div>
          )}
        </div>
      )}

      {/* Footer counters */}
      <div className="mt-auto flex items-center gap-3 border-t border-[--border-subtle] pt-3 text-xs text-[--text-muted]">
        <span className="flex items-center gap-1">
          <Monitor className="h-3 w-3" />
          <span className="font-medium text-[--text-secondary]">{_count.processes}</span>
          {" "}processus
        </span>
        <span className="text-[--border]">·</span>
        <span className="flex items-center gap-1">
          <GitBranch className="h-3 w-3" />
          <span className="font-medium text-[--text-secondary]">{_count.capabilities}</span>
          {" "}capabilities
        </span>
      </div>
    </Link>
  );
}
