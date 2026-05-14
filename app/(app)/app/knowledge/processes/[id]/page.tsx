import type { Route } from "next";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, GitBranch, Clock, TrendingUp, Zap,
  User, Building2, Layers, CheckCircle2, XCircle,
} from "lucide-react";

import { requirePermission } from "@/server/permissions";
import { processRepo }        from "@/lib/repositories/process.repo";

export const dynamic = "force-dynamic";

// ── Helpers ───────────────────────────────────────────────────────────────────

function StatCard({ label, value, unit }: { label: string; value: string | number | null; unit?: string }) {
  if (value == null) return null;
  return (
    <div className="rounded-xl border border-[--border] bg-[--bg-card] px-4 py-3">
      <p className="text-xs text-[--text-muted] mb-0.5">{label}</p>
      <p className="text-xl font-bold text-[--text-primary]">
        {value}
        {unit && <span className="text-sm font-normal text-[--text-muted] ml-1">{unit}</span>}
      </p>
    </div>
  );
}

const PAIN_COLOR = ["", "var(--green)", "var(--green)", "var(--amber)", "var(--amber)", "var(--red)"];
const AI_POT_STYLES: Record<string, string> = {
  high:   "bg-[--green-dim] text-[--green] border-[--green-border]",
  medium: "bg-[--amber-dim] text-[--amber] border-[--amber-border]",
  low:    "bg-[--bg-hover]  text-[--text-muted] border-[--border]",
};

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function KnowledgeProcessDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { workspace } = await requirePermission("business-structure.manage");
  if (!workspace?.id) redirect("/onboarding");

  const process = await processRepo.findByIdForDetail(id, workspace.id).catch(() => null);

  if (!process) notFound();

  const aiPotKey  = process.aiPotential?.toLowerCase() ?? "";
  const hasDiagram = !!process.diagram;

  return (
    <div className="space-y-6">
      {/* Back */}
      <Link
        href={"/app/knowledge/processes" as Route}
        className="inline-flex items-center gap-1.5 text-sm text-[--text-muted] hover:text-[--text-primary] transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour aux processus
      </Link>

      {/* Header card */}
      <div className="rounded-2xl border border-[--border] bg-[--bg-card] p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            {/* Domain + AI potential badges */}
            <div className="flex flex-wrap items-center gap-2 mb-2">
              {process.domain?.name && (
                <span className="inline-flex items-center gap-1 rounded-full border border-[--border] bg-[--bg-hover] px-2.5 py-0.5 text-xs text-[--text-muted]">
                  <Layers className="h-3 w-3" />
                  {process.domain.name}
                </span>
              )}
              {process.aiPotential && (
                <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize ${AI_POT_STYLES[aiPotKey] ?? AI_POT_STYLES.low}`}>
                  Potentiel IA : {process.aiPotential}
                </span>
              )}
            </div>

            <h1 className="text-3xl font-bold text-[--text-primary] tracking-tight">
              {process.name}
            </h1>

            {process.description && (
              <p className="mt-3 text-sm text-[--text-secondary] leading-relaxed max-w-2xl">
                {process.description}
              </p>
            )}
          </div>

          {/* Modeler CTA */}
          <div className="flex flex-col items-end gap-2">
            <Link
              href={`/app/knowledge/processes/${id}/modeler` as Route}
              className="inline-flex items-center gap-2 rounded-xl border border-[--green-border] bg-[--green-dim] px-4 py-2.5 text-sm font-semibold text-[--green] hover:bg-[--green] hover:text-black transition-all shadow-sm"
            >
              <GitBranch className="h-4 w-4" />
              Modéliser ce processus
            </Link>
            {hasDiagram ? (
              <span className="text-xs text-[--text-muted]">
                v{process.diagram!.versionCount} · modifié le{" "}
                {new Date(process.diagram!.updatedAt).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" })}
              </span>
            ) : (
              <span className="text-xs text-[--text-disabled]">Aucun diagramme</span>
            )}
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Fréquence" value={process.frequency} />
        <StatCard label="Effort manuel" value={process.manualEffortH} unit="h/sem." />
        <StatCard label="Taux d'automatisation" value={process.automationRate != null ? `${process.automationRate}%` : null} />
        {process.painLevel != null && (
          <div className="rounded-xl border border-[--border] bg-[--bg-card] px-4 py-3">
            <p className="text-xs text-[--text-muted] mb-0.5">Niveau de douleur</p>
            <div className="flex gap-0.5 mt-1">
              {[1, 2, 3, 4, 5].map(n => (
                <span
                  key={n}
                  style={{ color: n <= (process.painLevel ?? 0) ? PAIN_COLOR[process.painLevel ?? 0] : "var(--border)" }}
                  className="text-lg leading-none"
                >★</span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Meta info */}
      <div className="rounded-2xl border border-[--border] bg-[--bg-card] p-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {process.owner && (
          <div className="flex items-center gap-2.5">
            <User className="h-4 w-4 text-[--text-muted] shrink-0" />
            <div>
              <p className="text-xs text-[--text-muted]">Propriétaire</p>
              <p className="text-sm font-medium text-[--text-secondary]">{process.owner.name ?? process.owner.email}</p>
            </div>
          </div>
        )}
        {process.capability && (
          <div className="flex items-center gap-2.5">
            <Zap className="h-4 w-4 text-[--text-muted] shrink-0" />
            <div>
              <p className="text-xs text-[--text-muted]">Capacité</p>
              <p className="text-sm font-medium text-[--text-secondary]">{process.capability.name}</p>
            </div>
          </div>
        )}
        {process.businessUnit && (
          <div className="flex items-center gap-2.5">
            <Building2 className="h-4 w-4 text-[--text-muted] shrink-0" />
            <div>
              <p className="text-xs text-[--text-muted]">Unité</p>
              <p className="text-sm font-medium text-[--text-secondary]">{process.businessUnit.name}</p>
            </div>
          </div>
        )}
      </div>

      {/* Steps table */}
      {process.steps.length > 0 && (
        <div className="rounded-2xl border border-[--border] bg-[--bg-card] overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-[--border]">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-[--green]" />
              <span className="text-sm font-semibold text-[--text-primary]">
                Étapes du processus
              </span>
            </div>
            <span className="text-xs text-[--text-muted]">{process._count.steps} étapes</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[--border] bg-[--bg-hover]">
                  <th className="px-4 py-2 text-left text-xs font-semibold text-[--text-muted]">#</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-[--text-muted]">Étape</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-[--text-muted]">Acteur</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-[--text-muted]">Durée</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-[--text-muted]">Auto.</th>
                </tr>
              </thead>
              <tbody>
                {process.steps.map((step) => (
                  <tr key={step.id} className="border-b border-[--border] hover:bg-[--bg-hover] transition-colors">
                    <td className="px-4 py-2.5">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[--green-dim] text-xs font-semibold text-[--green]">
                        {step.order}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 font-medium text-[--text-primary]">{step.name}</td>
                    <td className="px-4 py-2.5 text-[--text-muted]">{step.actor}</td>
                    <td className="px-4 py-2.5 text-[--text-muted]">
                      {step.durationMin != null ? `${step.durationMin} min` : "—"}
                    </td>
                    <td className="px-4 py-2.5">
                      {step.automatable
                        ? <CheckCircle2 className="h-4 w-4 text-[--green]" />
                        : <XCircle    className="h-4 w-4 text-[--text-disabled]" />}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Linked opportunities */}
      {process.opportunities.length > 0 && (
        <div className="rounded-2xl border border-[--border] bg-[--bg-card] overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-[--border]">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-[--green]" />
              <span className="text-sm font-semibold text-[--text-primary]">Opportunités IA liées</span>
            </div>
            <span className="text-xs text-[--text-muted]">{process._count.opportunities} total</span>
          </div>
          <ul className="divide-y divide-[--border]">
            {process.opportunities.map((opp) => (
              <li key={opp.id}>
                <Link
                  href={`/app/opportunities/${opp.id}` as Route}
                  className="flex items-center justify-between px-5 py-3 hover:bg-[--bg-hover] transition-colors"
                >
                  <span className="text-sm text-[--text-secondary]">{opp.title}</span>
                  <span className="text-xs rounded-full border border-[--border] bg-[--bg-hover] px-2 py-0.5 text-[--text-muted] capitalize">
                    {opp.status}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
