import { redirect } from "next/navigation";
import { Plus } from "lucide-react";

import { requirePermission }  from "@/server/permissions";
import { capabilityRepo }      from "@/lib/repositories/capability.repo";
import { CapabilityTree, type CapabilityNode } from "@/components/knowledge/CapabilityTree";

export const dynamic = "force-dynamic";

function buildTree(
  capabilities: Array<{
    id: string;
    name: string;
    description: string | null;
    level: number;
    parentId: string | null;
    strategicValue: string | null;
    aiPotential: string | null;
    maturityScore: number | null;
    owner: { name: string | null } | null;
    _count: { processes: number; appCapabilities: number };
  }>
): CapabilityNode[] {
  const map = new Map<string, CapabilityNode>();

  for (const cap of capabilities) {
    map.set(cap.id, { ...cap, children: [] });
  }

  const roots: CapabilityNode[] = [];

  for (const node of map.values()) {
    if (!node.parentId) {
      roots.push(node);
    } else {
      const parent = map.get(node.parentId);
      if (parent) {
        parent.children.push(node);
      } else {
        // Orphan — traité comme root
        roots.push(node);
      }
    }
  }

  return roots;
}

export default async function KnowledgeCapabilitiesPage() {
  const { workspace } = await requirePermission("business-structure.manage");
  if (!workspace?.id) redirect("/onboarding");

  const capabilities = await capabilityRepo.findForKnowledge(workspace.id);

  const tree = buildTree(capabilities);
  const total = capabilities.length;
  const l1Count = capabilities.filter((c) => !c.parentId).length;
  const highAi = capabilities.filter((c) => c.aiPotential?.toLowerCase() === "high").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-[--text-primary]">
            Capabilities métier
          </h1>
          <p className="mt-1 text-sm text-[--text-muted]">
            {total} capabilit{total !== 1 ? "ies" : "y"}
            {l1Count > 0 && ` · ${l1Count} domaine${l1Count !== 1 ? "s" : ""} racine`}
          </p>
        </div>
        <button
          disabled
          title="Fonctionnalité disponible prochainement"
          className="inline-flex items-center gap-1.5 rounded-lg bg-[--blue] px-4 py-2 text-sm font-medium text-white opacity-50 cursor-not-allowed"
        >
          <Plus className="h-4 w-4" />
          Nouvelle capability
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Total", value: total, color: "text-[--text-primary]" },
          { label: "Domaines racines (L1)", value: l1Count, color: "text-[--blue]" },
          { label: "Potentiel IA élevé", value: highAi, color: "text-[--green]" },
        ].map((stat) => (
          <div key={stat.label} className="rounded-2xl border border-[--border] bg-[--bg-card] p-5 shadow-sm">
            <p className="text-sm text-[--text-muted]">{stat.label}</p>
            <p className={`mt-1 text-3xl font-bold ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Tree */}
      <CapabilityTree nodes={tree} />
    </div>
  );
}
