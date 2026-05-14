import type { Route } from "next";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Building2, GitBranch, Monitor, Sparkles, Users, DollarSign, Server, ExternalLink } from "lucide-react";

import { requirePermission }  from "@/server/permissions";
import { applicationRepo }    from "@/lib/repositories/application.repo";
import { LifecycleBadge } from "@/components/knowledge/LifecycleBadge";
import { ModernizationAdvicePanel } from "@/components/knowledge/ModernizationAdvicePanel";
import type { ModernizationAdvice } from "@/components/knowledge/ModernizationAdvicePanel";

export const dynamic = "force-dynamic";

// --- SVG Gauge ---
function AiReadinessGauge({ score }: { score: number }) {
  const pct = Math.min(Math.max(Math.round(score), 0), 100);
  const r = 40;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  const color = pct >= 70 ? "var(--green)" : pct >= 40 ? "var(--amber)" : "var(--red)";
  const label = pct >= 70 ? "Prêt pour l'IA" : pct >= 40 ? "En progression" : "Efforts requis";

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width="100" height="100" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r={r} fill="none" stroke="var(--border)" strokeWidth="6" />
        <circle
          cx="50"
          cy="50"
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="6"
          strokeDasharray={`${dash} ${circ - dash}`}
          strokeLinecap="round"
          transform="rotate(-90 50 50)"
        />
        <text x="50" y="46" textAnchor="middle" fill="var(--text-primary)" fontSize="18" fontWeight="700">
          {pct}
        </text>
        <text x="50" y="60" textAnchor="middle" fill="var(--text-muted)" fontSize="9">
          /100
        </text>
      </svg>
      <span className="text-sm font-medium" style={{ color }}>{label}</span>
    </div>
  );
}

// --- Criticality badge ---
const CRITICALITY_STYLES: Record<string, string> = {
  critical: "bg-[--red-dim] text-[--red] border-[--red-dim]",
  high:     "bg-[--amber-dim] text-[--amber] border-[--amber-border]",
  medium:   "bg-[--blue-dim] text-[--blue] border-[--blue-dim]",
  low:      "bg-[--bg-hover] text-[--text-muted] border-[--border]",
};
const CRITICALITY_LABELS: Record<string, string> = {
  critical: "Critique",
  high:     "Élevée",
  medium:   "Moyenne",
  low:      "Faible",
};

// --- Opportunity status badge ---
const OPP_STATUS_STYLES: Record<string, string> = {
  draft:       "bg-[--bg-hover] text-[--text-muted] border border-[--border]",
  evaluated:   "bg-[--blue-dim] text-[--blue] border border-[--blue-dim]",
  validated:   "bg-[--green-dim] text-[--green] border border-[--green-border]",
  in_progress: "bg-[--amber-dim] text-[--amber] border border-[--amber-border]",
  deployed:    "bg-[--green-dim] text-[--green] border border-[--green-border]",
  rejected:    "bg-[--red-dim] text-[--red] border border-[--red-dim]",
};

export default async function KnowledgeApplicationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { workspace } = await requirePermission("business-structure.manage");
  if (!workspace?.id) redirect("/onboarding");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const app: any = await applicationRepo.findByIdForDetail(id, workspace.id).catch(() => null);

  if (!app) notFound();

  const critKey = (app.criticality as string | null)?.toLowerCase();
  const critStyle = critKey ? (CRITICALITY_STYLES[critKey] ?? null) : null;
  const critLabel = critKey ? (CRITICALITY_LABELS[critKey] ?? app.criticality) : null;

  const capabilities: Array<{ capability: { name: string } }> = app.capabilities ?? [];
  const processes: Array<{ process: { id: string; name: string } }> = app.processes ?? [];
  const technologies: Array<{ technology: { name: string; category?: string | null } }> = app.technologies ?? [];
  const opportunities: Array<{ opportunity: { id: string; title: string; status: string } }> = app.opportunities ?? [];

  return (
    <div className="space-y-6">
      {/* Back */}
      <Link
        href={"/app/knowledge/applications" as Route}
        className="inline-flex items-center gap-1.5 text-sm text-[--text-muted] hover:text-[--text-primary] transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour aux applications
      </Link>

      {/* En-tête */}
      <div className="rounded-2xl border border-[--border] bg-[--bg-card] p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <LifecycleBadge lifecycle={app.lifecycleState} />
              {critLabel && critStyle && (
                <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium ${critStyle}`}>
                  {critLabel}
                </span>
              )}
              {app.deploymentType && (
                <span className="inline-flex items-center gap-1 rounded-full border border-[--border] bg-[--bg-hover] px-2.5 py-0.5 text-xs text-[--text-muted]">
                  <Server className="h-3 w-3" />
                  {app.deploymentType}
                </span>
              )}
            </div>
            <h1 className="text-3xl font-bold text-[--text-primary] tracking-tight" style={{ fontFamily: "var(--font-syne, sans-serif)" }}>
              {app.name}
            </h1>
            {app.vendor && (
              <p className="mt-1 text-sm text-[--text-muted]">par {app.vendor}</p>
            )}
            {app.description && (
              <p className="mt-3 text-sm text-[--text-secondary] leading-relaxed max-w-2xl">
                {app.description}
              </p>
            )}
          </div>
          {app.aiReadinessScore != null && (
            <AiReadinessGauge score={app.aiReadinessScore} />
          )}
        </div>
      </div>

      {/* 2 colonnes */}
      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        {/* Main */}
        <div className="space-y-6">
          {/* Owners */}
          <div className="rounded-2xl border border-[--border] bg-[--bg-card] p-5 shadow-sm">
            <h2 className="mb-4 text-sm font-semibold text-[--text-secondary] uppercase tracking-wider">
              Responsables
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {app.businessOwner ? (
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[--blue-dim] text-[--blue] text-sm font-semibold">
                    {app.businessOwner.name[0]}
                  </div>
                  <div>
                    <p className="text-xs text-[--text-muted] mb-0.5">Business Owner</p>
                    <p className="text-sm font-medium text-[--text-primary]">{app.businessOwner.name}</p>
                    {app.businessOwner.email && (
                      <p className="text-xs text-[--text-muted]">{app.businessOwner.email}</p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-sm text-[--text-muted]">Pas de Business Owner</div>
              )}
              {app.itOwner ? (
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[--green-dim] text-[--green] text-sm font-semibold">
                    {app.itOwner.name[0]}
                  </div>
                  <div>
                    <p className="text-xs text-[--text-muted] mb-0.5">IT Owner</p>
                    <p className="text-sm font-medium text-[--text-primary]">{app.itOwner.name}</p>
                    {app.itOwner.email && (
                      <p className="text-xs text-[--text-muted]">{app.itOwner.email}</p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-sm text-[--text-muted]">Pas d'IT Owner</div>
              )}
            </div>
          </div>

          {/* Relations — Capabilities & Processus */}
          <div className="rounded-2xl border border-[--border] bg-[--bg-card] p-5 shadow-sm">
            <h2 className="mb-4 text-sm font-semibold text-[--text-secondary] uppercase tracking-wider">
              Relations
            </h2>

            {capabilities.length > 0 && (
              <div className="mb-4">
                <p className="mb-2 text-xs text-[--text-muted] font-medium flex items-center gap-1">
                  <GitBranch className="h-3 w-3" />
                  Capabilities supportées ({capabilities.length})
                </p>
                <div className="flex flex-wrap gap-2">
                  {capabilities.map((ac, i) => (
                    <span
                      key={i}
                      className="inline-flex rounded-full border border-[--border] bg-[--bg-hover] px-3 py-1 text-xs text-[--text-secondary]"
                    >
                      {ac.capability.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {processes.length > 0 && (
              <div>
                <p className="mb-2 text-xs text-[--text-muted] font-medium flex items-center gap-1">
                  <Monitor className="h-3 w-3" />
                  Processus supportés ({processes.length})
                </p>
                <div className="space-y-1">
                  {processes.map((ap) => (
                    <Link
                      key={ap.process.id}
                      href={`/app/processes/${ap.process.id}` as Route}
                      className="flex items-center justify-between rounded-lg border border-[--border-subtle] bg-[--bg-hover] px-3 py-2 text-sm text-[--text-secondary] hover:border-[--green-border] hover:text-[--green] transition-colors"
                    >
                      {ap.process.name}
                      <ExternalLink className="h-3 w-3 opacity-50" />
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {capabilities.length === 0 && processes.length === 0 && (
              <p className="text-sm text-[--text-muted]">Aucune relation documentée.</p>
            )}
          </div>

          {/* Use Cases (opportunités) */}
          {opportunities.length > 0 && (
            <div className="rounded-2xl border border-[--border] bg-[--bg-card] p-5 shadow-sm">
              <h2 className="mb-4 text-sm font-semibold text-[--text-secondary] uppercase tracking-wider">
                Use Cases IA ({opportunities.length})
              </h2>
              <div className="space-y-2">
                {opportunities.map((ao) => {
                  const statusStyle = OPP_STATUS_STYLES[ao.opportunity.status] ?? OPP_STATUS_STYLES.draft;
                  return (
                    <Link
                      key={ao.opportunity.id}
                      href={`/app/opportunities/${ao.opportunity.id}` as Route}
                      className="flex items-center justify-between rounded-lg border border-[--border-subtle] bg-[--bg-hover] px-4 py-3 hover:border-[--green-border] transition-colors group"
                    >
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-3.5 w-3.5 text-[--blue] shrink-0" />
                        <span className="text-sm text-[--text-secondary] group-hover:text-[--text-primary]">
                          {ao.opportunity.title}
                        </span>
                      </div>
                      <span className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${statusStyle}`}>
                        {ao.opportunity.status}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* Technologies */}
          {technologies.length > 0 && (
            <div className="rounded-2xl border border-[--border] bg-[--bg-card] p-5 shadow-sm">
              <h2 className="mb-4 text-sm font-semibold text-[--text-secondary] uppercase tracking-wider">
                Technologies ({technologies.length})
              </h2>
              <div className="flex flex-wrap gap-2">
                {technologies.map((at, i) => (
                  <div key={i} className="rounded-lg border border-[--border] bg-[--bg-hover] px-3 py-1.5">
                    <p className="text-xs font-medium text-[--text-primary]">{at.technology.name}</p>
                    {at.technology.category && (
                      <p className="text-xs text-[--text-muted]">{at.technology.category}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Infos chiffrées */}
          <div className="rounded-2xl border border-[--border] bg-[--bg-card] p-5 shadow-sm">
            <h2 className="mb-4 text-sm font-semibold text-[--text-secondary] uppercase tracking-wider">
              Informations
            </h2>
            <div className="space-y-4">
              {app.annualCost != null && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-[--text-muted]">
                    <DollarSign className="h-4 w-4" />
                    Coût annuel
                  </div>
                  <span className="text-sm font-semibold text-[--text-primary]">
                    {new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(app.annualCost)}
                  </span>
                </div>
              )}
              {app.userCount != null && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-[--text-muted]">
                    <Users className="h-4 w-4" />
                    Utilisateurs
                  </div>
                  <span className="text-sm font-semibold text-[--text-primary]">
                    {app.userCount.toLocaleString("fr-FR")}
                  </span>
                </div>
              )}
              {app.deploymentType && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-[--text-muted]">
                    <Server className="h-4 w-4" />
                    Déploiement
                  </div>
                  <span className="text-sm font-semibold text-[--text-primary]">
                    {app.deploymentType}
                  </span>
                </div>
              )}
              {app.url && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[--text-muted]">URL</span>
                  <a
                    href={app.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-[--blue] hover:underline flex items-center gap-1"
                  >
                    Accéder
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Compteurs */}
          <div className="rounded-2xl border border-[--border] bg-[--bg-card] p-5 shadow-sm">
            <h2 className="mb-4 text-sm font-semibold text-[--text-secondary] uppercase tracking-wider">
              Usage
            </h2>
            <div className="space-y-3">
              {[
                { label: "Processus", value: processes.length, icon: Monitor },
                { label: "Capabilities", value: capabilities.length, icon: GitBranch },
                { label: "Use Cases IA", value: opportunities.length, icon: Sparkles },
                { label: "Technologies", value: technologies.length, icon: Building2 },
              ].map(({ label, value, icon: Icon }) => (
                <div key={label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-[--text-muted]">
                    <Icon className="h-4 w-4" />
                    {label}
                  </div>
                  <span className="text-sm font-bold text-[--text-primary]">{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-2">
            <Link
              href={"/app/admin/applications" as Route}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-[--border] bg-[--bg-card] px-4 py-2.5 text-sm font-medium text-[--text-secondary] hover:border-[--green-border] hover:text-[--green] transition-all"
            >
              <Monitor className="h-4 w-4" />
              Lier à un processus
            </Link>
          </div>

          {/* Modernization Advisor (P15) */}
          {(() => {
            let initialAdvice: ModernizationAdvice | null = null;
            try {
              if (app.modernizationAdvice) {
                initialAdvice =
                  typeof app.modernizationAdvice === "string"
                    ? JSON.parse(app.modernizationAdvice)
                    : app.modernizationAdvice;
              }
            } catch { /* ignore parse errors */ }
            return (
              <ModernizationAdvicePanel
                applicationId={app.id}
                initialAdvice={initialAdvice}
              />
            );
          })()}
        </div>
      </div>
    </div>
  );
}
