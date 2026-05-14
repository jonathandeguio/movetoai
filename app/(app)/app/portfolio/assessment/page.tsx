import { requireAnyPermission } from "@/server/permissions";
import { applicationRepo } from "@/lib/repositories/application.repo";
import { AssessmentMatrix } from "@/components/portfolio/AssessmentMatrix";
import type { AssessmentApp } from "@/components/portfolio/AssessmentMatrix";

export const dynamic = "force-dynamic";

// ── Calc functions (server-side, same logic as API route) ─────────────────────

interface AppData {
  id: string;
  name: string;
  vendor: string | null;
  lifecycleState: string | null;
  criticality: string | null;
  annualCost: number | null;
  userCount: number | null;
  aiReadinessScore: number | null;
  _count: { capabilities: number; processes: number };
}

function computeTechDebt(app: AppData): number {
  const lifecycleDebt: Record<string, number> = {
    plan: 10,
    active: 20,
    tolerate: 55,
    phaseout: 80,
    retire: 95,
  };
  const base = lifecycleDebt[app.lifecycleState ?? "active"] ?? 30;
  const penalty =
    app.aiReadinessScore != null ? Math.max(0, 50 - app.aiReadinessScore) * 0.4 : 20;
  return Math.min(100, base + penalty);
}

function computeBusinessValue(app: AppData): number {
  const critScore: Record<string, number> = {
    critical: 95,
    high: 75,
    medium: 50,
    low: 25,
  };
  const base = critScore[app.criticality ?? "low"] ?? 40;
  const capBonus = Math.min(20, app._count.capabilities * 5);
  const procBonus = Math.min(15, app._count.processes * 3);
  return Math.min(100, base + capBonus + procBonus);
}

function computeQuadrant(
  businessValue: number,
  techDebt: number
): "invest" | "renovate" | "maintain" | "retire" {
  const highValue = businessValue >= 50;
  const highDebt = techDebt >= 50;
  if (highValue && !highDebt) return "invest";
  if (highValue && highDebt) return "renovate";
  if (!highValue && !highDebt) return "maintain";
  return "retire";
}

// ── Quadrant legend data ───────────────────────────────────────────────────────

const QUADRANT_LEGEND = [
  {
    key: "invest",
    label: "Investir",
    desc: "Valeur élevée, dette faible — priorité d'investissement",
    color: "var(--green)",
    bg: "var(--green-dim)",
    border: "var(--green-border)",
  },
  {
    key: "renovate",
    label: "Rénover",
    desc: "Valeur élevée, dette élevée — modernisation urgente",
    color: "var(--amber)",
    bg: "var(--amber-dim)",
    border: "var(--amber-border)",
  },
  {
    key: "maintain",
    label: "Maintenir",
    desc: "Valeur faible, dette faible — conservation à coût minimal",
    color: "var(--text-muted)",
    bg: "var(--bg-hover)",
    border: "var(--border)",
  },
  {
    key: "retire",
    label: "Retirer",
    desc: "Valeur faible, dette élevée — décommissionnement recommandé",
    color: "var(--red)",
    bg: "var(--red-dim)",
    border: "var(--red-dim)",
  },
] as const;

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function PortfolioAssessmentPage() {
  const { workspace } = await requireAnyPermission(["opportunities.manage", "analytics.view"]);

  const rawApps = await applicationRepo.findForAssessment(workspace!.id);

  const apps: AssessmentApp[] = rawApps.map((app) => {
    const techDebt = computeTechDebt(app);
    const businessValue = computeBusinessValue(app);
    const quadrant = computeQuadrant(businessValue, techDebt);
    return {
      id: app.id,
      name: app.name,
      vendor: app.vendor,
      lifecycleState: app.lifecycleState,
      criticality: app.criticality,
      annualCost: app.annualCost != null ? Number(app.annualCost) : null,
      userCount: app.userCount,
      aiReadinessScore: app.aiReadinessScore,
      techDebt,
      businessValue,
      quadrant,
    };
  });

  // Summary counts per quadrant
  const counts = apps.reduce(
    (acc, a) => {
      acc[a.quadrant] = (acc[a.quadrant] ?? 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <section className="rounded-3xl border border-[--border] bg-[--bg-card] p-8 shadow-soft-sm">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="inline-flex rounded-full border border-[--blue-dim] bg-[--blue-dim] px-3 py-0.5 text-xs font-semibold text-[--blue]">
              Portfolio
            </span>
            <span className="text-xs text-[--text-muted]">{apps.length} application{apps.length !== 1 ? "s" : ""}</span>
          </div>
          <h1 className="text-3xl font-bold text-[--text-primary] tracking-tight">
            Assessment Matrix
          </h1>
          <p className="max-w-2xl text-sm leading-7 text-[--text-secondary]">
            Positionnez chaque application selon sa <strong>valeur métier</strong> et sa{" "}
            <strong>dette technique</strong> pour prioriser les décisions de modernisation.
            La taille de chaque bulle est proportionnelle au coût annuel. Cliquez sur une bulle
            pour voir le détail.
          </p>
        </div>
      </section>

      {/* Summary pills */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {QUADRANT_LEGEND.map((q) => (
          <div
            key={q.key}
            className="rounded-2xl border p-4"
            style={{ borderColor: q.border, background: q.bg }}
          >
            <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: q.color }}>
              {q.label}
            </p>
            <p className="mt-1 text-2xl font-bold" style={{ color: q.color }}>
              {counts[q.key] ?? 0}
            </p>
            <p className="mt-0.5 text-xs text-[--text-muted]">application{(counts[q.key] ?? 0) !== 1 ? "s" : ""}</p>
          </div>
        ))}
      </div>

      {/* Matrix */}
      <div className="rounded-2xl border border-[--border] bg-[--bg-card] p-6 shadow-sm">
        {apps.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="text-lg font-semibold text-[--text-primary] mb-2">
              Aucune application référencée
            </p>
            <p className="text-sm text-[--text-muted] max-w-sm">
              Ajoutez des applications dans le référentiel pour voir la matrice d&apos;assessment.
            </p>
          </div>
        ) : (
          <AssessmentMatrix apps={apps} />
        )}
      </div>

      {/* Legend */}
      <div className="rounded-2xl border border-[--border] bg-[--bg-card] p-5 shadow-sm">
        <h2 className="mb-4 text-sm font-semibold text-[--text-secondary] uppercase tracking-wider">
          Légende des quadrants
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {QUADRANT_LEGEND.map((q) => (
            <div
              key={q.key}
              className="rounded-xl border p-3"
              style={{ borderColor: q.border, background: q.bg }}
            >
              <div className="flex items-center gap-2 mb-1">
                <div
                  className="h-3 w-3 rounded-full"
                  style={{ background: q.color }}
                />
                <span className="text-sm font-semibold" style={{ color: q.color }}>
                  {q.label}
                </span>
              </div>
              <p className="text-xs text-[--text-muted]">{q.desc}</p>
            </div>
          ))}
        </div>
        <p className="mt-4 text-xs text-[--text-muted]">
          La taille des bulles est proportionnelle au coût annuel de l&apos;application.
        </p>
      </div>
    </div>
  );
}
