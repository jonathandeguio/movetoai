import { requireAnyPermission } from "@/server/permissions";
import { applicationRepo }       from "@/lib/repositories/application.repo";
import { DependencyGraph } from "@/components/insights/DependencyGraph";

export const dynamic = "force-dynamic";

export default async function DependencyGraphPage() {
  const { workspace } = await requireAnyPermission(["analytics.view", "opportunities.manage"]);

  const applications = await applicationRepo.findForDependencyGraph(workspace!.id);

  // Build nodes and edges
  type GraphNode = {
    id: string;
    label: string;
    type: "application" | "capability" | "process";
    lifecycleState?: string | null;
    criticality?: string | null;
    aiReadinessScore?: number | null;
  };

  type GraphEdge = {
    source: string;
    target: string;
    type: "app-capability" | "app-process";
  };

  const nodeMap = new Map<string, GraphNode>();
  const edges: GraphEdge[] = [];

  for (const app of applications) {
    nodeMap.set(app.id, {
      id: app.id,
      label: app.name,
      type: "application",
      lifecycleState: app.lifecycleState,
      criticality: app.criticality,
      aiReadinessScore: app.aiReadinessScore != null ? Number(app.aiReadinessScore) : null,
    });

    for (const { capability } of app.capabilities) {
      if (!nodeMap.has(capability.id)) {
        nodeMap.set(capability.id, {
          id: capability.id,
          label: capability.name,
          type: "capability",
        });
      }
      edges.push({ source: app.id, target: capability.id, type: "app-capability" });
    }

    for (const { process } of app.processes) {
      if (!nodeMap.has(process.id)) {
        nodeMap.set(process.id, {
          id: process.id,
          label: process.name,
          type: "process",
        });
      }
      edges.push({ source: app.id, target: process.id, type: "app-process" });
    }
  }

  const nodes = Array.from(nodeMap.values());
  const appCount = nodes.filter((n) => n.type === "application").length;
  const capCount = nodes.filter((n) => n.type === "capability").length;
  const procCount = nodes.filter((n) => n.type === "process").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-3xl border border-[--border] bg-[--bg-card] p-8 shadow-soft-sm">
        <div className="flex items-center gap-2">
          <span className="inline-flex rounded-full border border-[--blue-dim] bg-[--blue-dim] px-3 py-0.5 text-xs font-semibold text-[--blue]">
            Insights
          </span>
        </div>
        <h1 className="mt-3 text-3xl font-bold text-[--text-primary] tracking-tight">
          Graphe de dépendances
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-7 text-[--text-secondary]">
          Visualisez les relations entre vos applications, capabilities et processus.
          Identifiez les nœuds critiques et les zones de couplage fort.
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        {[
          { label: "Applications", value: appCount, color: "text-[--blue]" },
          { label: "Capabilities", value: capCount, color: "text-[--green]" },
          { label: "Processus", value: procCount, color: "text-[--amber]" },
          { label: "Relations", value: edges.length, color: "text-[--text-primary]" },
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

      {/* Graph */}
      {nodes.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[--border] bg-[--bg-hover] py-16 text-center">
          <p className="font-medium text-[--text-secondary]">Aucune donnée disponible</p>
          <p className="mt-1 text-sm text-[--text-muted]">
            Référencez des applications et leurs relations pour voir le graphe.
          </p>
        </div>
      ) : (
        <div className="rounded-2xl border border-[--border] bg-[--bg-card] shadow-sm overflow-hidden">
          <DependencyGraph nodes={nodes} edges={edges} />
        </div>
      )}

      {/* Legend */}
      <div className="rounded-2xl border border-[--border] bg-[--bg-card] p-5 shadow-sm">
        <h2 className="mb-3 text-sm font-semibold text-[--text-secondary] uppercase tracking-wider">
          Légende
        </h2>
        <div className="flex flex-wrap gap-4">
          {[
            { label: "Application", color: "var(--blue)", desc: "Système applicatif" },
            { label: "Capability", color: "var(--green)", desc: "Capacité métier" },
            { label: "Processus", color: "var(--amber)", desc: "Processus métier" },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-2">
              <div
                className="h-4 w-4 rounded-full"
                style={{ background: item.color, opacity: 0.85 }}
              />
              <div>
                <p className="text-xs font-semibold text-[--text-primary]">{item.label}</p>
                <p className="text-[10px] text-[--text-muted]">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
        <p className="mt-3 text-xs text-[--text-muted]">
          Cliquez sur un nœud pour voir ses détails. La taille des nœuds applications est proportionnelle au score de maturité IA.
        </p>
      </div>
    </div>
  );
}
