import { redirect } from "next/navigation";
import { Download, ExternalLink, FileText, Presentation, BarChart2, MessageSquare } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getCurrentWorkspaceContext } from "@/server/auth";
import type { ConsultantRecommendationResult } from "@/lib/claude-consultant";

export const dynamic = "force-dynamic";

type ResourceCategory = "pitch" | "roi" | "case_study" | "objections";

const CATEGORY_CONFIG: Record<ResourceCategory, { label: string; icon: React.ElementType; className: string }> = {
  pitch: { label: "Pitch deck", icon: Presentation, className: "bg-[--blue-dim] text-[--blue] border-[--blue-border]" },
  roi: { label: "Calculateur ROI", icon: BarChart2, className: "bg-[--green-dim] text-[--green] border-[--green-border]" },
  case_study: { label: "Cas client", icon: FileText, className: "bg-[--purple-dim] text-[--purple] border-[--purple-border]" },
  objections: { label: "Gestion objections", icon: MessageSquare, className: "bg-[--amber-dim] text-[--amber] border-[--amber-border]" },
};

const RESOURCES = [
  {
    id: "res_1",
    title: "Pitch deck Move to AI — PME (FR)",
    description: "Présentation clé en main pour vendre Move to AI à vos clients PME. 15 slides.",
    category: "pitch" as ResourceCategory,
    format: "PPTX",
    size: "4.2 MB",
    updated: "Avril 2026",
    downloadable: true,
  },
  {
    id: "res_2",
    title: "Calculateur ROI IA — Automatisation processus",
    description: "Spreadsheet pour estimer le ROI d'un projet d'automatisation IA. Personnalisable.",
    category: "roi" as ResourceCategory,
    format: "XLSX",
    size: "280 KB",
    updated: "Mars 2026",
    downloadable: true,
  },
  {
    id: "res_3",
    title: "Cas client — Industrie manufacturière",
    description: "Étude de cas anonymisée : -35% de temps de traitement sur la gestion des commandes.",
    category: "case_study" as ResourceCategory,
    format: "PDF",
    size: "1.8 MB",
    updated: "Fév. 2026",
    downloadable: true,
  },
  {
    id: "res_4",
    title: "Guide de gestion des objections",
    description: "Les 12 objections les plus fréquentes lors d'une vente IA, avec les réponses clés.",
    category: "objections" as ResourceCategory,
    format: "PDF",
    size: "420 KB",
    updated: "Mars 2026",
    downloadable: true,
  },
  {
    id: "res_5",
    title: "Pitch deck Move to AI — Grand groupe (EN)",
    description: "Présentation en anglais pour vos prospects Enterprise. Inclut ROI benchmarks sectoriels.",
    category: "pitch" as ResourceCategory,
    format: "PPTX",
    size: "6.1 MB",
    updated: "Avril 2026",
    downloadable: true,
  },
  {
    id: "res_6",
    title: "Cas client — Secteur finance & assurance",
    description: "Automatisation de la gestion des sinistres : -60% de délai de traitement.",
    category: "case_study" as ResourceCategory,
    format: "PDF",
    size: "2.1 MB",
    updated: "Janv. 2026",
    downloadable: true,
  },
];

const FORMAT_BADGE: Record<string, string> = {
  PDF: "bg-[--red-dim] text-[--red] border-[--red-dim]",
  PPTX: "bg-[--blue-dim] text-[--blue] border-[--blue-border]",
  XLSX: "bg-[--green-dim] text-[--green] border-[--green-border]",
};

export default async function ResourcesPage() {
  const { user, workspace } = await getCurrentWorkspaceContext({ requireMembership: true });
  if (!workspace?.id) redirect("/onboarding");

  const prefs = user.preferences as Record<string, unknown> | null;
  const consultantData = prefs?.consultantOnboarding as Record<string, unknown> | null;
  const recommendation = consultantData?.recommendation as ConsultantRecommendationResult | null;
  const specialization = typeof consultantData?.specialization === "string" ? consultantData.specialization : null;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-xl font-semibold text-[--text-primary]">
          Ressources de vente
        </h1>
        <p className="text-sm text-[--text-muted]">
          Pitchs, calculateurs ROI, cas clients et guides — tout ce qu'il vous faut pour convaincre.
        </p>
      </div>

      {/* Personalized use cases banner */}
      {recommendation && (
        <div className="rounded-2xl border border-[--amber-border] bg-[--amber-dim] p-5">
          <p className="text-sm font-semibold text-[--amber]">
            Vos arguments de vente personnalisés
          </p>
          <p className="mt-1 text-sm text-[--amber]">
            {recommendation.positioning_summary}
          </p>
          <div className="mt-3 space-y-2">
            {recommendation.use_cases.slice(0, 2).map((uc) => (
              <div
                key={uc.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-[--amber-border] bg-[--bg-card] px-4 py-2.5"
              >
                <p className="text-sm font-medium text-[--text-primary]">{uc.title}</p>
                <div className="flex shrink-0 gap-2 text-xs">
                  <span className="text-[--amber] font-semibold">{uc.price_range}</span>
                  <span className="text-[--text-disabled]">{uc.mission_days}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Category filters */}
      <div className="flex flex-wrap gap-2">
        {["Tous", "Pitch deck", "Calculateur ROI", "Cas client", "Gestion objections"].map((f) => (
          <button
            key={f}
            className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
              f === "Tous"
                ? "border-[--amber-border] bg-[--amber-dim] text-[--amber]"
                : "border-[--border] bg-[--bg-card] text-[--text-secondary] hover:border-[--amber-border] hover:text-[--amber]"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Resources grid */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {RESOURCES.map((resource) => {
          const catConfig = CATEGORY_CONFIG[resource.category];
          const CatIcon = catConfig.icon;
          const formatClass = FORMAT_BADGE[resource.format] ?? FORMAT_BADGE.PDF;

          return (
            <Card
              key={resource.id}
              className="border-[--border] bg-[--bg-card] shadow-soft-sm hover:border-[--amber-border]"
            >
              <CardContent className="space-y-4 p-5">
                <div className="flex items-start gap-3">
                  <div className={`rounded-xl border p-2.5 ${catConfig.className}`}>
                    <CatIcon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="font-semibold leading-tight text-[--text-primary]">
                      {resource.title}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      <span className={`rounded-full border px-2 py-0.5 text-xs font-medium ${catConfig.className}`}>
                        {catConfig.label}
                      </span>
                      <span className={`rounded-full border px-2 py-0.5 text-xs font-medium ${formatClass}`}>
                        {resource.format}
                      </span>
                    </div>
                  </div>
                </div>

                <p className="text-sm leading-6 text-[--text-muted]">
                  {resource.description}
                </p>

                <div className="flex items-center justify-between text-xs text-[--text-disabled]">
                  <span>{resource.size}</span>
                  <span>Mis à jour : {resource.updated}</span>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 border-[--amber-border] text-[--amber] hover:bg-[--amber-dim]"
                  >
                    <Download className="mr-1.5 h-3.5 w-3.5" />
                    Télécharger
                  </Button>
                  <Button variant="ghost" size="sm" className="shrink-0 text-[--text-disabled]">
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Request resource */}
      <div className="rounded-2xl border border-dashed border-[--border] bg-[--bg-hover] p-6 text-center">
        <p className="text-sm font-medium text-[--text-secondary]">
          Vous avez besoin d'une ressource spécifique ?
        </p>
        <p className="mt-1 text-xs text-[--text-disabled]">
          Soumettez une demande à l'équipe Move to AI — délai de réponse sous 5 jours ouvrés.
        </p>
        <Button size="sm" variant="outline" className="mt-3">
          Demander une ressource
        </Button>
      </div>
    </div>
  );
}
