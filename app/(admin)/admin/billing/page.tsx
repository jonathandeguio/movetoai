import { CreditCard, TrendingUp, ArrowUpRight, CheckCircle2, XCircle, Clock } from "lucide-react";

import { requireSuperAdminAccess } from "@/server/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

const PLAN_BADGE: Record<string, { label: string; cls: string }> = {
  FREE: { label: "Free", cls: "border-slate-700 bg-slate-800 text-slate-300" },
  PRO: { label: "Pro", cls: "border-blue-800 bg-blue-950/60 text-blue-300" },
  ENTERPRISE: { label: "Enterprise", cls: "border-violet-800 bg-violet-950/60 text-violet-300" },
};

const SUB_STATUS: Record<string, { icon: typeof CheckCircle2; cls: string; label: string }> = {
  ACTIVE: { icon: CheckCircle2, cls: "text-emerald-400", label: "Actif" },
  TRIALING: { icon: Clock, cls: "text-amber-400", label: "Essai" },
  PAST_DUE: { icon: XCircle, cls: "text-rose-400", label: "En retard" },
  CANCELED: { icon: XCircle, cls: "text-slate-500", label: "Annulé" },
  INACTIVE: { icon: XCircle, cls: "text-slate-500", label: "Inactif" },
};

// Mock MRR/ARR — real billing would come from Stripe webhooks stored in DB
const MOCK_REVENUE = {
  mrr: 12_840,
  arr: 154_080,
  mrrGrowth: 8.4,
  churnRate: 2.1,
  avgRevenuePerTenant: 214,
};

export default async function AdminBillingPage() {
  await requireSuperAdminAccess();

  const [tenants, planCounts] = await Promise.all([
    prisma.tenant.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: "desc" },
      take: 50,
      include: {
        subscriptionPlan: true,
        workspaces: {
          where: { deletedAt: null },
          select: { id: true, _count: { select: { memberships: { where: { status: "ACTIVE", deletedAt: null } } } } },
        },
      },
    }),
    prisma.subscriptionPlan.groupBy({
      by: ["planType"],
      _count: true,
    }),
  ]);

  const activeCount = tenants.filter((t) => t.subscriptionStatus === "ACTIVE").length;
  const trialingCount = tenants.filter((t) => t.subscriptionStatus === "TRIALING").length;
  const pastDueCount = tenants.filter((t) => t.subscriptionStatus === "PAST_DUE").length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-xl font-semibold text-slate-50">Facturation & Abonnements</h1>
        <p className="text-sm text-slate-400">Vue revenue et statuts des tenants.</p>
      </div>

      {/* Revenue cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: "MRR estimé", value: `${MOCK_REVENUE.mrr.toLocaleString("fr-FR")} €`, color: "text-emerald-400", sub: `+${MOCK_REVENUE.mrrGrowth}% vs mois précédent` },
          { label: "ARR estimé", value: `${MOCK_REVENUE.arr.toLocaleString("fr-FR")} €`, color: "text-blue-400", sub: "Annualisé" },
          { label: "Churn mensuel", value: `${MOCK_REVENUE.churnRate}%`, color: "text-rose-400", sub: "Taux de résiliation" },
          { label: "ARPU tenant", value: `${MOCK_REVENUE.avgRevenuePerTenant} €`, color: "text-amber-400", sub: "Revenu moyen / tenant" },
        ].map((card) => (
          <div key={card.label} className="rounded-2xl border border-slate-800 bg-slate-900 p-5 space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{card.label}</p>
            <p className={`text-2xl font-semibold ${card.color}`}>{card.value}</p>
            <p className="text-[11px] text-slate-500">{card.sub}</p>
          </div>
        ))}
      </div>

      {/* Plan distribution */}
      <div className="grid gap-6 lg:grid-cols-3">
        {[
          { key: "FREE", count: planCounts.find((p) => p.planType === "FREE")?._count ?? 0 },
          { key: "PRO", count: planCounts.find((p) => p.planType === "PRO")?._count ?? 0 },
          { key: "ENTERPRISE", count: planCounts.find((p) => p.planType === "ENTERPRISE")?._count ?? 0 },
        ].map((plan) => {
          const badge = PLAN_BADGE[plan.key] ?? PLAN_BADGE.FREE;
          const pct = tenants.length > 0 ? Math.round((plan.count / tenants.length) * 100) : 0;
          return (
            <div key={plan.key} className="rounded-2xl border border-slate-800 bg-slate-900 p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-semibold ${badge.cls}`}>
                  {badge.label}
                </span>
                <span className="text-xs text-slate-500">{pct}%</span>
              </div>
              <p className="text-3xl font-semibold text-slate-100">{plan.count}</p>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
                <div
                  className={`h-full rounded-full ${plan.key === "FREE" ? "bg-slate-500" : plan.key === "PRO" ? "bg-blue-500" : "bg-violet-500"}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Subscription status summary */}
      <div className="flex gap-4 flex-wrap">
        {[
          { label: "Abonnements actifs", value: activeCount, cls: "text-emerald-400" },
          { label: "En période d'essai", value: trialingCount, cls: "text-amber-400" },
          { label: "En retard de paiement", value: pastDueCount, cls: "text-rose-400" },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900 px-4 py-3">
            <span className={`text-2xl font-semibold ${item.cls}`}>{item.value}</span>
            <span className="text-sm text-slate-400">{item.label}</span>
          </div>
        ))}
      </div>

      {/* Tenants table */}
      <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
        <div className="border-b border-slate-800 px-5 py-3">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-500">Tenants</h2>
        </div>
        <div className="grid grid-cols-[1fr_auto_auto_auto_auto] items-center gap-4 border-b border-slate-800 px-5 py-3 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
          <span>Organisation</span>
          <span>Plan</span>
          <span>Statut</span>
          <span className="text-right">Workspaces</span>
          <span className="text-right">Membres</span>
        </div>
        <div className="divide-y divide-slate-800">
          {tenants.map((tenant) => {
            const plan = PLAN_BADGE[tenant.subscriptionPlan.planType] ?? PLAN_BADGE.FREE;
            const statusInfo = SUB_STATUS[tenant.subscriptionStatus] ?? SUB_STATUS.INACTIVE;
            const StatusIcon = statusInfo.icon;
            const totalMembers = tenant.workspaces.reduce(
              (acc, ws) => acc + ws._count.memberships,
              0
            );
            return (
              <div key={tenant.id} className="grid grid-cols-[1fr_auto_auto_auto_auto] items-center gap-4 px-5 py-4 hover:bg-slate-800/40">
                <div className="min-w-0">
                  <p className="font-medium text-slate-100 truncate">{tenant.name}</p>
                  <p className="text-[11px] text-slate-500">
                    Créé {new Date(tenant.createdAt).toLocaleDateString("fr-FR")}
                  </p>
                </div>
                <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${plan.cls}`}>
                  {plan.label}
                </span>
                <div className="flex items-center gap-1.5">
                  <StatusIcon className={`h-3.5 w-3.5 ${statusInfo.cls}`} />
                  <span className={`text-xs ${statusInfo.cls}`}>{statusInfo.label}</span>
                </div>
                <span className="text-right text-sm text-slate-300">{tenant.workspaces.length}</span>
                <span className="text-right text-sm text-slate-300">{totalMembers}</span>
              </div>
            );
          })}
          {tenants.length === 0 && (
            <div className="py-12 text-center text-sm text-slate-500">
              Aucun tenant enregistré.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
