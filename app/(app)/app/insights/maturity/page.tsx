import { requireAnyPermission } from "@/server/permissions";
import { capabilityRepo }        from "@/lib/repositories/capability.repo";

export const dynamic = "force-dynamic";

// ── Color helpers ──────────────────────────────────────────────────────────────

function maturityColor(score: number | null): string {
  if (score == null) return "var(--bg-hover)";
  if (score >= 4)    return "var(--green)";
  if (score >= 3)    return "var(--amber)";
  if (score >= 2)    return "var(--orange, #f97316)";
  return "var(--red)";
}

function maturityLabel(score: number | null): string {
  if (score == null) return "Non évalué";
  if (score >= 4)    return "Avancé";
  if (score >= 3)    return "Établi";
  if (score >= 2)    return "Émergent";
  return "Initial";
}

function maturityTextColor(score: number | null): string {
  if (score == null) return "var(--text-disabled)";
  if (score >= 4)    return "var(--green)";
  if (score >= 3)    return "var(--amber)";
  if (score >= 2)    return "var(--orange, #f97316)";
  return "var(--red)";
}

function maturityBg(score: number | null): string {
  if (score == null) return "var(--bg-hover)";
  if (score >= 4)    return "var(--green-dim)";
  if (score >= 3)    return "var(--amber-dim)";
  if (score >= 2)    return "color-mix(in srgb, var(--amber-dim) 50%, var(--red-dim) 50%)";
  return "var(--red-dim)";
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function MaturityHeatmapPage() {
  const { workspace } = await requireAnyPermission(["analytics.view", "opportunities.manage"]);

  const capabilities = await capabilityRepo.findForMaturity(workspace!.id);

  // Group by L1 domain
  const l1Caps = capabilities.filter((c) => !c.parentId);
  const byParent = new Map<string, typeof capabilities>();
  for (const cap of capabilities) {
    if (cap.parentId) {
      const group = byParent.get(cap.parentId) ?? [];
      group.push(cap);
      byParent.set(cap.parentId, group);
    }
  }

  // Global stats
  const evaluated = capabilities.filter((c) => c.maturityScore != null);
  const avgMaturity =
    evaluated.length > 0
      ? evaluated.reduce((sum, c) => sum + (c.maturityScore ?? 0), 0) / evaluated.length
      : null;

  const distribution = [1, 2, 3, 4, 5].map((score) => ({
    score,
    count: capabilities.filter((c) => Math.round(c.maturityScore ?? 0) === score).length,
  }));
  const maxDist = Math.max(...distribution.map((d) => d.count), 1);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-3xl border border-[--border] bg-[--bg-card] p-8 shadow-soft-sm">
        <div className="flex items-start gap-3">
          <span className="inline-flex rounded-full border border-[--amber-border] bg-[--amber-dim] px-3 py-0.5 text-xs font-semibold text-[--amber]">
            Insights
          </span>
        </div>
        <h1 className="mt-3 text-3xl font-bold text-[--text-primary] tracking-tight">
          Heatmap de maturité
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-7 text-[--text-secondary]">
          Vue thermique de la maturité de vos capabilities métier. Identifiez rapidement les zones de
          faiblesse et les priorités de renforcement.
        </p>
      </div>

      {/* KPI Row */}
      <div className="grid gap-4 sm:grid-cols-4">
        {[
          {
            label: "Total capabilities",
            value: capabilities.length.toString(),
            color: "text-[--text-primary]",
          },
          {
            label: "Domaines L1",
            value: l1Caps.length.toString(),
            color: "text-[--blue]",
          },
          {
            label: "Maturité moyenne",
            value: avgMaturity != null ? `${avgMaturity.toFixed(1)}/5` : "—",
            color: avgMaturity != null && avgMaturity >= 3 ? "text-[--green]" : "text-[--amber]",
          },
          {
            label: "Non évaluées",
            value: (capabilities.length - evaluated.length).toString(),
            color: "text-[--text-muted]",
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl border border-[--border] bg-[--bg-card] p-5 shadow-sm"
          >
            <p className="text-sm text-[--text-muted]">{stat.label}</p>
            <p className={`mt-1 text-3xl font-bold ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Distribution bar */}
      <div className="rounded-2xl border border-[--border] bg-[--bg-card] p-5 shadow-sm">
        <h2 className="mb-4 text-sm font-semibold text-[--text-secondary] uppercase tracking-wider">
          Distribution des scores
        </h2>
        <div className="flex items-end gap-3 h-24">
          {distribution.map(({ score, count }) => {
            const pct = maxDist > 0 ? (count / maxDist) * 100 : 0;
            const color = maturityColor(score);
            return (
              <div key={score} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-xs font-semibold text-[--text-secondary]">{count}</span>
                <div
                  className="w-full rounded-t-md transition-all"
                  style={{ height: `${Math.max(pct, 4)}%`, background: color, opacity: 0.85 }}
                />
                <span className="text-xs text-[--text-muted]">{score}/5</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Heatmap by L1 domain */}
      {l1Caps.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[--border] bg-[--bg-hover] py-16 text-center">
          <p className="font-medium text-[--text-secondary]">Aucune capability définie</p>
          <p className="mt-1 text-sm text-[--text-muted]">
            Ajoutez des capabilities dans le référentiel pour voir la heatmap.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {l1Caps.map((l1) => {
            const children = byParent.get(l1.id) ?? [];
            const l1Score = l1.maturityScore;

            return (
              <div
                key={l1.id}
                className="rounded-2xl border border-[--border] bg-[--bg-card] overflow-hidden shadow-sm"
              >
                {/* L1 row */}
                <div
                  className="flex items-center gap-4 px-5 py-4"
                  style={{ borderLeft: `4px solid ${maturityColor(l1Score)}` }}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-sm text-[--text-primary]">{l1.name}</span>
                      <span className="text-xs rounded-full border border-[--border] bg-[--bg-hover] px-2 py-0.5 text-[--text-muted]">
                        L1
                      </span>
                      {l1.strategicValue && (
                        <span className="text-xs rounded-full border border-[--blue-dim] bg-[--blue-dim] px-2 py-0.5 text-[--blue]">
                          {l1.strategicValue}
                        </span>
                      )}
                    </div>
                    <div className="mt-1 flex items-center gap-3 text-xs text-[--text-muted]">
                      <span>{children.length} sous-capability{children.length !== 1 ? "s" : ""}</span>
                      {l1.owner?.name && <span>· {l1.owner.name}</span>}
                    </div>
                  </div>

                  {/* Score pill */}
                  <div
                    className="shrink-0 rounded-xl px-4 py-2 text-center min-w-[80px]"
                    style={{
                      background: maturityBg(l1Score),
                      border: `1px solid ${maturityColor(l1Score)}`,
                    }}
                  >
                    <p
                      className="text-lg font-bold"
                      style={{ color: maturityTextColor(l1Score) }}
                    >
                      {l1Score != null ? `${l1Score}/5` : "—"}
                    </p>
                    <p
                      className="text-[9px] font-semibold uppercase tracking-wide"
                      style={{ color: maturityTextColor(l1Score) }}
                    >
                      {maturityLabel(l1Score)}
                    </p>
                  </div>
                </div>

                {/* Children grid */}
                {children.length > 0 && (
                  <div className="border-t border-[--border-subtle] grid gap-px bg-[--border-subtle]"
                    style={{ gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))" }}>
                    {children.map((child) => (
                      <div
                        key={child.id}
                        className="bg-[--bg-card] px-4 py-3 flex items-center justify-between gap-2"
                      >
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-[--text-primary] truncate">
                            {child.name}
                          </p>
                          <p className="text-[10px] text-[--text-muted] mt-0.5">
                            {child._count.processes} proc · {child._count.appCapabilities} apps
                          </p>
                        </div>
                        <div
                          className="shrink-0 h-8 w-8 rounded-lg flex items-center justify-center text-[10px] font-bold"
                          style={{
                            background: maturityBg(child.maturityScore),
                            color: maturityTextColor(child.maturityScore),
                          }}
                          title={maturityLabel(child.maturityScore)}
                        >
                          {child.maturityScore != null ? child.maturityScore : "?"}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Legend */}
      <div className="rounded-2xl border border-[--border] bg-[--bg-card] p-5 shadow-sm">
        <h2 className="mb-3 text-sm font-semibold text-[--text-secondary] uppercase tracking-wider">
          Légende
        </h2>
        <div className="flex flex-wrap gap-3">
          {[
            { range: "4-5", label: "Avancé", color: "var(--green)", bg: "var(--green-dim)", border: "var(--green-border)" },
            { range: "3-4", label: "Établi", color: "var(--amber)", bg: "var(--amber-dim)", border: "var(--amber-border)" },
            { range: "2-3", label: "Émergent", color: "#f97316", bg: "#fff7ed", border: "#fed7aa" },
            { range: "1-2", label: "Initial", color: "var(--red)", bg: "var(--red-dim)", border: "var(--red-dim)" },
            { range: "—", label: "Non évalué", color: "var(--text-muted)", bg: "var(--bg-hover)", border: "var(--border)" },
          ].map((item) => (
            <div
              key={item.label}
              className="flex items-center gap-2 rounded-lg border px-3 py-1.5"
              style={{ borderColor: item.border, background: item.bg }}
            >
              <div
                className="h-3 w-3 rounded-sm"
                style={{ background: item.color }}
              />
              <span className="text-xs font-medium" style={{ color: item.color }}>
                {item.range} — {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
