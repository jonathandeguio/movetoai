"use client";

import { Download, FileText, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";

const REPORTS = [
  {
    title: "Rapport exécutif — Avril 2026",
    description: "Synthèse mensuelle : maturité IA, ROI, avancement roadmap.",
    type: "monthly",
    date: "01/04/2026",
    available: true
  },
  {
    title: "Rapport exécutif — Mars 2026",
    description: "Synthèse mensuelle : maturité IA, ROI, avancement roadmap.",
    type: "monthly",
    date: "01/03/2026",
    available: true
  },
  {
    title: "Bilan stratégique Q1 2026",
    description: "Revue trimestrielle complète — quick wins, risques, recommandations.",
    type: "quarterly",
    date: "31/03/2026",
    available: false
  },
  {
    title: "Tableau de bord investisseurs",
    description: "Rapport de transformation IA adapté aux due diligences et levées de fonds.",
    type: "investors",
    date: "—",
    available: false
  }
];

const TYPE_STYLE: Record<string, string> = {
  monthly: "bg-[--blue-dim] text-[--blue]",
  quarterly: "bg-[--purple-dim] text-[--purple]",
  investors: "bg-[--amber-dim] text-[--amber]"
};

const TYPE_LABEL: Record<string, string> = {
  monthly: "Mensuel",
  quarterly: "Trimestriel",
  investors: "Investisseurs"
};

export default function ExecutiveReportsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-[--text-primary]">Rapports exportables</h1>
          <p className="mt-1 text-sm text-[--text-muted]">
            Synthèses exécutives au format PDF — prêtes pour CODIR, CA, ou due diligence.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {REPORTS.map((report) => (
          <div
            key={report.title}
            className={`rounded-2xl border bg-[--bg-card] p-5 shadow-sm ${report.available ? "border-[--border]" : "border-[--border-subtle] opacity-70"}`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${report.available ? "bg-[--purple-dim]" : "bg-[--bg-hover]"}`}>
                  <FileText className={`h-4 w-4 ${report.available ? "text-[--purple]" : "text-[--text-muted]"}`} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-[--text-primary]">{report.title}</p>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${TYPE_STYLE[report.type]}`}>
                      {TYPE_LABEL[report.type]}
                    </span>
                  </div>
                  <p className="mt-0.5 text-sm text-[--text-muted]">{report.description}</p>
                  <p className="mt-1 text-xs text-[--text-muted]">Période : {report.date}</p>
                </div>
              </div>
              <div className="shrink-0">
                {report.available ? (
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1.5 border-[--purple-border] text-[--purple] hover:bg-[--purple-dim]"
                    onClick={() => alert("Export PDF — fonctionnalité Pro disponible prochainement.")}
                  >
                    <Download className="h-3.5 w-3.5" />
                    Exporter
                  </Button>
                ) : (
                  <div className="flex items-center gap-1.5 rounded-lg border border-[--border] bg-[--bg-hover] px-3 py-1.5 text-xs text-[--text-muted]">
                    <Lock className="h-3 w-3" />
                    Pro
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <p className="rounded-xl border border-[--amber-border] bg-[--amber-dim] px-4 py-3 text-xs text-[--amber]">
        L'export PDF est disponible dans le plan Pro. Les rapports sont générés automatiquement chaque mois et trimestre.
      </p>
    </div>
  );
}
