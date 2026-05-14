import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock,
  Plus,
  RefreshCw,
  XCircle,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentWorkspaceContext } from "@/server/auth";

export const dynamic = "force-dynamic";

type IntegrationStatus = "healthy" | "degraded" | "offline";

const STATUS_CONFIG: Record<
  IntegrationStatus,
  { label: string; icon: React.ElementType; dotClass: string; badgeClass: string }
> = {
  healthy: {
    label: "Opérationnel",
    icon: CheckCircle2,
    dotClass: "bg-[--green]",
    badgeClass: "bg-[--green-dim] text-[--green] border-[--green-border]",
  },
  degraded: {
    label: "Dégradé",
    icon: AlertTriangle,
    dotClass: "bg-[--amber]",
    badgeClass: "bg-[--amber-dim] text-[--amber] border-[--amber-border]",
  },
  offline: {
    label: "Hors ligne",
    icon: XCircle,
    dotClass: "bg-[--red]",
    badgeClass: "bg-[--red-dim] text-[--red] border-[--red-dim]",
  },
};

const INTEGRATIONS = [
  {
    id: "mta-api",
    name: "Move to AI REST API",
    type: "Platform",
    description: "API principale de la plateforme — lecture/écriture des processus et opportunités",
    status: "healthy" as IntegrationStatus,
    latency: "42 ms",
    lastSync: "Il y a 2 min",
    uptime: "99.98%",
    authType: "API Key",
  },
  {
    id: "webhook-out",
    name: "Webhook sortant — Événements workspace",
    type: "Events",
    description: "Notification des changements de statut des opportunités vers votre SIRH / ERP",
    status: "healthy" as IntegrationStatus,
    latency: "120 ms",
    lastSync: "Il y a 5 min",
    uptime: "99.80%",
    authType: "HMAC SHA-256",
  },
  {
    id: "erp-connector",
    name: "Connecteur ERP",
    type: "ERP",
    description: "Synchronisation des processus métier depuis votre ERP vers Move to AI",
    status: "degraded" as IntegrationStatus,
    latency: "980 ms",
    lastSync: "Il y a 18 min",
    uptime: "97.20%",
    authType: "OAuth 2.0",
  },
  {
    id: "bi-export",
    name: "Export BI — Power BI / Tableau",
    type: "BI / Data",
    description: "Export automatisé des KPIs IA vers votre outil de BI favori",
    status: "healthy" as IntegrationStatus,
    latency: "65 ms",
    lastSync: "Il y a 1 h",
    uptime: "99.50%",
    authType: "Service Account",
  },
];

export default async function IntegrationsPage() {
  const { workspace } = await getCurrentWorkspaceContext({ requireMembership: true });
  if (!workspace?.id) redirect("/onboarding");

  const healthyCount = INTEGRATIONS.filter((i) => i.status === "healthy").length;
  const degradedCount = INTEGRATIONS.filter((i) => i.status === "degraded").length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-xl font-semibold text-[--text-primary]">
            Gestion des intégrations
          </h1>
          <p className="text-sm text-[--text-muted]">
            {healthyCount} opérationnel{healthyCount !== 1 ? "s" : ""}
            {degradedCount > 0 && ` · ${degradedCount} dégradé${degradedCount !== 1 ? "s" : ""}`}
          </p>
        </div>
        <Button className="bg-[--blue] hover:bg-[--blue]" size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Ajouter un connecteur
        </Button>
      </div>

      {/* Summary strip */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Opérationnels", value: healthyCount, colorClass: "text-[--green]" },
          { label: "Dégradés", value: degradedCount, colorClass: "text-[--amber]" },
          {
            label: "Hors ligne",
            value: INTEGRATIONS.filter((i) => i.status === "offline").length,
            colorClass: "text-[--red]",
          },
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

      {/* Integration list */}
      <div className="space-y-4">
        {INTEGRATIONS.map((integration) => {
          const config = STATUS_CONFIG[integration.status];
          const StatusIcon = config.icon;
          return (
            <Card key={integration.id} className="border-[--border] bg-[--bg-card] shadow-soft-sm">
              <CardContent className="p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                  <div className="flex-1 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold text-[--text-primary]">
                        {integration.name}
                      </h3>
                      <Badge variant="outline" className="text-xs">
                        {integration.type}
                      </Badge>
                      <span
                        className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${config.badgeClass}`}
                      >
                        <span className={`h-1.5 w-1.5 rounded-full ${config.dotClass}`} />
                        {config.label}
                      </span>
                    </div>
                    <p className="text-sm text-[--text-muted]">
                      {integration.description}
                    </p>
                    <div className="flex flex-wrap gap-4 text-xs text-[--text-disabled]">
                      <span className="flex items-center gap-1">
                        <Activity className="h-3.5 w-3.5" />
                        Latence : {integration.latency}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        Dernière synchro : {integration.lastSync}
                      </span>
                      <span className="flex items-center gap-1">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Uptime : {integration.uptime}
                      </span>
                      <span>Auth : {integration.authType}</span>
                    </div>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <Button variant="ghost" size="sm" className="text-[--text-muted] hover:text-[--text-secondary]">
                      <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
                      Tester
                    </Button>
                    <Button variant="outline" size="sm">
                      Configurer
                    </Button>
                  </div>
                </div>
                {integration.status === "degraded" && (
                  <div className="mt-4 flex items-start gap-2 rounded-xl border border-[--amber-border] bg-[--amber-dim] px-4 py-3">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[--amber]" />
                    <div>
                      <p className="text-sm font-medium text-[--amber]">
                        Performance dégradée détectée
                      </p>
                      <p className="text-xs text-[--amber]">
                        Latence supérieure au seuil de 500 ms depuis 20 minutes. Vérifiez les logs pour diagnostiquer.
                      </p>
                      <Link
                        href="/app/dashboard/tech/logs"
                        className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-[--amber] underline-offset-2 hover:underline"
                      >
                        Voir les logs <ArrowRight className="h-3 w-3" />
                      </Link>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Add connector CTA */}
      <Card className="border-dashed border-[--border] bg-[--bg-hover]">
        <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
          <div className="rounded-2xl bg-[--bg-hover] p-3">
            <Plus className="h-6 w-6 text-[--text-disabled]" />
          </div>
          <p className="text-sm font-medium text-[--text-secondary]">
            Connecter un nouveau système
          </p>
          <p className="max-w-sm text-xs text-[--text-disabled]">
            SAP, Salesforce, Power BI, Slack, Workday… Connectez vos outils métier pour
            centraliser les données IA dans Move to AI.
          </p>
          <Button className="bg-[--blue] hover:bg-[--blue]">
            <Plus className="mr-2 h-4 w-4" />
            Parcourir les connecteurs
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
