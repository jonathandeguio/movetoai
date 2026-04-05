import type { Route } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BriefcaseBusiness,
  Compass,
  Target
} from "lucide-react";

import type { MarketingSiteContent } from "@/lib/marketing-site";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SectionHeading } from "@/components/marketing/section-heading";
import { ScenarioBrowser } from "@/components/marketing/scenario-browser";

type MarketingHomepageProps = {
  content: MarketingSiteContent;
};

const problemIcons = [Compass, Target, BriefcaseBusiness];
const platformIcons = [Target, BriefcaseBusiness];

const hero = {
  eyebrow: "De l'intention IA a la transformation pilotee",
  title:
    "Move to AI aide a choisir les bons processus a transformer. La plateforme industrialise ensuite l'execution.",
  subtitle:
    "Move to AI apporte la methode. Le diagnostic se realise dans la plateforme, guide par un LLM qui structure l'analyse, suggere les priorites et aide a produire un cadrage actionnable.",
  bullets: [
    "Identifier les bons processus avant de multiplier les pilotes",
    "Prioriser les cas d'usage puis industrialiser l'execution"
  ],
  programCardTitle: "Move to AI structure la trajectoire",
  programCardBody:
    "Diagnostic, cadrage, priorisation et feuille de route pour transformer des intentions IA diffuses en programme concret.",
  platformCardTitle: "La plateforme pilote l'execution",
  platformCardBody:
    "Portefeuille d'opportunites, gouvernance, workflows, plans d'action, suivi de valeur et passage a l'echelle."
};

const problem = {
  title: "Beaucoup d'organisations avancent sans trajectoire claire",
  intro:
    "Les intentions sont nombreuses, les POC se multiplient, mais le passage a une transformation process et metier reste flou.",
  items: [
    "Des tests IA sont lances sans vision claire des processus a transformer",
    "Les POC s'accumulent sans mecanisme de priorisation ni passage a l'echelle",
    "Le business, l'IT et la gouvernance ne partagent pas la meme lecture"
  ]
};

const diagnosticSection = {
  title: "Le diagnostic se realise dans la plateforme",
  intro:
    "Ce n'est pas un PDF. C'est une experience guidee, structuree, directement dans la plateforme.",
  items: [
    {
      title: "Ce que l'utilisateur renseigne",
      body:
        "Processus a explorer, objectifs, irritants, contraintes et attentes de valeur."
    },
    {
      title: "Ce que le LLM aide a faire",
      body:
        "Structurer l'analyse, suggerer des processus, qualifier les irritants et proposer une priorisation."
    },
    {
      title: "Ce que la plateforme restitue",
      body:
        "Top 5 processus prioritaires, opportunites associees et premiers plans d'action."
    }
  ]
};

const platformSection = {
  title: "La plateforme, moteur d'execution de la transformation",
  intro:
    "La plateforme aide les equipes a piloter un portefeuille d'opportunites IA relie a des processus reels.",
  items: [
    {
      title: "Pilotage process-centrique",
      description:
        "Processus, opportunites, owners, statuts et plans d'action au meme endroit."
    },
    {
      title: "Priorisation et gouvernance",
      description:
        "Scoring simple, arbitrages explicites, workflow de decision."
    }
  ]
};

const finalCta = {
  title: "Commencez par les 5 processus qui comptent vraiment",
  body:
    "Move to AI clarifie la trajectoire. La plateforme vous donne ensuite le systeme pour la tenir dans la duree.",
  primary: "Identifiez les 5 processus a transformer en priorite",
  secondary: "Lancer le diagnostic dans la plateforme",
  tertiary: "Decouvrez comment la plateforme industrialise l'execution"
};

export function MarketingHomepage({ content }: MarketingHomepageProps) {
  return (
    <>
      <section className="page-shell grid gap-12 py-18 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:py-24">
        <div className="space-y-8">
          <div className="space-y-5">
            <Badge>{hero.eyebrow}</Badge>
            <h1 className="max-w-4xl text-5xl font-semibold tracking-tight text-slate-950 text-balance md:text-6xl">
              {hero.title}
            </h1>
            <p className="max-w-3xl text-lg leading-8 text-slate-600">{hero.subtitle}</p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button size="lg" asChild>
              <Link href={"/signup" as Route}>
                {content.shared.primaryCta}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href={"/plateforme" as Route}>{content.shared.secondaryCta}</Link>
            </Button>
          </div>

          <div className="grid gap-3">
            {hero.bullets.map((bullet) => (
              <div
                key={bullet}
                className="rounded-2xl border border-border/70 bg-white/80 px-4 py-4 text-sm leading-7 text-slate-700 shadow-soft-sm"
              >
                {bullet}
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-5">
          <Card className="border-primary/10 bg-gradient-to-br from-primary/5 via-white to-primary/10 shadow-soft">
            <CardHeader>
              <Badge>{content.shared.programLabel}</Badge>
              <CardTitle className="text-2xl">{hero.programCardTitle}</CardTitle>
              <CardDescription className="text-base leading-7">
                {hero.programCardBody}
              </CardDescription>
            </CardHeader>
          </Card>
          <Card className="border-slate-200 bg-slate-950 text-white shadow-soft">
            <CardHeader>
              <Badge className="bg-white/10 text-white" variant="outline">
                {content.shared.platformLabel}
              </Badge>
              <CardTitle className="text-2xl text-white">{hero.platformCardTitle}</CardTitle>
              <CardDescription className="text-base leading-7 text-slate-300">
                {hero.platformCardBody}
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      <section className="page-shell py-10">
        <SectionHeading eyebrow="Pourquoi les programmes IA patinent" title={problem.title} subtitle={problem.intro} />
        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          {problem.items.map((item, index) => {
            const Icon = problemIcons[index];
            return (
              <Card key={item} className="border-border/70 bg-white/85">
                <CardHeader className="space-y-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <CardDescription className="text-sm leading-7 text-slate-700">
                    {item}
                  </CardDescription>
                </CardHeader>
              </Card>
            );
          })}
        </div>
      </section>

      <section className="page-shell py-18">
        <SectionHeading eyebrow="Diagnostic dans la plateforme" title={diagnosticSection.title} subtitle={diagnosticSection.intro} />
        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          {diagnosticSection.items.map((item) => (
            <Card key={item.title} className="border-border/70 bg-white/90">
              <CardHeader>
                <CardTitle>{item.title}</CardTitle>
                <CardDescription className="text-sm leading-7">{item.body}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      <section className="page-shell py-18">
        <SectionHeading
          eyebrow="Exemples concrets"
          title="Exemples concrets par taille d'entreprise et secteur"
          subtitle="Choisissez un contexte pour voir comment Move to AI et la plateforme se positionnent ensemble."
        />
        <div className="mt-10">
          <ScenarioBrowser content={content} />
        </div>
      </section>

      <section className="page-shell py-18">
        <SectionHeading eyebrow="Plateforme" title={platformSection.title} subtitle={platformSection.intro} />
        <div className="mt-10 grid gap-5 lg:grid-cols-2">
          {platformSection.items.map((item, index) => {
            const Icon = platformIcons[index];
            return (
              <Card key={item.title} className="border-slate-200 bg-slate-950 text-white">
                <CardHeader className="space-y-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-white">
                    <Icon className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-white">{item.title}</CardTitle>
                  <CardDescription className="text-sm leading-7 text-slate-300">
                    {item.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            );
          })}
        </div>
      </section>

      <section className="page-shell py-10">
        <Card className="overflow-hidden border-primary/10 bg-slate-950 text-white shadow-soft">
          <CardContent className="grid gap-8 p-8 lg:grid-cols-[1fr_auto] lg:items-center">
            <div className="space-y-4">
              <Badge className="bg-white/10 text-white" variant="outline">
                {content.shared.programLabel} + {content.shared.platformLabel}
              </Badge>
              <h2 className="max-w-3xl text-3xl font-semibold tracking-tight text-balance">
                {finalCta.title}
              </h2>
              <p className="max-w-3xl text-base leading-8 text-slate-300">{finalCta.body}</p>
            </div>
            <div className="flex flex-col gap-3 lg:w-[19rem]">
              <Button size="lg" asChild>
                <Link href={"/signup" as Route}>{finalCta.primary}</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href={"/signup" as Route}>{finalCta.secondary}</Link>
              </Button>
              <Button size="lg" variant="ghost" asChild>
                <Link className="text-white hover:bg-white/10 hover:text-white" href={"/plateforme" as Route}>
                  {finalCta.tertiary}
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </>
  );
}
