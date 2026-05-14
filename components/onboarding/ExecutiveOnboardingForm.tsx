"use client";

import type { Route } from "next";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ExecutiveQuickWin } from "@/modules/workspace/server/executive-onboarding";

// ─── Step 1 types ────────────────────────────────────────────────────────────

type ProfileData = {
  firstName: string;
  lastName: string;
  jobTitle: string;
  linkedinUrl: string;
};

// ─── Step 2 types ────────────────────────────────────────────────────────────

type ContextData = {
  ambition: string;
  horizon: string;
  maturity: string;
};

const AMBITIONS = [
  { value: "reduce_costs", label: "Réduire mes coûts opérationnels" },
  { value: "accelerate_growth", label: "Accélérer ma croissance commerciale" },
  { value: "improve_cx", label: "Améliorer l'expérience client" },
  { value: "gain_competitiveness", label: "Gagner en compétitivité face au marché" },
  { value: "fundraising", label: "Préparer une levée de fonds / cession" }
];

const HORIZONS = [
  { value: "3_months", label: "Dans les 3 prochains mois" },
  { value: "6_months", label: "D'ici 6 mois" },
  { value: "12_months", label: "Dans l'année" },
  { value: "2_3_years", label: "Horizon 2-3 ans (transformation profonde)" }
];

const MATURITIES = [
  { value: "none", label: "Non, c'est notre première démarche" },
  { value: "experiments", label: "Quelques expérimentations isolées" },
  { value: "structured", label: "Oui, un projet structuré en cours" },
  { value: "advanced", label: "Oui, plusieurs projets avancés" }
];

// ─── Effort badge ─────────────────────────────────────────────────────────────

function EffortBadge({ effort }: { effort: "low" | "medium" | "high" }) {
  const map = {
    low: { label: "Faible effort", className: "bg-[--green-dim] text-[--green] border-[--green-border]" },
    medium: { label: "Effort moyen", className: "bg-[--amber-dim] text-[--amber] border-[--amber-border]" },
    high: { label: "Effort élevé", className: "bg-[--red-dim] text-[--red] border-[--red-dim]" }
  };
  const { label, className } = map[effort];
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${className}`}>
      {label}
    </span>
  );
}

// ─── Radio option ─────────────────────────────────────────────────────────────

function RadioOption({
  name,
  value,
  label,
  selected,
  onChange
}: {
  name: string;
  value: string;
  label: string;
  selected: boolean;
  onChange: () => void;
}) {
  return (
    <label
      className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 transition-colors ${
        selected
          ? "border-[--purple-border] bg-[--purple-dim]"
          : "border-[--border] bg-[--bg-card] hover:border-[--purple-border] hover:bg-[--purple-dim]"
      }`}
    >
      <input
        type="radio"
        name={name}
        value={value}
        checked={selected}
        onChange={onChange}
        className="accent-[--purple]"
      />
      <span className="text-sm text-[--text-secondary]">{label}</span>
    </label>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

type Step = 1 | 2 | 3;

export function ExecutiveOnboardingForm({ workspaceName }: { workspaceName: string }) {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  // Step 1 state
  const [profile, setProfile] = useState<ProfileData>({
    firstName: "",
    lastName: "",
    jobTitle: "",
    linkedinUrl: ""
  });
  const [profileErrors, setProfileErrors] = useState<Partial<ProfileData>>({});

  // Step 2 state
  const [context, setContext] = useState<ContextData>({
    ambition: "",
    horizon: "",
    maturity: ""
  });

  // Step 3 state (results)
  const [quickWins, setQuickWins] = useState<ExecutiveQuickWin[]>([]);
  const [maturityScore, setMaturityScore] = useState(0);

  // ── Step 1 validation ────────────────────────────────────────────────────

  const validateProfile = () => {
    const errs: Partial<ProfileData> = {};
    if (!profile.firstName.trim()) errs.firstName = "Champ requis";
    if (!profile.lastName.trim()) errs.lastName = "Champ requis";
    if (!profile.jobTitle.trim()) errs.jobTitle = "Champ requis";
    setProfileErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleStep1Next = () => {
    if (validateProfile()) setStep(2);
  };

  // ── Step 2 → Claude API ──────────────────────────────────────────────────

  const handleStep2Submit = () => {
    if (!context.ambition || !context.horizon || !context.maturity) {
      setError("Veuillez répondre aux 3 questions pour continuer.");
      return;
    }
    setError("");

    startTransition(() => {
      void (async () => {
        const res = await fetch("/api/onboarding/executive-recommend", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(context)
        });

        if (!res.ok) {
          setError("Une erreur est survenue. Veuillez réessayer.");
          return;
        }

        const data = (await res.json()) as { quickWins: ExecutiveQuickWin[]; maturityScore: number };
        setQuickWins(data.quickWins ?? []);
        setMaturityScore(data.maturityScore ?? 35);
        setStep(3);
      })();
    });
  };

  // ── Step 3 → Save + redirect ─────────────────────────────────────────────

  const handleFinish = () => {
    startTransition(() => {
      void (async () => {
        const res = await fetch("/api/onboarding/executive-complete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...profile,
            ...context,
            quickWins,
            maturityScore
          })
        });

        if (!res.ok) {
          setError("Une erreur est survenue lors de la sauvegarde.");
          return;
        }

        router.push("/app/dashboard/executive" as Route);
        router.refresh();
      })();
    });
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="mx-auto max-w-lg">
      {/* Progress */}
      <div className="mb-8 flex items-center gap-2">
        {([1, 2, 3] as Step[]).map((s) => (
          <div key={s} className="flex flex-1 items-center gap-2">
            <div
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-colors ${
                s < step
                  ? "bg-[--purple] text-[--on-green]"
                  : s === step
                  ? "border-2 border-[--purple] bg-[--purple-dim] text-[--purple]"
                  : "border border-[--border] bg-[--bg-card] text-[--text-muted]"
              }`}
            >
              {s < step ? "✓" : s}
            </div>
            {s < 3 && (
              <div className={`h-px flex-1 transition-colors ${s < step ? "bg-[--purple]" : "bg-[--border]"}`} />
            )}
          </div>
        ))}
      </div>

      {/* ── STEP 1 — Profil personnel ── */}
      {step === 1 && (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-[--text-primary]">Votre profil</h2>
            <p className="mt-1 text-sm text-[--text-muted]">
              Ces informations personnalisent votre expérience dans {workspaceName}.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="firstName">Prénom *</Label>
              <Input
                id="firstName"
                value={profile.firstName}
                onChange={(e) => setProfile((p) => ({ ...p, firstName: e.target.value }))}
                placeholder="Marie"
              />
              {profileErrors.firstName && (
                <p className="text-xs text-[--red]">{profileErrors.firstName}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="lastName">Nom *</Label>
              <Input
                id="lastName"
                value={profile.lastName}
                onChange={(e) => setProfile((p) => ({ ...p, lastName: e.target.value }))}
                placeholder="Dupont"
              />
              {profileErrors.lastName && (
                <p className="text-xs text-[--red]">{profileErrors.lastName}</p>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="jobTitle">Titre exact *</Label>
            <Input
              id="jobTitle"
              value={profile.jobTitle}
              onChange={(e) => setProfile((p) => ({ ...p, jobTitle: e.target.value }))}
              placeholder="Président Directeur Général"
            />
            {profileErrors.jobTitle && (
              <p className="text-xs text-[--red]">{profileErrors.jobTitle}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="linkedinUrl">
              LinkedIn <span className="text-[--text-muted]">(optionnel)</span>
            </Label>
            <Input
              id="linkedinUrl"
              type="url"
              value={profile.linkedinUrl}
              onChange={(e) => setProfile((p) => ({ ...p, linkedinUrl: e.target.value }))}
              placeholder="https://linkedin.com/in/marie-dupont"
            />
          </div>

          <Button
            className="w-full bg-[--purple] hover:bg-[--purple]"
            size="lg"
            onClick={handleStep1Next}
          >
            Continuer →
          </Button>
        </div>
      )}

      {/* ── STEP 2 — Contexte stratégique ── */}
      {step === 2 && (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-[--text-primary]">Votre contexte stratégique</h2>
            <p className="mt-1 text-sm text-[--text-muted]">
              3 questions pour calibrer vos recommandations IA personnalisées.
            </p>
          </div>

          <fieldset className="space-y-3">
            <legend className="text-sm font-medium text-[--text-secondary]">
              Quelle est votre ambition principale avec l'IA ?
            </legend>
            {AMBITIONS.map((opt) => (
              <RadioOption
                key={opt.value}
                name="ambition"
                value={opt.value}
                label={opt.label}
                selected={context.ambition === opt.value}
                onChange={() => setContext((c) => ({ ...c, ambition: opt.value }))}
              />
            ))}
          </fieldset>

          <fieldset className="space-y-3">
            <legend className="text-sm font-medium text-[--text-secondary]">
              Dans combien de temps souhaitez-vous voir des résultats ?
            </legend>
            {HORIZONS.map((opt) => (
              <RadioOption
                key={opt.value}
                name="horizon"
                value={opt.value}
                label={opt.label}
                selected={context.horizon === opt.value}
                onChange={() => setContext((c) => ({ ...c, horizon: opt.value }))}
              />
            ))}
          </fieldset>

          <fieldset className="space-y-3">
            <legend className="text-sm font-medium text-[--text-secondary]">
              Avez-vous déjà des initiatives IA en cours ?
            </legend>
            {MATURITIES.map((opt) => (
              <RadioOption
                key={opt.value}
                name="maturity"
                value={opt.value}
                label={opt.label}
                selected={context.maturity === opt.value}
                onChange={() => setContext((c) => ({ ...c, maturity: opt.value }))}
              />
            ))}
          </fieldset>

          {error && (
            <p className="rounded-xl border border-[--red-dim] bg-[--red-dim] px-4 py-3 text-sm text-[--red]">
              {error}
            </p>
          )}

          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
              ← Retour
            </Button>
            <Button
              className="flex-1 bg-[--purple] hover:bg-[--purple]"
              size="lg"
              onClick={handleStep2Submit}
              disabled={isPending}
            >
              {isPending ? "Analyse en cours…" : "Voir mes recommandations →"}
            </Button>
          </div>
        </div>
      )}

      {/* ── STEP 3 — Recommandations Claude ── */}
      {step === 3 && (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-[--text-primary]">Vos 3 quick-wins IA</h2>
            <p className="mt-1 text-sm text-[--text-muted]">
              Recommandations personnalisées basées sur votre profil stratégique.
            </p>
          </div>

          {/* Maturity score */}
          <div className="rounded-2xl border border-[--purple-border] bg-[--purple-dim] p-5">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium text-[--purple]">Score de maturité IA</span>
              <span className="text-2xl font-bold text-[--purple]">{maturityScore}/100</span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-[--purple-border]">
              <div
                className="h-full rounded-full bg-[--purple] transition-all"
                style={{ width: `${maturityScore}%` }}
              />
            </div>
          </div>

          {/* Quick wins */}
          <div className="space-y-4">
            {quickWins.map((win, i) => (
              <div key={i} className="rounded-2xl border border-[--border] bg-[--bg-card] p-5 shadow-sm">
                <div className="mb-2 flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[--purple-dim] text-xs font-bold text-[--purple]">
                      {i + 1}
                    </span>
                    <h3 className="font-semibold text-[--text-primary]">{win.title}</h3>
                  </div>
                  <EffortBadge effort={win.effort} />
                </div>
                <p className="mb-3 text-sm text-[--text-secondary]">{win.description}</p>
                <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-[--text-muted]">
                  <span>
                    <span className="font-medium text-[--green]">ROI :</span> {win.roi}
                  </span>
                  <span>
                    <span className="font-medium text-[--text-secondary]">Délai :</span> {win.timeframe}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {error && (
            <p className="rounded-xl border border-[--red-dim] bg-[--red-dim] px-4 py-3 text-sm text-[--red]">
              {error}
            </p>
          )}

          <Button
            className="w-full bg-[--purple] hover:bg-[--purple]"
            size="lg"
            onClick={handleFinish}
            disabled={isPending}
          >
            {isPending ? "Enregistrement…" : "Accéder à mon dashboard →"}
          </Button>
        </div>
      )}
    </div>
  );
}
