"use client";

import { useState } from "react";
import { Sparkles, Loader2, AlertTriangle, RefreshCw, CheckCircle, Zap, Shield, Wrench, Archive } from "lucide-react";

export interface ModernizationAdvice {
  strategy: "keep" | "renovate" | "replace" | "retire";
  summary: string;
  rationale: string;
  quickWins: string[];
  risks: string[];
  estimatedEffort: "low" | "medium" | "high";
  recommendedTechnologies: string[];
}

const STRATEGY_META = {
  keep: {
    label: "Conserver",
    icon: CheckCircle,
    color: "var(--green)",
    bg: "var(--green-dim)",
    border: "var(--green-border)",
  },
  renovate: {
    label: "Rénover",
    icon: Wrench,
    color: "var(--amber)",
    bg: "var(--amber-dim)",
    border: "var(--amber-border)",
  },
  replace: {
    label: "Remplacer",
    icon: Zap,
    color: "var(--blue)",
    bg: "var(--blue-dim)",
    border: "var(--blue-dim)",
  },
  retire: {
    label: "Retirer",
    icon: Archive,
    color: "var(--red)",
    bg: "var(--red-dim)",
    border: "var(--red-dim)",
  },
} as const;

const EFFORT_META = {
  low:    { label: "Faible",  color: "var(--green)" },
  medium: { label: "Moyen",   color: "var(--amber)" },
  high:   { label: "Élevé",   color: "var(--red)"   },
} as const;

interface Props {
  applicationId: string;
  initialAdvice?: ModernizationAdvice | null;
}

export function ModernizationAdvicePanel({ applicationId, initialAdvice }: Props) {
  const [advice, setAdvice]     = useState<ModernizationAdvice | null>(initialAdvice ?? null);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState<string | null>(null);

  async function generate() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/applications/${applicationId}/modernization-advice`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erreur inconnue");
      setAdvice(data.advice);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur de génération");
    } finally {
      setLoading(false);
    }
  }

  const strategyMeta = advice ? STRATEGY_META[advice.strategy] : null;
  const StrategyIcon = strategyMeta?.icon ?? Sparkles;

  return (
    <div className="rounded-2xl border border-[--border] bg-[--bg-card] p-5 shadow-sm">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-[--blue]" />
          <h2 className="text-sm font-semibold text-[--text-secondary] uppercase tracking-wider">
            Conseil de modernisation IA
          </h2>
        </div>
        <button
          onClick={generate}
          disabled={loading}
          className="flex items-center gap-1.5 rounded-lg border border-[--border] bg-[--bg-hover] px-3 py-1.5 text-xs font-medium text-[--text-secondary] transition-all hover:border-[--blue-dim] hover:text-[--blue] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <RefreshCw className="h-3.5 w-3.5" />
          )}
          {advice ? "Régénérer" : "Générer"}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-3 flex items-start gap-2 rounded-xl border border-[--red-dim] bg-[--red-dim] p-3 text-xs text-[--red]">
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          {error}
        </div>
      )}

      {/* Empty state */}
      {!advice && !loading && !error && (
        <p className="text-xs text-[--text-muted]">
          Générez une recommandation IA personnalisée basée sur le cycle de vie, la criticité et le score de maturité de cette application.
        </p>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div className="space-y-3 animate-pulse">
          <div className="h-10 rounded-xl bg-[--bg-hover]" />
          <div className="h-4 rounded bg-[--bg-hover] w-3/4" />
          <div className="h-4 rounded bg-[--bg-hover] w-1/2" />
        </div>
      )}

      {/* Advice */}
      {advice && strategyMeta && (
        <div className="space-y-4">
          {/* Strategy badge */}
          <div
            className="flex items-center gap-3 rounded-xl border p-4"
            style={{ borderColor: strategyMeta.border, background: strategyMeta.bg }}
          >
            <StrategyIcon className="h-5 w-5 shrink-0" style={{ color: strategyMeta.color }} />
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: strategyMeta.color }}>
                Stratégie recommandée
              </p>
              <p className="text-sm font-bold text-[--text-primary]">{strategyMeta.label}</p>
            </div>
            <div className="ml-auto text-right">
              <p className="text-xs text-[--text-muted]">Effort estimé</p>
              <p
                className="text-sm font-semibold"
                style={{ color: EFFORT_META[advice.estimatedEffort].color }}
              >
                {EFFORT_META[advice.estimatedEffort].label}
              </p>
            </div>
          </div>

          {/* Summary */}
          <p className="text-sm text-[--text-secondary] leading-relaxed">{advice.summary}</p>

          {/* Rationale (collapsible detail) */}
          <p className="text-xs text-[--text-muted] leading-relaxed">{advice.rationale}</p>

          {/* Quick wins */}
          {advice.quickWins.length > 0 && (
            <div>
              <p className="mb-2 text-xs font-semibold text-[--text-secondary] uppercase tracking-wider">
                Actions rapides
              </p>
              <ul className="space-y-1">
                {advice.quickWins.map((win, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-[--text-secondary]">
                    <span className="mt-0.5 h-4 w-4 shrink-0 rounded-full bg-[--green-dim] text-center text-[9px] font-bold leading-4 text-[--green]">
                      {i + 1}
                    </span>
                    {win}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Risks */}
          {advice.risks.length > 0 && (
            <div>
              <p className="mb-2 text-xs font-semibold text-[--text-secondary] uppercase tracking-wider flex items-center gap-1">
                <Shield className="h-3 w-3" />
                Risques
              </p>
              <ul className="space-y-1">
                {advice.risks.map((risk, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-[--text-muted]">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[--amber]" />
                    {risk}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Recommended technologies */}
          {advice.recommendedTechnologies.length > 0 && (
            <div>
              <p className="mb-2 text-xs font-semibold text-[--text-secondary] uppercase tracking-wider">
                Technologies suggérées
              </p>
              <div className="flex flex-wrap gap-1.5">
                {advice.recommendedTechnologies.map((tech, i) => (
                  <span
                    key={i}
                    className="rounded-full border border-[--border] bg-[--bg-hover] px-2.5 py-0.5 text-xs text-[--text-secondary]"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
