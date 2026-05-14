import { redirect } from "next/navigation";
import { Copy, ExternalLink, Key, Zap } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentWorkspaceContext } from "@/server/auth";

export const dynamic = "force-dynamic";

const ENDPOINTS = [
  {
    method: "GET",
    path: "/api/v1/processes",
    description: "Lister tous les processus du workspace",
    auth: true,
    category: "Processus",
  },
  {
    method: "POST",
    path: "/api/v1/processes",
    description: "Créer un nouveau processus",
    auth: true,
    category: "Processus",
  },
  {
    method: "GET",
    path: "/api/v1/opportunities",
    description: "Lister les opportunités IA du workspace",
    auth: true,
    category: "Opportunités",
  },
  {
    method: "POST",
    path: "/api/v1/opportunities",
    description: "Créer une opportunité IA",
    auth: true,
    category: "Opportunités",
  },
  {
    method: "GET",
    path: "/api/v1/workspace",
    description: "Récupérer les informations du workspace courant",
    auth: true,
    category: "Workspace",
  },
  {
    method: "GET",
    path: "/api/v1/members",
    description: "Lister les membres actifs du workspace",
    auth: true,
    category: "Workspace",
  },
  {
    method: "POST",
    path: "/api/v1/webhooks",
    description: "Enregistrer un endpoint webhook",
    auth: true,
    category: "Webhooks",
  },
] as const;

const METHOD_STYLES: Record<string, string> = {
  GET: "bg-[--green-dim] text-[--green] border-[--green-border]",
  POST: "bg-[--blue-dim] text-[--blue] border-[--blue-border]",
  PATCH: "bg-[--amber-dim] text-[--amber] border-[--amber-border]",
  DELETE: "bg-[--red-dim] text-[--red] border-[--red-dim]",
};

const CODE_SAMPLE = `curl -X GET \\
  https://app.movetoai.io/api/v1/processes \\
  -H "Authorization: Bearer <API_KEY>" \\
  -H "Content-Type: application/json"`;

const RESPONSE_SAMPLE = `{
  "data": [
    {
      "id": "proc_01abc",
      "name": "Traitement des commandes",
      "domain": "Supply Chain",
      "aiScore": 82,
      "status": "ACTIVE"
    }
  ],
  "meta": {
    "total": 12,
    "page": 1,
    "perPage": 20
  }
}`;

export default async function APIDocsPage() {
  const { workspace } = await getCurrentWorkspaceContext({ requireMembership: true });
  if (!workspace?.id) redirect("/onboarding");

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold text-[--text-primary]">
              API Move to AI
            </h1>
            <Badge className="border-[--blue-border] bg-[--blue-dim] text-[--blue]">v1</Badge>
          </div>
          <p className="text-sm text-[--text-muted]">
            Intégrez Move to AI dans vos outils internes via notre API REST.
          </p>
        </div>
        <Button className="bg-[--blue] hover:bg-[--blue]" size="sm">
          <ExternalLink className="mr-2 h-4 w-4" />
          Docs complètes
        </Button>
      </div>

      {/* API Key section */}
      <Card className="border-[--blue-border] bg-[--blue-dim] shadow-soft-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm font-semibold text-[--blue]">
            <Key className="h-4 w-4" />
            Votre clé API
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2">
            <code className="flex-1 rounded-lg border border-[--blue-border] bg-[--bg-card] px-4 py-2.5 font-mono text-sm text-[--text-secondary]">
              mta_live_••••••••••••••••••••••••••••••••
            </code>
            <Button variant="outline" size="sm" className="shrink-0">
              <Copy className="mr-1.5 h-3.5 w-3.5" />
              Copier
            </Button>
          </div>
          <p className="text-xs text-[--blue]">
            Ne partagez jamais votre clé API. Régénérez-la immédiatement si elle est compromise.
          </p>
          <Button variant="outline" size="sm" className="border-[--blue-border] text-[--blue] hover:bg-[--blue-dim]">
            Régénérer la clé
          </Button>
        </CardContent>
      </Card>

      {/* Quick start */}
      <Card className="border-[--border] bg-[--bg-card] shadow-soft-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm font-semibold">
            <Zap className="h-4 w-4 text-[--amber]" />
            Démarrage rapide
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-[--text-muted]">Requête</p>
              <pre className="overflow-x-auto rounded-xl border border-[--border] bg-[--bg-secondary] p-4 text-xs leading-6 text-[--text-secondary]">
                <code>{CODE_SAMPLE}</code>
              </pre>
            </div>
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-[--text-muted]">Réponse</p>
              <pre className="overflow-x-auto rounded-xl border border-[--border] bg-[--bg-secondary] p-4 text-xs leading-6 text-[--text-secondary]">
                <code>{RESPONSE_SAMPLE}</code>
              </pre>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Endpoints */}
      <Card className="border-[--border] bg-[--bg-card] shadow-soft-sm">
        <CardHeader>
          <CardTitle className="text-sm font-semibold">Endpoints disponibles</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {ENDPOINTS.map((endpoint) => (
              <div
                key={`${endpoint.method}-${endpoint.path}`}
                className="flex items-center gap-3 rounded-xl border border-[--border] px-4 py-3 hover:border-[--blue-border] hover:bg-[--blue-dim]"
              >
                <span
                  className={`shrink-0 rounded-md border px-2 py-0.5 font-mono text-xs font-semibold ${
                    METHOD_STYLES[endpoint.method] ?? ""
                  }`}
                >
                  {endpoint.method}
                </span>
                <code className="flex-1 font-mono text-sm text-[--text-secondary]">
                  {endpoint.path}
                </code>
                <span className="hidden text-xs text-[--text-muted] sm:block">
                  {endpoint.description}
                </span>
                <Badge variant="outline" className="shrink-0 text-xs">
                  {endpoint.category}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Rate limits */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Requêtes / minute", value: "1 000", plan: "Plan Free" },
          { label: "Requêtes / minute", value: "10 000", plan: "Plan Pro" },
          { label: "Requêtes / minute", value: "Illimité", plan: "Plan Enterprise" },
        ].map((limit) => (
          <div
            key={limit.plan}
            className="rounded-xl border border-[--border] bg-[--bg-card] p-4 text-center"
          >
            <p className="text-2xl font-semibold text-[--text-primary]">
              {limit.value}
            </p>
            <p className="mt-0.5 text-xs text-[--text-muted]">{limit.label}</p>
            <p className="mt-1 text-xs font-medium text-[--green]">{limit.plan}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
