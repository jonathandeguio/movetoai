import { redirect } from "next/navigation";
import Link from "next/link";
import {
  ArrowRight,
  Award,
  Check,
  Gift,
  Lock,
  Star,
  TrendingUp,
  Users,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentWorkspaceContext } from "@/server/auth";
import type { ConsultantRecommendationResult } from "@/lib/claude-consultant";

export const dynamic = "force-dynamic";

const TIERS = [
  {
    id: "explorer",
    name: "Explorer",
    icon: Star,
    color: "text-[--text-secondary]",
    bgClass: "bg-[--bg-hover] border-[--border]",
    requirements: ["Certification Explorer complétée", "1+ client actif sur Move to AI"],
    benefits: [
      "Badge partenaire Explorer",
      "Accès à la bibliothèque de templates",
      "Support email prioritaire",
      "Accès à l'Academy complète",
    ],
    commission: "0%",
    price: "Gratuit",
  },
  {
    id: "certified",
    name: "Certified Partner",
    icon: Award,
    color: "text-[--amber]",
    bgClass: "bg-[--amber-dim] border-[--amber-border]",
    requirements: [
      "Certification Certified complétée",
      "3+ clients actifs",
      "LinkedIn partenaire vérifié",
    ],
    benefits: [
      "Badge Certified Partner",
      "15% de commission sur les conversions clients",
      "Listing dans l'annuaire partenaires Move to AI",
      "Co-marketing et études de cas",
      "Support téléphonique dédié",
    ],
    commission: "15%",
    price: "Sur candidature",
  },
  {
    id: "expert",
    name: "Expert Partner",
    icon: Award,
    color: "text-[--purple]",
    bgClass: "bg-[--purple-dim] border-[--purple-border]",
    requirements: [
      "Certification Expert complétée",
      "10+ clients actifs ou 50k€ de CA généré",
      "Revu et approuvé par Move to AI",
    ],
    benefits: [
      "Badge Expert Partner",
      "25% de commission sur les conversions",
      "Accès aux bêtas produits en avant-première",
      "Co-vente avec l'équipe Move to AI",
      "Account manager dédié",
      "Co-branding et matériaux de vente personnalisés",
    ],
    commission: "25%",
    price: "Sur invitation",
  },
];

const MOCK_COMMISSIONS = [
  { client: "RetailPlus", plan: "Pro", amount: 180, date: "Mars 2026", status: "paid" },
  { client: "Acme Corp", plan: "Enterprise", amount: 750, date: "Mars 2026", status: "pending" },
  { client: "FinServ SA", plan: "Pro", amount: 180, date: "Fév. 2026", status: "paid" },
];

export default async function PartnerPage() {
  const { user, workspace } = await getCurrentWorkspaceContext({ requireMembership: true });
  if (!workspace?.id) redirect("/onboarding");

  const prefs = user.preferences as Record<string, unknown> | null;
  const consultantData = prefs?.consultantOnboarding as Record<string, unknown> | null;
  const recommendation = consultantData?.recommendation as ConsultantRecommendationResult | null;
  const currentTier = recommendation?.partner_tier_suggestion ?? "Explorer";

  const tierIndex = TIERS.findIndex((t) => t.id === currentTier.toLowerCase());

  const totalCommissions = MOCK_COMMISSIONS.reduce((s, c) => s + c.amount, 0);
  const paidCommissions = MOCK_COMMISSIONS.filter((c) => c.status === "paid").reduce((s, c) => s + c.amount, 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-xl font-semibold text-[--text-primary]">
          Programme Partenaire
        </h1>
        <p className="text-sm text-[--text-muted]">
          Niveau actuel : <span className="font-semibold text-[--amber]">{currentTier}</span> · Progressez pour débloquer plus de commissions et d'avantages.
        </p>
      </div>

      {/* Commission summary */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total généré", value: `${totalCommissions} €`, colorClass: "text-[--text-primary]" },
          { label: "Commissions payées", value: `${paidCommissions} €`, colorClass: "text-[--green]" },
          { label: "En attente", value: `${totalCommissions - paidCommissions} €`, colorClass: "text-[--amber]" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-[--border] bg-[--bg-card] p-4 text-center"
          >
            <p className={`text-xl font-semibold ${stat.colorClass}`}>{stat.value}</p>
            <p className="mt-0.5 text-xs text-[--text-muted]">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Tier progression */}
      <div className="space-y-4">
        <h2 className="text-base font-semibold text-[--text-primary]">
          Niveaux partenaires
        </h2>
        <div className="grid gap-4 md:grid-cols-3">
          {TIERS.map((tier, i) => {
            const TierIcon = tier.icon;
            const isActive = tier.id === currentTier.toLowerCase();
            const isUnlocked = i <= tierIndex;
            const isLocked = i > tierIndex;

            return (
              <Card
                key={tier.id}
                className={`relative border-2 shadow-soft-sm transition ${
                  isActive
                    ? "border-[--amber]"
                    : isLocked
                    ? "border-[--border] opacity-70"
                    : "border-[--border]"
                } bg-[--bg-card]`}
              >
                {isActive && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="border-[--amber-border] bg-[--amber] text-[--on-green]">
                      Niveau actuel
                    </Badge>
                  </div>
                )}
                <CardContent className="space-y-4 pt-6 p-5">
                  <div className="flex items-center gap-3">
                    <div className={`rounded-xl border p-2.5 ${tier.bgClass}`}>
                      <TierIcon className={`h-5 w-5 ${tier.color}`} />
                    </div>
                    <div>
                      <p className="font-semibold text-[--text-primary]">{tier.name}</p>
                      <p className={`text-sm font-bold ${tier.color}`}>
                        {tier.commission} commissions
                      </p>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <p className="text-xs font-semibold uppercase tracking-wide text-[--text-disabled]">
                      Prérequis
                    </p>
                    {tier.requirements.map((req) => (
                      <div key={req} className="flex items-start gap-2 text-xs text-[--text-secondary]">
                        <Check className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${isUnlocked ? "text-[--green]" : "text-[--border-strong]"}`} />
                        {req}
                      </div>
                    ))}
                  </div>

                  <div className="space-y-1.5">
                    <p className="text-xs font-semibold uppercase tracking-wide text-[--text-disabled]">
                      Avantages
                    </p>
                    {tier.benefits.map((benefit) => (
                      <div key={benefit} className="flex items-start gap-2 text-xs text-[--text-secondary]">
                        <Gift className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${isLocked ? "text-[--border-strong]" : "text-[--amber]"}`} />
                        {benefit}
                      </div>
                    ))}
                  </div>

                  <Button
                    size="sm"
                    className={`w-full ${
                      isLocked
                        ? "bg-[--bg-hover] text-[--text-muted] hover:bg-[--bg-hover]"
                        : isActive
                        ? "bg-[--amber] hover:bg-[--amber]"
                        : "bg-[--green] hover:bg-[--green]"
                    }`}
                    disabled={isLocked}
                  >
                    {isLocked ? (
                      <><Lock className="mr-2 h-3.5 w-3.5" />{tier.price}</>
                    ) : isActive ? (
                      "Niveau actuel"
                    ) : (
                      "Complété ✓"
                    )}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Commissions history */}
      <Card className="border-[--border] bg-[--bg-card] shadow-soft-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm font-semibold">
            <TrendingUp className="h-4 w-4 text-[--amber]" />
            Historique des commissions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {MOCK_COMMISSIONS.map((commission) => (
              <div
                key={`${commission.client}-${commission.date}`}
                className="flex items-center justify-between gap-3 rounded-xl border border-[--border] px-4 py-3"
              >
                <div>
                  <p className="text-sm font-medium text-[--text-primary]">
                    {commission.client}
                  </p>
                  <p className="text-xs text-[--text-disabled]">
                    Plan {commission.plan} · {commission.date}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <p className="font-semibold text-[--text-primary]">
                    {commission.amount} €
                  </p>
                  <span
                    className={`rounded-full border px-2 py-0.5 text-xs font-medium ${
                      commission.status === "paid"
                        ? "border-[--green-border] bg-[--green-dim] text-[--green]"
                        : "border-[--amber-border] bg-[--amber-dim] text-[--amber]"
                    }`}
                  >
                    {commission.status === "paid" ? "Payé" : "En attente"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
