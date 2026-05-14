import Link from "next/link";
import { ArrowRight, Building2, Plus, Search, Users } from "lucide-react";

import { requireSuperAdminAccess } from "@/server/auth";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export const dynamic = "force-dynamic";

const PLAN_BADGE: Record<string, string> = {
  FREE: "bg-slate-800 text-slate-300 border-slate-700",
  PRO: "bg-blue-950/60 text-blue-300 border-blue-800",
  ENTERPRISE: "bg-violet-950/60 text-violet-300 border-violet-800",
};

const STATUS_DOT: Record<string, string> = {
  ACTIVE: "bg-emerald-500",
  ARCHIVED: "bg-slate-500",
  SUSPENDED: "bg-rose-500",
};

export default async function AdminWorkspacesPage() {
  await requireSuperAdminAccess();

  const workspaces = await prisma.workspace.findMany({
    where: { deletedAt: null },
    orderBy: { createdAt: "desc" },
    include: {
      tenant: { include: { subscriptionPlan: true } },
      _count: {
        select: {
          memberships: { where: { status: "ACTIVE", deletedAt: null } },
          processes: { where: { deletedAt: null } },
          opportunities: true,
        },
      },
    },
    take: 100,
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-xl font-semibold text-slate-50">Workspaces</h1>
          <p className="text-sm text-slate-400">
            {workspaces.length} workspace{workspaces.length !== 1 ? "s" : ""} enregistrés
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700">
            <Search className="mr-2 h-3.5 w-3.5" />
            Rechercher
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
        <div className="grid grid-cols-[auto_1fr_auto_auto_auto_auto] items-center gap-4 border-b border-slate-800 px-5 py-3 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
          <span>Statut</span>
          <span>Workspace / Tenant</span>
          <span className="text-right">Plan</span>
          <span className="text-right">Membres</span>
          <span className="text-right">Processus</span>
          <span />
        </div>
        <div className="divide-y divide-slate-800">
          {workspaces.map((ws) => {
            const planType = ws.tenant.subscriptionPlan.planType;
            const dotClass = STATUS_DOT[ws.status] ?? "bg-slate-500";
            const planBadgeClass = PLAN_BADGE[planType] ?? PLAN_BADGE.FREE;
            return (
              <div
                key={ws.id}
                className="grid grid-cols-[auto_1fr_auto_auto_auto_auto] items-center gap-4 px-5 py-4 hover:bg-slate-800/40"
              >
                <span className={`h-2 w-2 rounded-full ${dotClass}`} />
                <div className="min-w-0">
                  <p className="font-medium text-slate-100 truncate">{ws.name}</p>
                  <p className="text-[11px] text-slate-500 truncate">
                    {ws.tenant.name} · /{ws.slug}
                  </p>
                </div>
                <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${planBadgeClass}`}>
                  {planType}
                </span>
                <span className="text-right text-sm text-slate-300">
                  {ws._count.memberships}
                </span>
                <span className="text-right text-sm text-slate-300">
                  {ws._count.processes}
                </span>
                <button className="rounded-lg border border-slate-700 p-1.5 text-slate-400 hover:border-slate-500 hover:text-slate-200">
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {workspaces.length === 0 && (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <Building2 className="h-8 w-8 text-slate-600" />
          <p className="text-sm text-slate-500">Aucun workspace enregistré.</p>
        </div>
      )}
    </div>
  );
}
