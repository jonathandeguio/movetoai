import { getCurrentWorkspaceContext } from "@/lib/current-workspace";
import { getExecutiveDashboardData } from "@/modules/workspace/server/executive-onboarding";

export const dynamic = "force-dynamic";

const MOCK_ROI_ITEMS = [
  {
    process: "Traitement des factures fournisseurs",
    status: "deployed" as const,
    roiMonthly: 2800,
    timeSaved: "18h/mois",
    automation: "Extraction IA + validation automatique"
  },
  {
    process: "Scoring des leads commerciaux",
    status: "in_progress" as const,
    roiMonthly: 4200,
    timeSaved: "32h/mois",
    automation: "Modèle prédictif probabilité de conversion"
  },
  {
    process: "Résumés de réunions et CR automatiques",
    status: "pilot" as const,
    roiMonthly: 1100,
    timeSaved: "12h/mois",
    automation: "Transcription + synthèse Claude"
  }
];

const STATUS_LABEL: Record<string, { label: string; className: string }> = {
  deployed: { label: "Déployé", className: "bg-[--green-dim] text-[--green]" },
  in_progress: { label: "En cours", className: "bg-[--purple-dim] text-[--purple]" },
  pilot: { label: "Pilote", className: "bg-[--amber-dim] text-[--amber]" }
};

export default async function ExecutiveRoiPage() {
  const { session, workspace } = await getCurrentWorkspaceContext({ requireMembership: true });
  const data = await getExecutiveDashboardData(session.user.id, workspace?.id ?? "");

  const totalMonthly = MOCK_ROI_ITEMS.reduce((sum, r) => sum + r.roiMonthly, 0);
  const totalAnnual = totalMonthly * 12;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-bold text-[--text-primary]">Métriques financières & ROI</h1>
        <p className="mt-1 text-sm text-[--text-muted]">
          Impact estimé des automatisations IA en cours.
        </p>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-[--green-border] bg-gradient-to-br from-[--green-dim] to-[--bg-card] p-6">
          <p className="text-sm font-medium text-[--green]">ROI mensuel estimé</p>
          <p className="mt-2 text-4xl font-bold text-[--text-primary]">
            {totalMonthly.toLocaleString("fr-FR")}€
          </p>
          <p className="mt-1 text-xs text-[--text-muted]">Gains cumulés des automatisations actives</p>
        </div>
        <div className="rounded-2xl border border-[--purple-border] bg-gradient-to-br from-[--purple-dim] to-[--bg-card] p-6">
          <p className="text-sm font-medium text-[--purple]">Projection annuelle</p>
          <p className="mt-2 text-4xl font-bold text-[--text-primary]">
            {totalAnnual.toLocaleString("fr-FR")}€
          </p>
          <p className="mt-1 text-xs text-[--text-muted]">Sur base des projets en cours</p>
        </div>
        <div className="rounded-2xl border border-[--border] bg-[--bg-card] p-6 shadow-sm">
          <p className="text-sm font-medium text-[--text-secondary]">Score maturité IA</p>
          <p className="mt-2 text-4xl font-bold text-[--text-primary]">{data.maturityScore}/100</p>
          <p className="mt-1 text-xs text-[--text-muted]">Capacité à générer du ROI IA</p>
        </div>
      </div>

      {/* ROI breakdown table */}
      <div className="rounded-2xl border border-[--border] bg-[--bg-card] shadow-sm overflow-hidden">
        <div className="border-b border-[--border-subtle] px-6 py-4">
          <h2 className="font-semibold text-[--text-secondary]">Détail par automatisation</h2>
        </div>
        <div className="divide-y divide-[--border-subtle]">
          {MOCK_ROI_ITEMS.map((item) => {
            const statusInfo = STATUS_LABEL[item.status];
            return (
              <div key={item.process} className="px-6 py-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-[--text-primary]">{item.process}</p>
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusInfo.className}`}>
                        {statusInfo.label}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-[--text-muted]">{item.automation}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="font-semibold text-[--green]">
                      +{item.roiMonthly.toLocaleString("fr-FR")}€/mois
                    </p>
                    <p className="text-xs text-[--text-muted]">{item.timeSaved} économisées</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
