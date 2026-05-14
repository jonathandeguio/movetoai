import { redirect } from "next/navigation";
import Link from "next/link";
import { AlertTriangle, CheckCircle2, Clock, Shield, Zap, ArrowLeft } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getCurrentWorkspaceContext } from "@/server/auth";
import type { ITRoadmapResult, ITPhase } from "@/lib/claude-it";

export const dynamic = "force-dynamic";

const PHASE_GRADIENTS = [
  "from-cyan-500 to-blue-500",
  "from-blue-500 to-violet-500",
  "from-violet-500 to-purple-500",
];

const PHASE_BADGE_CLASSES = [
  "bg-[--blue-dim] text-[--blue] border-[--blue-border]",
  "bg-[--blue-dim] text-[--blue] border-[--blue-border]",
  "bg-[--purple-dim] text-[--purple] border-[--purple-border]",
];

function PhaseDetail({ phase, index }: { phase: ITPhase; index: number }) {
  const gradient = PHASE_GRADIENTS[index] ?? PHASE_GRADIENTS[0];
  const badgeClass = PHASE_BADGE_CLASSES[index] ?? PHASE_BADGE_CLASSES[0];

  return (
    <div className="overflow-hidden rounded-2xl border border-[--border] bg-[--bg-card]">
      <div className={`h-1.5 w-full bg-gradient-to-r ${gradient}`} />
      <div className="space-y-5 p-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1.5">
            <span
              className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${badgeClass}`}
            >
              Phase {phase.phase}
            </span>
            <h2 className="text-lg font-semibold text-[--text-primary]">
              {phase.title}
            </h2>
          </div>
          <div className="flex shrink-0 items-center gap-1.5 rounded-full bg-[--bg-hover] px-3 py-1.5 text-xs text-[--text-secondary]">
            <Clock className="h-3.5 w-3.5" />
            {phase.duration}
          </div>
        </div>

        {/* Systems involved */}
        {phase.systems_involved.length > 0 && (
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[--text-disabled]">
              Systèmes impliqués
            </p>
            <div className="flex flex-wrap gap-1.5">
              {phase.systems_involved.map((s) => (
                <span
                  key={s}
                  className="rounded-full border border-[--border] bg-[--bg-hover] px-2.5 py-0.5 text-xs font-medium text-[--text-secondary]"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Three columns */}
        <div className="grid gap-5 sm:grid-cols-3">
          {/* Prérequis */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-[--green]" />
              <p className="text-xs font-semibold uppercase tracking-wide text-[--text-muted]">
                Prérequis
              </p>
            </div>
            <ul className="space-y-1.5">
              {phase.prerequisites.map((p) => (
                <li
                  key={p}
                  className="flex items-start gap-1.5 text-sm leading-5 text-[--text-secondary]"
                >
                  <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-[--green]" />
                  {p}
                </li>
              ))}
            </ul>
          </div>

          {/* Risques */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5">
              <AlertTriangle className="h-4 w-4 text-[--amber]" />
              <p className="text-xs font-semibold uppercase tracking-wide text-[--text-muted]">
                Risques
              </p>
            </div>
            <ul className="space-y-1.5">
              {phase.risks.map((r) => (
                <li
                  key={r}
                  className="flex items-start gap-1.5 text-sm leading-5 text-[--text-secondary]"
                >
                  <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-[--amber]" />
                  {r}
                </li>
              ))}
            </ul>
          </div>

          {/* RGPD */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5">
              <Shield className="h-4 w-4 text-[--blue]" />
              <p className="text-xs font-semibold uppercase tracking-wide text-[--text-muted]">
                Vigilance RGPD
              </p>
            </div>
            <ul className="space-y-1.5">
              {phase.rgpd_notes.map((n) => (
                <li
                  key={n}
                  className="flex items-start gap-1.5 text-sm leading-5 text-[--text-secondary]"
                >
                  <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-[--blue]" />
                  {n}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default async function TechArchitecturePage() {
  const { user, workspace } = await getCurrentWorkspaceContext({ requireMembership: true });
  if (!workspace?.id) redirect("/onboarding");

  const prefs = user.preferences as Record<string, unknown> | null;
  const itOnboarding = prefs?.itOnboarding as Record<string, unknown> | null;
  const roadmap = itOnboarding?.roadmap as ITRoadmapResult | null;
  const selectedSystems = Array.isArray(itOnboarding?.selectedSystems)
    ? (itOnboarding.selectedSystems as string[])
    : [];
  const mainConstraint =
    typeof itOnboarding?.mainConstraint === "string" ? itOnboarding.mainConstraint : null;
  const completedAt =
    typeof itOnboarding?.completedAt === "string" ? itOnboarding.completedAt : null;

  if (!roadmap) {
    return (
      <div className="flex flex-col items-center gap-6 py-20 text-center">
        <div className="rounded-2xl border border-[--blue-border] bg-[--blue-dim] p-6">
          <Zap className="mx-auto mb-3 h-8 w-8 text-[--blue]" />
          <p className="text-sm font-semibold text-[--text-primary]">Aucune roadmap générée</p>
          <p className="mt-1 text-sm text-[--text-muted]">
            Complétez la configuration de votre stack pour obtenir votre roadmap personnalisée.
          </p>
        </div>
        <Button asChild className="bg-[--blue] hover:bg-[--blue]">
          <Link href="/onboarding/it-setup">
            Configurer ma stack
          </Link>
        </Button>
      </div>
    );
  }

  const generatedDate = completedAt
    ? new Date(completedAt).toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Badge className="border-[--blue-border] bg-[--blue-dim] text-[--blue]">
            Roadmap IA
          </Badge>
          {generatedDate && (
            <span className="text-xs text-[--text-disabled]">Générée le {generatedDate}</span>
          )}
        </div>
        <h1 className="text-2xl font-semibold tracking-tight text-[--text-primary]">
          Architecture d'intégration IA
        </h1>
        <p className="max-w-2xl text-sm leading-6 text-[--text-muted]">
          {roadmap.summary}
        </p>

        {/* Context badges */}
        <div className="flex flex-wrap gap-2">
          {selectedSystems.slice(0, 6).map((system) => (
            <span
              key={system}
              className="rounded-full border border-[--border] bg-[--bg-hover] px-2.5 py-0.5 text-xs text-[--text-secondary]"
            >
              {system}
            </span>
          ))}
          {selectedSystems.length > 6 && (
            <span className="rounded-full border border-[--border] bg-[--bg-hover] px-2.5 py-0.5 text-xs text-[--text-muted]">
              +{selectedSystems.length - 6} autres
            </span>
          )}
        </div>
      </div>

      {/* Priority action */}
      <div className="flex items-start gap-3 rounded-2xl border border-[--blue-border] bg-[--blue-dim] p-5">
        <Zap className="mt-0.5 h-5 w-5 shrink-0 text-[--blue]" />
        <div>
          <p className="text-sm font-semibold text-[--blue]">
            Action prioritaire recommandée
          </p>
          <p className="mt-1 text-sm text-[--blue]">
            {roadmap.priority_recommendation}
          </p>
        </div>
      </div>

      {/* Constraint reminder */}
      {mainConstraint && (
        <div className="flex items-center gap-3 rounded-xl border border-[--amber-border] bg-[--amber-dim] px-4 py-3">
          <AlertTriangle className="h-4 w-4 shrink-0 text-[--amber]" />
          <p className="text-sm text-[--amber]">
            <span className="font-semibold">Contrainte principale : </span>
            {mainConstraint}
          </p>
        </div>
      )}

      {/* Timeline connector + phases */}
      <div className="relative space-y-6">
        {/* Vertical connector */}
        <div className="absolute left-6 top-10 hidden h-[calc(100%-60px)] w-px bg-gradient-to-b from-cyan-300 via-blue-300 to-violet-300 sm:block" />

        {roadmap.phases.map((phase, index) => (
          <div key={phase.phase} className="relative flex gap-4 sm:pl-14">
            {/* Phase dot */}
            <div
              className={`absolute left-3.5 top-6 hidden h-5 w-5 rounded-full border-2 border-white bg-gradient-to-br shadow-md sm:flex items-center justify-center text-[10px] font-bold text-white ${PHASE_GRADIENTS[index] ?? PHASE_GRADIENTS[0]}`}
            >
              {phase.phase}
            </div>
            <div className="w-full">
              <PhaseDetail phase={phase} index={index} />
            </div>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="flex flex-col gap-3 pt-2 sm:flex-row">
        <Button asChild size="lg" className="flex-1 bg-[--blue] hover:bg-[--blue]">
          <Link href="/app/dashboard/tech/integrations">
            Configurer les intégrations →
          </Link>
        </Button>
        <Button asChild variant="outline" size="lg" className="flex-1">
          <Link href="/app/dashboard/tech">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Dashboard technique
          </Link>
        </Button>
      </div>
    </div>
  );
}
