import { redirect } from "next/navigation";
import { Monitor } from "lucide-react";

import { requireAnyPermission } from "@/server/permissions";
import { getCurrentWorkspaceContext } from "@/server/auth";
import { applicationRepo } from "@/lib/repositories/application.repo";
import { ApplicationCreateForm } from "@/components/admin/ApplicationCreateForm";
import { ApplicationEditForm } from "@/components/admin/ApplicationEditForm";

export const dynamic = "force-dynamic";

export default async function AdminApplicationsPage() {
  await requireAnyPermission(["workspace.manage", "business-structure.manage"]);

  const { workspace, role } = await getCurrentWorkspaceContext({ requireMembership: true });
  if (!workspace?.id) redirect("/onboarding");

  const canEdit = ["WORKSPACE_ADMIN", "ENTERPRISE_ARCHITECT", "TRANSFORMATION_MANAGER"].includes(role?.code ?? "");

  const applications = await applicationRepo.findForAdmin(workspace.id);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-[--text-primary]">
            Applications
          </h1>
          <p className="mt-1 text-sm text-[--text-muted]">
            {applications.length} application{applications.length !== 1 ? "s" : ""} dans ce workspace
          </p>
        </div>
        {canEdit && <ApplicationCreateForm />}
      </div>

      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Total", value: applications.length, color: "text-[--text-primary]" },
          {
            label: "Liées à des processus",
            value: applications.filter((a) => a._count.processes > 0).length,
            color: "text-[--blue]",
          },
          {
            label: "Liées à des opportunités",
            value: applications.filter((a) => a._count.opportunities > 0).length,
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
      {applications.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-[--border] bg-[--bg-hover] py-16 text-center">
          <Monitor className="h-10 w-10 text-[--text-disabled]" />
          <div>
            <p className="font-medium text-[--text-secondary]">Aucune application référencée</p>
            <p className="mt-1 text-sm text-[--text-muted]">
              Ajoutez les applications utilisées dans vos processus métier.
            </p>
          </div>
          {canEdit && <ApplicationCreateForm />}
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-[--border] bg-[--bg-card] shadow-sm">
          <table className="w-full text-sm">
            <thead className="border-b border-[--border-subtle] bg-[--bg-hover]">
              <tr>
                <th className="px-5 py-3 text-left font-medium text-[--text-secondary]">Application</th>
                <th className="px-5 py-3 text-left font-medium text-[--text-secondary]">Éditeur</th>
                <th className="px-5 py-3 text-left font-medium text-[--text-secondary]">Processus</th>
                <th className="px-5 py-3 text-left font-medium text-[--text-secondary]">Opportunités</th>
                {canEdit && (
                  <th className="px-5 py-3 text-left font-medium text-[--text-secondary]">Actions</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-[--border-subtle]">
              {applications.map((app) => (
                <tr key={app.id} className="hover:bg-[--bg-hover] transition-colors">
                  <td className="px-5 py-3">
                    <p className="font-medium text-[--text-primary]">{app.name}</p>
                    {app.description && (
                      <p className="mt-0.5 text-xs text-[--text-muted] line-clamp-1">{app.description}</p>
                    )}
                  </td>
                  <td className="px-5 py-3 text-[--text-muted]">
                    {app.vendor ?? <span className="text-[--text-disabled]">—</span>}
                  </td>
                  <td className="px-5 py-3 text-[--text-muted]">{app._count.processes}</td>
                  <td className="px-5 py-3 text-[--text-muted]">{app._count.opportunities}</td>
                  {canEdit && (
                    <td className="px-5 py-3">
                      <ApplicationEditForm
                        applicationId={app.id}
                        initialName={app.name}
                        initialVendor={app.vendor ?? null}
                        initialDescription={app.description ?? null}
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
