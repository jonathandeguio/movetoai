import { AlertCircle, ArrowRight, CheckCircle2, TrendingUp, Zap } from "lucide-react";

import { getCurrentWorkspaceContext } from "@/lib/current-workspace";
import { getExecutiveDashboardData } from "@/modules/workspace/server/executive-onboarding";
import type { ExecutiveQuickWin } from "@/modules/workspace/server/executive-onboarding";

export const dynamic = "force-dynamic";

function MaturityGauge({ score }: { score: number }) {
  const getBarColor = () => {
    if (score >= 70) return "var(--green)";
    if (score >= 40) return "var(--amber)";
    return "var(--purple)";
  };
  const getLabel = () => {
    if (score >= 70) return "Avancé";
    if (score >= 40) return "En progression";
    return "Débutant";
  };

  return (
    <div
      style={{
        borderRadius: "var(--r-xl)",
        border: "1px solid var(--purple-border)",
        background: "var(--purple-dim)",
        padding: "1.5rem",
      }}
    >
      <div className="mb-1 flex items-center gap-2 text-sm font-medium text-[--purple]">
        <TrendingUp className="h-4 w-4" />
        Score maturité IA
      </div>
      <div className="mb-3 flex items-end gap-2">
        <span className="text-5xl font-bold text-[--text-primary]">{score}</span>
        <span className="mb-1 text-xl text-[--text-muted]">/100</span>
        <span
          className="mb-1 ml-2 text-xs font-semibold text-[--purple]"
          style={{
            borderRadius: "var(--r-pill)",
            background: "var(--purple-dim)",
            border: "1px solid var(--purple-border)",
            padding: "2px 10px",
          }}
        >
          {getLabel()}
        </span>
      </div>
      <div
        style={{
          height: "12px",
          borderRadius: "var(--r-pill)",
          background: "var(--bg-hover)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            borderRadius: "var(--r-pill)",
            background: getBarColor(),
            width: `${score}%`,
            transition: "width var(--t-norm)",
          }}
        />
      </div>
    </div>
  );
}

function QuickWinCard({ win, index }: { win: ExecutiveQuickWin; index: number }) {
  const effortStyles: Record<string, { bg: string; color: string }> = {
    low:    { bg: "var(--green-dim)",  color: "var(--green)"  },
    medium: { bg: "var(--amber-dim)",  color: "var(--amber)"  },
    high:   { bg: "var(--red-dim)",    color: "var(--red)"    },
  };
  const effortLabel = { low: "Faible effort", medium: "Effort moyen", high: "Effort élevé" };
  const effort = effortStyles[win.effort] ?? effortStyles.medium;

  return (
    <div
      style={{
        borderRadius: "var(--r-xl)",
        border: "1px solid var(--border)",
        background: "var(--bg-card)",
        padding: "1.25rem",
      }}
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <span
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "28px",
              height: "28px",
              borderRadius: "50%",
              background: "var(--purple-dim)",
              border: "1px solid var(--purple-border)",
              fontSize: "12px",
              fontWeight: 700,
              color: "var(--purple)",
              flexShrink: 0,
            }}
          >
            {index + 1}
          </span>
          <h3 className="font-semibold text-[--text-primary] leading-tight">{win.title}</h3>
        </div>
        <span
          style={{
            flexShrink: 0,
            borderRadius: "var(--r-pill)",
            background: effort.bg,
            color: effort.color,
            padding: "2px 10px",
            fontSize: "11px",
            fontWeight: 500,
          }}
        >
          {effortLabel[win.effort]}
        </span>
      </div>
      <p className="mb-4 text-sm text-[--text-secondary]">{win.description}</p>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "0.25rem 1.25rem",
          borderRadius: "var(--r-lg)",
          background: "var(--bg-hover)",
          padding: "0.5rem 0.75rem",
          fontSize: "12px",
        }}
      >
        <span className="text-[--text-muted]">
          <span className="font-semibold text-[--green]">ROI estimé :</span> {win.roi}
        </span>
        <span className="text-[--text-muted]">
          <span className="font-semibold text-[--text-secondary]">Délai :</span> {win.timeframe}
        </span>
      </div>
    </div>
  );
}

export default async function ExecutiveDashboardPage() {
  const { session, workspace } = await getCurrentWorkspaceContext({ requireMembership: true });

  const data = await getExecutiveDashboardData(
    session.user.id,
    workspace?.id ?? ""
  );

  const deploymentRate =
    data.processCount > 0
      ? Math.min(100, Math.round((data.opportunityCount / data.processCount) * 100))
      : 0;

  const alerts = [
    { type: "action", label: "2 opportunités IA sans responsable assigné", urgent: true },
    { type: "info",   label: "Rapport mensuel disponible — mars 2026",       urgent: false },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome strip */}
      <div
        style={{
          borderRadius: "var(--r-xl)",
          border: "1px solid var(--purple-border)",
          background: "linear-gradient(135deg, var(--purple-dim) 0%, var(--bg-card) 100%)",
          padding: "1.25rem 1.5rem",
        }}
      >
        <p className="text-sm text-[--text-muted]">Bonjour,</p>
        <p className="text-xl font-bold text-[--text-primary]">
          {data.jobTitle ? `${data.jobTitle}` : session.user?.name ?? "Dirigeant"}
        </p>
        {data.ambition && (
          <p className="mt-1 text-sm text-[--text-secondary]">
            Objectif : {data.ambition.replace(/_/g, " ")}
          </p>
        )}
      </div>

      {/* KPI grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MaturityGauge score={data.maturityScore} />

        {/* ROI widget */}
        <div
          style={{
            borderRadius: "var(--r-xl)",
            border: "1px solid var(--green-border)",
            background: "var(--green-dim)",
            padding: "1.5rem",
          }}
        >
          <div className="mb-1 flex items-center gap-2 text-sm font-medium text-[--green]">
            <Zap className="h-4 w-4" />
            ROI estimé (annuel)
          </div>
          <div className="text-4xl font-bold text-[--text-primary]">
            {data.opportunityCount > 0 ? `+${data.opportunityCount * 12}k€` : "—"}
          </div>
          <p className="mt-1 text-xs text-[--text-muted]">
            Basé sur {data.opportunityCount} opportunité(s) identifiée(s)
          </p>
        </div>

        {/* Avancement */}
        <div
          style={{
            borderRadius: "var(--r-xl)",
            border: "1px solid var(--border)",
            background: "var(--bg-card)",
            padding: "1.5rem",
          }}
        >
          <div className="mb-1 text-sm font-medium text-[--text-secondary]">Avancement global</div>
          <div className="text-4xl font-bold text-[--text-primary]">{deploymentRate}%</div>
          <p className="mt-1 text-xs text-[--text-muted]">
            {data.processCount} processus cartographiés
          </p>
          <div
            style={{
              marginTop: "0.75rem",
              height: "8px",
              borderRadius: "var(--r-pill)",
              background: "var(--bg-hover)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                borderRadius: "var(--r-pill)",
                background: "var(--purple)",
                width: `${deploymentRate}%`,
              }}
            />
          </div>
        </div>

        {/* Alertes */}
        <div
          style={{
            borderRadius: "var(--r-xl)",
            border: "1px solid var(--amber-border)",
            background: "var(--amber-dim)",
            padding: "1.5rem",
          }}
        >
          <div className="mb-3 flex items-center gap-2 text-sm font-medium text-[--amber]">
            <AlertCircle className="h-4 w-4" />
            Alertes décisionnelles
          </div>
          <div className="space-y-2">
            {alerts.map((a, i) => (
              <div key={i} className="flex items-start gap-2 text-xs text-[--text-secondary]">
                {a.urgent ? (
                  <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[--amber]" />
                ) : (
                  <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[--text-muted]" />
                )}
                {a.label}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick wins */}
      {data.quickWins.length > 0 && (
        <div>
          <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-[--text-primary]">
            <Zap className="h-4 w-4 text-[--purple]" />
            Top 3 quick-wins recommandés
          </h2>
          <div className="grid gap-4 lg:grid-cols-3">
            {data.quickWins.map((win, i) => (
              <QuickWinCard key={i} win={win} index={i} />
            ))}
          </div>
        </div>
      )}

      {/* CTA to strategy */}
      <div className="flex justify-end">
        <a
          href="/app/dashboard/executive/strategy"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
            borderRadius: "var(--r-xl)",
            border: "1px solid var(--purple-border)",
            background: "var(--purple-dim)",
            padding: "0.625rem 1rem",
            fontSize: "14px",
            fontWeight: 500,
            color: "var(--purple)",
            transition: "background var(--t-fast)",
            textDecoration: "none",
          }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.background = "var(--bg-hover)")}
          onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.background = "var(--purple-dim)")}
        >
          Voir la roadmap stratégique
          <ArrowRight className="h-4 w-4" />
        </a>
      </div>
    </div>
  );
}
