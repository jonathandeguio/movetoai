"use client";

import type { Route } from "next";
import Link from "next/link";
import { Star, GitBranch, Sparkles, User, Clock, Zap } from "lucide-react";

type ProcessCardProps = {
  id: string;
  name: string;
  description?: string | null;
  aiPotential?: string | null;
  frequency?: string | null;
  manualEffortH?: number | null;
  painLevel?: number | null;
  automationRate?: number | null;
  capability?: { id: string; name: string } | null;
  domain?: { id: string; name: string } | null;
  owner?: { id: string; name: string | null } | null;
  _count: {
    steps: number;
    opportunities: number;
    applications: number;
  };
};

const AI_POTENTIAL_STYLES: Record<string, string> = {
  high:   "bg-[--green-dim] text-[--green] border border-[--green-border]",
  medium: "bg-[--amber-dim] text-[--amber] border border-[--amber-border]",
  low:    "bg-[--bg-hover] text-[--text-muted] border border-[--border]",
};

const AI_POTENTIAL_LABELS: Record<string, string> = {
  high:   "Potentiel élevé",
  medium: "Potentiel moyen",
  low:    "Potentiel faible",
};

function StarRating({ value, max = 5 }: { value: number | null | undefined; max?: number }) {
  const filled = Math.min(Math.max(Math.round(value ?? 0), 0), max);
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: max }).map((_, i) => (
        <Star
          key={i}
          className={`h-3.5 w-3.5 ${i < filled ? "fill-[--amber] text-[--amber]" : "fill-none text-[--border]"}`}
        />
      ))}
    </div>
  );
}

export function ProcessCard({
  id,
  name,
  description,
  aiPotential,
  frequency,
  manualEffortH,
  painLevel,
  automationRate,
  capability,
  owner,
  _count,
}: ProcessCardProps) {
  const potentialKey = aiPotential?.toLowerCase() ?? "low";
  const potentialStyle = AI_POTENTIAL_STYLES[potentialKey] ?? AI_POTENTIAL_STYLES.low;
  const potentialLabel = AI_POTENTIAL_LABELS[potentialKey] ?? "Non défini";

  return (
    <Link
      href={`/app/knowledge/processes/${id}` as Route}
      className="group block rounded-2xl border border-[--border] bg-[--bg-card] p-5 shadow-sm transition-all duration-200 hover:border-[--green-border] hover:shadow-md hover:-translate-y-0.5"
    >
      {/* Header */}
      <div className="mb-3 flex items-start justify-between gap-3">
        <h3 className="font-semibold text-[--text-primary] leading-snug group-hover:text-[--green] transition-colors line-clamp-2">
          {name}
        </h3>
        {aiPotential && (
          <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${potentialStyle}`}>
            {potentialLabel}
          </span>
        )}
      </div>

      {/* Description */}
      {description && (
        <p className="mb-3 text-sm text-[--text-muted] line-clamp-2 leading-relaxed">
          {description}
        </p>
      )}

      {/* Capability badge */}
      {capability && (
        <div className="mb-3">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[--bg-hover] px-2.5 py-0.5 text-xs text-[--text-secondary] border border-[--border-subtle]">
            <GitBranch className="h-3 w-3" />
            {capability.name}
          </span>
        </div>
      )}

      {/* Metrics row */}
      <div className="mb-4 flex flex-wrap items-center gap-4 text-xs text-[--text-muted]">
        {painLevel != null && (
          <div className="flex items-center gap-1.5">
            <span className="text-[--text-muted]">Douleur</span>
            <StarRating value={painLevel} />
          </div>
        )}
        {manualEffortH != null && (
          <div className="flex items-center gap-1.5">
            <Clock className="h-3 w-3" />
            <span>{manualEffortH}h/sem.</span>
          </div>
        )}
        {automationRate != null && (
          <div className="flex items-center gap-1.5">
            <Zap className="h-3 w-3 text-[--green]" />
            <span className="text-[--green] font-medium">{Math.round(automationRate)}%</span>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-[--border-subtle] pt-3">
        <div className="flex items-center gap-3 text-xs text-[--text-muted]">
          <span className="flex items-center gap-1">
            <span className="font-medium text-[--text-secondary]">{_count.steps}</span>
            {" "}étapes
          </span>
          <span className="text-[--border]">·</span>
          <span className="flex items-center gap-1">
            <Sparkles className="h-3 w-3 text-[--blue]" />
            <span className="font-medium text-[--text-secondary]">{_count.opportunities}</span>
            {" "}use cases
          </span>
        </div>
        {owner && (
          <div className="flex items-center gap-1 text-xs text-[--text-muted]">
            <User className="h-3 w-3" />
            <span>{owner.name}</span>
          </div>
        )}
      </div>
    </Link>
  );
}
