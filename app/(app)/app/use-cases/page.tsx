import { Suspense } from "react";
import { Lightbulb, Plus, Search, Filter } from "lucide-react";
import Link from "next/link";
import type { Route } from "next";

import { getCurrentWorkspaceContext } from "@/server/auth";
import { useCaseRepo }                from "@/lib/repositories/use-case.repo";
import { canReadUseCases }            from "@/lib/permissions/opportunities";
import { UseCaseStatusBadge } from "@/components/shared/status-badge";
import { PriorityBadge } from "@/components/shared/priority-badge";
import { DomainBadge } from "@/components/shared/domain-badge";
import { cn } from "@/lib/utils";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const STATUS_OPTIONS = [
  { value: "backlog",   label: "Backlog" },
  { value: "analysis",  label: "Analyse" },
  { value: "active",    label: "Actif" },
  { value: "deployed",  label: "Déployé" },
  { value: "paused",    label: "Pausé" },
] as const;

const PRIORITY_OPTIONS = ["P0", "P1", "P2"] as const;

async function UseCaseList({
  workspaceId,
  roleCode,
  search,
  status,
  priority,
}: {
  workspaceId: string;
  roleCode: string;
  search?: string;
  status?: string;
  priority?: string;
}) {
  if (!canReadUseCases(roleCode)) {
    return (
      <div className="rounded-xl border border-[--red-dim] bg-[--red-dim] px-6 py-10 text-center">
        <p className="text-sm font-medium text-[--red]">Accès non autorisé à ce module.</p>
      </div>
    );
  }

  const useCases = await useCaseRepo.findByWorkspace(workspaceId, { search, status, priority });

  if (useCases.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-[--border] py-20 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[--bg-hover]">
          <Lightbulb className="h-5 w-5 text-[--text-muted]" />
        </div>
        <p className="text-sm font-medium text-[--text-secondary]">Aucun cas d'usage trouvé</p>
        <p className="max-w-xs text-xs text-[--text-muted]">
          Les cas d'usage sont créés lors de la conversion d'une opportunité validée.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-[--border] bg-[--bg-card]">
      <table className="w-full text-sm">
        <thead className="bg-[--bg-hover]">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[--text-muted]">Cas d'usage</th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[--text-muted]">Domaine</th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[--text-muted]">Type</th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[--text-muted]">Priorité</th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[--text-muted]">Statut</th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[--text-muted]">Effort</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[--border]">
          {useCases.map((uc) => {
            const roi = uc.roiEstimated as Record<string, number> | null;
            return (
              <tr key={uc.id} className="group hover:bg-[--bg-hover] transition-colors">
                <td className="px-4 py-3">
                  <Link
                    href={`/app/use-cases/${uc.id}` as Route}
                    className="block"
                  >
                    <p className="font-medium text-[--text-primary] group-hover:text-[--green] transition-colors">
                      {uc.title}
                    </p>
                    {uc.opportunity && (
                      <p className="mt-0.5 text-xs text-[--text-muted]">
                        ↳ {uc.opportunity.title}
                      </p>
                    )}
                  </Link>
                </td>
                <td className="px-4 py-3">
                  {uc.opportunity?.domainLabel ? (
                    <DomainBadge domain={uc.opportunity.domainLabel} />
                  ) : (
                    <span className="text-xs text-[--text-muted]">—</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <span className="rounded-full bg-[--bg-hover] px-2 py-0.5 text-xs text-[--text-secondary]">
                    {uc.solutionType ?? "—"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {uc.priorityLevel ? (
                    <PriorityBadge priority={uc.priorityLevel as "P0" | "P1" | "P2"} />
                  ) : (
                    <span className="text-xs text-[--text-muted]">—</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <UseCaseStatusBadge status={uc.status} />
                </td>
                <td className="px-4 py-3 text-xs text-[--text-secondary]">
                  {uc.effortDays != null ? `${uc.effortDays}j` : "—"}
                  {roi?.savings_euros_per_year ? (
                    <span className="ml-2 text-[--green]">
                      {(roi.savings_euros_per_year / 1000).toFixed(0)}k€/an
                    </span>
                  ) : null}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default async function UseCasesPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const search = typeof sp.search === "string" ? sp.search : undefined;
  const status = typeof sp.status === "string" ? sp.status : undefined;
  const priority = typeof sp.priority === "string" ? sp.priority : undefined;

  const { workspace, role } = await getCurrentWorkspaceContext({ requireMembership: true });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[--text-primary]">Cas d'usage IA</h1>
          <p className="mt-0.5 text-sm text-[--text-muted]">
            Spécifications et suivi de livraison des cas d'usage validés.
          </p>
        </div>
      </div>

      {/* Filters */}
      <form method="get" className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[--text-muted]" />
          <input
            name="search"
            defaultValue={search}
            placeholder="Rechercher un cas d'usage…"
            className="h-9 w-full rounded-xl border border-input bg-[--bg-card] pl-9 pr-3 text-sm placeholder:text-[--text-muted] focus:outline-none focus:ring-2 focus:ring-[--border-focus]"
          />
        </div>

        <select
          name="status"
          defaultValue={status ?? ""}
          className="h-9 rounded-xl border border-input bg-[--bg-card] px-3 text-sm text-[--text-secondary] focus:outline-none focus:ring-2 focus:ring-[--border-focus]"
        >
          <option value="">Tous les statuts</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>

        <select
          name="priority"
          defaultValue={priority ?? ""}
          className="h-9 rounded-xl border border-input bg-[--bg-card] px-3 text-sm text-[--text-secondary] focus:outline-none focus:ring-2 focus:ring-[--border-focus]"
        >
          <option value="">Toutes priorités</option>
          {PRIORITY_OPTIONS.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>

        <button
          type="submit"
          className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-[--green-border] bg-[--green-dim] px-3 text-sm font-medium text-[--green] hover:bg-[--green-dim] transition-colors"
        >
          <Filter className="h-3.5 w-3.5" />
          Filtrer
        </button>

        {(search || status || priority) && (
          <Link
            href={"/app/use-cases" as Route}
            className="inline-flex h-9 items-center rounded-xl border border-[--border] bg-[--bg-card] px-3 text-sm text-[--text-muted] hover:text-[--text-secondary] transition-colors"
          >
            Réinitialiser
          </Link>
        )}
      </form>

      {/* List */}
      <Suspense
        fallback={
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-14 animate-pulse rounded-xl bg-[--bg-hover]" />
            ))}
          </div>
        }
      >
        <UseCaseList
          workspaceId={workspace?.id ?? ""}
          roleCode={role?.code ?? ""}
          search={search}
          status={status}
          priority={priority}
        />
      </Suspense>
    </div>
  );
}
