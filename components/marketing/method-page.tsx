import type { Route } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import type { MarketingSiteContent } from "@/lib/marketing-site";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHero } from "@/components/marketing/page-hero";

type MethodPageProps = {
  content: MarketingSiteContent;
};

const stages = [
  {
    title: "1. Diagnostic guide",
    description:
      "Le diagnostic se realise dans la plateforme. Le LLM structure l'analyse, aide a explorer les processus et propose une premiere priorisation.",
    deliverables: ["Top processus prioritaires"]
  },
  {
    title: "2. Sprint Move to AI",
    description:
      "Cadrage, gouvernance, quick wins et trajectoire de transformation.",
    deliverables: ["Feuille de route"]
  },
  {
    title: "3. Industrialisation",
    description:
      "La plateforme devient le cockpit d'execution, de gouvernance et de suivi de valeur.",
    deliverables: ["Plans d'action"]
  }
];

export function MethodPage({ content }: MethodPageProps) {
  return (
    <>
      <PageHero
        eyebrow="La methode Move to AI"
        title="Un parcours sobre pour passer des intentions IA a une trajectoire executable"
        subtitle="Move to AI combine diagnostic, priorisation et cadrage. Le diagnostic se realise dans la plateforme, guide par un LLM, avant d'industrialiser l'execution."
        aside={
          <Card className="w-full max-w-md border-primary/10 bg-gradient-to-br from-primary/5 via-white to-primary/10">
            <CardHeader>
              <Badge>{content.shared.programLabel}</Badge>
              <CardTitle>Ce que vous obtenez</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm leading-7 text-slate-700">
              <div className="rounded-2xl border border-border/70 px-4 py-3">
                Diagnostic structure dans la plateforme
              </div>
              <div className="rounded-2xl border border-border/70 px-4 py-3">
                Priorites process et opportunites IA
              </div>
              <div className="rounded-2xl border border-border/70 px-4 py-3">
                Trajectoire vers l'execution
              </div>
            </CardContent>
          </Card>
        }
      />

      <section className="page-shell py-10">
        <div className="grid gap-6 lg:grid-cols-3">
          {stages.map((stage, index) => (
            <Card key={stage.title}>
              <CardHeader>
                <Badge>{`0${index + 1}`}</Badge>
                <CardTitle>{stage.title}</CardTitle>
                <CardDescription className="text-sm leading-7">
                  {stage.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {stage.deliverables.map((item) => (
                  <div key={item} className="rounded-2xl border border-border/70 px-4 py-3 text-sm text-slate-700">
                    {item}
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="page-shell py-10">
        <Card className="border-primary/10 bg-primary/5">
          <CardHeader>
            <Badge>LLM copilote de diagnostic</Badge>
            <CardTitle>Un assistant structure l'analyse</CardTitle>
            <CardDescription className="text-base leading-7">
              Le LLM aide a explorer les processus, qualifier les irritants et proposer une priorisation. Les decisions restent humaines, mais l'analyse est acceleree et mieux structuree.
            </CardDescription>
          </CardHeader>
        </Card>
      </section>

      <section className="page-shell py-10">
        <Card className="overflow-hidden border-slate-200 bg-slate-950 text-white">
          <CardContent className="grid gap-8 p-8 lg:grid-cols-[1fr_auto] lg:items-center">
            <div className="space-y-4">
              <Badge className="bg-white/10 text-white" variant="outline">
                {content.shared.platformLabel}
              </Badge>
              <h2 className="text-3xl font-semibold tracking-tight">
                La plateforme prend ensuite le relais de l'execution
              </h2>
              <p className="max-w-3xl text-base leading-8 text-slate-300">
                Une fois la trajectoire clarifiee, la plateforme devient le cockpit de priorisation, de gouvernance, de workflow, de plans d'action et de suivi de la valeur.
              </p>
            </div>
            <Button size="lg" asChild>
              <Link href={"/plateforme" as Route}>
                {content.shared.secondaryCta}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </section>
    </>
  );
}
