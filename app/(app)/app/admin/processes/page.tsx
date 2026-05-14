import { redirect } from "next/navigation";
import Link from "next/link";
import { Network, Search } from "lucide-react";

import { getCurrentWorkspaceContext } from "@/server/auth";
import { processRepo } from "@/lib/repositories/process.repo";
import { domainRepo }  from "@/lib/repositories/domain.repo";
import { ProcessCreateForm } from "@/components/admin/ProcessCreateForm";

export const dynamic = "force-dynamic";

const STATUS_STYLE: Record<string, { label: string; className: string }> = {
  ACTIVE:   { label: "Actif",         className: "bg-[--green-dim] text-[--green] border-[--green-border]" },
  INACTIVE: { label: "Inactif",       className: "bg-[--bg-hover] text-[--text-muted] border-[--border]" },
  DRAFT:    { label: "Brouillon",     className: "bg-[--amber-dim] text-[--amber] border-[--amber-border]" },
  ARCHIVED: { label: "Archivé",       className: "bg-[--bg-hover] text-[--text-disabled] border-[--border]" }
};

export default async function AdminProcessesPage() {
  const { workspace, role } = await getCurrentWorkspaceContext({ requireMembership: true });
  if (!workspace?.id) redirect("/onboarding");

  const [processes, domains] = await Promise.all([
    processRepo.findForAdmin(workspace.id),
    domainRepo.findByWorkspace(workspace.id),
  ]);

  const canEdit = role?.code === "WORKSPACE_ADMIN";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-[--text-primary]">
            Catalogue des processus
          </h1>
          <p className="mt-1 text-sm text-[--text-muted]">
            {processes.length} processus dans ce workspace
          </p>
        </div>
        {canEdit && <ProcessCreateForm domains={domains} />}
      </div>

      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Total", value: processes.length, color: "text-[--text-primary]" },
          { label: "Actifs", value: processes.filter(p => p.processStatus === "ACTIVE").length, color: "text-[--green]" },
          { label: "En attente", value: processes.filter(p => p.processStatus === "DRAFT" || p.processStatus === "INACTIVE").length, color: "text-[--amber]" }
        ].map((stat) => (
          <div key={stat.label} className="rounded-2xl border border-[--border] bg-[--bg-card] p-5 shadow-sm">
            <p className="text-sm text-[--text-muted]">{stat.label}</p>
            <p className={`mt-1 text-3xl font-bold ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Process list */}
      {processes.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-[--border] bg-[--bg-hover] py-16 text-center">
          <Network className="h-10 w-10 text-[--text-disabled]" />
          <div>
            <p className="font-medium text-[--text-secondary]">Aucun processus cartographié</p>
            <p className="mt-1 text-sm text-[--text-muted]">
              Commencez par ajouter vos premiers processus métier.
            </p>
          </div>
          {canEdit ? (
            <ProcessCreateForm domains={domains} />
          ) : null}
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-[--border] bg-[--bg-card] shadow-sm">
          <table className="w-full text-sm">
            <thead className="border-b border-[--border-subtle] bg-[--bg-hover]">
              <tr>
                <th className="px-5 py-3 text-left font-medium text-[--text-secondary]">Processus</th>
                <th className="px-5 py-3 text-left font-medium text-[--text-secondary]">Domaine</th>
                <th className="px-5 py-3 text-left font-medium text-[--text-secondary]">Responsable</th>
                <th className="px-5 py-3 text-left font-medium text-[--text-secondary]">Statut</th>
                <th className="px-5 py-3 text-left font-medium text-[--text-secondary]">Mis à jour</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[--border-subtle]">
              {processes.map((p) => {
                const statusInfo = STATUS_STYLE[p.processStatus] ?? STATUS_STYLE.INACTIVE;
                return (
                  <tr key={p.id} className="hover:bg-[--bg-hover] transition-colors">
                    <td className="px-5 py-3">
                      <Link
                        href={`/app/processes/${p.id}`}
                        className="font-medium text-[--text-primary] hover:text-[--blue] transition-colors"
                      >
                        {p.name}
                      </Link>
                    </td>
                    <td className="px-5 py-3 text-[--text-muted]">
                      {p.domain?.name ?? <span className="text-[--text-disabled]">—</span>}
                    </td>
                    <td className="px-5 py-3 text-[--text-muted]">
                      {p.owner?.name ?? <span className="text-[--text-disabled]">—</span>}
                    </td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium ${statusInfo.className}`}>
                        {statusInfo.label}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-[--text-muted]">
                      {new Date(p.updatedAt).toLocaleDateString("fr-FR")}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex items-center gap-2 text-xs text-[--text-muted]">
        <Search className="h-3.5 w-3.5" />
        Pour une gestion complète (filtres, domains, scoring), accédez au{" "}
        <Link href="/app/processes" className="text-[--blue] hover:underline">
          catalogue principal
        </Link>.
      </div>
    </div>
  );
}
