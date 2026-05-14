import { redirect } from "next/navigation";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Download,
  Filter,
  Info,
  Lock,
  User,
  Webhook,
  XCircle,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentWorkspaceContext } from "@/server/auth";

export const dynamic = "force-dynamic";

type LogLevel = "info" | "warning" | "error" | "success";

const LOG_CONFIG: Record<
  LogLevel,
  { icon: React.ElementType; className: string; dotClass: string }
> = {
  info: { icon: Info, className: "text-[--blue] bg-[--blue-dim]", dotClass: "bg-[--blue]" },
  warning: { icon: AlertTriangle, className: "text-[--amber] bg-[--amber-dim]", dotClass: "bg-[--amber]" },
  error: { icon: XCircle, className: "text-[--red] bg-[--red-dim]", dotClass: "bg-[--red]" },
  success: { icon: CheckCircle2, className: "text-[--green] bg-[--green-dim]", dotClass: "bg-[--green]" },
};

type LogCategory = "api" | "auth" | "integration" | "security";

const CATEGORY_CONFIG: Record<LogCategory, { icon: React.ElementType; label: string; className: string }> = {
  api: { icon: Activity, label: "API", className: "bg-[--blue-dim] text-[--blue] border-[--blue-border]" },
  auth: { icon: User, label: "Auth", className: "bg-[--purple-dim] text-[--purple] border-[--purple-border]" },
  integration: { icon: Webhook, label: "Intégration", className: "bg-[--blue-dim] text-[--blue] border-[--blue-border]" },
  security: { icon: Lock, label: "Sécurité", className: "bg-[--red-dim] text-[--red] border-[--red-dim]" },
};

const MOCK_LOGS: Array<{
  id: string;
  timestamp: string;
  level: LogLevel;
  category: LogCategory;
  message: string;
  actor: string;
  details?: string;
  duration?: string;
}> = [
  {
    id: "log_1",
    timestamp: "2026-04-06 14:32:07",
    level: "success",
    category: "api",
    message: "GET /api/v1/processes — 200 OK",
    actor: "API Key mta_live_••••8f2a",
    duration: "42 ms",
  },
  {
    id: "log_2",
    timestamp: "2026-04-06 14:28:15",
    level: "warning",
    category: "integration",
    message: "Connecteur ERP — latence élevée détectée",
    actor: "Système (auto-moniteur)",
    details: "Latence : 980 ms — seuil : 500 ms",
    duration: "980 ms",
  },
  {
    id: "log_3",
    timestamp: "2026-04-06 14:15:00",
    level: "success",
    category: "auth",
    message: "Connexion réussie",
    actor: "admin@entreprise.fr",
    duration: "210 ms",
  },
  {
    id: "log_4",
    timestamp: "2026-04-06 13:50:34",
    level: "info",
    category: "api",
    message: "POST /api/v1/opportunities — 201 Created",
    actor: "API Key mta_live_••••8f2a",
    duration: "88 ms",
  },
  {
    id: "log_5",
    timestamp: "2026-04-06 13:40:12",
    level: "error",
    category: "integration",
    message: "Webhook sortant — échec de livraison",
    actor: "Webhook https://erp.entreprise.fr/hook",
    details: "HTTP 503 — Retry #3/3 échoué",
    duration: "5 020 ms",
  },
  {
    id: "log_6",
    timestamp: "2026-04-06 13:10:00",
    level: "info",
    category: "security",
    message: "Renouvellement de certificat SSL planifié",
    actor: "Système",
    details: "Certificat expire le 6 mai 2026 — renouvellement auto activé",
  },
  {
    id: "log_7",
    timestamp: "2026-04-06 12:45:22",
    level: "success",
    category: "api",
    message: "GET /api/v1/workspace — 200 OK",
    actor: "API Key mta_live_••••8f2a",
    duration: "31 ms",
  },
  {
    id: "log_8",
    timestamp: "2026-04-06 12:00:00",
    level: "info",
    category: "auth",
    message: "Invitation envoyée — membre.equipe@entreprise.fr",
    actor: "admin@entreprise.fr",
  },
];

export default async function LogsPage() {
  const { workspace } = await getCurrentWorkspaceContext({ requireMembership: true });
  if (!workspace?.id) redirect("/onboarding");

  const errorCount = MOCK_LOGS.filter((l) => l.level === "error").length;
  const warningCount = MOCK_LOGS.filter((l) => l.level === "warning").length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-xl font-semibold text-[--text-primary]">
            Journaux d'activité
          </h1>
          <p className="text-sm text-[--text-muted]">
            Audit des actions, appels API et événements de sécurité du workspace.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Filter className="mr-1.5 h-3.5 w-3.5" />
            Filtrer
          </Button>
          <Button variant="outline" size="sm">
            <Download className="mr-1.5 h-3.5 w-3.5" />
            Exporter CSV
          </Button>
        </div>
      </div>

      {/* Summary strip */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "Entrées (24h)", value: MOCK_LOGS.length, colorClass: "text-[--text-secondary]" },
          { label: "Succès", value: MOCK_LOGS.filter(l => l.level === "success").length, colorClass: "text-[--green]" },
          { label: "Avertissements", value: warningCount, colorClass: "text-[--amber]" },
          { label: "Erreurs", value: errorCount, colorClass: "text-[--red]" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-[--border] bg-[--bg-card] p-3 text-center"
          >
            <p className={`text-xl font-semibold ${stat.colorClass}`}>{stat.value}</p>
            <p className="mt-0.5 text-xs text-[--text-muted]">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Log stream */}
      <Card className="border-[--border] bg-[--bg-card] shadow-soft-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm font-semibold">
            <Activity className="h-4 w-4 text-[--blue]" />
            Journaux en temps réel — dernières 24 heures
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {MOCK_LOGS.map((log) => {
            const levelConfig = LOG_CONFIG[log.level];
            const catConfig = CATEGORY_CONFIG[log.category];
            const LevelIcon = levelConfig.icon;
            return (
              <div
                key={log.id}
                className="flex items-start gap-3 rounded-xl border border-[--border-subtle] px-4 py-3 hover:bg-[--bg-hover]"
              >
                {/* Level icon */}
                <span className={`mt-0.5 rounded-lg p-1.5 ${levelConfig.className}`}>
                  <LevelIcon className="h-3.5 w-3.5" />
                </span>

                {/* Content */}
                <div className="flex-1 space-y-0.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <code className="text-sm font-medium text-[--text-primary]">
                      {log.message}
                    </code>
                    <Badge
                      variant="outline"
                      className={`text-xs ${catConfig.className}`}
                    >
                      {catConfig.label}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap gap-3 text-xs text-[--text-muted]">
                    <span>{log.actor}</span>
                    {log.duration && <span>· {log.duration}</span>}
                    {log.details && (
                      <span className={log.level === "error" ? "text-[--red]" : log.level === "warning" ? "text-[--amber]" : ""}>
                        · {log.details}
                      </span>
                    )}
                  </div>
                </div>

                {/* Timestamp */}
                <span className="shrink-0 font-mono text-xs text-[--text-muted]">
                  {log.timestamp.split(" ")[1]}
                </span>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Retention info */}
      <div className="flex items-start gap-3 rounded-xl border border-[--blue-border] bg-[--blue-dim] px-4 py-3 text-sm">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-[--blue]" />
        <div className="text-[--blue]">
          <span className="font-semibold">Rétention des journaux : </span>
          Les journaux sont conservés 90 jours sur le plan Free, 12 mois sur Pro et 7 ans sur Enterprise (conformité audit RGPD).
        </div>
      </div>
    </div>
  );
}
