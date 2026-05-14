import { redirect } from "next/navigation";
import { Copy, FileText, Globe, Lock, Plus, Tag } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getCurrentWorkspaceContext } from "@/server/auth";

export const dynamic = "force-dynamic";

type TemplateVisibility = "private" | "public" | "shared";

const VISIBILITY_CONFIG: Record<TemplateVisibility, { label: string; icon: React.ElementType; className: string }> = {
  private: { label: "Privé", icon: Lock, className: "text-[--text-secondary] bg-[--bg-hover] border-[--border]" },
  public: { label: "Public", icon: Globe, className: "text-[--blue] bg-[--blue-dim] border-[--blue-border]" },
  shared: { label: "Partagé", icon: Copy, className: "text-[--amber] bg-[--amber-dim] border-[--amber-border]" },
};

const MOCK_TEMPLATES = [
  {
    id: "tpl_1",
    name: "Audit IA Readiness — PME",
    description: "Grille d'évaluation complète de la maturité IA pour PME. Inclut 40 points de contrôle.",
    category: "Audit",
    visibility: "public" as TemplateVisibility,
    uses: 12,
    lastUpdated: "Il y a 3 jours",
    sectors: ["Industrie", "Commerce"],
  },
  {
    id: "tpl_2",
    name: "Cartographie des processus — Template standard",
    description: "Template de cartographie processus adapté à une mission de 3 jours.",
    category: "Cartographie",
    visibility: "shared" as TemplateVisibility,
    uses: 8,
    lastUpdated: "Hier",
    sectors: ["Tous secteurs"],
  },
  {
    id: "tpl_3",
    name: "Plan de déploiement POC IA",
    description: "Planning type pour un POC IA générative sur 4 semaines.",
    category: "POC",
    visibility: "private" as TemplateVisibility,
    uses: 5,
    lastUpdated: "Il y a 1 semaine",
    sectors: ["Finance", "Services"],
  },
];

const CATEGORY_COLORS: Record<string, string> = {
  Audit: "bg-[--purple-dim] text-[--purple] border-[--purple-border]",
  Cartographie: "bg-[--blue-dim] text-[--blue] border-[--blue-border]",
  POC: "bg-[--green-dim] text-[--green] border-[--green-border]",
  Formation: "bg-[--amber-dim] text-[--amber] border-[--amber-border]",
  Livrables: "bg-[--amber-dim] text-[--amber] border-[--amber-border]",
};

export default async function TemplatesPage() {
  const { workspace } = await getCurrentWorkspaceContext({ requireMembership: true });
  if (!workspace?.id) redirect("/onboarding");

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-xl font-semibold text-[--text-primary]">
            Ma bibliothèque de templates
          </h1>
          <p className="text-sm text-[--text-muted]">
            {MOCK_TEMPLATES.length} template{MOCK_TEMPLATES.length !== 1 ? "s" : ""} · Réutilisables et partageables avec vos clients
          </p>
        </div>
        <Button className="bg-[--amber] hover:bg-[--amber]" size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Créer un template
        </Button>
      </div>

      {/* Category filters */}
      <div className="flex flex-wrap gap-2">
        {["Tous", "Audit", "Cartographie", "POC", "Formation", "Livrables"].map((cat) => (
          <button
            key={cat}
            className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
              cat === "Tous"
                ? "border-[--amber-border] bg-[--amber-dim] text-[--amber]"
                : "border-[--border] bg-[--bg-card] text-[--text-secondary] hover:border-[--amber-border] hover:text-[--amber]"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Templates grid */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {MOCK_TEMPLATES.map((template) => {
          const visConfig = VISIBILITY_CONFIG[template.visibility];
          const VisIcon = visConfig.icon;
          const catClass = CATEGORY_COLORS[template.category] ?? CATEGORY_COLORS.Audit;
          return (
            <Card key={template.id} className="border-[--border] bg-[--bg-card] shadow-soft-sm hover:border-[--amber-border]">
              <CardContent className="space-y-4 p-5">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-3">
                    <div className="rounded-xl bg-[--amber-dim] p-2">
                      <FileText className="h-4 w-4 text-[--amber]" />
                    </div>
                    <div className="space-y-1">
                      <p className="font-semibold leading-tight text-[--text-primary]">
                        {template.name}
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        <span className={`rounded-full border px-2 py-0.5 text-xs font-medium ${catClass}`}>
                          {template.category}
                        </span>
                        <span
                          className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${visConfig.className}`}
                        >
                          <VisIcon className="h-3 w-3" />
                          {visConfig.label}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <p className="text-sm leading-6 text-[--text-muted]">
                  {template.description}
                </p>

                <div className="flex flex-wrap gap-1.5">
                  {template.sectors.map((s) => (
                    <span key={s} className="flex items-center gap-1 rounded-full bg-[--bg-hover] px-2.5 py-0.5 text-xs text-[--text-secondary]">
                      <Tag className="h-3 w-3" />
                      {s}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between text-xs text-[--text-disabled]">
                  <span>{template.uses} utilisation{template.uses !== 1 ? "s" : ""}</span>
                  <span>{template.lastUpdated}</span>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1 border-[--amber-border] text-[--amber] hover:bg-[--amber-dim]">
                    Utiliser
                  </Button>
                  <Button variant="ghost" size="sm" className="flex-1 text-[--text-muted]">
                    <Copy className="mr-1.5 h-3.5 w-3.5" />
                    Dupliquer
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {/* Create template card */}
        <Card className="border-dashed border-[--border] bg-[--bg-hover]">
          <CardContent className="flex h-full min-h-[220px] flex-col items-center justify-center gap-3 text-center">
            <div className="rounded-2xl bg-[--amber-dim] p-3">
              <Plus className="h-6 w-6 text-[--amber]" />
            </div>
            <p className="text-sm font-medium text-[--text-secondary]">
              Créer un template
            </p>
            <p className="max-w-[180px] text-xs text-[--text-disabled]">
              Transformez une mission réussie en template réutilisable
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
