import type { Route } from "next";
import Link from "next/link";

import type { MarketingSiteContent } from "@/lib/marketing-site";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHero } from "@/components/marketing/page-hero";
import { ScenarioBrowser } from "@/components/marketing/scenario-browser";
import { SectionHeading } from "@/components/marketing/section-heading";

type ExamplesPageProps = {
  content: MarketingSiteContent;
};

const useCases = [
  {
    title: "Amelioration des processus",
    description:
      "Qualifier les irritants, prioriser les leviers IA et tenir les plans d'action.",
    outcomes: ["Priorites plus claires", "Execution plus reguliere"]
  },
  {
    title: "Copilots metier",
    description:
      "Cadrer les copilots utiles dans les bons workflows et en suivre l'adoption.",
    outcomes: ["Adoption plus utile", "Gouvernance plus nette"]
  },
  {
    title: "Knowledge management",
    description:
      "Transformer la connaissance diffuse en actif exploitable pour les equipes.",
    outcomes: ["Acces accelere", "Moins de re-travail"]
  },
  {
    title: "Gouvernance de portefeuille IA",
    description:
      "Relier chaque opportunite a un processus, un owner, un statut et une valeur.",
    outcomes: ["Arbitrages solides", "Vision portefeuille lisible"]
  },
  {
    title: "Data products & pilotage",
    description:
      "Preparer la readiness data et connecter reporting, valeur et execution.",
    outcomes: ["Alignement data-metier", "Pilotage plus robuste"]
  },
  {
    title: "Suivi de plans d'action",
    description:
      "Assurer la traction entre opportunites, chantiers et valeur attendue.",
    outcomes: ["Execution plus visible", "Impact mieux suivi"]
  }
];

export function ExamplesPage({ content }: ExamplesPageProps) {
  return (
    <>
      <PageHero
        eyebrow="Cas d'usage & Exemples"
        title="Trouvez rapidement les exemples les plus proches de votre contexte"
        subtitle="Explorez les exemples par taille d'entreprise, secteur et priorites process. Move to AI cadre la trajectoire, la plateforme organise l'execution."
        aside={
          <Card className="w-full max-w-md border-primary/10 bg-white shadow-soft">
            <CardHeader>
              <Badge>{content.shared.programLabel}</Badge>
              <CardTitle>Ce que vous obtenez en premier</CardTitle>
              <CardDescription className="text-sm leading-7">
                Un diagnostic guide dans la plateforme, puis une trajectoire d'execution
                priorisee et gouvernee.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="rounded-2xl border border-border/70 px-4 py-3 text-sm text-slate-700">
                5 processus prioritaires et des opportunites IA utiles
              </div>
              <div className="rounded-2xl border border-primary/10 bg-primary/5 px-4 py-3 text-sm text-primary-deep">
                Move to AI structure le cadrage et les quick wins
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-950 px-4 py-3 text-sm text-slate-200">
                La plateforme pilote execution, gouvernance et valeur
              </div>
            </CardContent>
          </Card>
        }
      />

      <section className="page-shell py-12">
        <SectionHeading
          eyebrow="Filtrer par contexte"
          title="Selectionnez votre taille et votre secteur"
          subtitle="Le diagnostic guide et les exemples sont adaptes a votre contexte, vos contraintes et vos priorites process."
        />
        <div className="mt-10">
          <ScenarioBrowser content={content} />
        </div>
      </section>

      <section className="page-shell py-12">
        <SectionHeading
          eyebrow="Cas d'usage transverses"
          title="Des cas d'usage relies a l'execution"
          subtitle="Une lecture complementaire pour situer vos priorites process et la trajectoire d'industrialisation."
        />
        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          {useCases.map((item) => (
            <Card key={item.title} className="border-border/70 bg-white/90">
              <CardHeader>
                <CardTitle className="text-lg">{item.title}</CardTitle>
                <CardDescription className="text-sm leading-7">{item.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {item.outcomes.map((outcome) => (
                  <div key={outcome} className="rounded-2xl border border-border/70 px-4 py-3 text-sm text-slate-700">
                    {outcome}
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="page-shell py-12">
        <SectionHeading
          eyebrow="Move to AI + Plateforme"
          title="Diagnostiquer, cadrer, puis piloter l'execution"
          subtitle="Move to AI apporte la methode et le cadrage. La plateforme orchestre l'execution, la gouvernance et le suivi de valeur."
        />
        <div className="mt-8 grid gap-5 lg:grid-cols-2">
          <Card className="border-primary/10 bg-primary/5">
            <CardHeader>
              <Badge>{content.shared.programLabel}</Badge>
              <CardTitle>Move to AI: cadrage et priorisation</CardTitle>
              <CardDescription className="text-sm leading-7">
                Diagnostic guide, choix des 5 processus prioritaires, quick wins et trajectoire.
              </CardDescription>
            </CardHeader>
          </Card>
          <Card className="border-slate-200 bg-slate-950 text-white">
            <CardHeader>
              <Badge className="bg-white/10 text-white" variant="outline">
                {content.shared.platformLabel}
              </Badge>
              <CardTitle className="text-white">Plateforme: execution et gouvernance</CardTitle>
              <CardDescription className="text-sm leading-7 text-slate-300">
                Portefeuille d'opportunites, workflows, plans d'action et suivi de la valeur.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      <section className="page-shell py-12">
        <Card className="overflow-hidden border-primary/10 bg-slate-950 text-white shadow-soft">
          <CardContent className="grid gap-8 p-8 lg:grid-cols-[1fr_auto] lg:items-center">
            <div className="space-y-4">
              <Badge className="bg-white/10 text-white" variant="outline">
                {content.shared.programLabel}
              </Badge>
              <h2 className="max-w-3xl text-3xl font-semibold tracking-tight">
                Identifiez les 5 processus a transformer en priorite
              </h2>
              <p className="max-w-3xl text-base leading-8 text-slate-300">
                Lancez le diagnostic guide et obtenez une trajectoire claire, puis pilotez
                l'execution dans la plateforme.
              </p>
            </div>
            <div className="flex flex-col gap-3 lg:w-[18rem]">
              <Button size="lg" asChild>
                <Link href={"/signup" as Route}>{content.shared.primaryCta}</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href={"/plateforme" as Route}>{content.shared.secondaryCta}</Link>
              </Button>
              <Button size="lg" variant="ghost" asChild>
                <Link className="text-white hover:bg-white/10 hover:text-white" href={"/request-demo" as Route}>
                  Reserver un echange
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </>
  );
}
