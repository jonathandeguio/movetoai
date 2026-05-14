import {
  Activity,
  ArrowRight,
  BarChart3,
  Briefcase,
  CreditCard,
  Flag,
  Shield,
  TrendingUp,
  Users,
  Workflow,
  Zap,
} from "lucide-react";
import Link from "next/link";

import { requireSuperAdminAccess } from "@/server/auth";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const { user } = await requireSuperAdminAccess();

  // Platform-wide metrics
  const [
    totalWorkspaces,
    totalUsers,
    totalTenants,
    activeSubscriptions,
    totalProcesses,
    totalOpportunities,
    recentAuditLogs,
  ] = await Promise.all([
    prisma.workspace.count({ where: { deletedAt: null } }),
    prisma.user.count({ where: { deletedAt: null, status: "ACTIVE" } }),
    prisma.tenant.count({ where: { deletedAt: null } }),
    prisma.tenant.count({ where: { subscriptionStatus: "ACTIVE", deletedAt: null } }),
    prisma.process.count({ where: { deletedAt: null } }),
    prisma.opportunity.count(),
    prisma.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
      include: { actorUser: { select: { name: true, email: true } } },
    }),
  ]);

  const platformHealth = Math.min(
    100,
    Math.round(
      ((activeSubscriptions / Math.max(totalTenants, 1)) * 40) +
      (totalProcesses >= 10 ? 30 : totalProcesses * 3) +
      (totalUsers >= 5 ? 30 : totalUsers * 6)
    )
  );

  const QUICK_LINKS = [
    { href: "/admin/workspaces", label: "Workspaces", icon: Workflow, value: totalWorkspaces, colorClass: "text-blue-400", bgClass: "bg-blue-950/40" },
    { href: "/admin/users", label: "Utilisateurs", icon: Users, value: totalUsers, colorClass: "text-emerald-400", bgClass: "bg-emerald-950/40" },
    { href: "/admin/billing", label: "Abonnements actifs", icon: CreditCard, value: activeSubscriptions, colorClass: "text-amber-400", bgClass: "bg-amber-950/40" },
    { href: "/admin/analytics", label: "Processus cartographiés", icon: TrendingUp, value: totalProcesses, colorClass: "text-violet-400", bgClass: "bg-violet-950/40" },
    { href: "/admin/analytics", label: "Opportunités IA", icon: Zap, value: totalOpportunities, colorClass: "text-cyan-400", bgClass: "bg-cyan-950/40" },
    { href: "/admin/logs", label: "Tenants", icon: Briefcase, value: totalTenants, colorClass: "text-rose-400", bgClass: "bg-rose-950/40" },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold text-slate-50">
            Back-office Move to AI
          </h1>
          <Badge className="border-rose-800 bg-rose-950 text-rose-400">Super Admin</Badge>
        </div>
        <p className="text-sm text-slate-400">
          Bienvenue, {user.name?.split(" ")[0] ?? "Admin"} — Vue globale de la plateforme.
        </p>
      </div>

      {/* Health score */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Santé globale plateforme
            </p>
            <p className={`text-5xl font-semibold ${platformHealth >= 70 ? "text-emerald-400" : platformHealth >= 40 ? "text-amber-400" : "text-rose-400"}`}>
              {platformHealth}%
            </p>
          </div>
          <Shield className="h-8 w-8 text-slate-600" />
        </div>
        <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-slate-800">
          <div
            className={`h-full rounded-full transition-all ${platformHealth >= 70 ? "bg-emerald-500" : platformHealth >= 40 ? "bg-amber-500" : "bg-rose-500"}`}
            style={{ width: `${platformHealth}%` }}
          />
        </div>
        <p className="mt-2 text-xs text-slate-500">
          Calculé à partir du taux de conversion Free→Paid, du volume de données et des utilisateurs actifs.
        </p>
      </div>

      {/* KPI grid */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {QUICK_LINKS.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.label}
              href={item.href}
              className="group flex flex-col gap-3 rounded-2xl border border-slate-800 bg-slate-900 p-5 transition hover:border-slate-700"
            >
              <div className={`w-fit rounded-xl p-2.5 ${item.bgClass}`}>
                <Icon className={`h-5 w-5 ${item.colorClass}`} />
              </div>
              <div>
                <p className={`text-2xl font-semibold ${item.colorClass}`}>{item.value}</p>
                <p className="mt-0.5 text-xs text-slate-500">{item.label}</p>
              </div>
              <ArrowRight className="h-4 w-4 text-slate-700 transition group-hover:text-slate-400" />
            </Link>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Audit log */}
        <Card className="border-slate-800 bg-slate-900">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold text-slate-200">
              <Activity className="h-4 w-4 text-rose-500" />
              Journaux d'audit récents
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {recentAuditLogs.length === 0 ? (
              <p className="text-sm text-slate-500">Aucun événement enregistré.</p>
            ) : (
              recentAuditLogs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-start gap-3 rounded-lg border border-slate-800 px-3 py-2.5"
                >
                  <div className="flex-1 space-y-0.5">
                    <p className="font-mono text-xs font-medium text-slate-200">{log.action}</p>
                    <p className="text-[10px] text-slate-500">
                      {log.actorUser?.name ?? log.actorUser?.email ?? "Système"} · {log.resourceType}{log.resourceId ? ` ${log.resourceId.slice(0, 8)}…` : ""}
                    </p>
                  </div>
                  <span className="font-mono text-[10px] text-slate-600">
                    {new Date(log.createdAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              ))
            )}
            <Link
              href="/admin/logs"
              className="flex items-center gap-1.5 pt-1 text-xs text-rose-500 hover:text-rose-400"
            >
              Voir tous les journaux <ArrowRight className="h-3 w-3" />
            </Link>
          </CardContent>
        </Card>

        {/* Quick actions */}
        <Card className="border-slate-800 bg-slate-900">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold text-slate-200">
              <Zap className="h-4 w-4 text-amber-400" />
              Actions rapides
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {[
              { href: "/admin/users", label: "Provisionner un Super Admin", desc: "Créer un accès back-office interne", icon: Shield, colorClass: "text-rose-400 bg-rose-950/40" },
              { href: "/admin/flags", label: "Gérer les feature flags", desc: "Activer / désactiver des fonctionnalités", icon: Flag, colorClass: "text-blue-400 bg-blue-950/40" },
              { href: "/admin/prompts", label: "Modifier les prompts IA", desc: "System prompts Claude pour l'onboarding", icon: BarChart3, colorClass: "text-violet-400 bg-violet-950/40" },
              { href: "/admin/workspaces", label: "Inspecter un workspace", desc: "Accès en lecture à tous les workspaces", icon: Workflow, colorClass: "text-emerald-400 bg-emerald-950/40" },
            ].map((action) => {
              const Icon = action.icon;
              return (
                <Link
                  key={action.href}
                  href={action.href}
                  className="flex items-center gap-3 rounded-xl border border-slate-800 px-4 py-3 transition hover:border-slate-700 hover:bg-slate-800/50"
                >
                  <div className={`rounded-lg p-2 ${action.colorClass}`}>
                    <Icon className="h-3.5 w-3.5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-200">{action.label}</p>
                    <p className="text-[11px] text-slate-500">{action.desc}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-600" />
                </Link>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
