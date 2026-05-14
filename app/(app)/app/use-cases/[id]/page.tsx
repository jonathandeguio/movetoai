"use client";

import { useEffect, useState, useTransition } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import type { Route } from "next";
import dynamic from "next/dynamic";
import {
  ArrowLeft,
  Sparkles,
  Loader2,
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  Clock,
  Euro,
  TrendingUp,
  CheckCircle,
  Zap,
  ShieldAlert,
  ListChecks,
  GitBranch,
  FileDown,
} from "lucide-react";

import { ProcessModelerSkeleton } from "@/components/use-cases/ProcessModelerSkeleton";

const ProcessModeler = dynamic(
  () => import("@/components/use-cases/ProcessModeler"),
  { ssr: false, loading: () => <ProcessModelerSkeleton /> }
);

import { generateSummary } from "@/app/actions/generateSummary";
import { UseCaseEditForm } from "@/components/use-cases/UseCaseEditForm";
import { KPITable, type KPI } from "@/components/use-cases/KPITable";
import { ROICard, type ROIData } from "@/components/use-cases/ROICard";
import { RiskTable, type Risk } from "@/components/use-cases/RiskTable";
import { UseCaseStatusBadge } from "@/components/shared/status-badge";
import { PriorityBadge } from "@/components/shared/priority-badge";
import { DomainBadge } from "@/components/shared/domain-badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// ── Types ────────────────────────────────────────────────────────────────────

type UseCase = {
  id: string;
  title: string;
  solutionType: string | null;
  solutionDescription: string | null;
  processDescription: string | null;
  expectedOutcome: string | null;
  processSteps: string[];
  kpis: KPI[];
  roiEstimated: ROIData;
  effortDays: number | null;
  effortBreakdown: Record<string, number> | null;
  dataRequired: string[];
  risks: Risk[];
  recommendedTools: string[];
  nextSteps: string[];
  priorityLevel: string | null;
  status: string;
  constraints: string | null;
  createdAt: string;
  updatedAt: string;
  opportunity: {
    id: string;
    title: string;
    domainLabel: string | null;
    gainEstimate: string | null;
    status: string;
  } | null;
};

const SOLUTION_COLORS: Record<string, string> = {
  automation: "bg-[--blue-dim] text-[--blue] border-[--blue-border]",
  assistant:  "bg-[--purple-dim] text-[--purple] border-[--purple-border]",
  analysis:   "bg-[--amber-dim] text-[--amber] border-[--amber-border]",
  generation: "bg-[--green-dim] text-[--green] border-[--green-border]",
};

const STATUS_TRANSITIONS: Record<string, { label: string; next: string }[]> = {
  backlog:  [{ label: "Passer en analyse", next: "analysis" }],
  analysis: [{ label: "Activer le cas", next: "active" }],
  active:   [{ label: "Marquer déployé", next: "deployed" }, { label: "Mettre en pause", next: "paused" }],
  paused:   [{ label: "Réactiver", next: "active" }],
  deployed: [],
};

// ── Section wrapper ───────────────────────────────────────────────────────────

function Section({
  icon: Icon,
  title,
  children,
  defaultOpen = true,
}: {
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-2xl border border-[--border] bg-[--bg-card]">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between px-6 py-4 text-left"
      >
        <div className="flex items-center gap-2.5">
          <Icon className="h-4 w-4 text-[--green]" />
          <span className="text-sm font-semibold text-[--text-primary]">{title}</span>
        </div>
        {open ? <ChevronDown className="h-4 w-4 text-[--text-muted]" /> : <ChevronRight className="h-4 w-4 text-[--text-muted]" />}
      </button>
      {open && <div className="border-t border-[--border] px-6 pb-6 pt-4">{children}</div>}
    </div>
  );
}

// ── AI Summary panel ──────────────────────────────────────────────────────────

function SummaryPanel({ useCaseId }: { useCaseId: string }) {
  const [markdown, setMarkdown] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function generate() {
    setError(null);
    startTransition(async () => {
      const result = await generateSummary(useCaseId);
      if (result.ok) setMarkdown(result.markdown);
      else setError(result.error);
    });
  }

  return (
    <div className="rounded-2xl border border-[--green-border] bg-[--green-dim] p-5">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-[--green]" />
          <span className="text-sm font-semibold text-[--green]">Résumé exécutif IA</span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={generate}
          disabled={isPending}
          className="gap-1.5 border-[--green-border] text-[--green] hover:bg-[--green-dim]"
        >
          {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
          {markdown ? "Régénérer" : "Générer le résumé"}
        </Button>
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-xl border border-[--red-dim] bg-[--red-dim] p-3 text-xs text-[--red]">
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          {error}
        </div>
      )}

      {!markdown && !isPending && !error && (
        <p className="text-xs text-[--text-muted]">
          Cliquez sur "Générer" pour produire un résumé exécutif (contexte, solution, ROI, risques, go/no-go).
        </p>
      )}

      {isPending && (
        <div className="flex items-center gap-2 text-xs text-[--text-muted]">
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          Génération en cours…
        </div>
      )}

      {markdown && (
        <div className="prose prose-sm max-w-none text-[--text-secondary]">
          {markdown.split("\n").map((line, i) => {
            if (line.startsWith("## ")) return <h3 key={i} className="mt-4 mb-1.5 text-sm font-semibold text-[--text-primary]">{line.slice(3)}</h3>;
            if (line.startsWith("# ")) return <h2 key={i} className="mt-3 mb-1 text-base font-bold text-[--text-primary]">{line.slice(2)}</h2>;
            if (line.startsWith("- ")) return <li key={i} className="ml-4 text-xs leading-5">{line.slice(2)}</li>;
            if (line.startsWith("**") && line.endsWith("**")) return <p key={i} className="mt-1 text-xs font-semibold">{line.slice(2, -2)}</p>;
            if (line.trim() === "") return <div key={i} className="h-1" />;
            return <p key={i} className="text-xs leading-5">{line}</p>;
          })}
        </div>
      )}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function UseCaseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [useCase,         setUseCase]         = useState<UseCase | null>(null);
  const [loading,         setLoading]         = useState(true);
  const [error,           setError]           = useState<string | null>(null);
  const [updating,        setUpdating]        = useState(false);
  const [diagramVersion,  setDiagramVersion]  = useState(0);

  useEffect(() => {
    fetch(`/api/use-cases/${id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) setError(data.error);
        else setUseCase(data as UseCase);
      })
      .catch(() => setError("Erreur réseau"))
      .finally(() => setLoading(false));
  }, [id]);

  async function patchStatus(next: string) {
    if (!useCase) return;
    setUpdating(true);
    try {
      const res = await fetch(`/api/use-cases/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      if (res.ok) {
        const updated = await res.json();
        setUseCase((prev) => prev ? { ...prev, status: updated.status } : prev);
      }
    } finally {
      setUpdating(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-[--green]" />
      </div>
    );
  }

  if (error || !useCase) {
    return (
      <div className="rounded-2xl border border-[--red-dim] bg-[--red-dim] px-6 py-12 text-center">
        <AlertTriangle className="mx-auto mb-3 h-8 w-8 text-[--red]" />
        <p className="text-sm font-medium text-[--red]">{error ?? "Cas d'usage introuvable"}</p>
        <Link href={"/app/use-cases" as Route} className="mt-4 inline-block text-xs text-[--red] underline">
          Retour aux cas d'usage
        </Link>
      </div>
    );
  }

  const roi = useCase.roiEstimated ?? { savings_hours_per_month: 0, savings_euros_per_year: 0, payback_months: 0, assumptions: "" };
  const transitions = STATUS_TRANSITIONS[useCase.status] ?? [];

  return (
    <div className="space-y-6">
      {/* Back + header */}
      <div className="flex items-start gap-4">
        <Link
          href={"/app/use-cases" as Route}
          className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[--border] bg-[--bg-card] text-[--text-muted] hover:text-[--text-secondary] transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            {useCase.opportunity?.domainLabel && (
              <DomainBadge domain={useCase.opportunity.domainLabel} />
            )}
            {useCase.priorityLevel && (
              <PriorityBadge priority={useCase.priorityLevel as "P0" | "P1" | "P2"} />
            )}
            <UseCaseStatusBadge status={useCase.status} />
            {useCase.solutionType && (
              <span className={cn("rounded-full border px-2 py-0.5 text-xs font-medium", SOLUTION_COLORS[useCase.solutionType] ?? "bg-[--bg-hover] text-[--text-secondary]")}>
                {useCase.solutionType}
              </span>
            )}
          </div>
          <h1 className="text-xl font-semibold text-[--text-primary]">{useCase.title}</h1>
          {useCase.opportunity && (
            <p className="mt-0.5 text-xs text-[--text-muted]">
              Issu de :{" "}
              <Link href={`/app/opportunities/${useCase.opportunity.id}` as Route} className="underline hover:text-[--green]">
                {useCase.opportunity.title}
              </Link>
            </p>
          )}
        </div>

        {/* Status transitions + Export PDF */}
        <div className="flex flex-wrap gap-2">
          {transitions.map((t) => (
            <Button
              key={t.next}
              variant="outline"
              size="sm"
              onClick={() => patchStatus(t.next)}
              disabled={updating}
              className="gap-1.5"
            >
              {updating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
              {t.label}
            </Button>
          ))}
          <a
            href={`/api/use-cases/${id}/export/pdf`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg border border-[--border] bg-[--bg-card] px-3 py-1.5 text-xs font-medium text-[--text-secondary] hover:border-[--green-border] hover:text-[--green] transition-all"
          >
            <FileDown className="h-3.5 w-3.5" />
            Exporter PDF
          </a>
        </div>
      </div>

      {/* Inline edit form */}
      <div>
        <UseCaseEditForm
          useCaseId={useCase.id}
          initialTitle={useCase.title}
          initialSolutionDescription={useCase.solutionDescription}
          initialEffortDays={useCase.effortDays}
          initialConstraints={useCase.constraints}
          initialPriorityLevel={useCase.priorityLevel}
          onSaved={() => {
            fetch(`/api/use-cases/${id}`)
              .then((r) => r.json())
              .then((data: UseCase & { error?: string }) => { if (!data.error) setUseCase(data); });
          }}
        />
      </div>

      {/* AI Summary */}
      <SummaryPanel useCaseId={useCase.id} />

      {/* ROI */}
      <Section icon={Euro} title="Retour sur investissement">
        <ROICard roi={roi} readOnly />
      </Section>

      {/* Solution */}
      <Section icon={Zap} title="Solution IA">
        <div className="space-y-4 text-sm">
          {useCase.solutionDescription && (
            <div>
              <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-[--text-muted]">Description</p>
              <p className="leading-6 text-[--text-secondary]">{useCase.solutionDescription}</p>
            </div>
          )}
          {useCase.processSteps?.length > 0 && (
            <div>
              <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-[--text-muted]">Étapes du processus</p>
              <ol className="space-y-1.5">
                {(useCase.processSteps as string[]).map((step, i) => (
                  <li key={i} className="flex gap-2 text-sm">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[--green-dim] text-xs font-semibold text-[--green]">{i + 1}</span>
                    <span className="text-[--text-secondary]">{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}
          {useCase.recommendedTools?.length > 0 && (
            <div>
              <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-[--text-muted]">Outils recommandés</p>
              <div className="flex flex-wrap gap-1.5">
                {(useCase.recommendedTools as string[]).map((tool, i) => (
                  <span key={i} className="rounded-full bg-[--bg-hover] px-2.5 py-0.5 text-xs text-[--text-secondary]">{tool}</span>
                ))}
              </div>
            </div>
          )}
          {useCase.effortDays != null && (
            <div className="flex items-center gap-2">
              <Clock className="h-3.5 w-3.5 text-[--text-muted]" />
              <span className="text-xs text-[--text-secondary]">Effort estimé : <strong>{useCase.effortDays} jours</strong></span>
            </div>
          )}
          {useCase.constraints && (
            <div className="rounded-xl border border-[--amber-border] bg-[--amber-dim] p-3">
              <p className="text-xs font-semibold text-[--amber]">Contraintes</p>
              <p className="mt-1 text-xs text-[--amber]">{useCase.constraints}</p>
            </div>
          )}
        </div>
      </Section>

      {/* KPIs */}
      <Section icon={TrendingUp} title="KPIs">
        <KPITable kpis={(useCase.kpis as KPI[]) ?? []} onChange={() => {}} readOnly />
      </Section>

      {/* Risks */}
      <Section icon={ShieldAlert} title="Risques">
        <RiskTable risks={(useCase.risks as Risk[]) ?? []} onChange={() => {}} readOnly />
      </Section>

      {/* Data required */}
      {useCase.dataRequired?.length > 0 && (
        <Section icon={ListChecks} title="Données requises" defaultOpen={false}>
          <ul className="space-y-1.5">
            {(useCase.dataRequired as string[]).map((d, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-[--text-secondary]">
                <CheckCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[--green]" />
                {d}
              </li>
            ))}
          </ul>
        </Section>
      )}

      {/* Next steps */}
      {useCase.nextSteps?.length > 0 && (
        <Section icon={ListChecks} title="Prochaines étapes" defaultOpen={false}>
          <ol className="space-y-1.5">
            {(useCase.nextSteps as string[]).map((step, i) => (
              <li key={i} className="flex gap-2 text-sm">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[--green-dim] text-xs font-semibold text-[--green]">{i + 1}</span>
                <span className="text-[--text-secondary]">{step}</span>
              </li>
            ))}
          </ol>
        </Section>
      )}

      {/* BPMN Process Modeler */}
      <Section icon={GitBranch} title="Modélisation BPMN du processus" defaultOpen={false}>
        <div
          style={{
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 12,
            overflow: "hidden",
            height: 600,
          }}
        >
          <ProcessModeler
            useCaseId={useCase.id}
            useCase={{
              title:         useCase.title,
              kpis:          useCase.kpis as import("@/components/use-cases/ProcessContextPanel").KPI[],
              dataRequired:  useCase.dataRequired as string[],
            }}
            onSave={(v) => setDiagramVersion(v)}
          />
        </div>
      </Section>
    </div>
  );
}
