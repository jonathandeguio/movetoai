import { redirect } from "next/navigation";
import Link from "next/link";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  FileText,
  Lock,
  Shield,
  XCircle,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentWorkspaceContext } from "@/server/auth";

export const dynamic = "force-dynamic";

type ComplianceStatus = "ok" | "warning" | "error" | "pending";

const COMPLIANCE_CONFIG: Record<
  ComplianceStatus,
  { label: string; icon: React.ElementType; className: string }
> = {
  ok: {
    label: "Conforme",
    icon: CheckCircle2,
    className: "text-[--green] bg-[--green-dim] border-[--green-border]",
  },
  warning: {
    label: "À surveiller",
    icon: AlertTriangle,
    className: "text-[--amber] bg-[--amber-dim] border-[--amber-border]",
  },
  error: {
    label: "Non conforme",
    icon: XCircle,
    className: "text-[--red] bg-[--red-dim] border-[--red-dim]",
  },
  pending: {
    label: "En attente",
    icon: Clock,
    className: "text-[--blue] bg-[--blue-dim] border-[--blue-border]",
  },
};

const COMPLIANCE_ITEMS = [
  {
    id: "data-mapping",
    title: "Registre des traitements IA",
    description: "Cartographie des données personnelles traitées par les modèles IA",
    status: "ok" as ComplianceStatus,
    lastReview: "15 mars 2026",
    responsible: "DPO",
  },
  {
    id: "consent",
    title: "Mécanismes de consentement",
    description: "Recueil et traçabilité du consentement des utilisateurs concernés",
    status: "warning" as ComplianceStatus,
    lastReview: "28 févr. 2026",
    responsible: "DPO + Juridique",
  },
  {
    id: "data-transfer",
    title: "Transferts de données hors UE",
    description: "Validation des clauses contractuelles types (CCT) avec les fournisseurs IA",
    status: "ok" as ComplianceStatus,
    lastReview: "1 mars 2026",
    responsible: "Juridique",
  },
  {
    id: "incident-plan",
    title: "Plan de réponse aux incidents",
    description: "Procédures de notification CNIL et communication en cas de violation",
    status: "pending" as ComplianceStatus,
    lastReview: "À finaliser",
    responsible: "RSSI + DPO",
  },
  {
    id: "ai-act",
    title: "Conformité AI Act (UE 2024/1689)",
    description: "Classification des systèmes IA par niveau de risque et obligations associées",
    status: "pending" as ComplianceStatus,
    lastReview: "Échéance : août 2026",
    responsible: "Juridique + DSI",
  },
  {
    id: "ssl-cert",
    title: "Certificats SSL / TLS",
    description: "Validité des certificats des endpoints API et des webhooks",
    status: "warning" as ComplianceStatus,
    lastReview: "Expire le 6 mai 2026",
    responsible: "Équipe IT",
  },
];

const AI_TREATMENTS = [
  {
    name: "Recommandation de processus",
    model: "Claude Sonnet (Anthropic)",
    dataType: "Données fonctionnelles anonymisées",
    dataLocation: "EU (Ireland)",
    legalBasis: "Intérêt légitime",
    retention: "90 jours",
    status: "ok" as ComplianceStatus,
  },
  {
    name: "Roadmap d'intégration IT",
    model: "Claude Sonnet (Anthropic)",
    dataType: "Stack technique — aucune donnée personnelle",
    dataLocation: "EU (Ireland)",
    legalBasis: "Contrat",
    retention: "12 mois",
    status: "ok" as ComplianceStatus,
  },
];

export default async function SecurityPage() {
  const { user, workspace } = await getCurrentWorkspaceContext({ requireMembership: true });
  if (!workspace?.id) redirect("/onboarding");

  const prefs = user.preferences as Record<string, unknown> | null;
  const itOnboarding = prefs?.itOnboarding as Record<string, unknown> | null;
  const mainConstraint =
    typeof itOnboarding?.mainConstraint === "string" ? itOnboarding.mainConstraint : null;
  const isRGPDPriority = mainConstraint?.toLowerCase().includes("rgpd");

  const okCount = COMPLIANCE_ITEMS.filter((i) => i.status === "ok").length;
  const warningCount = COMPLIANCE_ITEMS.filter((i) => i.status === "warning").length;
  const pendingCount = COMPLIANCE_ITEMS.filter((i) => i.status === "pending").length;
  const score = Math.round((okCount / COMPLIANCE_ITEMS.length) * 100);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-xl font-semibold text-[--text-primary]">
          RGPD & Sécurité
        </h1>
        <p className="text-sm text-[--text-muted]">
          Statut de conformité des traitements IA de votre workspace.
        </p>
      </div>

      {/* RGPD priority banner */}
      {isRGPDPriority && (
        <div className="flex items-start gap-3 rounded-2xl border border-[--blue-border] bg-[--blue-dim] p-5">
          <Shield className="mt-0.5 h-5 w-5 shrink-0 text-[--blue]" />
          <div>
            <p className="text-sm font-semibold text-[--blue]">
              Contrainte RGPD identifiée comme prioritaire lors de votre onboarding
            </p>
            <p className="mt-0.5 text-sm text-[--blue]">
              Ce dashboard est personnalisé pour vous aider à suivre la conformité de vos traitements IA.
            </p>
          </div>
        </div>
      )}

      {/* Score strip */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: "Score conformité", value: `${score}%`, colorClass: score >= 70 ? "text-[--green]" : "text-[--amber]" },
          { label: "Conformes", value: okCount, colorClass: "text-[--green]" },
          { label: "À surveiller", value: warningCount, colorClass: "text-[--amber]" },
          { label: "En attente", value: pendingCount, colorClass: "text-[--blue]" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-[--border] bg-[--bg-card] p-4 text-center"
          >
            <p className={`text-2xl font-semibold ${stat.colorClass}`}>{stat.value}</p>
            <p className="mt-0.5 text-xs text-[--text-muted]">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Compliance checklist */}
      <Card className="border-[--border] bg-[--bg-card] shadow-soft-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm font-semibold">
            <Shield className="h-4 w-4 text-[--blue]" />
            Checklist de conformité RGPD
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {COMPLIANCE_ITEMS.map((item) => {
            const config = COMPLIANCE_CONFIG[item.status];
            const Icon = config.icon;
            return (
              <div
                key={item.id}
                className="flex items-start gap-4 rounded-xl border border-[--border] p-4"
              >
                <span
                  className={`mt-0.5 rounded-full border p-1.5 ${config.className}`}
                >
                  <Icon className="h-4 w-4" />
                </span>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-[--text-primary]">
                      {item.title}
                    </p>
                    <span
                      className={`rounded-full border px-2 py-0.5 text-xs font-medium ${config.className}`}
                    >
                      {config.label}
                    </span>
                  </div>
                  <p className="text-xs leading-5 text-[--text-muted]">
                    {item.description}
                  </p>
                  <div className="flex gap-4 text-xs text-[--text-disabled]">
                    <span>Dernière révision : {item.lastReview}</span>
                    <span>Responsable : {item.responsible}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* AI Treatments registry */}
      <Card className="border-[--border] bg-[--bg-card] shadow-soft-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm font-semibold">
            <FileText className="h-4 w-4 text-[--purple]" />
            Registre des traitements IA
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[--border] text-left">
                  {[
                    "Traitement",
                    "Modèle IA",
                    "Données",
                    "Localisation",
                    "Base légale",
                    "Rétention",
                    "Statut",
                  ].map((h) => (
                    <th
                      key={h}
                      className="pb-3 pr-4 text-xs font-semibold uppercase tracking-wide text-[--text-disabled]"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[--border-subtle]">
                {AI_TREATMENTS.map((treatment) => {
                  const config = COMPLIANCE_CONFIG[treatment.status];
                  const Icon = config.icon;
                  return (
                    <tr key={treatment.name} className="text-xs">
                      <td className="py-3 pr-4 font-medium text-[--text-primary]">
                        {treatment.name}
                      </td>
                      <td className="py-3 pr-4 text-[--text-muted]">{treatment.model}</td>
                      <td className="py-3 pr-4 text-[--text-muted]">{treatment.dataType}</td>
                      <td className="py-3 pr-4 text-[--text-muted]">{treatment.dataLocation}</td>
                      <td className="py-3 pr-4 text-[--text-muted]">{treatment.legalBasis}</td>
                      <td className="py-3 pr-4 text-[--text-muted]">{treatment.retention}</td>
                      <td className="py-3">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 font-medium ${config.className}`}
                        >
                          <Icon className="h-3 w-3" />
                          {config.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Quick actions */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <Button asChild size="lg" className="flex-1 bg-[--blue] hover:bg-[--blue]">
          <Link href="/app/dashboard/tech/logs">
            <Lock className="mr-2 h-4 w-4" />
            Journaux d'audit
          </Link>
        </Button>
        <Button asChild variant="outline" size="lg" className="flex-1">
          <Link href="/app/dashboard/tech/architecture">
            Voir la roadmap RGPD →
          </Link>
        </Button>
      </div>
    </div>
  );
}
