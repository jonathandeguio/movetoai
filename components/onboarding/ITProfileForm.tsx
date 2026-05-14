"use client";

import type { Route } from "next";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Shield, Zap, Clock, AlertTriangle, CheckCircle2 } from "lucide-react";

import type { ITRoadmapResult, ITPhase } from "@/lib/claude-it";
import { SystemSelector, type SystemOption } from "@/components/onboarding/SystemSelector";
import { LoadingSkeleton } from "@/components/onboarding/LoadingSkeleton";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

type Step = "profile" | "stack" | "loading" | "roadmap";

const IT_TITLES = [
  "DSI — Directeur des Systèmes d'Information",
  "Responsable IT",
  "RSSI — Responsable Sécurité SI",
  "CTO — Chief Technology Officer",
  "Chef de projet IT",
  "Autre",
] as const;

const TEAM_SIZES = [
  { value: "solo", label: "Solo (1 pers.)" },
  { value: "small", label: "Petite équipe (2-5 pers.)" },
  { value: "medium", label: "Équipe IT (6-20 pers.)" },
  { value: "large", label: "DSI structurée (20+ pers.)" },
] as const;

const SYSTEMS: SystemOption[] = [
  { id: "erp_sap", label: "SAP", category: "ERP" },
  { id: "erp_oracle", label: "Oracle / NetSuite", category: "ERP" },
  { id: "erp_sage", label: "Sage", category: "ERP" },
  { id: "erp_dynamics", label: "Microsoft Dynamics", category: "ERP" },
  { id: "crm_salesforce", label: "Salesforce", category: "CRM" },
  { id: "crm_hubspot", label: "HubSpot", category: "CRM" },
  { id: "crm_pipedrive", label: "Pipedrive", category: "CRM" },
  { id: "sirh_workday", label: "Workday", category: "SIRH" },
  { id: "sirh_bamboo", label: "BambooHR / Lucca", category: "SIRH" },
  { id: "bi_powerbi", label: "Power BI", category: "BI / Data" },
  { id: "bi_tableau", label: "Tableau / Looker", category: "BI / Data" },
  { id: "dw_bigquery", label: "BigQuery / Snowflake", category: "BI / Data" },
  { id: "collab_teams", label: "Microsoft Teams", category: "Collab" },
  { id: "collab_slack", label: "Slack", category: "Collab" },
  { id: "collab_gws", label: "Google Workspace", category: "Collab" },
  { id: "custom", label: "Outil métier spécifique", category: "Autre" },
];

const CONSTRAINTS = [
  { value: "rgpd", label: "Conformité RGPD / sécurité des données" },
  { value: "legacy", label: "Complexité des intégrations legacy" },
  { value: "budget", label: "Budget et ROI à justifier" },
  { value: "change", label: "Résistance au changement des équipes" },
  { value: "skills", label: "Manque de compétences IA en interne" },
] as const;

const PHASE_COLORS = [
  "from-[--blue] to-[--blue]",
  "from-[--blue] to-[--purple]",
  "from-[--purple] to-[--purple]",
];

const COMPLEXITY_BADGE: Record<string, { label: string; className: string }> = {
  "1": { label: "Phase 1", className: "bg-[--blue-dim] text-[--blue] border-[--blue-border]" },
  "2": { label: "Phase 2", className: "bg-[--blue-dim] text-[--blue] border-[--blue-border]" },
  "3": { label: "Phase 3", className: "bg-[--purple-dim] text-[--purple] border-[--purple-border]" },
};

function PhaseCard({ phase, index }: { phase: ITPhase; index: number }) {
  const badge = COMPLEXITY_BADGE[String(phase.phase)] ?? COMPLEXITY_BADGE["1"];
  const gradient = PHASE_COLORS[index] ?? PHASE_COLORS[0];

  return (
    <div className="overflow-hidden rounded-2xl border border-[--border] bg-[--bg-card]">
      {/* gradient strip */}
      <div className={`h-1 w-full bg-gradient-to-r ${gradient}`} />
      <div className="space-y-4 p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <span
              className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${badge.className}`}
            >
              {badge.label}
            </span>
            <h3 className="mt-2 font-semibold text-[--text-primary]">
              {phase.title}
            </h3>
          </div>
          <div className="flex shrink-0 items-center gap-1.5 text-xs text-[--text-muted]">
            <Clock className="h-3.5 w-3.5" />
            {phase.duration}
          </div>
        </div>

        {/* Systems involved */}
        {phase.systems_involved.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {phase.systems_involved.map((s) => (
              <span
                key={s}
                className="rounded-full bg-[--bg-hover] px-2 py-0.5 text-xs text-[--text-secondary]"
              >
                {s}
              </span>
            ))}
          </div>
        )}

        <div className="grid gap-3 sm:grid-cols-3">
          {/* Prérequis */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[--text-muted] uppercase tracking-wide">
              <CheckCircle2 className="h-3.5 w-3.5 text-[--green]" />
              Prérequis
            </div>
            <ul className="space-y-1">
              {phase.prerequisites.map((p) => (
                <li key={p} className="text-xs leading-5 text-[--text-secondary]">
                  · {p}
                </li>
              ))}
            </ul>
          </div>

          {/* Risques */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[--text-muted] uppercase tracking-wide">
              <AlertTriangle className="h-3.5 w-3.5 text-[--amber]" />
              Risques
            </div>
            <ul className="space-y-1">
              {phase.risks.map((r) => (
                <li key={r} className="text-xs leading-5 text-[--text-secondary]">
                  · {r}
                </li>
              ))}
            </ul>
          </div>

          {/* RGPD */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[--text-muted] uppercase tracking-wide">
              <Shield className="h-3.5 w-3.5 text-[--blue]" />
              RGPD
            </div>
            <ul className="space-y-1">
              {phase.rgpd_notes.map((n) => (
                <li key={n} className="text-xs leading-5 text-[--text-secondary]">
                  · {n}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ITProfileForm() {
  const [step, setStep] = useState<Step>("profile");
  const [itTitle, setItTitle] = useState("");
  const [teamSize, setTeamSize] = useState("");
  const [selectedSystems, setSelectedSystems] = useState<string[]>([]);
  const [mainConstraint, setMainConstraint] = useState("");
  const [roadmap, setRoadmap] = useState<ITRoadmapResult | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const selectClass =
    "flex h-11 w-full rounded-lg border border-[--border] bg-[--bg-card] px-3 text-sm text-[--text-primary] shadow-sm outline-none transition focus:border-[--blue-border]";

  function toggleSystem(id: string) {
    setSelectedSystems((current) =>
      current.includes(id) ? current.filter((s) => s !== id) : [...current, id]
    );
  }

  function handleGetRoadmap() {
    if (selectedSystems.length === 0 || !mainConstraint) return;
    setStep("loading");
    setErrorMessage("");

    startTransition(() => {
      void (async () => {
        try {
          const systemLabels = selectedSystems.map(
            (id) => SYSTEMS.find((s) => s.id === id)?.label ?? id
          );
          const constraintLabel =
            CONSTRAINTS.find((c) => c.value === mainConstraint)?.label ?? mainConstraint;

          const response = await fetch("/api/onboarding/it-recommend", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ systems: systemLabels, constraint: constraintLabel }),
          });

          const payload = (await response.json().catch(() => null)) as
            | (ITRoadmapResult & { ok: boolean })
            | null;

          if (!payload?.ok || !payload.phases) {
            setErrorMessage("Impossible de générer la roadmap. Réessayez ou continuez manuellement.");
            setStep("stack");
            return;
          }

          setRoadmap(payload);
          setStep("roadmap");
        } catch {
          setErrorMessage("Erreur réseau. Vérifiez votre connexion et réessayez.");
          setStep("stack");
        }
      })();
    });
  }

  function handleComplete() {
    if (!roadmap) return;
    setErrorMessage("");

    startTransition(() => {
      void (async () => {
        try {
          const response = await fetch("/api/onboarding/it-complete", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              itTitle,
              teamSize,
              selectedSystems,
              mainConstraint,
              roadmap,
            }),
          });

          const payload = (await response.json().catch(() => null)) as {
            ok: boolean;
            redirectTo?: string;
          } | null;

          if (!response.ok || !payload?.ok) {
            setErrorMessage("Erreur lors de la sauvegarde. Réessayez.");
            return;
          }

          router.push((payload.redirectTo ?? "/app/dashboard/tech") as Route);
          router.refresh();
        } catch {
          setErrorMessage("Erreur réseau. Réessayez.");
        }
      })();
    });
  }

  const steps = ["profile", "stack", "roadmap"] as const;
  const currentStepIndex = steps.indexOf(step === "loading" ? "stack" : (step as typeof steps[number]));

  return (
    <Card className="border-[--blue-border] shadow-soft">
      <CardContent className="space-y-6 p-8">
        {/* Progress */}
        {step !== "loading" && (
          <div className="flex items-center gap-2">
            {steps.map((s, i) => (
              <div key={s} className="flex items-center gap-2">
                <span
                  className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold transition-colors ${
                    i <= currentStepIndex
                      ? "bg-[--blue] text-[--on-green]"
                      : "bg-[--bg-hover] text-[--text-muted]"
                  }`}
                >
                  {i + 1}
                </span>
                {i < steps.length - 1 && (
                  <div
                    className={`h-px w-6 transition-colors ${
                      i < currentStepIndex ? "bg-[--blue]" : "bg-[--border]"
                    }`}
                  />
                )}
              </div>
            ))}
            <span className="ml-2 text-xs text-[--text-muted]">
              {step === "profile" && "Votre profil IT"}
              {step === "stack" && "Votre stack actuelle"}
              {step === "roadmap" && "Roadmap personnalisée"}
            </span>
          </div>
        )}

        {/* ── STEP 1 : Profil IT ── */}
        {step === "profile" && (
          <div className="space-y-5">
            <div className="space-y-1">
              <p className="text-base font-semibold text-[--text-primary]">
                Votre profil IT
              </p>
              <p className="text-sm leading-6 text-[--text-secondary]">
                Précisez votre titre et la taille de votre équipe pour personnaliser votre expérience.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="itTitle">Titre *</Label>
              <select
                id="itTitle"
                value={itTitle}
                onChange={(e) => setItTitle(e.target.value)}
                className={selectClass}
              >
                <option value="">Sélectionnez votre titre</option>
                {IT_TITLES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="teamSize">Taille de l'équipe IT *</Label>
              <select
                id="teamSize"
                value={teamSize}
                onChange={(e) => setTeamSize(e.target.value)}
                className={selectClass}
              >
                <option value="">Sélectionnez</option>
                {TEAM_SIZES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            <Button
              className="w-full bg-[--blue] hover:bg-[--blue]"
              size="lg"
              type="button"
              disabled={!itTitle || !teamSize}
              onClick={() => setStep("stack")}
            >
              Continuer →
            </Button>
          </div>
        )}

        {/* ── STEP 2 : Stack technique ── */}
        {step === "stack" && (
          <div className="space-y-5">
            <div className="space-y-1">
              <p className="text-base font-semibold text-[--text-primary]">
                Votre stack technique actuelle
              </p>
              <p className="text-sm leading-6 text-[--text-secondary]">
                Sélectionnez les systèmes que vous souhaitez connecter à Move to AI.
              </p>
              <p className="text-xs font-medium text-[--blue]">
                {selectedSystems.length} système{selectedSystems.length !== 1 ? "s" : ""} sélectionné{selectedSystems.length !== 1 ? "s" : ""}
              </p>
            </div>

            <SystemSelector
              systems={SYSTEMS}
              selected={selectedSystems}
              onToggle={toggleSystem}
            />

            <div className="space-y-2">
              <Label>Contrainte principale *</Label>
              <div className="space-y-2">
                {CONSTRAINTS.map((c) => (
                  <label
                    key={c.value}
                    className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-sm transition-all ${
                      mainConstraint === c.value
                        ? "border-[--blue-border] bg-[--blue-dim] text-[--blue]"
                        : "border-[--border] bg-[--bg-card] text-[--text-secondary] hover:border-[--blue-border]"
                    }`}
                  >
                    <input
                      type="radio"
                      name="constraint"
                      value={c.value}
                      checked={mainConstraint === c.value}
                      onChange={() => setMainConstraint(c.value)}
                      className="sr-only"
                    />
                    <span
                      className={`h-4 w-4 shrink-0 rounded-full border-2 transition-all ${
                        mainConstraint === c.value
                          ? "border-[--blue] bg-[--blue]"
                          : "border-[--border]"
                      }`}
                    />
                    {c.label}
                  </label>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => setStep("profile")}
              >
                ← Retour
              </Button>
              <Button
                className="flex-1 bg-[--blue] hover:bg-[--blue]"
                size="lg"
                type="button"
                disabled={selectedSystems.length === 0 || !mainConstraint || isPending}
                onClick={handleGetRoadmap}
              >
                <Zap className="mr-2 h-4 w-4" />
                Générer ma roadmap IA
              </Button>
            </div>
          </div>
        )}

        {/* ── Chargement ── */}
        {step === "loading" && (
          <LoadingSkeleton
            title="Analyse de votre stack en cours…"
            subtitle="Claude génère votre roadmap d'intégration personnalisée en 3 phases."
          />
        )}

        {/* ── STEP 3 : Roadmap ── */}
        {step === "roadmap" && roadmap && (
          <div className="space-y-5">
            <div className="space-y-1">
              <p className="text-base font-semibold text-[--text-primary]">
                Votre roadmap d'intégration IA
              </p>
              <p className="text-sm leading-6 text-[--text-secondary]">
                {roadmap.summary}
              </p>
              <div className="flex items-start gap-2 rounded-xl border border-[--blue-border] bg-[--blue-dim] px-3 py-2">
                <Zap className="mt-0.5 h-4 w-4 shrink-0 text-[--blue]" />
                <p className="text-xs leading-5 text-[--blue]">
                  <span className="font-semibold">Action prioritaire : </span>
                  {roadmap.priority_recommendation}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {roadmap.phases.map((phase, i) => (
                <PhaseCard key={phase.phase} phase={phase} index={i} />
              ))}
            </div>

            <Button
              className="w-full bg-[--blue] hover:bg-[--blue]"
              size="lg"
              type="button"
              disabled={isPending}
              onClick={handleComplete}
            >
              {isPending ? "Enregistrement…" : "Accéder à mon dashboard IT →"}
            </Button>
          </div>
        )}

        {errorMessage && (
          <p className="rounded-xl border border-[--red-dim] bg-[--red-dim] px-4 py-3 text-sm text-[--red]">
            {errorMessage}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
