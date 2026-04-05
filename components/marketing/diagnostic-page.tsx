import type { MarketingSiteContent } from "@/lib/marketing-site";
import { RequestDemoForm } from "@/components/auth/request-demo-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHero } from "@/components/marketing/page-hero";

type DiagnosticPageProps = {
  content: MarketingSiteContent;
};

export function DiagnosticPage({ content }: DiagnosticPageProps) {
  const promise = [
    "Lecture executive de votre point de depart",
    "Processus prioritaires et opportunites IA claires"
  ];

  const analyzed = [
    "Processus metier prioritaires",
    "Irritants et points de friction"
  ];

  const deliverables = ["Top 5 processus cibles", "Premiere priorisation actionnable"];

  return (
    <>
      <PageHero
        eyebrow="Move to AI"
        title="Identifiez les 5 processus a transformer en priorite"
        subtitle="Le diagnostic se realise dans la plateforme, guide par un LLM. En vous inscrivant, vous lancez directement ce diagnostic."
      />

      <section className="page-shell grid gap-6 py-10 lg:grid-cols-3">
        {promise.map((item) => (
          <Card key={item} className="border-primary/10 bg-primary/5">
            <CardContent className="p-6 text-sm leading-7 text-slate-700">{item}</CardContent>
          </Card>
        ))}
      </section>

      <section className="page-shell grid gap-10 py-10 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <Badge>Ce qui est analyse</Badge>
            </CardHeader>
            <CardContent className="space-y-3">
              {analyzed.map((item) => (
                <div key={item} className="rounded-2xl border border-border/70 px-4 py-3 text-sm text-slate-700">
                  {item}
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Badge>Ce que vous obtenez</Badge>
            </CardHeader>
            <CardContent className="space-y-3">
              {deliverables.map((item) => (
                <div key={item} className="rounded-2xl border border-primary/10 bg-primary/5 px-4 py-3 text-sm text-primary-deep">
                  {item}
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-primary/10 bg-primary/5">
            <CardHeader>
              <Badge>LLM copilote de diagnostic</Badge>
              <CardTitle>Un assistant structure l'analyse</CardTitle>
              <CardDescription className="text-sm leading-7">
                Le LLM aide a explorer les processus, qualifier les irritants, identifier les opportunites et proposer une priorisation actionnable.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        <Card id="diagnostic-form" className="border-primary/10 shadow-soft">
          <CardHeader>
            <Badge>{content.shared.programLabel}</Badge>
            <CardTitle>{content.shared.primaryCta}</CardTitle>
            <CardDescription className="text-base leading-8">
              Nous revenons vers vous avec un cadrage de premier niveau pour organiser le diagnostic et identifier les parties prenantes a mobiliser.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-6 flex flex-col gap-3 sm:flex-row">
              <Button asChild>
                <a href="/signup">Lancer le diagnostic</a>
              </Button>
              <Button variant="outline" asChild>
                <a href="#diagnostic-form">Demander une demo</a>
              </Button>
            </div>
            <RequestDemoForm />
          </CardContent>
        </Card>
      </section>
    </>
  );
}
