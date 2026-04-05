import type { Route } from "next";
import Link from "next/link";

import type { MarketingSiteContent } from "@/lib/marketing-site";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHero } from "@/components/marketing/page-hero";

type CompanySizePageProps = {
  content: MarketingSiteContent;
};

const sections = [
  {
    title: "PME",
    challenges: ["Peu de bande passante", "Besoin de quick wins"],
    maturity: "Maturite heterogene, besoins concrets et rapides.",
    diagnostic: "Diagnostic guide dans la plateforme pour identifier 5 processus prioritaires.",
    moveToAi: "Cadrage rapide et trajectoire courte.",
    bluePilotAi: "Cockpit simple pour piloter opportunites et actions.",
    benefits: ["Trajectoire lisible", "Adoption plus rapide"]
  },
  {
    title: "ETI",
    challenges: ["Aligner plusieurs equipes", "Arbitrer entre quick wins et chantiers"],
    maturity: "Premiers cas d'usage, passage a l'echelle partiel.",
    diagnostic: "Diagnostic guide pour prioriser et organiser la gouvernance.",
    moveToAi: "Priorisation et gouvernance adaptee.",
    bluePilotAi: "Portefeuille, workflows et suivi de valeur.",
    benefits: ["Priorites mieux arbitrees", "Execution plus coherente"]
  },
  {
    title: "Grand groupe",
    challenges: ["Portefeuille IA trop vaste", "Gouvernance multi-entites"],
    maturity: "Initiatives nombreuses, industrialisation inegale.",
    diagnostic: "Diagnostic guide pour selectionner les processus critiques.",
    moveToAi: "Structuration du programme et des arbitrages.",
    bluePilotAi: "Cockpit transverse de gouvernance et execution.",
    benefits: ["Vision corporate plus claire", "Passage a l'echelle plus credible"]
  }
];

export function CompanySizePage({ content }: CompanySizePageProps) {
  return (
    <>
      <PageHero
        eyebrow="Exemples par taille"
        title="Une trajectoire adaptee a la taille, a la maturite et a la capacite de transformation"
        subtitle="Le point de depart reste le meme: diagnostic guide dans la plateforme, puis execution pilotee."
      />

      <section className="page-shell py-10">
        <div className="grid gap-6">
          {sections.map((section) => (
            <Card key={section.title}>
              <CardHeader>
                <Badge>{section.title}</Badge>
                <CardTitle className="text-2xl">{section.maturity}</CardTitle>
                <CardDescription className="text-base leading-8">
                  {section.moveToAi}
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-6 lg:grid-cols-3">
                <div className="space-y-3">
                  <p className="text-sm font-semibold text-slate-950">Defis</p>
                  {section.challenges.map((item) => (
                    <div key={item} className="rounded-2xl border border-border/70 px-4 py-3 text-sm text-slate-700">
                      {item}
                    </div>
                  ))}
                </div>
                <div className="space-y-3">
                  <p className="text-sm font-semibold text-slate-950">Diagnostic</p>
                  <div className="rounded-2xl border border-primary/10 bg-primary/5 px-4 py-3 text-sm text-primary-deep">
                    {section.diagnostic}
                  </div>
                  <p className="text-sm font-semibold text-slate-950">Plateforme</p>
                  <div className="rounded-2xl border border-slate-200 bg-slate-950 px-4 py-3 text-sm text-slate-200">
                    {section.bluePilotAi}
                  </div>
                </div>
                <div className="space-y-3">
                  <p className="text-sm font-semibold text-slate-950">Benefices</p>
                  {section.benefits.map((item) => (
                    <div key={item} className="rounded-2xl border border-border/70 bg-slate-50 px-4 py-3 text-sm text-slate-700">
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
          <span>Le diagnostic guide reste le meme, quelle que soit la taille.</span>
          <Button size="sm" className="ml-auto" asChild>
            <Link href={"/signup" as Route}>{content.shared.primaryCta}</Link>
          </Button>
        </div>
      </section>
    </>
  );
}
