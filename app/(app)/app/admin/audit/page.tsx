import type { Route } from "next";
import Link from "next/link";
import { Download } from "lucide-react";

import { requirePermission } from "@/server/permissions";
import { auditLogRepo } from "@/lib/repositories/audit-log.repo";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

function formatDate(d: Date | string) {
  return new Date(d).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function AuditPage({
  searchParams,
}: {
  searchParams: { entityType?: string; action?: string };
}) {
  const { workspace } = await requirePermission("business-structure.manage");

  const [logs, entityTypes] = await Promise.all([
    auditLogRepo.findByWorkspace(workspace!.id, {
      entityType: searchParams.entityType,
      action:     searchParams.action,
    }),
    auditLogRepo.findDistinctEntityTypes(workspace!.id),
  ]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <Badge variant="gray">Admin</Badge>
          <h1 className="text-2xl font-semibold tracking-tight text-[--text-primary]">
            Journal d'audit
          </h1>
          <p className="text-sm text-[--text-muted]">
            Historique des 100 dernières actions sur ce workspace.
          </p>
        </div>
        <Link
          href={"/api/audit/export" as Route}
          className="inline-flex items-center gap-2 rounded-xl border border-[--border] bg-[--bg-card] px-4 py-2.5 text-sm font-medium text-[--text-secondary] hover:bg-[--bg-hover] hover:text-[--text-primary] transition-colors"
        >
          <Download className="h-4 w-4" />
          Exporter CSV
        </Link>
      </div>

      {/* Filters */}
      <form method="GET" className="flex flex-wrap gap-3">
        <select
          name="entityType"
          defaultValue={searchParams.entityType ?? ""}
          className="rounded-xl border border-[--border] bg-[--bg-card] px-3 py-2 text-sm text-[--text-secondary] focus:border-[--blue] focus:outline-none focus:ring-1 focus:ring-[--blue]"
        >
          <option value="">Tous les types</option>
          {entityTypes.map((et) => (
            <option key={et} value={et}>
              {et}
            </option>
          ))}
        </select>
        <input
          name="action"
          type="text"
          defaultValue={searchParams.action ?? ""}
          placeholder="Filtrer par action…"
          className="rounded-xl border border-[--border] bg-[--bg-card] px-3 py-2 text-sm text-[--text-secondary] placeholder:text-[--text-muted] focus:border-[--blue] focus:outline-none focus:ring-1 focus:ring-[--blue]"
        />
        <button
          type="submit"
          className="rounded-xl bg-[--blue-dim] border border-[--border] px-4 py-2 text-sm font-medium text-[--blue] hover:opacity-80 transition-opacity"
        >
          Filtrer
        </button>
        {(searchParams.entityType || searchParams.action) && (
          <Link
            href={"/app/admin/audit" as Route}
            className="rounded-xl border border-[--border] bg-[--bg-card] px-4 py-2 text-sm font-medium text-[--text-muted] hover:bg-[--bg-hover] transition-colors"
          >
            Réinitialiser
          </Link>
        )}
      </form>

      {/* Table */}
      <div className="rounded-2xl border border-[--border] bg-[--bg-card] shadow-sm">
        {logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-16 text-[--text-muted]">
            <p className="text-sm">Aucune entrée dans le journal d'audit.</p>
            {(searchParams.entityType || searchParams.action) && (
              <p className="text-xs">Essayez de réinitialiser les filtres.</p>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[--border]">
                  <th className="px-4 py-3 text-left font-medium text-[--text-muted] whitespace-nowrap">Date</th>
                  <th className="px-4 py-3 text-left font-medium text-[--text-muted]">Acteur</th>
                  <th className="px-4 py-3 text-left font-medium text-[--text-muted]">Action</th>
                  <th className="px-4 py-3 text-left font-medium text-[--text-muted]">Entité</th>
                  <th className="px-4 py-3 text-left font-medium text-[--text-muted]">Type</th>
                  <th className="px-4 py-3 text-left font-medium text-[--text-muted]">Résumé</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[--border-subtle]">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-[--bg-hover] transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap text-xs text-[--text-muted]">
                      {formatDate(log.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-[--text-primary] text-xs">
                        {log.actorUser?.name ?? "—"}
                      </p>
                      <p className="text-[10px] text-[--text-muted]">{log.actorUser?.email ?? ""}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded-md bg-[--bg-hover] border border-[--border] px-1.5 py-0.5 font-mono text-[10px] text-[--text-secondary]">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-4 py-3 max-w-[120px]">
                      <p className="truncate text-xs text-[--text-secondary] font-mono">{log.entityId ?? "—"}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center rounded-full border border-[--border] bg-[--bg-hover] px-2 py-0.5 text-[10px] font-medium text-[--text-secondary]">
                        {log.entityType ?? "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3 max-w-xs">
                      <p className="truncate text-xs text-[--text-secondary]">{log.summary ?? "—"}</p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {logs.length > 0 && (
          <div className="border-t border-[--border] px-4 py-3 text-xs text-[--text-muted]">
            {logs.length} entrée{logs.length !== 1 ? "s" : ""}
          </div>
        )}
      </div>
    </div>
  );
}
