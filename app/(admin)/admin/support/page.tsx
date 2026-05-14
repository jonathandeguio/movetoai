"use client";

import { useState } from "react";
import {
  Search,
  UserSearch,
  Building2,
  MessageSquare,
  Mail,
  Copy,
  Check,
  ExternalLink,
  AlertCircle,
  RefreshCcw,
} from "lucide-react";

// Support tools — in production these would call real API endpoints
// /api/admin/support/lookup-user, /api/admin/support/lookup-workspace, etc.

type LookupResult =
  | { type: "user"; id: string; name: string; email: string; status: string; createdAt: string; workspaces: string[] }
  | { type: "workspace"; id: string; name: string; plan: string; status: string; members: number; processes: number; tenant: string }
  | null;

const MOCK_TICKETS = [
  { id: "TK-001", user: "alice@acme.com", subject: "Impossible de finaliser l'onboarding consultant", status: "open", priority: "high", created: "2026-04-06" },
  { id: "TK-002", user: "bob@startup.io", subject: "Les recommandations IA ne se chargent plus", status: "in_progress", priority: "high", created: "2026-04-05" },
  { id: "TK-003", user: "carol@bigcorp.fr", subject: "Export PDF indisponible sur l'offre Pro", status: "open", priority: "medium", created: "2026-04-05" },
  { id: "TK-004", user: "dave@conseil.net", subject: "Demande de migration de workspace vers Enterprise", status: "waiting", priority: "low", created: "2026-04-04" },
  { id: "TK-005", user: "eve@dsicorp.com", subject: "Erreur 500 lors de la génération de la roadmap IT", status: "resolved", priority: "high", created: "2026-04-03" },
  { id: "TK-006", user: "frank@pme.fr", subject: "Question sur les limites de l'offre Free", status: "resolved", priority: "low", created: "2026-04-02" },
];

const STATUS_BADGE: Record<string, string> = {
  open: "border-amber-800 bg-amber-950/50 text-amber-300",
  in_progress: "border-blue-800 bg-blue-950/50 text-blue-300",
  waiting: "border-slate-700 bg-slate-800 text-slate-400",
  resolved: "border-emerald-800 bg-emerald-950/50 text-emerald-300",
};

const STATUS_LABEL: Record<string, string> = {
  open: "Ouvert",
  in_progress: "En cours",
  waiting: "En attente",
  resolved: "Résolu",
};

const PRIORITY_DOT: Record<string, string> = {
  high: "bg-rose-500",
  medium: "bg-amber-500",
  low: "bg-slate-500",
};

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(value); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
      className="rounded p-1 text-slate-500 hover:text-slate-300 transition"
    >
      {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
    </button>
  );
}

export default function AdminSupportPage() {
  const [query, setQuery] = useState("");
  const [lookupType, setLookupType] = useState<"user" | "workspace">("user");
  const [result, setResult] = useState<LookupResult>(null);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<"all" | "open" | "in_progress" | "resolved">("all");

  async function handleLookup() {
    if (!query.trim()) return;
    setLoading(true);
    setResult(null);
    // Mock lookup — replace with real API call
    await new Promise((r) => setTimeout(r, 600));
    if (lookupType === "user") {
      setResult({
        type: "user",
        id: "usr_mock_" + Date.now(),
        name: query.includes("@") ? query.split("@")[0] : query,
        email: query.includes("@") ? query : `${query}@example.com`,
        status: "ACTIVE",
        createdAt: "2026-01-15",
        workspaces: ["Acme Corp", "Side Project"],
      });
    } else {
      setResult({
        type: "workspace",
        id: "ws_mock_" + Date.now(),
        name: query,
        plan: "PRO",
        status: "ACTIVE",
        members: 12,
        processes: 34,
        tenant: "Acme Corp SAS",
      });
    }
    setLoading(false);
  }

  const filteredTickets =
    statusFilter === "all" ? MOCK_TICKETS : MOCK_TICKETS.filter((t) => t.status === statusFilter);

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-xl font-semibold text-slate-50">Support client</h1>
        <p className="text-sm text-slate-400">Outils de diagnostic, lookup et gestion des tickets.</p>
      </div>

      {/* Lookup tool */}
      <div className="space-y-4">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-500">Diagnostic & Lookup</h2>
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 space-y-4">
          {/* Type toggle */}
          <div className="flex gap-2">
            {(["user", "workspace"] as const).map((t) => (
              <button
                key={t}
                onClick={() => { setLookupType(t); setResult(null); }}
                className={`flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-medium transition ${
                  lookupType === t
                    ? "border-rose-700 bg-rose-950/50 text-rose-300"
                    : "border-slate-700 bg-slate-800 text-slate-400 hover:border-slate-600"
                }`}
              >
                {t === "user" ? <UserSearch className="h-3.5 w-3.5" /> : <Building2 className="h-3.5 w-3.5" />}
                {t === "user" ? "Utilisateur" : "Workspace"}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLookup()}
                placeholder={lookupType === "user" ? "Email ou nom d'utilisateur…" : "Nom du workspace…"}
                className="w-full rounded-xl border border-slate-700 bg-slate-800 py-2.5 pl-9 pr-4 text-sm text-slate-200 placeholder:text-slate-500 focus:border-rose-700 focus:outline-none"
              />
            </div>
            <button
              onClick={handleLookup}
              disabled={loading || !query.trim()}
              className="flex items-center gap-2 rounded-xl bg-rose-700 px-4 py-2 text-sm font-medium text-white hover:bg-rose-600 disabled:opacity-40 transition"
            >
              {loading ? <RefreshCcw className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              Rechercher
            </button>
          </div>

          {/* Result */}
          {result && (
            <div className="rounded-xl border border-slate-700 bg-slate-800 p-4 space-y-3">
              {result.type === "user" ? (
                <>
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-slate-100">{result.name}</p>
                    <span className="rounded-full border border-emerald-800 bg-emerald-950/50 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">{result.status}</span>
                  </div>
                  <div className="space-y-1.5">
                    {[
                      { label: "Email", value: result.email },
                      { label: "ID", value: result.id },
                      { label: "Inscrit le", value: result.createdAt },
                    ].map((row) => (
                      <div key={row.label} className="flex items-center gap-2">
                        <span className="text-[11px] text-slate-500 w-20 shrink-0">{row.label}</span>
                        <span className="font-mono text-xs text-slate-300">{row.value}</span>
                        <CopyButton value={row.value} />
                      </div>
                    ))}
                    <div className="flex items-start gap-2">
                      <span className="text-[11px] text-slate-500 w-20 shrink-0">Workspaces</span>
                      <div className="flex flex-wrap gap-1">
                        {result.workspaces.map((ws) => (
                          <span key={ws} className="rounded border border-slate-700 px-1.5 py-0.5 text-[10px] text-slate-300">{ws}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 pt-1">
                    <button className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1.5 text-[11px] text-slate-400 hover:text-slate-200 transition">
                      <Mail className="h-3 w-3" /> Envoyer un email
                    </button>
                    <button className="flex items-center gap-1.5 rounded-lg border border-rose-900/50 bg-rose-950/20 px-2.5 py-1.5 text-[11px] text-rose-400 hover:text-rose-300 transition">
                      <AlertCircle className="h-3 w-3" /> Suspendre le compte
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-slate-100">{result.name}</p>
                    <span className="rounded-full border border-emerald-800 bg-emerald-950/50 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">{result.status}</span>
                  </div>
                  <div className="space-y-1.5">
                    {[
                      { label: "ID", value: result.id },
                      { label: "Plan", value: result.plan },
                      { label: "Tenant", value: result.tenant },
                      { label: "Membres", value: String(result.members) },
                      { label: "Processus", value: String(result.processes) },
                    ].map((row) => (
                      <div key={row.label} className="flex items-center gap-2">
                        <span className="text-[11px] text-slate-500 w-20 shrink-0">{row.label}</span>
                        <span className="font-mono text-xs text-slate-300">{row.value}</span>
                        <CopyButton value={row.value} />
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2 pt-1">
                    <button className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1.5 text-[11px] text-slate-400 hover:text-slate-200 transition">
                      <ExternalLink className="h-3 w-3" /> Ouvrir le workspace
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Tickets */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-500">
            Tickets support ({MOCK_TICKETS.length})
          </h2>
          <div className="flex gap-1.5">
            {(["all", "open", "in_progress", "resolved"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`rounded-lg border px-2.5 py-1 text-[10px] font-medium transition ${
                  statusFilter === s
                    ? "border-rose-700 bg-rose-950/50 text-rose-300"
                    : "border-slate-700 bg-slate-800 text-slate-400 hover:border-slate-600"
                }`}
              >
                {s === "all" ? "Tous" : STATUS_LABEL[s]}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 divide-y divide-slate-800">
          {filteredTickets.map((ticket) => (
            <div key={ticket.id} className="flex items-start gap-4 px-5 py-4 hover:bg-slate-800/30 transition">
              <div className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${PRIORITY_DOT[ticket.priority]}`} />
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-[11px] text-slate-600">{ticket.id}</span>
                  <p className="font-medium text-slate-200 text-sm">{ticket.subject}</p>
                </div>
                <p className="mt-0.5 text-[11px] text-slate-500">{ticket.user}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${STATUS_BADGE[ticket.status]}`}>
                  {STATUS_LABEL[ticket.status]}
                </span>
                <span className="text-[10px] text-slate-600">{ticket.created}</span>
              </div>
              <button className="shrink-0 rounded-lg border border-slate-700 bg-slate-800 p-1.5 text-slate-500 hover:text-slate-300 transition">
                <MessageSquare className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
          {filteredTickets.length === 0 && (
            <div className="py-12 text-center text-sm text-slate-500">Aucun ticket dans cette catégorie.</div>
          )}
        </div>
      </div>
    </div>
  );
}
