import type { Route } from "next";
import Link from "next/link";
import { CheckCircle2, GitBranch, Shield, Target } from "lucide-react";

import type { MarketingSiteContent } from "@/lib/marketing-site";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHero } from "@/components/marketing/page-hero";

type PlatformPageProps = {
  content: MarketingSiteContent;
};

const pillarIcons = [Target, Shield, GitBranch];

export function PlatformPage({ content }: PlatformPageProps) {
  const pillars = [
    {
      title: "Diagnostic guide dans la plateforme",
      description:
        "Le diagnostic se realise dans la plateforme. Le LLM agit comme copilote pour structurer l&rsquo;analyse, sans remplacer la decision humaine.",
      details: [
        "Exploration des processus par priorite",
        "Qualification des irritants et des risques",
        "Premiere priorisation actionnable"
      ]
    },
    {
      title: "Pilotage process-centrique",
      description:
        "Les opportunites sont reliees a des processus metier concrets, des points de friction et des owners clairement identifies.",
      details: [
        "Domaines, processus et opportunites relies",
        "Vision portefeuille lisible pour le business",
        "Base de priorisation orientees impact"
      ]
    },
    {
      title: "Gouvernance et industrialisation",
      description:
        "La plateforme donne un cadre de gouvernance concret pour passer des cas d&rsquo;usage pilotes a une execution gouvernee.",
      details: [
        "Decisions et arbitrages traces",
        "Suivi de la valeur et de l'adoption",
        "Preparation du passage a l&rsquo;echelle"
      ]
    }
  ];

  return (
    <>
      <PageHero
        eyebrow="Plateforme"
        title="La plateforme qui structure, priorise, gouverne et industrialise l&rsquo;execution"
        subtitle="La plateforme n&rsquo;est pas vendue comme un outil IA generique. C&rsquo;est le systeme de pilotage d&rsquo;une transformation process centree sur les opportunites IA, la gouvernance, les workflows et la valeur. Le diagnostic s&rsquo;y realise, guide par un LLM."
        aside={
          <Card className="w-full max-w-md border-primary/10 bg-white shadow-soft">
            <CardHeader>
              <Badge>{content.shared.platformLabel}</Badge>
              <CardTitle>Ce que la plateforme rend visible</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                "Les opportunites a prioriser",
                "Les workflows a structurer",
                "Les plans d&rsquo;action a tenir",
                "La valeur a suivre",
                "Les conditions du passage a l&rsquo;echelle"
              ].map((item) => (
                <div key={item} className="flex items-start gap-3 rounded-2xl border border-border/70 px-4 py-3 text-sm text-slate-700">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary" />
                  <span>{item}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        }
      />

      <section className="page-shell py-10">
        <div className="grid gap-6 lg:grid-cols-4">
          {pillars.map((pillar, index) => {
            const Icon = pillarIcons[index % pillarIcons.length];

            return (
              <Card key={pillar.title}>
                <CardHeader className="space-y-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <CardTitle>{pillar.title}</CardTitle>
                  <CardDescription className="text-sm leading-7">
                    {pillar.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {pillar.details.map((item) => (
                    <div key={item} className="rounded-2xl border border-border/70 px-4 py-3 text-sm text-slate-700">
                      {item}
                    </div>
                  ))}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      <section className="page-shell py-10">
        <Card className="overflow-hidden border-primary/10 bg-white shadow-soft">
          <CardContent className="grid gap-8 p-8 lg:grid-cols-[1fr_auto] lg:items-center">
            <div className="space-y-4">
              <Badge>{content.shared.programLabel}</Badge>
              <h2 className="text-3xl font-semibold tracking-tight text-slate-950">
                Le programme Move to AI construit la trajectoire. La plateforme la fait tenir.
              </h2>
              <p className="max-w-3xl text-base leading-8 text-slate-600">
                C&rsquo;est cette separation entre programme de transformation et plateforme d&rsquo;execution qui rend l&rsquo;ensemble credible, lisible et scalable.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
              <Button size="lg" asChild>
                <Link href={"/signup" as Route}>Lancer le diagnostic</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href={"/exemples" as Route}>
                  Decouvrir les exemples
                  <GitBranch className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </>
  );
}
