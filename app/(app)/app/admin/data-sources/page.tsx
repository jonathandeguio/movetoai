import { redirect } from "next/navigation";
import { Database } from "lucide-react";

import { requireAnyPermission } from "@/server/permissions";
import { getCurrentWorkspaceContext } from "@/server/auth";
import { dataSourceRepo } from "@/lib/repositories/data-source.repo";
import { DataSourceCreateForm } from "@/components/admin/DataSourceCreateForm";

export const dynamic = "force-dynamic";

export default async function AdminDataSourcesPage() {
  await requireAnyPermission(["workspace.manage", "business-structure.manage"]);

  const { workspace, role } = await getCurrentWorkspaceContext({ requireMembership: true });
  if (!workspace?.id) redirect("/onboarding");

  const canEdit = ["WORKSPACE_ADMIN", "ENTERPRISE_ARCHITECT", "TRANSFORMATION_MANAGER"].includes(role?.code ?? "");

  const dataSources = await dataSourceRepo.findByWorkspace(workspace.id);

  const classificationColors: Record<string, string> = {
    "Confidentiel": "bg-[--red-dim] text-[--red] border-[--red-dim]",
    "Interne":      "bg-[--amber-dim] text-[--amber] border-[--amber-border]",
    "Public":       "bg-[--green-dim] text-[--green] border-[--green-border]",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-[--text-primary]">
            Sources de données
          </h1>
          <p className="mt-1 text-sm text-[--text-muted]">
            {dataSources.length} source{dataSources.length !== 1 ? "s" : ""} dans ce workspace
          </p>
        </div>
        {canEdit && <DataSourceCreateForm />}
      </div>

      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Total", value: dataSources.length, color: "text-[--text-primary]" },
          {
            label: "Liées à des processus",
            value: dataSources.filter((d) => d._count.processes > 0).length,
            color: "text-[--blue]",
          },
          {
            label: "Liées à des opportunités",
            value: dataSources.filter((d) => d._count.opportunities > 0).length,
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
      {dataSources.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-[--border] bg-[--bg-hover] py-16 text-center">
          <Database className="h-10 w-10 text-[--text-disabled]" />
          <div>
            <p className="font-medium text-[--text-secondary]">Aucune source de données référencée</p>
            <p className="mt-1 text-sm text-[--text-muted]">
              Référencez les données utilisées dans vos processus et opportunités.
            </p>
          </div>
          {canEdit && <DataSourceCreateForm />}
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-[--border] bg-[--bg-card] shadow-sm">
          <table className="w-full text-sm">
            <thead className="border-b border-[--border-subtle] bg-[--bg-hover]">
              <tr>
                <th className="px-5 py-3 text-left font-medium text-[--text-secondary]">Source</th>
                <th className="px-5 py-3 text-left font-medium text-[--text-secondary]">Système</th>
                <th className="px-5 py-3 text-left font-medium text-[--text-secondary]">Classification</th>
                <th className="px-5 py-3 text-left font-medium text-[--text-secondary]">Processus</th>
                <th className="px-5 py-3 text-left font-medium text-[--text-secondary]">Opportunités</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[--border-subtle]">
              {dataSources.map((ds) => {
                const classColor = ds.classification ? (classificationColors[ds.classification] ?? "bg-[--bg-hover] text-[--text-secondary] border-[--border]") : null;
                return (
                  <tr key={ds.id} className="hover:bg-[--bg-hover] transition-colors">
                    <td className="px-5 py-3">
                      <p className="font-medium text-[--text-primary]">{ds.name}</p>
                      {ds.description && (
                        <p className="mt-0.5 text-xs text-[--text-muted] line-clamp-1">{ds.description}</p>
                      )}
                    </td>
                    <td className="px-5 py-3 text-[--text-muted]">
                      {ds.systemName ?? <span className="text-[--text-disabled]">—</span>}
                    </td>
                    <td className="px-5 py-3">
                      {classColor ? (
                        <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium ${classColor}`}>
                          {ds.classification}
                        </span>
                      ) : (
                        <span className="text-[--text-disabled]">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-[--text-muted]">{ds._count.processes}</td>
                    <td className="px-5 py-3 text-[--text-muted]">{ds._count.opportunities}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
