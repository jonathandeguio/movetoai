"use client";

import type { Route } from "next";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Award,
  Briefcase,
  Check,
  ExternalLink,
  Star,
  TrendingUp,
  Zap,
} from "lucide-react";

import type { ConsultantRecommendationResult, ConsultantUseCase } from "@/lib/claude-consultant";
import { LoadingSkeleton } from "@/components/onboarding/LoadingSkeleton";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Step = "type" | "profile" | "context" | "loading" | "usecases";

// ─── Static data ───────────────────────────────────────────────────────────

const CONSULTANT_TYPES = [
  { id: "freelance", label: "Consultant indépendant (freelance)" },
  { id: "cabinet", label: "Cabinet de conseil (structure multi-consultants)" },
  { id: "integrator", label: "Intégrateur technique / ESN" },
  { id: "agency", label: "Agence digitale / marketing" },
  { id: "editor", label: "Éditeur de solution IA" },
] as const;

const SPECIALIZATIONS = [
  "Automatisation de processus",
  "IA générative",
  "Data & Analytics",
  "RPA",
  "Chatbots & assistants",
  "Intégration ERP-CRM",
  "Conseil stratégique",
  "Autre",
] as const;

const EXPERIENCE_OPTIONS = [
  { value: "moins d'1 an", label: "< 1 an" },
  { value: "1 à 3 ans", label: "1 – 3 ans" },
  { value: "3 à 7 ans", label: "3 – 7 ans" },
  { value: "plus de 7 ans", label: "> 7 ans" },
] as const;

const CLIENT_COUNTS = ["1-2 clients", "3-5 clients", "6-10 clients", ">10 clients"] as const;

const SECTORS = [
  "Industrie",
  "Commerce / Retail",
  "Services",
  "Santé",
  "Finance",
  "Immobilier",
  "Éducation",
  "Secteur public",
] as const;

const AI_TOOLS = [
  "OpenAI / Azure OpenAI",
  "Anthropic Claude",
  "Make / Zapier",
  "n8n",
  "Microsoft Power Automate",
  "LangChain / LlamaIndex",
  "Flowise",
  "Autre",
] as const;

const TIER_CONFIG: Record<string, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  Explorer: { label: "Explorer", color: "text-[--text-secondary]", bg: "bg-[--bg-hover] border-[--border]", icon: Star },
  Certified: { label: "Certified Partner", color: "text-[--amber]", bg: "bg-[--amber-dim] border-[--amber-border]", icon: Award },
  Expert: { label: "Expert Partner", color: "text-[--purple]", bg: "bg-[--purple-dim] border-[--purple-border]", icon: Award },
};

const COMPLEXITY_BADGE: Record<string, { label: string; className: string }> = {
  low: { label: "Rapide", className: "bg-[--green-dim] text-[--green] border-[--green-border]" },
  medium: { label: "Intermédiaire", className: "bg-[--amber-dim] text-[--amber] border-[--amber-border]" },
  high: { label: "Avancé", className: "bg-[--red-dim] text-[--red] border-[--red-dim]" },
};

// ─── Sub-components ─────────────────────────────────────────────────────────

function CheckboxGrid({
  options,
  selected,
  onToggle,
}: {
  options: readonly string[];
  selected: string[];
  onToggle: (v: string) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {options.map((option) => {
        const isSelected = selected.includes(option);
        return (
          <button
            key={option}
            type="button"
            aria-pressed={isSelected}
            onClick={() => onToggle(option)}
            className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-left text-sm transition-all ${
              isSelected
                ? "border-[--amber-border] bg-[--amber-dim] text-[--amber]"
                : "border-[--border] bg-[--bg-card] text-[--text-secondary] hover:border-[--amber-border] hover:bg-[--amber-dim]"
            }`}
          >
            <span
              className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-all ${
                isSelected
                  ? "border-[--amber] bg-[--amber] text-[--on-green]"
                  : "border-[--border]"
              }`}
            >
              {isSelected && <Check className="h-3 w-3" />}
            </span>
            <span className="leading-snug">{option}</span>
          </button>
        );
      })}
    </div>
  );
}

function UseCaseCard({
  useCase,
  index,
}: {
  useCase: ConsultantUseCase;
  index: number;
}) {
  const badge = COMPLEXITY_BADGE[useCase.complexity] ?? COMPLEXITY_BADGE.medium;
  return (
    <div className="overflow-hidden rounded-2xl border border-[--border] bg-[--bg-card]">
      <div className="h-1 w-full bg-gradient-to-r from-[--amber] to-[--coral]" />
      <div className="space-y-3 p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-[--amber]">#{index + 1}</span>
              <span
                className={`rounded-full border px-2 py-0.5 text-xs font-medium ${badge.className}`}
              >
                {badge.label}
              </span>
            </div>
            <h3 className="font-semibold text-[--text-primary]">
              {useCase.title}
            </h3>
          </div>
          <div className="shrink-0 text-right">
            <p className="text-xs font-semibold text-[--amber]">{useCase.price_range}</p>
            <p className="text-xs text-[--text-muted]">{useCase.mission_days}</p>
          </div>
        </div>

        <p className="text-sm leading-6 text-[--text-secondary]">
          {useCase.client_value}
        </p>

        <div className="flex flex-wrap gap-1.5">
          {useCase.tools_used.map((tool) => (
            <span
              key={tool}
              className="rounded-full bg-[--bg-hover] px-2.5 py-0.5 text-xs text-[--text-secondary]"
            >
              {tool}
            </span>
          ))}
          <span className="rounded-full bg-[--amber-dim] px-2.5 py-0.5 text-xs text-[--amber]">
            {useCase.sector}
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Main form ───────────────────────────────────────────────────────────────

export function ConsultantProfileForm() {
  // Step state
  const [step, setStep] = useState<Step>("type");

  // Form data
  const [consultantType, setConsultantType] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [yearsExperience, setYearsExperience] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [website, setWebsite] = useState("");
  const [simultaneousClients, setSimultaneousClients] = useState("");
  const [selectedSectors, setSelectedSectors] = useState<string[]>([]);
  const [selectedTools, setSelectedTools] = useState<string[]>([]);

  // Results
  const [recommendation, setRecommendation] =
    useState<ConsultantRecommendationResult | null>(null);

  const [errorMessage, setErrorMessage] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const selectClass =
    "flex h-11 w-full rounded-lg border border-[--border] bg-[--bg-card] px-3 text-sm text-[--text-primary] shadow-sm outline-none transition focus:border-[--amber-border]";

  const stepOrder: Step[] = ["type", "profile", "context", "usecases"];
  const currentIndex = stepOrder.indexOf(step === "loading" ? "context" : step);

  function toggleSector(v: string) {
    setSelectedSectors((prev) =>
      prev.includes(v) ? prev.filter((s) => s !== v) : [...prev, v]
    );
  }

  function toggleTool(v: string) {
    setSelectedTools((prev) =>
      prev.includes(v) ? prev.filter((t) => t !== v) : [...prev, v]
    );
  }

  function handleGetUseCases() {
    if (!simultaneousClients || selectedSectors.length === 0 || selectedTools.length === 0) return;
    setStep("loading");
    setErrorMessage("");

    startTransition(() => {
      void (async () => {
        try {
          const response = await fetch("/api/onboarding/consultant-recommend", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              specialization,
              yearsExperience,
              sectors: selectedSectors,
              tools: selectedTools,
            }),
          });

          const payload = (await response.json().catch(() => null)) as
            | (ConsultantRecommendationResult & { ok: boolean })
            | null;

          if (!payload?.ok || !payload.use_cases) {
            setErrorMessage("Impossible de générer les cas d'usage. Réessayez.");
            setStep("context");
            return;
          }

          setRecommendation(payload);
          setStep("usecases");
        } catch {
          setErrorMessage("Erreur réseau. Réessayez.");
          setStep("context");
        }
      })();
    });
  }

  function handleComplete() {
    if (!recommendation) return;
    setErrorMessage("");

    startTransition(() => {
      void (async () => {
        try {
          const response = await fetch("/api/onboarding/consultant-complete", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              consultantType,
              specialization,
              yearsExperience,
              linkedinUrl,
              website,
              simultaneousClients,
              sectors: selectedSectors,
              tools: selectedTools,
              recommendation,
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

          router.push((payload.redirectTo ?? "/app/dashboard/consulting") as Route);
          router.refresh();
        } catch {
          setErrorMessage("Erreur réseau. Réessayez.");
        }
      })();
    });
  }

  const tierConfig =
    recommendation ? TIER_CONFIG[recommendation.partner_tier_suggestion] ?? TIER_CONFIG.Explorer : null;

  return (
    <Card className="border-[--amber-border] shadow-soft">
      <CardContent className="space-y-6 p-8">

        {/* Progress indicator */}
        {step !== "loading" && (
          <div className="flex items-center gap-2">
            {stepOrder.map((s, i) => (
              <div key={s} className="flex items-center gap-2">
                <span
                  className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold transition-colors ${
                    i <= currentIndex
                      ? "bg-[--amber] text-[--on-green]"
                      : "bg-[--bg-hover] text-[--text-muted]"
                  }`}
                >
                  {i + 1}
                </span>
                {i < stepOrder.length - 1 && (
                  <div
                    className={`h-px w-5 transition-colors ${
                      i < currentIndex ? "bg-[--amber]" : "bg-[--border]"
                    }`}
                  />
                )}
              </div>
            ))}
            <span className="ml-2 text-xs text-[--text-muted]">
              {step === "type" && "Type de structure"}
              {step === "profile" && "Profil professionnel"}
              {step === "context" && "Contexte d'activité"}
              {step === "usecases" && "Cas d'usage recommandés"}
            </span>
          </div>
        )}

        {/* ── ÉTAPE 0 : Type de structure ── */}
        {step === "type" && (
          <div className="space-y-5">
            <div className="space-y-1">
              <p className="text-base font-semibold text-[--text-primary]">
                Vous intervenez en tant que :
              </p>
              <p className="text-sm leading-6 text-[--text-secondary]">
                Précisez votre type de structure pour personnaliser votre expérience Move to AI.
              </p>
            </div>

            <div className="space-y-2">
              {CONSULTANT_TYPES.map((type) => (
                <label
                  key={type.id}
                  className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3.5 text-sm transition-all ${
                    consultantType === type.id
                      ? "border-[--amber-border] bg-[--amber-dim] text-[--amber]"
                      : "border-[--border] bg-[--bg-card] text-[--text-secondary] hover:border-[--amber-border] hover:bg-[--amber-dim]"
                  }`}
                >
                  <input
                    type="radio"
                    name="consultantType"
                    value={type.id}
                    checked={consultantType === type.id}
                    onChange={() => setConsultantType(type.id)}
                    className="sr-only"
                  />
                  <span
                    className={`h-4 w-4 shrink-0 rounded-full border-2 transition-all ${
                      consultantType === type.id
                        ? "border-[--amber] bg-[--amber]"
                        : "border-[--border]"
                    }`}
                  />
                  <span className="font-medium">{type.label}</span>
                </label>
              ))}
            </div>

            <Button
              className="w-full bg-[--amber] hover:bg-[--amber]"
              size="lg"
              type="button"
              disabled={!consultantType}
              onClick={() => setStep("profile")}
            >
              Continuer →
            </Button>
          </div>
        )}

        {/* ── ÉTAPE 1 : Profil professionnel ── */}
        {step === "profile" && (
          <div className="space-y-5">
            <div className="space-y-1">
              <p className="text-base font-semibold text-[--text-primary]">
                Votre profil professionnel
              </p>
              <p className="text-sm leading-6 text-[--text-secondary]">
                Ces informations servent à personnaliser vos recommandations et à valider votre statut partenaire.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="specialization">Spécialisation principale *</Label>
              <select
                id="specialization"
                value={specialization}
                onChange={(e) => setSpecialization(e.target.value)}
                className={selectClass}
              >
                <option value="">Sélectionnez votre spécialisation</option>
                {SPECIALIZATIONS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="yearsExperience">Années d'expérience en IA *</Label>
              <select
                id="yearsExperience"
                value={yearsExperience}
                onChange={(e) => setYearsExperience(e.target.value)}
                className={selectClass}
              >
                <option value="">Sélectionnez</option>
                {EXPERIENCE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="linkedinUrl">LinkedIn * <span className="font-normal text-[--text-muted]">(requis pour la validation partenaire)</span></Label>
              <Input
                id="linkedinUrl"
                type="url"
                placeholder="https://linkedin.com/in/votre-profil"
                value={linkedinUrl}
                onChange={(e) => setLinkedinUrl(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">Site web <span className="font-normal text-[--text-muted]">(optionnel)</span></Label>
              <Input
                id="website"
                type="url"
                placeholder="https://votrecabinet.fr"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
              />
            </div>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => setStep("type")}
              >
                ← Retour
              </Button>
              <Button
                className="flex-1 bg-[--amber] hover:bg-[--amber]"
                size="lg"
                type="button"
                disabled={!specialization || !yearsExperience || !linkedinUrl}
                onClick={() => setStep("context")}
              >
                Continuer →
              </Button>
            </div>
          </div>
        )}

        {/* ── ÉTAPE 2 : Contexte d'activité ── */}
        {step === "context" && (
          <div className="space-y-5">
            <div className="space-y-1">
              <p className="text-base font-semibold text-[--text-primary]">
                Votre contexte d'activité
              </p>
              <p className="text-sm leading-6 text-[--text-secondary]">
                Claude va générer 5 cas d'usage spécifiquement adaptés à votre profil.
              </p>
            </div>

            <div className="space-y-2">
              <Label>Combien de clients accompagnez-vous simultanément ? *</Label>
              <div className="grid grid-cols-2 gap-2">
                {CLIENT_COUNTS.map((c) => (
                  <label
                    key={c}
                    className={`flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-2.5 text-sm transition-all ${
                      simultaneousClients === c
                        ? "border-[--amber-border] bg-[--amber-dim] text-[--amber]"
                        : "border-[--border] bg-[--bg-card] text-[--text-secondary] hover:border-[--amber-border]"
                    }`}
                  >
                    <input
                      type="radio"
                      name="clients"
                      value={c}
                      checked={simultaneousClients === c}
                      onChange={() => setSimultaneousClients(c)}
                      className="sr-only"
                    />
                    <span
                      className={`h-4 w-4 shrink-0 rounded-full border-2 transition-all ${
                        simultaneousClients === c
                          ? "border-[--amber] bg-[--amber]"
                          : "border-[--border]"
                      }`}
                    />
                    {c}
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Secteurs maîtrisés * <span className="font-normal text-[--text-muted]">({selectedSectors.length} sélectionné{selectedSectors.length !== 1 ? "s" : ""})</span></Label>
              <CheckboxGrid
                options={SECTORS}
                selected={selectedSectors}
                onToggle={toggleSector}
              />
            </div>

            <div className="space-y-2">
              <Label>Outils IA intégrés habituellement * <span className="font-normal text-[--text-muted]">({selectedTools.length} sélectionné{selectedTools.length !== 1 ? "s" : ""})</span></Label>
              <CheckboxGrid
                options={AI_TOOLS}
                selected={selectedTools}
                onToggle={toggleTool}
              />
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
                className="flex-1 bg-[--amber] hover:bg-[--amber]"
                size="lg"
                type="button"
                disabled={
                  !simultaneousClients ||
                  selectedSectors.length === 0 ||
                  selectedTools.length === 0 ||
                  isPending
                }
                onClick={handleGetUseCases}
              >
                <Zap className="mr-2 h-4 w-4" />
                Générer mes cas d'usage
              </Button>
            </div>
          </div>
        )}

        {/* ── Chargement ── */}
        {step === "loading" && (
          <LoadingSkeleton
            title="Analyse de votre profil en cours…"
            subtitle="Claude génère vos 5 cas d'usage prioritaires avec estimations de mission."
          />
        )}

        {/* ── ÉTAPE 3 : Cas d'usage recommandés ── */}
        {step === "usecases" && recommendation && (
          <div className="space-y-5">
            {/* Positioning summary */}
            <div className="space-y-2">
              <p className="text-base font-semibold text-[--text-primary]">
                Vos 5 cas d'usage Move to AI
              </p>
              <p className="text-sm leading-6 text-[--text-secondary]">
                {recommendation.positioning_summary}
              </p>
            </div>

            {/* Partner tier suggestion */}
            {tierConfig && (
              <div
                className={`flex items-center gap-3 rounded-xl border px-4 py-3 ${tierConfig.bg}`}
              >
                <tierConfig.icon className={`h-5 w-5 shrink-0 ${tierConfig.color}`} />
                <div>
                  <p className={`text-sm font-semibold ${tierConfig.color}`}>
                    Niveau partenaire suggéré : {tierConfig.label}
                  </p>
                  <p className="text-xs text-[--text-muted]">
                    Basé sur votre profil et expérience — évolutif selon vos missions Move to AI
                  </p>
                </div>
              </div>
            )}

            {/* Use cases list */}
            <div className="space-y-3">
              {recommendation.use_cases.map((uc, i) => (
                <UseCaseCard key={uc.id} useCase={uc} index={i} />
              ))}
            </div>

            {/* Value summary */}
            <div className="rounded-2xl border border-[--amber-border] bg-[--amber-dim] p-5">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-[--amber]" />
                <p className="text-sm font-semibold text-[--amber]">
                  Potentiel de revenus indicatif
                </p>
              </div>
              <p className="mt-1 text-sm text-[--amber]">
                En combinant ces 5 cas d'usage sur 2-3 clients simultanément, votre potentiel
                de chiffre d'affaires annuel estimé dépasse{" "}
                <span className="font-bold">60 000 €</span> via Move to AI.
              </p>
            </div>

            <Button
              className="w-full bg-[--amber] hover:bg-[--amber]"
              size="lg"
              type="button"
              disabled={isPending}
              onClick={handleComplete}
            >
              {isPending ? "Création de votre espace…" : "Accéder à mon dashboard consultant →"}
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
