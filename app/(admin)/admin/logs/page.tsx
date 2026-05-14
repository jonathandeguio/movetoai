import { requireSuperAdminAccess } from "@/server/auth";
import { prisma } from "@/lib/prisma";
import { AlertCircle, CheckCircle2, Info, AlertTriangle, Download, Filter } from "lucide-react";

export const dynamic = "force-dynamic";

const ACTION_ICON: Record<string, { icon: typeof Info; cls: string }> = {
  CREATE: { icon: CheckCircle2, cls: "text-emerald-400" },
  UPDATE: { icon: Info, cls: "text-blue-400" },
  DELETE: { icon: AlertCircle, cls: "text-rose-400" },
  ACCESS: { icon: Info, cls: "text-slate-400" },
  PROVISION: { icon: AlertTriangle, cls: "text-amber-400" },
  LOGIN: { icon: CheckCircle2, cls: "text-cyan-400" },
  LOGOUT: { icon: Info, cls: "text-slate-500" },
  ERROR: { icon: AlertCircle, cls: "text-rose-400" },
};

const ACTION_BADGE: Record<string, string> = {
  CREATE: "border-emerald-800 bg-emerald-950/50 text-emerald-300",
  UPDATE: "border-blue-800 bg-blue-950/50 text-blue-300",
  DELETE: "border-rose-800 bg-rose-950/50 text-rose-300",
  ACCESS: "border-slate-700 bg-slate-800 text-slate-400",
  PROVISION: "border-amber-800 bg-amber-950/50 text-amber-300",
  LOGIN: "border-cyan-800 bg-cyan-950/50 text-cyan-300",
  LOGOUT: "border-slate-700 bg-slate-800 text-slate-500",
  ERROR: "border-rose-800 bg-rose-950/50 text-rose-300",
};

function relativeTime(date: Date): string {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "À l'instant";
  if (mins < 60) return `il y a ${mins} min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `il y a ${hrs}h`;
  const days = Math.floor(hrs / 24);
  return `il y a ${days}j`;
}

export default async function AdminLogsPage() {
  await requireSuperAdminAccess();

  const logs = await prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      actorUser: { select: { name: true, email: true } },
    },
  });

  const totalCount = await prisma.auditLog.count();

  // Action summary
  const actionCounts: Record<string, number> = {};
  for (const log of logs) {
    actionCounts[log.action] = (actionCounts[log.action] ?? 0) + 1;
  }

  const topActions = Object.entries(actionCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-xl font-semibold text-slate-50">Journaux d'audit système</h1>
          <p className="text-sm text-slate-400">
            {totalCount.toLocaleString("fr-FR")} entrées au total — affichage des 100 dernières.
          </p>
        </div>
        <button className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-medium text-slate-400 hover:text-slate-200 transition">
          <Download className="h-3.5 w-3.5" />
          Exporter CSV
        </button>
      </div>

      {/* Summary row */}
      <div className="flex flex-wrap gap-3">
        {topActions.map(([action, count]) => {
          const badge = ACTION_BADGE[action] ?? ACTION_BADGE.ACCESS;
          return (
            <div key={action} className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900 px-3 py-2">
              <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${badge}`}>{action}</span>
              <span className="text-sm font-medium text-slate-300">{count}</span>
            </div>
          );
        })}
        {logs.length === 0 && (
          <p className="text-sm text-slate-500">Aucune entrée d'audit.</p>
        )}
      </div>

      {/* Log table */}
      <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
        <div className="grid grid-cols-[auto_1fr_auto_auto_auto] items-center gap-4 border-b border-slate-800 px-5 py-3 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
          <span className="w-4" />
          <span>Événement</span>
          <span>Utilisateur</span>
          <span>Action</span>
          <span className="text-right">Date</span>
        </div>

        <div className="divide-y divide-slate-800 max-h-[600px] overflow-y-auto">
          {logs.length === 0 && (
            <div className="py-16 text-center text-sm text-slate-500">
              Aucune entrée dans les journaux d'audit.
            </div>
          )}
          {logs.map((log) => {
            const info = ACTION_ICON[log.action] ?? ACTION_ICON.ACCESS;
            const Icon = info.icon;
            const badge = ACTION_BADGE[log.action] ?? ACTION_BADGE.ACCESS;
            const metadata =
              log.metadata && typeof log.metadata === "object"
                ? (log.metadata as Record<string, unknown>)
                : null;

            return (
              <div
                key={log.id}
                className="grid grid-cols-[auto_1fr_auto_auto_auto] items-start gap-4 px-5 py-3.5 hover:bg-slate-800/30 transition"
              >
                {/* Icon */}
                <div className="mt-0.5">
                  <Icon className={`h-3.5 w-3.5 ${info.cls}`} />
                </div>

                {/* Description */}
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-200">{log.entityType}</p>
                  {log.entityId && (
                    <p className="font-mono text-[10px] text-slate-600 truncate">{log.entityId}</p>
                  )}
                  {metadata && Object.keys(metadata).length > 0 && (
                    <p className="text-[10px] text-slate-500 truncate">
                      {Object.entries(metadata)
                        .slice(0, 3)
                        .map(([k, v]) => `${k}: ${String(v)}`)
                        .join(" · ")}
                    </p>
                  )}
                </div>

                {/* User */}
                <div className="text-right shrink-0">
                  {log.actorUser ? (
                    <>
                      <p className="text-xs text-slate-300 font-medium">{log.actorUser.name}</p>
                      <p className="text-[10px] text-slate-600">{log.actorUser.email}</p>
                    </>
                  ) : (
                    <span className="text-xs text-slate-600">Système</span>
                  )}
                </div>

                {/* Action badge */}
                <div className="shrink-0">
                  <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${badge}`}>
                    {log.action}
                  </span>
                </div>

                {/* Date */}
                <div className="text-right shrink-0">
                  <p className="text-xs text-slate-500">{relativeTime(log.createdAt)}</p>
                  <p className="text-[10px] text-slate-700 font-mono">
                    {new Date(log.createdAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
