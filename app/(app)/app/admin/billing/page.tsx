import { redirect } from "next/navigation";
import { CreditCard, Zap, CheckCircle2, Lock } from "lucide-react";

import { getCurrentWorkspaceContext } from "@/server/auth";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

const PLANS = [
  {
    id: "free",
    name: "Free",
    price: "0€",
    period: "/mois",
    description: "Pour démarrer et explorer la plateforme.",
    features: [
      "1 workspace",
      "5 membres",
      "15 processus",
      "30 opportunités IA",
      "30 requêtes IA/mois"
    ],
    cta: "Plan actuel",
    current: true,
    highlight: false
  },
  {
    id: "pro",
    name: "Pro",
    price: "79€",
    period: "/mois",
    description: "Pour les équipes qui passent à l'échelle.",
    features: [
      "Membres illimités",
      "Processus illimités",
      "Scoring avancé & gouvernance",
      "Export PDF & rapports",
      "Analytics ROI complets",
      "Support prioritaire"
    ],
    cta: "Passer au Pro",
    current: false,
    highlight: true
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: "Sur mesure",
    period: "",
    description: "Pour les grands groupes et déploiements multi-BU.",
    features: [
      "SSO / SCIM",
      "Audit complet",
      "API & intégrations avancées",
      "Multi-workspace",
      "SLA & support dédié",
      "Facturation personnalisée"
    ],
    cta: "Contacter les ventes",
    current: false,
    highlight: false
  }
];

export default async function AdminBillingPage() {
  const { workspace, tenant, subscriptionPlan } = await getCurrentWorkspaceContext({ requireMembership: true });
  if (!workspace?.id) redirect("/onboarding");

  const planName = subscriptionPlan?.name ?? "FREE";

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-[--text-primary]">Abonnement & facturation</h1>
        <p className="mt-1 text-sm text-[--text-muted]">
          Gérez votre plan pour {workspace.name}.
        </p>
      </div>

      {/* Current plan summary */}
      <div className="rounded-2xl border border-[--blue-border] bg-[--blue-dim] p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm text-[--blue] font-medium">Plan actuel</p>
            <p className="mt-1 text-2xl font-bold text-[--text-primary]">{planName}</p>
            <p className="mt-0.5 text-sm text-[--text-muted]">
              Accès Free — jusqu'à 5 membres et 15 processus.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-[--blue]" />
            <span className="text-sm text-[--text-secondary]">Aucune carte enregistrée</span>
          </div>
        </div>
      </div>

      {/* Plan comparison */}
      <div className="grid gap-4 lg:grid-cols-3">
        {PLANS.map((plan) => (
          <div
            key={plan.id}
            className={`relative rounded-2xl border p-6 shadow-sm ${
              plan.highlight
                ? "border-[--blue-border] bg-[--blue-dim]"
                : plan.current
                ? "border-[--green-border] bg-[--green-dim]"
                : "border-[--border] bg-[--bg-card]"
            }`}
          >
            {plan.highlight && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[--blue] px-3 py-0.5 text-xs font-semibold text-[--on-green]">
                Recommandé
              </div>
            )}
            {plan.current && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[--green] px-3 py-0.5 text-xs font-semibold text-[--on-green]">
                Plan actuel
              </div>
            )}
            <div className="mb-4">
              <h3 className="font-bold text-[--text-primary]">{plan.name}</h3>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-3xl font-bold text-[--text-primary]">{plan.price}</span>
                <span className="text-sm text-[--text-muted]">{plan.period}</span>
              </div>
              <p className="mt-1 text-xs text-[--text-muted]">{plan.description}</p>
            </div>
            <ul className="mb-5 space-y-2">
              {plan.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-[--text-secondary]">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[--green]" />
                  {f}
                </li>
              ))}
            </ul>
            <Button
              className={`w-full ${
                plan.current
                  ? "border-[--green-border] bg-[--bg-card] text-[--green] hover:bg-[--green-dim]"
                  : plan.highlight
                  ? "bg-[--blue] text-[--on-green]"
                  : "bg-[--bg-hover] text-[--text-secondary]"
              }`}
              variant={plan.current ? "outline" : "default"}
              disabled={plan.current}
              size="sm"
            >
              {plan.current && <CheckCircle2 className="mr-1.5 h-4 w-4" />}
              {!plan.highlight && !plan.current && <Lock className="mr-1.5 h-3.5 w-3.5" />}
              {plan.highlight && <Zap className="mr-1.5 h-4 w-4" />}
              {plan.cta}
            </Button>
          </div>
        ))}
      </div>

      <p className="text-xs text-[--text-muted]">
        Les upgrades sont immédiats. Vous pouvez annuler à tout moment depuis cette page.
        Pour la facturation annuelle (2 mois offerts), contactez{" "}
        <a href="mailto:sales@move-to-ai.com" className="text-[--blue] hover:underline">
          sales@move-to-ai.com
        </a>.
      </p>
    </div>
  );
}
