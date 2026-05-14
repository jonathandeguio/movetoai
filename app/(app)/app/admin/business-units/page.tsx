import { redirect } from "next/navigation";
import { Building2 } from "lucide-react";

import { requireAnyPermission } from "@/server/permissions";
import { getCurrentWorkspaceContext } from "@/server/auth";
import { businessUnitRepo } from "@/lib/repositories/business-unit.repo";
import { BusinessUnitCreateForm } from "@/components/admin/BusinessUnitCreateForm";
import { BusinessUnitEditForm } from "@/components/admin/BusinessUnitEditForm";

export const dynamic = "force-dynamic";

export default async function AdminBusinessUnitsPage() {
  await requireAnyPermission(["workspace.manage"]);

  const { workspace, role } = await getCurrentWorkspaceContext({ requireMembership: true });
  if (!workspace?.id) redirect("/onboarding");

  const canEdit = role?.code === "WORKSPACE_ADMIN";

  const businessUnits = await businessUnitRepo.findByWorkspace(workspace.id);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-[--text-primary]">
            Unités métier
          </h1>
          <p className="mt-1 text-sm text-[--text-muted]">
            {businessUnits.length} unité{businessUnits.length !== 1 ? "s" : ""} dans ce workspace
          </p>
        </div>
        {canEdit && <BusinessUnitCreateForm />}
      </div>

      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Total", value: businessUnits.length, color: "text-[--text-primary]" },
          {
            label: "Domaines rattachés",
            value: businessUnits.reduce((acc, bu) => acc + bu._count.domains, 0),
            color: "text-[--blue]",
          },
          {
            label: "Capacités rattachées",
            value: businessUnits.reduce((acc, bu) => acc + bu._count.capabilities, 0),
            color: "text-[--green]",
          },
        ].map((stat) => (
          <div key={stat.label} className="rounded-2xl border border-[--border] bg-[--bg-card] p-5 shadow-sm">
            <p className="text-sm text-[--text-muted]">{stat.label}</p>
            <p className={`mt-1 text-3xl font-bold ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* List */}
      {businessUnits.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-[--border] bg-[--bg-hover] py-16 text-center">
          <Building2 className="h-10 w-10 text-[--text-disabled]" />
          <div>
            <p className="font-medium text-[--text-secondary]">Aucune unité métier</p>
            <p className="mt-1 text-sm text-[--text-muted]">
              Les unités métier organisent vos domaines et capacités.
            </p>
          </div>
          {canEdit && <BusinessUnitCreateForm />}
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-[--border] bg-[--bg-card] shadow-sm">
          <table className="w-full text-sm">
            <thead className="border-b border-[--border-subtle] bg-[--bg-hover]">
              <tr>
                <th className="px-5 py-3 text-left font-medium text-[--text-secondary]">Nom</th>
                <th className="px-5 py-3 text-left font-medium text-[--text-secondary]">Code</th>
                <th className="px-5 py-3 text-left font-medium text-[--text-secondary]">Domaines</th>
                <th className="px-5 py-3 text-left font-medium text-[--text-secondary]">Capacités</th>
                <th className="px-5 py-3 text-left font-medium text-[--text-secondary]">Processus</th>
                {canEdit && (
                  <th className="px-5 py-3 text-left font-medium text-[--text-secondary]">Actions</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-[--border-subtle]">
              {businessUnits.map((bu) => (
                <tr key={bu.id} className="hover:bg-[--bg-hover] transition-colors">
                  <td className="px-5 py-3">
                    <p className="font-medium text-[--text-primary]">{bu.name}</p>
                    {bu.description && (
                      <p className="mt-0.5 text-xs text-[--text-muted] line-clamp-1">{bu.description}</p>
                    )}
                  </td>
                  <td className="px-5 py-3">
                    {bu.code ? (
                      <span className="rounded bg-[--bg-hover] px-2 py-0.5 font-mono text-xs text-[--text-secondary]">
                        {bu.code}
                      </span>
                    ) : (
                      <span className="text-[--text-disabled]">—</span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-[--text-muted]">{bu._count.domains}</td>
                  <td className="px-5 py-3 text-[--text-muted]">{bu._count.capabilities}</td>
                  <td className="px-5 py-3 text-[--text-muted]">{bu._count.processes}</td>
                  {canEdit && (
                    <td className="px-5 py-3">
                      <BusinessUnitEditForm
                        businessUnitId={bu.id}
                        initialName={bu.name}
                        initialDescription={bu.description ?? null}
                        initialCode={bu.code ?? null}
                      />
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
