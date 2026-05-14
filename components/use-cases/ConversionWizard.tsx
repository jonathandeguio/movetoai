"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Route } from "next";
import { Loader2, Sparkles, ChevronDown, ChevronRight, AlertCircle, CheckCircle2, Plus, X } from "lucide-react";

import { generateUseCase, type GeneratedUseCase } from "@/app/actions/generateUseCase";
import { KPITable, type KPI } from "@/components/use-cases/KPITable";
import { ROICard, type ROIData } from "@/components/use-cases/ROICard";
import { RiskTable, type Risk } from "@/components/use-cases/RiskTable";
import { DomainBadge } from "@/components/shared/domain-badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

// ── Types ─────────────────────────────────────────────────────────────────────

type Step = 1 | 2 | 3;

const DATA_OPTIONS = [
  "Fichiers Excel/CSV", "Base de données SQL", "API tierce (CRM, ERP…)",
  "Emails", "Documents PDF", "Formulaires web",
];

const SOLUTION_TYPES = [
  { value: "automation", label: "Automatisation", desc: "Exécution automatique d'un processus répétitif" },
  { value: "assistant",  label: "Assistant IA",   desc: "Aide à la décision et suggestions contextuelles" },
  { value: "analysis",   label: "Analyse",         desc: "Extraction d'insights depuis des données brutes" },
  { value: "generation", label: "Génération",      desc: "Création de contenu (emails, rapports, code…)" },
] as const;

interface OpportunitySummary {
  id: string;
  title: string;
  domainLabel?: string | null;
  gainEstimate?: string | null;
}

interface ConversionWizardProps {
  opportunity: OpportunitySummary;
}

// ── Step indicator ────────────────────────────────────────────────────────────

function StepIndicator({ current }: { current: Step }) {
  const steps = [
    { n: 1 as Step, label: "Contexte" },
    { n: 2 as Step, label: "Révision" },
    { n: 3 as Step, label: "Soumission" },
  ];
  return (
    <div className="flex items-center gap-0">
      {steps.map(({ n, label }, i) => (
        <div key={n} className="flex items-center">
          <div className="flex flex-col items-center">
            <div className={cn(
              "flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm font-bold transition",
              current === n ? "border-[--green] bg-[--green] text-[--on-green]" :
              current > n ? "border-[--green] bg-[--green] text-[--on-green]" :
              "border-[--border-strong] bg-[--bg-card] text-[--text-muted]"
            )}>
              {current > n ? <CheckCircle2 className="h-4 w-4" /> : n}
            </div>
            <span className={cn("mt-1 text-xs font-medium", current === n ? "text-[--green]" : "text-[--text-muted]")}>{label}</span>
          </div>
          {i < steps.length - 1 && (
            <div className={cn("mb-5 h-px w-20 transition", current > n ? "bg-[--green]" : "bg-[--border]")} />
          )}
        </div>
      ))}
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

export function ConversionWizard({ opportunity }: ConversionWizardProps) {
  const router = useRouter();

  // Step 1 form state
  const [processDescription, setProcessDescription] = useState("");
  const [selectedData, setSelectedData] = useState<string[]>([]);
  const [customData, setCustomData] = useState("");
  const [expectedOutcome, setExpectedOutcome] = useState("");
  const [constraints, setConstraints] = useState("");
  const [oppExpanded, setOppExpanded] = useState(false);

  // Step 2 state — generated + editable use case
  const [generatedUC, setGeneratedUC] = useState<GeneratedUseCase | null>(null);
  const [kpis, setKpis] = useState<KPI[]>([]);
  const [roi, setRoi] = useState<ROIData>({ savings_hours_per_month: 0, savings_euros_per_year: 0, payback_months: 0, assumptions: "" });
  const [risks, setRisks] = useState<Risk[]>([]);
  const [solutionType, setSolutionType] = useState<GeneratedUseCase["solution_type"]>("automation");
  const [solutionDesc, setSolutionDesc] = useState("");
  const [processSteps, setProcessSteps] = useState<string[]>([]);
  const [tools, setTools] = useState<string[]>([]);
  const [nextSteps, setNextSteps] = useState<string[]>([]);
  const [effortDays, setEffortDays] = useState(10);

  // Global state
  const [step, setStep] = useState<Step>(1);
  const [aiError, setAiError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isGenerating, startGenerate] = useTransition();
  const [isSubmitting, startSubmit] = useTransition();

  // ── Step 1 → Generate ──────────────────────────────────────────────────────

  function handleGenerate() {
    setAiError(null);
    const dataAvailable = [...selectedData, ...(customData.trim() ? [`Autre : ${customData}`] : [])];

    startGenerate(async () => {
      const result = await generateUseCase({
        opportunityId: opportunity.id,
        processDescription,
        dataAvailable,
        expectedOutcome,
        constraints,
      });

      if (!result.ok) {
        setAiError(result.error);
        return;
      }

      const d = result.data;
      setGeneratedUC(d);
      setKpis(d.kpis as KPI[]);
      setRoi(d.roi_estimated as ROIData);
      setRisks(d.risks as Risk[]);
      setSolutionType(d.solution_type);
      setSolutionDesc(d.solution_description);
      setProcessSteps(d.process_steps);
      setTools(d.recommended_tools);
      setNextSteps(d.next_steps);
      setEffortDays(d.effort_days);
      setStep(2);
    });
  }

  // ── Step 2 → Submit ────────────────────────────────────────────────────────

  function handleSubmit(submitForValidation: boolean) {
    setSubmitError(null);
    startSubmit(async () => {
      const dataAvailable = [...selectedData, ...(customData.trim() ? [`Autre : ${customData}`] : [])];

      const payload = {
        title: generatedUC?.title ?? `Use case — ${opportunity.title}`,
        processDescription,
        expectedOutcome,
        solutionType,
        solutionDescription: solutionDesc,
        processSteps,
        kpis,
        roiEstimated: roi,
        effortDays,
        dataRequired: dataAvailable.map((src) => ({ source: src, type: "Manuel", available: true })),
        risks,
        recommendedTools: tools,
        nextSteps,
        priorityLevel: "P2",
        constraints,
        submitForValidation,
      };

      const res = await fetch(`/api/opportunities/${opportunity.id}/convert`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        setSubmitError(err.error ?? "Erreur lors de la création");
        return;
      }

      const { id: useCaseId } = await res.json();
      router.push(`/app/use-cases/${useCaseId}` as Route);
    });
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-8">
      {/* Step indicator */}
      <div className="flex justify-center">
        <StepIndicator current={step} />
      </div>

      {/* ── Step 1 — Context ── */}
      {step === 1 && (
        <div className="space-y-6">
          {/* Opportunity reminder — collapsible */}
          <div className="rounded-2xl border border-[--green-border] bg-[--green-dim]">
            <button
              type="button"
              onClick={() => setOppExpanded((s) => !s)}
              className="flex w-full items-center justify-between px-5 py-4"
            >
              <div className="flex items-center gap-3">
                <DomainBadge domain={opportunity.domainLabel} />
                <span className="font-semibold text-[--text-primary]">{opportunity.title}</span>
                {opportunity.gainEstimate && (
                  <span className="text-sm text-[--text-muted]">{opportunity.gainEstimate}</span>
                )}
              </div>
              {oppExpanded ? <ChevronDown className="h-4 w-4 text-[--text-muted]" /> : <ChevronRight className="h-4 w-4 text-[--text-muted]" />}
            </button>
          </div>

          {/* Process description */}
          <div className="space-y-1.5">
            <Label htmlFor="process">Description du processus actuel <span className="text-[--red]">*</span></Label>
            <Textarea
              id="process"
              value={processDescription}
              onChange={(e) => setProcessDescription(e.target.value)}
              placeholder="Décrivez comment ce processus est réalisé aujourd'hui, étape par étape, avec les outils utilisés…"
              className="min-h-[140px] resize-none"
            />
          </div>

          {/* Data sources */}
          <div className="space-y-3">
            <Label>Données disponibles <span className="text-[--red]">*</span></Label>
            <div className="flex flex-wrap gap-2">
              {DATA_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setSelectedData((s) => s.includes(opt) ? s.filter((x) => x !== opt) : [...s, opt])}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-sm font-medium transition",
                    selectedData.includes(opt)
                      ? "border-[--green-border] bg-[--green-dim] text-[--green]"
                      : "border-[--border] text-[--text-secondary] hover:border-[--border-strong]"
                  )}
                >
                  {selectedData.includes(opt) ? "✓ " : ""}{opt}
                </button>
              ))}
            </div>
            <input
              type="text"
              value={customData}
              onChange={(e) => setCustomData(e.target.value)}
              placeholder="Autre : précisez…"
              className="w-full rounded-xl border border-[--border] bg-[--bg-input] px-3 py-2 text-sm text-[--text-primary] focus:outline-none focus:ring-2 focus:ring-[--green-dim]"
            />
          </div>

          {/* Expected outcome */}
          <div className="space-y-1.5">
            <Label htmlFor="outcome">Résultat attendu <span className="text-[--red]">*</span></Label>
            <Textarea
              id="outcome"
              value={expectedOutcome}
              onChange={(e) => setExpectedOutcome(e.target.value)}
              placeholder="À la fin, qu'est-ce qui doit se passer différemment ?"
              className="min-h-[100px] resize-none"
            />
          </div>

          {/* Constraints */}
          <div className="space-y-1.5">
            <Label htmlFor="constraints">Contraintes spécifiques <span className="text-[--text-muted]">(optionnel)</span></Label>
            <Textarea
              id="constraints"
              value={constraints}
              onChange={(e) => setConstraints(e.target.value)}
              placeholder="Ex : Doit s'intégrer avec Salesforce, données RGPD sensibles, budget limité à 20k€…"
              className="min-h-[80px] resize-none"
            />
          </div>

          {aiError && (
            <p role="alert" className="flex items-start gap-2 rounded-xl border border-[--red-dim] bg-[--red-dim] px-4 py-3 text-sm text-[--red]">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              {aiError}
            </p>
          )}

          {isGenerating ? (
            <div className="flex flex-col items-center gap-4 rounded-2xl border border-[--green-border] bg-[--green-dim] py-10">
              <Loader2 className="h-8 w-8 animate-spin text-[--green]" />
              <p className="text-sm font-semibold text-[--text-primary]">Génération de la fiche use case…</p>
              <p className="text-xs text-[--text-muted]">Claude analyse votre processus et génère les KPIs, ROI, risques (max 30s)</p>
              <div className="w-64 space-y-2">
                {[90, 70, 80].map((w, i) => (
                  <div key={i} className="h-2.5 animate-pulse rounded-full bg-[--bg-hover]" style={{ width: `${w}%` }} />
                ))}
              </div>
            </div>
          ) : (
            <Button
              onClick={handleGenerate}
              disabled={processDescription.length < 20 || expectedOutcome.length < 10 || (selectedData.length === 0 && !customData.trim())}
              className="w-full gap-2"
              size="lg"
            >
              <Sparkles className="h-4 w-4" />
              Générer la fiche use case avec l'IA →
            </Button>
          )}
        </div>
      )}

      {/* ── Step 2 — Review ── */}
      {step === 2 && (
        <div className="space-y-8">
          {/* Section A — Solution */}
          <section className="space-y-4 rounded-2xl border border-[--border] bg-[--bg-card] p-6">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-[--text-muted]">A — Description de la solution</h3>

            {/* Solution type */}
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {SOLUTION_TYPES.map(({ value, label, desc }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setSolutionType(value)}
                  className={cn(
                    "rounded-xl border p-3 text-left transition",
                    solutionType === value ? "border-[--green-border] bg-[--green-dim]" : "border-[--border] hover:border-[--border-strong]"
                  )}
                >
                  <p className={cn("text-sm font-semibold", solutionType === value ? "text-[--green]" : "text-[--text-primary]")}>{label}</p>
                  <p className="mt-0.5 text-xs text-[--text-muted]">{desc}</p>
                </button>
              ))}
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <Label>Description de la solution</Label>
              <Textarea value={solutionDesc} onChange={(e) => setSolutionDesc(e.target.value)} className="min-h-[100px] resize-none text-sm" />
            </div>

            {/* Process steps */}
            <div className="space-y-2">
              <Label>Étapes automatisées</Label>
              <ol className="space-y-2">
                {processSteps.map((step, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[--green-dim] text-xs font-bold text-[--green]">{i + 1}</span>
                    <input
                      value={step}
                      onChange={(e) => setProcessSteps(processSteps.map((s, j) => j === i ? e.target.value : s))}
                      className="flex-1 rounded-lg border border-[--border] bg-[--bg-input] px-3 py-1.5 text-sm text-[--text-primary] focus:outline-none focus:ring-2 focus:ring-[--green-dim]"
                    />
                    <button onClick={() => setProcessSteps(processSteps.filter((_, j) => j !== i))} className="text-[--text-muted] hover:text-[--red]">
                      <X className="h-4 w-4" />
                    </button>
                  </li>
                ))}
              </ol>
              <button
                onClick={() => setProcessSteps([...processSteps, ""])}
                className="flex items-center gap-1.5 text-sm text-[--green] hover:text-[--green]"
              >
                <Plus className="h-4 w-4" /> Ajouter une étape
              </button>
            </div>
          </section>

          {/* Section B — KPIs & ROI */}
          <section className="space-y-4 rounded-2xl border border-[--border] bg-[--bg-card] p-6">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-[--text-muted]">B — KPIs et ROI</h3>
            <KPITable kpis={kpis} onChange={setKpis} />
            <div className="mt-4">
              <p className="mb-3 text-sm font-medium text-[--text-secondary]">Retour sur investissement</p>
              <ROICard roi={roi} onChange={setRoi} />
            </div>
          </section>

          {/* Section C — Effort */}
          <section className="space-y-4 rounded-2xl border border-[--border] bg-[--bg-card] p-6">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-[--text-muted]">C — Effort et ressources</h3>
            <div className="space-y-2">
              <Label>Estimation totale (jours)</Label>
              <div className="flex items-center gap-4">
                <input
                  type="range" min={1} max={120} value={effortDays}
                  onChange={(e) => setEffortDays(Number(e.target.value))}
                  className="flex-1 accent-[--green]"
                />
                <span className="w-16 text-right text-sm font-semibold text-[--text-primary]">{effortDays} jours</span>
              </div>
            </div>

            {/* Tools */}
            <div className="space-y-2">
              <Label>Outils recommandés</Label>
              <div className="flex flex-wrap gap-2">
                {tools.map((t, i) => (
                  <span key={i} className="inline-flex items-center gap-1 rounded-full border border-[--border] bg-[--bg-hover] px-3 py-1 text-xs text-[--text-secondary]">
                    {t}
                    <button onClick={() => setTools(tools.filter((_, j) => j !== i))} className="text-[--text-muted] hover:text-[--red]"><X className="h-3 w-3" /></button>
                  </span>
                ))}
                <input
                  placeholder="+ Ajouter un outil"
                  className="rounded-full border border-dashed border-[--border-subtle] px-3 py-1 text-xs text-[--text-muted] focus:outline-none focus:border-[--green]"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && e.currentTarget.value.trim()) {
                      setTools([...tools, e.currentTarget.value.trim()]);
                      e.currentTarget.value = "";
                    }
                  }}
                />
              </div>
            </div>
          </section>

          {/* Section D — Risks */}
          <section className="space-y-4 rounded-2xl border border-[--border] bg-[--bg-card] p-6">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-[--text-muted]">D — Risques</h3>
            <RiskTable risks={risks} onChange={setRisks} />
          </section>

          {/* Section E — Next steps */}
          <section className="space-y-4 rounded-2xl border border-[--border] bg-[--bg-card] p-6">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-[--text-muted]">E — Prochaines étapes</h3>
            <ol className="space-y-2">
              {nextSteps.map((s, i) => (
                <li key={i} className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-[--text-muted]">{i + 1}.</span>
                  <input value={s} onChange={(e) => setNextSteps(nextSteps.map((x, j) => j === i ? e.target.value : x))}
                    className="flex-1 rounded-lg border border-[--border] bg-[--bg-input] px-3 py-1.5 text-sm text-[--text-primary] focus:outline-none focus:ring-2 focus:ring-[--green-dim]" />
                  <button onClick={() => setNextSteps(nextSteps.filter((_, j) => j !== i))} className="text-[--text-muted] hover:text-[--red]"><X className="h-4 w-4" /></button>
                </li>
              ))}
            </ol>
            <button onClick={() => setNextSteps([...nextSteps, ""])} className="flex items-center gap-1.5 text-sm text-[--green] hover:text-[--green]">
              <Plus className="h-4 w-4" /> Ajouter une étape
            </button>
          </section>

          {/* Navigation */}
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setStep(1)}>← Modifier le contexte</Button>
            <Button onClick={() => setStep(3)} className="flex-1">Passer à la soumission →</Button>
          </div>
        </div>
      )}

      {/* ── Step 3 — Submit ── */}
      {step === 3 && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-[--border] bg-[--bg-hover] p-6">
            <h3 className="font-semibold text-[--text-primary]">{generatedUC?.title ?? opportunity.title}</h3>
            <p className="mt-1 text-sm text-[--text-secondary]">{kpis.length} KPIs · {risks.length} risques · {effortDays} jours estimés</p>
            <div className="mt-4 flex flex-wrap gap-3 text-sm">
              <span className="font-semibold text-[--green]">{roi.savings_euros_per_year.toLocaleString("fr-FR")} €/an</span>
              <span className="text-[--text-muted]">ROI en {roi.payback_months} mois</span>
            </div>
          </div>

          {submitError && (
            <p role="alert" className="flex items-start gap-2 rounded-xl border border-[--red-dim] bg-[--red-dim] px-4 py-3 text-sm text-[--red]">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              {submitError}
            </p>
          )}

          <div className="flex flex-col gap-3">
            <Button
              onClick={() => handleSubmit(false)}
              disabled={isSubmitting}
              variant="outline"
              size="lg"
              className="justify-start"
            >
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Enregistrer en backlog
            </Button>
            <Button
              onClick={() => handleSubmit(true)}
              disabled={isSubmitting}
              size="lg"
              className="justify-start"
            >
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Soumettre pour validation →
            </Button>
          </div>

          <Button variant="ghost" onClick={() => setStep(2)} className="w-full text-[--text-muted]">
            ← Réviser la fiche
          </Button>
        </div>
      )}
    </div>
  );
}
