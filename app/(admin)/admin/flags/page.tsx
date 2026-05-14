"use client";

import { useState } from "react";
import { Flag, Info, ToggleLeft, ToggleRight } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Feature flags are typically stored in a config / DB table.
// This mock is representative — connect to a real FeatureFlag model when available.

type FlagScope = "global" | "pro_only" | "enterprise_only" | "beta";

interface FeatureFlag {
  key: string;
  label: string;
  description: string;
  enabled: boolean;
  scope: FlagScope;
  category: string;
}

const SCOPE_BADGE: Record<FlagScope, string> = {
  global: "border-slate-700 bg-slate-800 text-slate-300",
  pro_only: "border-blue-800 bg-blue-950/50 text-blue-300",
  enterprise_only: "border-violet-800 bg-violet-950/50 text-violet-300",
  beta: "border-amber-800 bg-amber-950/50 text-amber-300",
};

const INITIAL_FLAGS: FeatureFlag[] = [
  // Onboarding
  { key: "onboarding_it_manager", label: "Onboarding IT Manager", description: "Active le parcours d'onboarding DSI / IT Manager avec génération de roadmap IA.", enabled: true, scope: "global", category: "Onboarding" },
  { key: "onboarding_consultant", label: "Onboarding Consultant", description: "Active le parcours consultant avec génération de 5 cas d'usage IA.", enabled: true, scope: "global", category: "Onboarding" },
  { key: "onboarding_skip_team_size", label: "Skip taille d'équipe", description: "Permet de passer l'étape de configuration de la taille d'équipe.", enabled: false, scope: "beta", category: "Onboarding" },
  // AI Features
  { key: "ai_process_recommendations", label: "Recommandations IA processus", description: "Génère des recommandations Claude pour les processus métier.", enabled: true, scope: "global", category: "IA" },
  { key: "ai_opportunity_scoring", label: "Scoring IA opportunités", description: "Score automatique de priorité pour les opportunités d'automatisation.", enabled: true, scope: "pro_only", category: "IA" },
  { key: "ai_assistant_chat", label: "Assistant IA conversationnel", description: "Chat contextuel Claude intégré dans chaque workspace.", enabled: false, scope: "beta", category: "IA" },
  { key: "ai_bulk_process_analysis", label: "Analyse bulk processus", description: "Import CSV et analyse automatique de plusieurs processus en lot.", enabled: false, scope: "enterprise_only", category: "IA" },
  // Collaboration
  { key: "workspace_comments", label: "Commentaires workspace", description: "Commentaires en ligne sur les processus et opportunités.", enabled: true, scope: "global", category: "Collaboration" },
  { key: "workspace_sharing_public", label: "Partage public", description: "Génère un lien public read-only pour un workspace.", enabled: false, scope: "pro_only", category: "Collaboration" },
  { key: "workspace_export_pdf", label: "Export PDF", description: "Exporte la cartographie des processus au format PDF.", enabled: true, scope: "pro_only", category: "Collaboration" },
  // Integrations
  { key: "integration_zapier", label: "Intégration Zapier", description: "Webhooks sortants compatibles Zapier / Make.", enabled: false, scope: "enterprise_only", category: "Intégrations" },
  { key: "integration_slack", label: "Notifications Slack", description: "Alertes Slack lors de nouvelles opportunités détectées.", enabled: false, scope: "beta", category: "Intégrations" },
  // Admin
  { key: "admin_audit_export", label: "Export journaux audit", description: "Export CSV des journaux d'audit sur 90 jours.", enabled: true, scope: "global", category: "Admin" },
  { key: "admin_impersonation", label: "Impersonation utilisateur", description: "Permet aux Super Admin de se connecter en tant qu'utilisateur (audité).", enabled: false, scope: "global", category: "Admin" },
];

const CATEGORIES = [...new Set(INITIAL_FLAGS.map((f) => f.category))];

export default function AdminFlagsPage() {
  const [flags, setFlags] = useState<FeatureFlag[]>(INITIAL_FLAGS);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [saved, setSaved] = useState<string | null>(null);

  function toggle(key: string) {
    setFlags((prev) => prev.map((f) => (f.key === key ? { ...f, enabled: !f.enabled } : f)));
    setSaved(key);
    setTimeout(() => setSaved(null), 2000);
  }

  const filtered = activeCategory === "all" ? flags : flags.filter((f) => f.category === activeCategory);
  const enabledCount = flags.filter((f) => f.enabled).length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-xl font-semibold text-slate-50">Feature Flags</h1>
          <p className="text-sm text-slate-400">
            {enabledCount} / {flags.length} flags activés — changements appliqués immédiatement.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-amber-900/40 bg-amber-950/30 px-3 py-2 text-xs text-amber-400">
          <Info className="h-3.5 w-3.5 shrink-0" />
          Les flags s'appliquent en temps réel à tous les workspaces.
        </div>
      </div>

      {/* Category filters */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setActiveCategory("all")}
          className={`rounded-xl border px-3 py-1.5 text-xs font-medium transition ${
            activeCategory === "all"
              ? "border-rose-700 bg-rose-950/50 text-rose-300"
              : "border-slate-700 bg-slate-800 text-slate-400 hover:border-slate-600"
          }`}
        >
          Tous ({flags.length})
        </button>
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`rounded-xl border px-3 py-1.5 text-xs font-medium transition ${
              activeCategory === cat
                ? "border-rose-700 bg-rose-950/50 text-rose-300"
                : "border-slate-700 bg-slate-800 text-slate-400 hover:border-slate-600"
            }`}
          >
            {cat} ({flags.filter((f) => f.category === cat).length})
          </button>
        ))}
      </div>

      {/* Flags list */}
      <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 divide-y divide-slate-800">
        {filtered.map((flag) => (
          <div
            key={flag.key}
            className="flex items-center gap-4 px-5 py-4 hover:bg-slate-800/30 transition"
          >
            <button
              onClick={() => toggle(flag.key)}
              className="shrink-0"
              title={flag.enabled ? "Désactiver" : "Activer"}
            >
              {flag.enabled ? (
                <ToggleRight className="h-7 w-7 text-emerald-500" />
              ) : (
                <ToggleLeft className="h-7 w-7 text-slate-600" />
              )}
            </button>

            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-medium text-slate-100">{flag.label}</p>
                <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${SCOPE_BADGE[flag.scope]}`}>
                  {flag.scope.replace("_", " ")}
                </span>
                {saved === flag.key && (
                  <span className="text-[10px] text-emerald-400 animate-pulse">Mis à jour ✓</span>
                )}
              </div>
              <p className="mt-0.5 text-xs text-slate-500">{flag.description}</p>
              <p className="mt-0.5 font-mono text-[10px] text-slate-600">{flag.key}</p>
            </div>

            <div className="shrink-0">
              <span
                className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold ${
                  flag.enabled
                    ? "border-emerald-800 bg-emerald-950/50 text-emerald-400"
                    : "border-slate-700 bg-slate-800 text-slate-500"
                }`}
              >
                {flag.enabled ? "ON" : "OFF"}
              </span>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="py-12 text-center text-sm text-slate-500">Aucun flag dans cette catégorie.</div>
        )}
      </div>
    </div>
  );
}
