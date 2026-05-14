import { BarChart3, TrendingUp, Users, Workflow, Zap, ArrowUpRight, ArrowDownRight } from "lucide-react";

import { requireSuperAdminAccess } from "@/server/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

function StatCard({
  label,
  value,
  sub,
  trend,
  trendLabel,
  colorClass = "text-slate-100",
}: {
  label: string;
  value: string | number;
  sub?: string;
  trend?: "up" | "down" | "neutral";
  trendLabel?: string;
  colorClass?: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 space-y-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className={`text-3xl font-semibold ${colorClass}`}>{value}</p>
      {(trendLabel || sub) && (
        <div className="flex items-center gap-1.5">
          {trend === "up" && <ArrowUpRight className="h-3.5 w-3.5 text-emerald-400" />}
          {trend === "down" && <ArrowDownRight className="h-3.5 w-3.5 text-rose-400" />}
          <p className={`text-xs ${trend === "up" ? "text-emerald-400" : trend === "down" ? "text-rose-400" : "text-slate-500"}`}>
            {trendLabel ?? sub}
          </p>
        </div>
      )}
    </div>
  );
}

const ACCOUNT_TYPE_LABEL: Record<string, string> = {
  manager: "Manager",
  team_member: "Membre d'équipe",
  it_manager: "DSI / IT Manager",
  consultant: "Consultant IA",
  super_admin: "Super Admin",
};

export default async function AdminAnalyticsPage() {
  await requireSuperAdminAccess();

  const [
    totalWorkspaces,
    totalUsers,
    totalProcesses,
    totalOpportunities,
    totalTenants,
    activeMembers,
    recentProcesses,
    workspacesByStatus,
  ] = await Promise.all([
    prisma.workspace.count({ where: { deletedAt: null } }),
    prisma.user.count({ where: { deletedAt: null, status: "ACTIVE" } }),
    prisma.process.count({ where: { deletedAt: null } }),
    prisma.opportunity.count(),
    prisma.tenant.count({ where: { deletedAt: null } }),
    prisma.membership.count({ where: { status: "ACTIVE", deletedAt: null } }),
    prisma.process.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: "desc" },
      take: 8,
      select: {
        id: true,
        name: true,
        createdAt: true,
        workspace: { select: { name: true } },
      },
    }),
    prisma.workspace.groupBy({
      by: ["status"],
      where: { deletedAt: null },
      _count: true,
    }),
  ]);

  const avgProcessesPerWorkspace =
    totalWorkspaces > 0 ? (totalProcesses / totalWorkspaces).toFixed(1) : "0";

  const avgOpportunitiesPerProcess =
    totalProcesses > 0 ? (totalOpportunities / totalProcesses).toFixed(1) : "0";

  const activeWs = workspacesByStatus.find((w) => w.status === "ACTIVE")?._count ?? 0;
  const suspendedWs = workspacesByStatus.find((w) => w.status === "SUSPENDED")?._count ?? 0;
  const archivedWs = workspacesByStatus.find((w) => w.status === "ARCHIVED")?._count ?? 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-xl font-semibold text-slate-50">Analytics plateforme</h1>
        <p className="text-sm text-slate-400">Métriques globales en temps réel.</p>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        <StatCard label="Workspaces actifs" value={activeWs} colorClass="text-blue-400" trend="up" trendLabel={`${totalWorkspaces} au total`} />
        <StatCard label="Utilisateurs actifs" value={totalUsers} colorClass="text-emerald-400" trend="up" trendLabel={`${activeMembers} memberships actifs`} />
        <StatCard label="Processus cartographiés" value={totalProcesses} colorClass="text-violet-400" trend="up" trendLabel={`${avgProcessesPerWorkspace} / workspace`} />
        <StatCard label="Opportunités IA" value={totalOpportunities} colorClass="text-cyan-400" trend="up" trendLabel={`${avgOpportunitiesPerProcess} / processus`} />
        <StatCard label="Tenants" value={totalTenants} colorClass="text-amber-400" />
        <StatCard label="Workspaces suspendus" value={suspendedWs} colorClass="text-rose-400" />
        <StatCard label="Workspaces archivés" value={archivedWs} colorClass="text-slate-400" />
        <StatCard label="Memberships actifs" value={activeMembers} colorClass="text-indigo-400" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Workspace repartition */}
        <Card className="border-slate-800 bg-slate-900">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold text-slate-200">
              <Workflow className="h-4 w-4 text-blue-400" />
              Répartition des workspaces
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { label: "Actifs", value: activeWs, total: totalWorkspaces, color: "bg-emerald-500" },
              { label: "Archivés", value: archivedWs, total: totalWorkspaces, color: "bg-slate-500" },
              { label: "Suspendus", value: suspendedWs, total: totalWorkspaces, color: "bg-rose-500" },
            ].map((row) => {
              const pct = totalWorkspaces > 0 ? Math.round((row.value / totalWorkspaces) * 100) : 0;
              return (
                <div key={row.label} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">{row.label}</span>
                    <span className="text-slate-300 font-medium">{row.value} <span className="text-slate-500">({pct}%)</span></span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
                    <div className={`h-full rounded-full ${row.color}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Recent processes */}
        <Card className="border-slate-800 bg-slate-900">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold text-slate-200">
              <BarChart3 className="h-4 w-4 text-violet-400" />
              Processus récents
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {recentProcesses.length === 0 ? (
              <p className="text-sm text-slate-500">Aucun processus enregistré.</p>
            ) : (
              recentProcesses.map((p) => (
                <div key={p.id} className="flex items-start gap-3 rounded-lg border border-slate-800 px-3 py-2.5">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-200 truncate">{p.name}</p>
                    <p className="text-[10px] text-slate-500">{p.workspace.name}</p>
                  </div>
                  <span className="font-mono text-[10px] text-slate-600 shrink-0">
                    {new Date(p.createdAt).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" })}
                  </span>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Funnel */}
      <Card className="border-slate-800 bg-slate-900">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold text-slate-200">
            <TrendingUp className="h-4 w-4 text-emerald-400" />
            Entonnoir d'usage
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4">
            {[
              { label: "Tenants", value: totalTenants, color: "bg-blue-500/20 border-blue-800 text-blue-400" },
              { label: "Workspaces", value: totalWorkspaces, color: "bg-violet-500/20 border-violet-800 text-violet-400" },
              { label: "Processus", value: totalProcesses, color: "bg-cyan-500/20 border-cyan-800 text-cyan-400" },
              { label: "Opportunités IA", value: totalOpportunities, color: "bg-amber-500/20 border-amber-800 text-amber-400" },
            ].map((step, i) => (
              <div key={step.label} className={`rounded-xl border px-4 py-5 text-center ${step.color}`}>
                <p className="text-3xl font-semibold">{step.value}</p>
                <p className="mt-1 text-[11px] font-medium opacity-80">{step.label}</p>
                {i < 3 && (
                  <p className="mt-2 text-[10px] opacity-50">
                    ×{i === 0 ? (totalWorkspaces / Math.max(totalTenants, 1)).toFixed(1)
                      : i === 1 ? (totalProcesses / Math.max(totalWorkspaces, 1)).toFixed(1)
                      : (totalOpportunities / Math.max(totalProcesses, 1)).toFixed(1)}
                  </p>
                )}
              </div>
            ))}
          </div>
          <p className="mt-3 text-[11px] text-slate-500">Multiplicateur moyen entre chaque étape du pipeline.</p>
        </CardContent>
      </Card>
    </div>
  );
}
