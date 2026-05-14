import { requireAnyPermission } from "@/server/permissions";
import { insightsRepo }           from "@/lib/repositories/insights.repo";
import { RelationshipSuggestions } from "@/components/knowledge/RelationshipSuggestions";

export const dynamic = "force-dynamic";

export default async function RelationshipSuggestionsPage() {
  const { workspace } = await requireAnyPermission(["analytics.view", "opportunities.manage"]);

  const suggestions = await insightsRepo.findRelationshipSuggestions(workspace!.id);

  const pending = suggestions.filter((s) => s.status === "pending").length;
  const accepted = suggestions.filter((s) => s.status === "accepted").length;
  const rejected = suggestions.filter((s) => s.status === "rejected").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-3xl border border-[--border] bg-[--bg-card] p-8 shadow-soft-sm">
        <div className="flex items-center gap-2">
          <span className="inline-flex rounded-full border border-[--green-border] bg-[--green-dim] px-3 py-0.5 text-xs font-semibold text-[--green]">
            IA
          </span>
        </div>
        <h1 className="mt-3 text-3xl font-bold text-[--text-primary] tracking-tight">
          Relations suggérées par l'IA
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-7 text-[--text-secondary]">
          L'IA analyse votre référentiel et suggère des liens manquants entre applications,
          capabilities et processus. Acceptez ou rejetez chaque suggestion.
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        {[
          { label: "Total", value: suggestions.length, color: "text-[--text-primary]" },
          { label: "En attente", value: pending, color: "text-[--amber]" },
          { label: "Acceptées", value: accepted, color: "text-[--green]" },
          { label: "Rejetées", value: rejected, color: "text-[--text-muted]" },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl border border-[--border] bg-[--bg-card] p-5 shadow-sm">
            <p className="text-sm text-[--text-muted]">{s.label}</p>
            <p className={`mt-1 text-3xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Client component — fetches & manages suggestions internally */}
      <RelationshipSuggestions />
    </div>
  );
}
