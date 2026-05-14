import { redirect } from "next/navigation";
import { BarChart3, TrendingUp, Zap } from "lucide-react";

import { getCurrentWorkspaceContext } from "@/server/auth";
import { processRepo }   from "@/lib/repositories/process.repo";
import { opportunityRepo } from "@/lib/repositories/opportunity.repo";
import { workspaceRepo } from "@/lib/repositories/workspace.repo";

export const dynamic = "force-dynamic";

export default async function AdminAnalyticsPage() {
  const { workspace, tenant } = await getCurrentWorkspaceContext({ requireMembership: true });
  if (!workspace?.id) redirect("/onboarding");

  const [processStats, opportunityStats, memberCount] = await Promise.all([
    processRepo.countStats(workspace.id),
    opportunityRepo.countStats(workspace.id),
    workspaceRepo.countActiveMembers(workspace.id),
  ]);
  const processCount    = processStats.total;
  const opportunityCount = opportunityStats.total;

  const tenantSettings = (tenant as { settings?: Record<string, unknown> } | null)?.settings as Record<string, unknown> | null;
  const sector = typeof tenantSettings?.sector === "string" ? tenantSettings.sector : "—";
  const companySize = typeof tenantSettings?.companySize === "string" ? tenantSettings.companySize : null;

  const sizeLabel: Record<string, string> = { pme: "PME", eti: "ETI", grand_groupe: "Grand groupe" };

  // Simple maturity score
  const maturityScore = Math.min(100,
    (processCount >= 3 ? 25 : processCount * 8) +
    (opportunityCount >= 5 ? 25 : opportunityCount * 5) +
    (memberCount >= 3 ? 25 : memberCount * 8) +
    (sector !== "—" ? 15 : 0) +
    (companySize ? 10 : 0)
  );

  const KPI_ITEMS = [
    { label: "Processus cartographiés", value: processCount, sub: "sur ce workspace", icon: BarChart3, color: "text-[--blue]", bg: "bg-[--blue-dim]" },
    { label: "Opportunités IA identifiées", value: opportunityCount, sub: "prêtes à prioriser", icon: Zap, color: "text-[--purple]", bg: "bg-[--purple-dim]" },
    { label: "Membres actifs", value: memberCount, sub: "collaborateurs", icon: TrendingUp, color: "text-[--green]", bg: "bg-[--green-dim]" }
  ];

  // Mock trend data (ROI estimation)
  const ROI_ESTIMATE = opportunityCount * 8500;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-[--text-primary]">Analytics workspace</h1>
        <p className="mt-1 text-sm text-[--text-muted]">
          Vue d'ensemble de votre avancement — {workspace.name}
          {companySize && ` · ${sizeLabel[companySize] ?? companySize}`}
          {sector !== "—" && ` · ${sector}`}
        </p>
      </div>

      {/* KPI strip */}
      <div className="grid gap-4 sm:grid-cols-3">
        {KPI_ITEMS.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div key={kpi.label} className="rounded-2xl border border-[--border] bg-[--bg-card] p-6 shadow-sm">
              <div className={`mb-3 inline-flex rounded-xl p-2 ${kpi.bg}`}>
                <Icon className={`h-5 w-5 ${kpi.color}`} />
              </div>
              <p className="text-3xl font-bold text-[--text-primary]">{kpi.value}</p>
              <p className="mt-1 font-medium text-[--text-secondary]">{kpi.label}</p>
              <p className="text-xs text-[--text-muted]">{kpi.sub}</p>
            </div>
          );
        })}
      </div>

      {/* Maturity & ROI */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Maturity score */}
        <div className="rounded-2xl border border-[--blue-border] bg-[--blue-dim] p-6 shadow-sm">
          <h2 className="mb-4 font-semibold text-[--text-primary]">Score de maturité IA</h2>
          <div className="mb-2 flex items-end gap-2">
            <span className="text-5xl font-bold text-[--blue]">{maturityScore}</span>
            <span className="mb-1 text-xl text-[--text-muted]">/100</span>
          </div>
          <div className="mb-3 h-3 overflow-hidden rounded-full bg-[--blue-dim]">
            <div className="h-full rounded-full bg-[--blue] transition-all" style={{ width: `${maturityScore}%` }} />
          </div>
          <p className="text-xs text-[--text-muted]">
            Calculé à partir des processus, opportunités et membres actifs. Progresse automatiquement.
          </p>
        </div>

        {/* ROI estimate */}
        <div className="rounded-2xl border border-[--green-border] bg-[--green-dim] p-6 shadow-sm">
          <h2 className="mb-4 font-semibold text-[--text-primary]">ROI estimé (annuel)</h2>
          <div className="mb-2">
            <span className="text-4xl font-bold text-[--green]">
              {opportunityCount > 0 ? `+${ROI_ESTIMATE.toLocaleString("fr-FR")}€` : "—"}
            </span>
          </div>
          <p className="mt-2 text-sm text-[--text-secondary]">
            {opportunityCount > 0
              ? `Estimation basée sur ${opportunityCount} opportunité${opportunityCount > 1 ? "s" : ""} IA identifiée${opportunityCount > 1 ? "s" : ""}.`
              : "Identifiez des opportunités IA pour calculer le ROI potentiel."}
          </p>
          <p className="mt-1 text-xs text-[--text-muted]">Gain moyen estimé : 8 500€/an par opportunité</p>
        </div>
      </div>

      {/* Progress by category */}
      <div className="rounded-2xl border border-[--border] bg-[--bg-card] p-6 shadow-sm">
        <h2 className="mb-5 font-semibold text-[--text-primary]">Avancement par pilier</h2>
        <div className="space-y-4">
          {[
            { label: "Cartographie des processus", pct: Math.min(100, processCount * 7), target: "15 processus" },
            { label: "Identification des opportunités IA", pct: Math.min(100, opportunityCount * 3), target: "30 opportunités" },
            { label: "Collaboration & équipe", pct: Math.min(100, memberCount * 20), target: "5 membres" }
          ].map((item) => (
            <div key={item.label}>
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="font-medium text-[--text-secondary]">{item.label}</span>
                <span className="text-[--text-muted] text-xs">Objectif : {item.target}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-[--bg-hover]">
                <div className="h-full rounded-full bg-[--blue] transition-all" style={{ width: `${item.pct}%` }} />
              </div>
              <p className="mt-0.5 text-right text-xs text-[--blue]">{item.pct}%</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
