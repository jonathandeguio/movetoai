import type { Route } from "next";
import Link from "next/link";

import type { MarketingSiteContent } from "@/lib/marketing-site";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHero } from "@/components/marketing/page-hero";

type UseCasesPageProps = {
  content: MarketingSiteContent;
};

const useCases = [
  {
    title: "Amelioration des processus",
    businessContext:
      "Directions operations, qualite ou transformation qui veulent des gains concrets.",
    targetedProcesses: ["Qualite", "Support operationnel", "Workflows documentaires"],
    transformationLogic:
      "Repartir des irritants et cadrer les usages IA utiles.",
    expectedValue: "Priorites plus claires et execution mieux suivie.",
    moveToAiRole: "Aide a choisir les processus a plus fort impact.",
    platformRole: "Pilote portefeuille, workflows, actions et valeur."
  },
  {
    title: "Gouvernance de portefeuille IA",
    businessContext:
      "Organisations qui veulent sortir d'initiatives dispersees.",
    targetedProcesses: ["Qualification", "Arbitrage", "Decision"],
    transformationLogic:
      "Relier chaque opportunite a un processus, un owner, un statut et une logique de valeur.",
    expectedValue: "Arbitrages plus solides, execution plus disciplinee.",
    moveToAiRole: "Pose la methode commune de priorisation.",
    platformRole: "Fait vivre le portefeuille dans l'operationnel."
  }
];

export function UseCasesPage({ content }: UseCasesPageProps) {
  return (
    <>
      <PageHero
        eyebrow="Cas d'usage"
        title="Des cas d'usage relies a des processus et a des resultats"
        subtitle="Le diagnostic se realise dans la plateforme, guide par un LLM. Chaque cas d'usage part d'un processus cible, d'une logique de transformation et d'une valeur attendue."
      />

      <section className="page-shell py-10">
        <div className="grid gap-6">
          {useCases.map((item) => (
            <Card key={item.title}>
              <CardHeader className="space-y-4">
                <Badge>{item.title}</Badge>
                <CardTitle className="text-2xl">{item.businessContext}</CardTitle>
                <CardDescription className="text-base leading-8">
                  {item.transformationLogic}
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
                <div className="space-y-3">
                  <p className="text-sm font-semibold text-slate-950">Processus cibles</p>
                  <div className="flex flex-wrap gap-2">
                    {item.targetedProcesses.map((process) => (
                      <span
                        key={process}
                        className="rounded-full border border-primary/10 bg-primary/5 px-3 py-1.5 text-xs font-medium text-primary-deep"
                      >
                        {process}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="rounded-3xl border border-border/70 p-5">
                    <p className="text-sm font-semibold text-slate-950">Valeur attendue</p>
                    <p className="mt-2 text-sm leading-7 text-slate-600">{item.expectedValue}</p>
                  </div>
                  <div className="rounded-3xl border border-primary/10 bg-primary/5 p-5">
                    <p className="text-sm font-semibold text-primary-deep">Role de Move to AI</p>
                    <p className="mt-2 text-sm leading-7 text-slate-700">{item.moveToAiRole}</p>
                  </div>
                  <div className="rounded-3xl border border-slate-200 bg-slate-950 p-5 text-white">
                    <p className="text-sm font-semibold text-slate-100">Role de la plateforme</p>
                    <p className="mt-2 text-sm leading-7 text-slate-200">{item.platformRole}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="page-shell py-10">
        <Card className="overflow-hidden border-primary/10 bg-white shadow-soft">
          <CardContent className="grid gap-8 p-8 lg:grid-cols-[1fr_auto] lg:items-center">
            <div className="space-y-4">
              <Badge>{content.shared.programLabel}</Badge>
              <h2 className="text-3xl font-semibold tracking-tight text-slate-950">
                Le point d'entree reste le meme: quels sont vos 5 processus prioritaires ?
              </h2>
              <p className="max-w-3xl text-base leading-8 text-slate-600">
                C'est a partir de cette clarification que Move to AI cadre les cas d'usage et que la plateforme devient utile comme systeme de pilotage.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
              <Button size="lg" asChild>
                <Link href={"/signup" as Route}>{content.shared.primaryCta}</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href={"/exemples" as Route}>Voir des exemples</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </>
  );
}
