import { requireAnyPermission } from "@/server/permissions";
import { technologyRepo }        from "@/lib/repositories/technology.repo";
import { TechRadarChart } from "@/components/insights/TechRadarChart";

export const dynamic = "force-dynamic";

export default async function TechRadarPage() {
  const { workspace } = await requireAnyPermission(["analytics.view", "opportunities.manage"]);

  const technologies = await technologyRepo.findForRadar(workspace!.id);

  const ringCounts = {
    adopt: technologies.filter((t) => t.lifecycleState === "adopt").length,
    trial: technologies.filter((t) => t.lifecycleState === "trial").length,
    hold: technologies.filter((t) => ["hold", "phaseout"].includes(t.lifecycleState)).length,
    emerging: technologies.filter((t) => t.lifecycleState === "emerging").length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-3xl border border-[--border] bg-[--bg-card] p-8 shadow-soft-sm">
        <div className="flex items-center gap-2">
          <span className="inline-flex rounded-full border border-[--blue-border] bg-[--blue-dim] px-3 py-0.5 text-xs font-semibold text-[--blue]">
            Insights
          </span>
        </div>
        <h1 className="mt-3 text-3xl font-bold text-[--text-primary] tracking-tight">
          Tech Radar
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-7 text-[--text-secondary]">
          Visualisez l'état de maturité de votre portefeuille technologique. Chaque point représente
          une technologie positionnée dans l'une des quatre zones : Adopt, Trial, Hold ou Emerging.
        </p>
      </div>

      {/* Ring stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        {[
          { label: "ADOPT", value: ringCounts.adopt, color: "text-[--green]", border: "border-[--green-border]", bg: "bg-[--green-dim]" },
          { label: "TRIAL", value: ringCounts.trial, color: "text-[--blue]", border: "border-[--border]", bg: "bg-[--bg-card]" },
          { label: "HOLD", value: ringCounts.hold, color: "text-[--amber]", border: "border-[--border]", bg: "bg-[--bg-card]" },
          { label: "EMERGING", value: ringCounts.emerging, color: "text-[--text-muted]", border: "border-[--border]", bg: "bg-[--bg-card]" },
        ].map((s) => (
          <div key={s.label} className={`rounded-2xl border ${s.border} ${s.bg} p-5 shadow-sm`}>
            <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
            <p className="mt-1 text-xs font-semibold tracking-widest text-[--text-muted]">{s.label}</p>
          </div>
        ))}
      </div>

      {technologies.length === 0 ? (
        <div className="rounded-2xl border border-[--border] bg-[--bg-card] p-12 text-center">
          <p className="text-sm text-[--text-muted]">Aucune technologie enregistrée pour ce workspace.</p>
          <p className="mt-1 text-xs text-[--text-muted]">
            Ajoutez des technologies depuis la section Connaissances → Technologies.
          </p>
        </div>
      ) : (
        <TechRadarChart technologies={technologies} />
      )}
    </div>
  );
}
