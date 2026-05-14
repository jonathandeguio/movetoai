import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock,
  Shield,
  TrendingUp,
  Zap,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentWorkspaceContext } from "@/server/auth";
import { workspaceRepo }              from "@/lib/repositories/workspace.repo";

export const dynamic = "force-dynamic";

type IntegrationStatus = "healthy" | "degraded" | "offline";

const STATUS_CONFIG: Record<
  IntegrationStatus,
  { label: string; dotClass: string; badgeClass: string }
> = {
  healthy: {
    label: "Opérationnel",
    dotClass: "bg-[--green]",
    badgeClass: "bg-[--green-dim] text-[--green] border-[--green-border]",
  },
  degraded: {
    label: "Dégradé",
    dotClass: "bg-[--amber]",
    badgeClass: "bg-[--amber-dim] text-[--amber] border-[--amber-border]",
  },
  offline: {
    label: "Hors ligne",
    dotClass: "bg-[--red]",
    badgeClass: "bg-[--red-dim] text-[--red] border-[--red-dim]",
  },
};

// Placeholder integration statuses — replace with real API health checks
const MOCK_INTEGRATIONS: Array<{
  name: string;
  type: string;
  status: IntegrationStatus;
  latency: string;
  lastSync: string;
}> = [
  { name: "Move to AI API", type: "Platform", status: "healthy", latency: "42 ms", lastSync: "Il y a 2 min" },
  { name: "Webhook sortant", type: "Events", status: "healthy", latency: "120 ms", lastSync: "Il y a 5 min" },
  { name: "Connecteur ERP", type: "ERP", status: "degraded", latency: "980 ms", lastSync: "Il y a 18 min" },
  { name: "Export BI", type: "BI / Data", status: "healthy", latency: "65 ms", lastSync: "Il y a 1 h" },
];

const MOCK_ALERTS = [
  {
    id: "1",
    severity: "warning" as const,
    title: "Latence élevée sur le connecteur ERP",
    description: "Le connecteur ERP dépasse le seuil de 500 ms depuis 20 minutes.",
    time: "Il y a 20 min",
  },
  {
    id: "2",
    severity: "info" as const,
    title: "Renouvellement de certificat SSL dans 30 jours",
    description: "Le certificat SSL de l'API Move to AI expire le 6 mai 2026.",
    time: "Aujourd'hui",
  },
];

const ALERT_CONFIG = {
  warning: {
    className: "border-[--amber-border] bg-[--amber-dim]",
    icon: AlertTriangle,
    iconClass: "text-[--amber]",
  },
  info: {
    className: "border-[--blue-border] bg-[--blue-dim]",
    icon: Activity,
    iconClass: "text-[--blue]",
  },
};

export default async function TechDashboardPage() {
  const { user, workspace } = await getCurrentWorkspaceContext({ requireMembership: true });
  if (!workspace?.id) redirect("/onboarding");

  const prefs = user.preferences as Record<string, unknown> | null;
  const itOnboarding = prefs?.itOnboarding as Record<string, unknown> | null;
  const itTitle = typeof itOnboarding?.itTitle === "string" ? itOnboarding.itTitle : "DSI";
  const selectedSystems = Array.isArray(itOnboarding?.selectedSystems)
    ? (itOnboarding.selectedSystems as string[])
    : [];
  const mainConstraint =
    typeof itOnboarding?.mainConstraint === "string" ? itOnboarding.mainConstraint : null;

  // Gather workspace metrics
  const memberCount = await workspaceRepo.countActiveMembers(workspace.id);

  const healthyCount = MOCK_INTEGRATIONS.filter((i) => i.status === "healthy").length;
  const healthPct = Math.round((healthyCount / MOCK_INTEGRATIONS.length) * 100);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <Badge className="border-[--blue-border] bg-[--blue-dim] text-[--blue]">
            {itTitle}
          </Badge>
          <Badge variant="outline" className="text-xs">
            {workspace.name}
          </Badge>
        </div>
        <h1 className="text-2xl font-semibold tracking-tight text-[--text-primary]">
          Dashboard technique
        </h1>
        <p className="text-sm text-[--text-muted]">
          Vue centralisée de vos intégrations, sécurité et gouvernance IA.
          {selectedSystems.length > 0 && (
            <> Systèmes surveillés : <span className="font-medium text-[--text-secondary]">{selectedSystems.slice(0, 3).join(", ")}{selectedSystems.length > 3 ? ` +${selectedSystems.length - 3}` : ""}</span>.</>
          )}
        </p>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          {
            label: "Intégrations actives",
            value: `${healthyCount}/${MOCK_INTEGRATIONS.length}`,
            icon: Activity,
            colorClass: "text-[--blue]",
          },
          {
            label: "Santé globale",
            value: `${healthPct}%`,
            icon: TrendingUp,
            colorClass: healthPct >= 80 ? "text-[--green]" : "text-[--amber]",
          },
          {
            label: "Alertes actives",
            value: MOCK_ALERTS.length,
            icon: AlertTriangle,
            colorClass: MOCK_ALERTS.length > 0 ? "text-[--amber]" : "text-[--green]",
          },
          {
            label: "Membres IT",
            value: memberCount,
            icon: CheckCircle2,
            colorClass: "text-[--blue]",
          },
        ].map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div
              key={kpi.label}
              className="flex flex-col items-start gap-2 rounded-2xl border border-[--border] bg-[--bg-card] p-4"
            >
              <Icon className={`h-5 w-5 ${kpi.colorClass}`} />
              <p className={`text-2xl font-semibold ${kpi.colorClass}`}>{kpi.value}</p>
              <p className="text-xs text-[--text-muted]">{kpi.label}</p>
            </div>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* API Health */}
        <Card className="border-[--border] bg-[--bg-card] shadow-soft-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
              <Activity className="h-4 w-4 text-[--blue]" />
              Statut des intégrations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {MOCK_INTEGRATIONS.map((integration) => {
              const config = STATUS_CONFIG[integration.status];
              return (
                <div
                  key={integration.name}
                  className="flex items-center justify-between gap-3 rounded-xl border border-[--border] px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <span className={`h-2 w-2 rounded-full ${config.dotClass}`} />
                    <div>
                      <p className="text-sm font-medium text-[--text-primary]">
                        {integration.name}
                      </p>
                      <p className="text-xs text-[--text-disabled]">
                        {integration.type} · {integration.latency}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="hidden text-xs text-[--text-disabled] sm:block">
                      {integration.lastSync}
                    </span>
                    <span
                      className={`rounded-full border px-2 py-0.5 text-xs font-medium ${config.badgeClass}`}
                    >
                      {config.label}
                    </span>
                  </div>
                </div>
              );
            })}
            <Button asChild variant="ghost" size="sm" className="w-full text-[--blue] hover:text-[--blue]">
              <Link href="/app/dashboard/tech/integrations">
                Gérer les intégrations <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Security Alerts */}
        <Card className="border-[--border] bg-[--bg-card] shadow-soft-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
              <Shield className="h-4 w-4 text-[--blue]" />
              Alertes de sécurité
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {MOCK_ALERTS.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-6 text-center">
                <CheckCircle2 className="h-8 w-8 text-[--green]" />
                <p className="text-sm text-[--text-muted]">Aucune alerte active</p>
              </div>
            ) : (
              MOCK_ALERTS.map((alert) => {
                const config = ALERT_CONFIG[alert.severity];
                const Icon = config.icon;
                return (
                  <div
                    key={alert.id}
                    className={`flex items-start gap-3 rounded-xl border p-4 ${config.className}`}
                  >
                    <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${config.iconClass}`} />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-[--text-primary]">
                        {alert.title}
                      </p>
                      <p className="mt-0.5 text-xs text-[--text-secondary]">
                        {alert.description}
                      </p>
                      <p className="mt-1 flex items-center gap-1 text-xs text-[--text-disabled]">
                        <Clock className="h-3 w-3" />
                        {alert.time}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
            <Button asChild variant="ghost" size="sm" className="w-full text-[--blue] hover:text-[--blue]">
              <Link href="/app/dashboard/tech/security">
                Sécurité & RGPD <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Quick actions */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          {
            href: "/app/dashboard/tech/architecture",
            label: "Voir ma roadmap",
            description: "Roadmap d'intégration IA générée lors de l'onboarding",
            icon: Zap,
            colorClass: "text-[--blue]",
            bgClass: "bg-[--blue-dim]",
          },
          {
            href: "/app/dashboard/tech/security",
            label: "Conformité RGPD",
            description: "Vérifier le statut de conformité des traitements",
            icon: Shield,
            colorClass: "text-[--blue]",
            bgClass: "bg-[--blue-dim]",
          },
          {
            href: "/app/dashboard/tech/logs",
            label: "Journaux d'activité",
            description: "Audit des actions et appels API dans le workspace",
            icon: Activity,
            colorClass: "text-[--purple]",
            bgClass: "bg-[--purple-dim]",
          },
        ].map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.href}
              href={action.href}
              className="group flex items-start gap-4 rounded-2xl border border-[--border] bg-[--bg-card] p-5 transition hover:border-[--blue-border] hover:shadow-soft-sm"
            >
              <span className={`rounded-xl p-2.5 ${action.bgClass}`}>
                <Icon className={`h-5 w-5 ${action.colorClass}`} />
              </span>
              <div className="flex-1">
                <p className="font-semibold text-[--text-primary] group-hover:text-[--blue]">
                  {action.label}
                </p>
                <p className="mt-0.5 text-xs leading-5 text-[--text-muted]">
                  {action.description}
                </p>
              </div>
              <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-[--text-disabled] transition group-hover:text-[--blue]" />
            </Link>
          );
        })}
      </div>

      {/* Constraint banner */}
      {mainConstraint && (
        <div className="flex items-start gap-3 rounded-2xl border border-[--blue-border] bg-[--blue-dim] p-5">
          <Shield className="mt-0.5 h-5 w-5 shrink-0 text-[--blue]" />
          <div>
            <p className="text-sm font-semibold text-[--blue]">
              Contrainte prioritaire identifiée lors de l'onboarding
            </p>
            <p className="mt-0.5 text-sm text-[--blue]">{mainConstraint}</p>
            <Link
              href="/app/dashboard/tech/architecture"
              className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-[--blue] underline-offset-2 hover:underline"
            >
              Voir la roadmap adaptée <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
