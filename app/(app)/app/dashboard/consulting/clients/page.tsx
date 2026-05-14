import { redirect } from "next/navigation";
import Link from "next/link";
import {
  ArrowRight,
  Briefcase,
  Building2,
  ExternalLink,
  Plus,
  Sparkles,
  TrendingUp,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentWorkspaceContext } from "@/server/auth";

export const dynamic = "force-dynamic";

// Mock client workspaces — to be replaced by real multi-tenant Prisma query
const MOCK_CLIENTS = [
  {
    id: "ws_1",
    name: "Acme Corp",
    sector: "Industrie",
    size: "ETI",
    activeProcesses: 8,
    activeOpportunities: 5,
    members: 6,
    lastActivity: "Il y a 2h",
    status: "active" as const,
    contractType: "Mission longue",
    startDate: "Janv. 2026",
    aiMaturity: 62,
  },
  {
    id: "ws_2",
    name: "RetailPlus",
    sector: "Commerce / Retail",
    size: "PME",
    activeProcesses: 4,
    activeOpportunities: 3,
    members: 3,
    lastActivity: "Hier",
    status: "active" as const,
    contractType: "Mission courte",
    startDate: "Mars 2026",
    aiMaturity: 34,
  },
  {
    id: "ws_3",
    name: "FinServ SA",
    sector: "Finance",
    size: "Grand groupe",
    activeProcesses: 12,
    activeOpportunities: 7,
    members: 14,
    lastActivity: "Il y a 3 jours",
    status: "idle" as const,
    contractType: "Retainer mensuel",
    startDate: "Fév. 2026",
    aiMaturity: 78,
  },
];

const STATUS_CONFIG = {
  active: { label: "Actif", dotClass: "bg-[--green]", badgeClass: "bg-[--green-dim] text-[--green] border-[--green-border]" },
  idle: { label: "En attente", dotClass: "bg-[--amber]", badgeClass: "bg-[--amber-dim] text-[--amber] border-[--amber-border]" },
  closed: { label: "Terminé", dotClass: "bg-[--border-strong]", badgeClass: "bg-[--bg-hover] text-[--text-secondary] border-[--border]" },
};

function MaturityBar({ score }: { score: number }) {
  const color =
    score < 30 ? "bg-[--red]" :
    score < 60 ? "bg-[--amber]" :
    score < 85 ? "bg-[--blue]" : "bg-[--green]";
  const label =
    score < 30 ? "Débutant" :
    score < 60 ? "En progression" :
    score < 85 ? "Avancé" : "Expert";
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-[--text-muted]">Maturité IA</span>
        <span className="font-semibold text-[--text-secondary]">{score}% · {label}</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-[--bg-hover]">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${score}%` }} />
      </div>
    </div>
  );
}

export default async function ConsultingClientsPage() {
  const { workspace } = await getCurrentWorkspaceContext({ requireMembership: true });
  if (!workspace?.id) redirect("/onboarding");

  const activeCount = MOCK_CLIENTS.filter((c) => c.status === "active").length;
  const totalProcesses = MOCK_CLIENTS.reduce((s, c) => s + c.activeProcesses, 0);
  const totalOpportunities = MOCK_CLIENTS.reduce((s, c) => s + c.activeOpportunities, 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-xl font-semibold text-[--text-primary]">
            Mes workspaces clients
          </h1>
          <p className="text-sm text-[--text-muted]">
            {activeCount} client{activeCount !== 1 ? "s" : ""} actif{activeCount !== 1 ? "s" : ""}
            {" · "}
            {totalProcesses} processus · {totalOpportunities} opportunités IA
          </p>
        </div>
        <Button className="bg-[--amber] hover:bg-[--amber]" size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Ajouter un client
        </Button>
      </div>

      {/* Clients grid */}
      <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
        {MOCK_CLIENTS.map((client) => {
          const statusConfig = STATUS_CONFIG[client.status];
          return (
            <Card key={client.id} className="border-[--border] bg-[--bg-card] shadow-soft-sm">
              <CardContent className="space-y-4 p-5">
                {/* Client header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[--amber-dim]">
                      <Building2 className="h-5 w-5 text-[--amber]" />
                    </div>
                    <div>
                      <p className="font-semibold text-[--text-primary]">{client.name}</p>
                      <p className="text-xs text-[--text-disabled]">{client.sector} · {client.size}</p>
                    </div>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${statusConfig.badgeClass}`}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${statusConfig.dotClass}`} />
                    {statusConfig.label}
                  </span>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-2 text-center">
                  {[
                    { label: "Processus", value: client.activeProcesses, icon: TrendingUp },
                    { label: "Opportunités", value: client.activeOpportunities, icon: Sparkles },
                    { label: "Membres", value: client.members, icon: Briefcase },
                  ].map((stat) => {
                    const Icon = stat.icon;
                    return (
                      <div key={stat.label} className="rounded-xl bg-[--bg-hover] py-2">
                        <Icon className="mx-auto h-3.5 w-3.5 text-[--text-disabled]" />
                        <p className="mt-1 text-sm font-semibold text-[--text-primary]">
                          {stat.value}
                        </p>
                        <p className="text-[10px] text-[--text-disabled]">{stat.label}</p>
                      </div>
                    );
                  })}
                </div>

                {/* Maturity bar */}
                <MaturityBar score={client.aiMaturity} />

                {/* Meta */}
                <div className="flex items-center justify-between text-xs text-[--text-disabled]">
                  <span>{client.contractType} · depuis {client.startDate}</span>
                  <span>{client.lastActivity}</span>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="flex-1 border-[--amber-border] text-[--amber] hover:bg-[--amber-dim]"
                  >
                    <Link href={`/app`}>
                      Ouvrir
                      <ExternalLink className="ml-1.5 h-3 w-3" />
                    </Link>
                  </Button>
                  <Button asChild variant="ghost" size="sm" className="flex-1 text-[--text-secondary]">
                    <Link href="/app/dashboard/consulting/templates">
                      Templates
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {/* Add client card */}
        <Card className="border-dashed border-[--border] bg-[--bg-hover]">
          <CardContent className="flex h-full flex-col items-center justify-center gap-3 py-12 text-center">
            <div className="rounded-2xl bg-[--amber-dim] p-3">
              <Plus className="h-6 w-6 text-[--amber]" />
            </div>
            <p className="text-sm font-medium text-[--text-secondary]">
              Ajouter un client
            </p>
            <p className="max-w-[180px] text-xs text-[--text-disabled]">
              Invitez un client à créer son workspace ou rejoignez-en un existant
            </p>
            <Button size="sm" className="bg-[--amber] hover:bg-[--amber]">
              <Plus className="mr-2 h-3.5 w-3.5" />
              Nouveau client
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
