import type { Route } from "next";
import Link from "next/link";

import type { MarketingSiteContent } from "@/lib/marketing-site";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHero } from "@/components/marketing/page-hero";

type IndustryPageProps = {
  content: MarketingSiteContent;
};

const sectors = [
  {
    title: "Industrie",
    challenges: ["Qualite", "Maintenance"],
    workflows: ["Non-conformites", "Plans d'action", "Procedures atelier"],
    diagnostic: "Diagnostic guide pour identifier les processus critiques et leurs irritants.",
    governance: "Gouvernance intermediaire a elevee.",
    benefits: ["Reactivite terrain", "Pilotage plus consolide"]
  },
  {
    title: "Retail / Distribution",
    challenges: ["Standardisation reseau", "Support terrain"],
    workflows: ["Procedures magasins", "Support operationnel", "Plans d'action terrain"],
    diagnostic: "Diagnostic guide pour prioriser les processus magasin et back-office.",
    governance: "Gouvernance intermediaire, forte dimension reseau.",
    benefits: ["Execution plus homogene", "Support plus fluide"]
  },
  {
    title: "Banque / Assurance",
    challenges: ["Documentation", "Conformite"],
    workflows: ["Traitement documentaire", "Validation", "Demandes internes"],
    diagnostic: "Diagnostic guide pour cadrer les workflows sensibles et les contraintes reglementaires.",
    governance: "Gouvernance elevee et decisions tracees.",
    benefits: ["Moins de friction", "Tracabilite accrue"]
  },
  {
    title: "Sante / Pharmaceutique",
    challenges: ["Qualite", "Documentation critique"],
    workflows: ["CAPA", "Procedures", "Referentiels"],
    diagnostic: "Diagnostic guide pour qualifier les processus critiques et le niveau de confiance requis.",
    governance: "Gouvernance elevee, forte exigence de preuve.",
    benefits: ["Confiance plus forte", "Progression mieux mesurable"]
  },
  {
    title: "Services / Conseil / ESN",
    challenges: ["Capitalisation", "Delivery"],
    workflows: ["Knowledge management", "Propositions", "Support delivery"],
    diagnostic: "Diagnostic guide pour identifier les processus a plus fort levier de productivite.",
    governance: "Gouvernance intermediaire et mutualisation.",
    benefits: ["Reutilisation de l'expertise", "Execution plus coherente"]
  },
  {
    title: "Secteur public",
    challenges: ["Simplification administrative", "Connaissance diffuse"],
    workflows: ["Instruction de demandes", "Gestion documentaire", "Suivi d'actions"],
    diagnostic: "Diagnostic guide pour cadrer les processus a moderniser progressivement.",
    governance: "Gouvernance variable, forte coordination.",
    benefits: ["Parcours plus fluides", "Transformation plus progressive"]
  }
];

export function IndustryPage({ content }: IndustryPageProps) {
  return (
    <>
      <PageHero
        eyebrow="Exemples par secteur"
        title="Des trajectoires qui partent des contraintes reelles du terrain"
        subtitle="Move to AI et la plateforme s'adaptent a chaque secteur, avec un diagnostic guide."
      />

      <section className="page-shell py-10">
        <div className="grid gap-6">
          {sectors.map((sector) => (
            <Card key={sector.title}>
              <CardHeader>
                <Badge>{sector.title}</Badge>
                <CardTitle className="text-2xl">{sector.governance}</CardTitle>
                <CardDescription className="text-base leading-8">
                  {sector.diagnostic}
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-6 lg:grid-cols-3">
                <div className="space-y-3">
                  <p className="text-sm font-semibold text-slate-950">Enjeux</p>
                  {sector.challenges.map((item) => (
                    <div key={item} className="rounded-2xl border border-border/70 px-4 py-3 text-sm text-slate-700">
                      {item}
                    </div>
                  ))}
                </div>
                <div className="space-y-3">
                  <p className="text-sm font-semibold text-slate-950">Workflows cibles</p>
                  {sector.workflows.map((item) => (
                    <div key={item} className="rounded-2xl border border-primary/10 bg-primary/5 px-4 py-3 text-sm text-primary-deep">
                      {item}
                    </div>
                  ))}
                </div>
                <div className="space-y-3">
                  <p className="text-sm font-semibold text-slate-950">Valeur attendue</p>
                  {sector.benefits.map((item) => (
                    <div key={item} className="rounded-2xl border border-slate-200 bg-slate-950 px-4 py-3 text-sm text-slate-200">
                      {item}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="page-shell py-10">
        <div className="flex flex-wrap items-center gap-3 rounded-3xl border border-primary/10 bg-primary/5 p-6 text-sm text-slate-700">
          <Badge>{content.shared.programLabel}</Badge>
          <span>Le diagnostic guide dans la plateforme reste le socle commun.</span>
          <Button size="sm" className="ml-auto" asChild>
            <Link href={"/signup" as Route}>{content.shared.primaryCta}</Link>
          </Button>
        </div>
      </section>
    </>
  );
}
