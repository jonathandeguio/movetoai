"use client";

import type { Route } from "next";
import { useState, useTransition, useMemo } from "react";
import { useRouter } from "next/navigation";

import { OnboardingStepper }             from "@/components/onboarding/OnboardingStepper";
import { CompanySizePicker }             from "@/components/onboarding/CompanySizePicker";
import { SectorPicker }                  from "@/components/onboarding/SectorPicker";
import { SectorPreview }                 from "@/components/onboarding/SectorPreview";
import { CertificationOnboardingStep, type CertificationSelection }
                                         from "@/components/onboarding/CertificationOnboardingStep";
import { createWorkspaceFromOnboarding } from "@/lib/onboarding/create-workspace";
import { SECTOR_CONFIG, type CompanySize, type Sector }
                                         from "@/lib/onboarding/sector-config";
import { getCertificationsForContext, FAMILY_LABELS }
                                         from "@/lib/seed/certifications";
import type { Locale }                   from "@/lib/i18n/config";

// ── Options ───────────────────────────────────────────────────────────────────

const MATURITY_OPTIONS = [
  { value: "debutant",        label: "Débutant",       desc: "Nous démarrons notre réflexion IA" },
  { value: "experimentateur", label: "Expérimentateur", desc: "Quelques projets pilotes en cours" },
  { value: "avance",          label: "Avancé",          desc: "Plusieurs déploiements en production" },
  { value: "leader",          label: "Leader",          desc: "L'IA est au cœur de notre stratégie" },
];

const PRIORITY_OPTIONS = [
  { value: "cost_reduction",      label: "Réduction des coûts"          },
  { value: "productivity",        label: "Productivité & automatisation" },
  { value: "customer_experience", label: "Expérience client"            },
  { value: "risk_compliance",     label: "Risque & conformité"          },
  { value: "innovation",          label: "Innovation produit"            },
  { value: "data_quality",        label: "Qualité des données"          },
];

const HORIZON_OPTIONS = [
  { value: "6_months", label: "6 mois" },
  { value: "1_year",   label: "1 an"   },
  { value: "3_years",  label: "3 ans"  },
];

const STEPS = [
  { id: 1, label: "Entreprise"     },
  { id: 2, label: "Secteur"        },
  { id: 3, label: "Certifications" },
  { id: 4, label: "Maturité"       },
  { id: 5, label: "Aperçu"         },
];

// ── Types ─────────────────────────────────────────────────────────────────────

interface WizardState {
  companyName:      string;
  workspaceName:    string;
  size:             CompanySize | "";
  sector:           Sector | "";
  certifications:   CertificationSelection[];
  aiMaturity:       string;
  priorities:       string[];
  horizon:          string;
}

interface Props {
  userId:   string;
  locale:   Locale;
  userName: string;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function WorkspaceSetupWizard({ userId, locale, userName }: Props) {
  const router = useRouter();
  const [step, setStep]       = useState(1);
  const [error, setError]     = useState("");
  const [isPending, startTransition] = useTransition();

  const [state, setState] = useState<WizardState>({
    companyName:    "",
    workspaceName:  "",
    size:           "",
    sector:         "",
    certifications: [],
    aiMaturity:     "debutant",
    priorities:     [],
    horizon:        "1_year",
  });

  const update = <K extends keyof WizardState>(key: K, value: WizardState[K]) =>
    setState((s) => ({ ...s, [key]: value }));

  // ── Validation ──────────────────────────────────────────────────────────────

  const canProceed = () => {
    if (step === 1) return state.companyName.trim().length >= 2 && !!state.size;
    if (step === 2) return !!state.sector;
    if (step === 3) return true; // certifications optional
    if (step === 4) return !!state.aiMaturity && !!state.horizon;
    return true;
  };

  // ── Certification preview for step 3 ────────────────────────────────────────

  const certPreview = useMemo(() => {
    if (!state.sector || !state.size) return null;
    const all = getCertificationsForContext(state.sector, state.size as CompanySize);
    return {
      total:     all.length,
      mandatory: all.filter((c) => c.isMandatory).length,
    };
  }, [state.sector, state.size]);

  // ── Summary for step 5 ──────────────────────────────────────────────────────

  const certSummary = useMemo(() => {
    const current = state.certifications.filter((c) => c.type === "current");
    const target  = state.certifications.filter((c) => c.type === "target");
    const byFamily = (list: CertificationSelection[]) => {
      const g: Record<string, string[]> = {};
      list.forEach((c) => { g[c.family] ??= []; g[c.family].push(c.shortName); });
      return g;
    };
    return { current, target, currentByFamily: byFamily(current), targetByFamily: byFamily(target) };
  }, [state.certifications]);

  // ── Submit ──────────────────────────────────────────────────────────────────

  const handleSubmit = () => {
    if (!state.sector || !state.size) return;
    setError("");
    startTransition(async () => {
      try {
        const result = await createWorkspaceFromOnboarding({
          userId,
          preferredLocale:  locale,
          companyName:      state.companyName.trim(),
          workspaceName:    state.workspaceName.trim() || state.companyName.trim(),
          sector:           state.sector as Sector,
          companySize:      state.size as CompanySize,
          certifications:   state.certifications,
          aiMaturity:       state.aiMaturity,
          priorities:       state.priorities,
          horizon:          state.horizon,
        });
        router.push(`/app/welcome?w=${result.workspaceId}` as Route);
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Erreur inconnue";
        if (msg === "ALREADY_ONBOARDED") {
          router.push("/app" as Route);
        } else {
          setError("Une erreur est survenue, veuillez réessayer.");
          console.error(err);
        }
      }
    });
  };

  // ── Shared styles ───────────────────────────────────────────────────────────

  const card: React.CSSProperties = {
    background: "var(--bg-card)", borderRadius: 16,
    border: "1.5px solid var(--border)", padding: "32px 36px",
    width: "100%", maxWidth: 640, boxSizing: "border-box",
  };
  const title: React.CSSProperties = {
    fontSize: 20, fontWeight: 700,
    color: "var(--text-primary)", marginBottom: 6, marginTop: 0,
  };
  const subtitle: React.CSSProperties = {
    fontSize: 14, color: "var(--text-muted)", marginBottom: 24, marginTop: 0,
  };

  return (
    <div style={{ width: "100%", maxWidth: 640, margin: "0 auto" }}>
      <OnboardingStepper steps={STEPS} currentStep={step} />

      <div style={card}>

        {/* ── Step 1 : Entreprise ──────────────────────────────────────────── */}
        {step === 1 && (
          <div>
            <p style={title}>Votre entreprise</p>
            <p style={subtitle}>
              Bonjour {userName.split(" ")[0]} 👋 Commençons par quelques infos de base.
            </p>
            <div style={{ marginBottom: 16 }}>
              <label style={{
                fontSize: 13, fontWeight: 600,
                color: "var(--text-secondary)", display: "block", marginBottom: 6,
              }}>
                Nom de l'entreprise *
              </label>
              <input
                type="text"
                value={state.companyName}
                onChange={(e) => {
                  update("companyName", e.target.value);
                  if (!state.workspaceName) update("workspaceName", e.target.value);
                }}
                placeholder="Acme Corp"
                style={{
                  width: "100%", padding: "10px 14px", boxSizing: "border-box",
                  borderRadius: 10, border: "1.5px solid var(--border)",
                  background: "var(--bg-input)", color: "var(--text-primary)",
                  fontSize: 14, outline: "none",
                }}
              />
            </div>
            <div style={{ marginBottom: 24 }}>
              <label style={{
                fontSize: 13, fontWeight: 600,
                color: "var(--text-secondary)", display: "block", marginBottom: 6,
              }}>
                Taille de l'entreprise *
              </label>
              <CompanySizePicker value={state.size} onChange={(v) => update("size", v)} />
            </div>
          </div>
        )}

        {/* ── Step 2 : Secteur ─────────────────────────────────────────────── */}
        {step === 2 && (
          <div>
            <p style={title}>Votre secteur d'activité</p>
            <p style={subtitle}>
              Nous pré-configurerons votre workspace avec des capacités et opportunités IA adaptées à votre secteur.
            </p>
            <SectorPicker value={state.sector} onChange={(v) => update("sector", v)} />
          </div>
        )}

        {/* ── Step 3 : Certifications ──────────────────────────────────────── */}
        {step === 3 && state.sector && state.size && (
          <div>
            <p style={title}>Vos certifications</p>
            <p style={subtitle}>
              Déclarez vos certifications actuelles et vos objectifs —{" "}
              votre Dashboard de Conformité sera opérationnel dès J0.
              {certPreview && (
                <span style={{
                  display: "inline-block", marginLeft: 8,
                  fontSize: 12, color: "var(--green)", fontWeight: 600,
                }}>
                  {certPreview.total} pertinentes dont {certPreview.mandatory} obligatoires
                </span>
              )}
            </p>

            <CertificationOnboardingStep
              sector={state.sector}
              companySize={state.size as CompanySize}
              value={state.certifications}
              onChange={(v) => update("certifications", v)}
            />
          </div>
        )}

        {/* ── Step 4 : Maturité & Priorités ────────────────────────────────── */}
        {step === 4 && (
          <div>
            <p style={title}>Maturité IA & priorités</p>
            <p style={subtitle}>
              Ces informations personnalisent les opportunités et la feuille de route suggérées.
            </p>

            {/* Maturity */}
            <div style={{ marginBottom: 20 }}>
              <label style={{
                fontSize: 13, fontWeight: 600,
                color: "var(--text-secondary)", display: "block", marginBottom: 8,
              }}>
                Maturité IA actuelle
              </label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {MATURITY_OPTIONS.map((opt) => {
                  const sel = state.aiMaturity === opt.value;
                  return (
                    <button
                      key={opt.value} type="button"
                      onClick={() => update("aiMaturity", opt.value)}
                      style={{
                        padding: "10px 12px", borderRadius: 10, textAlign: "left",
                        border: `2px solid ${sel ? "var(--green)" : "var(--border)"}`,
                        background: sel ? "var(--green-dim)" : "var(--bg-primary)",
                        cursor: "pointer", outline: "none",
                      }}
                    >
                      <div style={{ fontSize: 13, fontWeight: 600, color: sel ? "var(--green)" : "var(--text-primary)" }}>
                        {opt.label}
                      </div>
                      <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>{opt.desc}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Priorities */}
            <div style={{ marginBottom: 20 }}>
              <label style={{
                fontSize: 13, fontWeight: 600,
                color: "var(--text-secondary)", display: "block", marginBottom: 8,
              }}>
                Priorités stratégiques (choisissez jusqu'à 3)
              </label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {PRIORITY_OPTIONS.map((opt) => {
                  const sel    = state.priorities.includes(opt.value);
                  const canAdd = !sel && state.priorities.length < 3;
                  return (
                    <button
                      key={opt.value} type="button"
                      onClick={() => {
                        if (sel) {
                          update("priorities", state.priorities.filter((p) => p !== opt.value));
                        } else if (canAdd) {
                          update("priorities", [...state.priorities, opt.value]);
                        }
                      }}
                      style={{
                        padding: "6px 12px", borderRadius: 999, fontSize: 12, fontWeight: 500,
                        border: `1.5px solid ${sel ? "var(--green)" : "var(--border)"}`,
                        background: sel ? "var(--green-dim)" : "var(--bg-primary)",
                        color: sel ? "var(--green)" : canAdd ? "var(--text-secondary)" : "var(--text-muted)",
                        cursor: canAdd || sel ? "pointer" : "default",
                        outline: "none", opacity: !canAdd && !sel ? 0.5 : 1,
                      }}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Horizon */}
            <div>
              <label style={{
                fontSize: 13, fontWeight: 600,
                color: "var(--text-secondary)", display: "block", marginBottom: 8,
              }}>
                Horizon de la transformation
              </label>
              <div style={{ display: "flex", gap: 8 }}>
                {HORIZON_OPTIONS.map((opt) => {
                  const sel = state.horizon === opt.value;
                  return (
                    <button
                      key={opt.value} type="button"
                      onClick={() => update("horizon", opt.value)}
                      style={{
                        flex: 1, padding: "8px 12px", borderRadius: 10, fontSize: 13,
                        fontWeight: sel ? 700 : 500,
                        border: `2px solid ${sel ? "var(--green)" : "var(--border)"}`,
                        background: sel ? "var(--green-dim)" : "var(--bg-primary)",
                        color: sel ? "var(--green)" : "var(--text-secondary)",
                        cursor: "pointer", outline: "none",
                      }}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ── Step 5 : Aperçu ──────────────────────────────────────────────── */}
        {step === 5 && state.sector && state.size && (
          <div>
            <p style={title}>Votre workspace est prêt à être configuré</p>
            <p style={subtitle}>
              Voici ce qui sera créé pour{" "}
              <strong>{SECTOR_CONFIG[state.sector as Sector].label}</strong>{" "}
              ({state.size.toUpperCase()}).
            </p>

            {/* Certification recap */}
            {state.certifications.length > 0 && (
              <div style={{
                marginBottom: 16, padding: "12px 16px", borderRadius: 12,
                border: "1.5px solid var(--green-border)", background: "var(--green-dim)",
              }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)", margin: "0 0 8px" }}>
                  🛡 {state.certifications.length} certification{state.certifications.length > 1 ? "s" : ""} déclarée{state.certifications.length > 1 ? "s" : ""}
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                  {certSummary.current.map((c) => (
                    <span key={c.code} style={{
                      fontSize: 11, padding: "2px 8px", borderRadius: 999,
                      background: "var(--green)", color: "#fff", fontWeight: 600,
                    }}>
                      ✓ {c.shortName}
                    </span>
                  ))}
                  {certSummary.target.map((c) => (
                    <span key={c.code} style={{
                      fontSize: 11, padding: "2px 8px", borderRadius: 999,
                      border: "1.5px solid var(--purple)", color: "var(--purple)", fontWeight: 600,
                    }}>
                      🎯 {c.shortName}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <SectorPreview sector={state.sector as Sector} size={state.size as CompanySize} />
          </div>
        )}

        {/* ── Error ───────────────────────────────────────────────────────── */}
        {error && (
          <div style={{
            marginTop: 12, padding: "10px 14px", borderRadius: 8,
            background: "var(--red-dim)", border: "1.5px solid var(--red-border)",
            fontSize: 13, color: "var(--red)",
          }}>
            {error}
          </div>
        )}

        {/* ── Navigation ──────────────────────────────────────────────────── */}
        <div style={{ display: "flex", gap: 10, marginTop: 28 }}>
          {step > 1 && (
            <button
              type="button"
              onClick={() => setStep((s) => s - 1)}
              disabled={isPending}
              style={{
                padding: "10px 20px", borderRadius: 10, fontSize: 14, fontWeight: 500,
                border: "1.5px solid var(--border)", background: "var(--bg-primary)",
                color: "var(--text-secondary)", cursor: "pointer", outline: "none",
                flex: "0 0 auto",
              }}
            >
              ← Retour
            </button>
          )}
          <button
            type="button"
            disabled={!canProceed() || isPending}
            onClick={() => {
              if (step < STEPS.length) setStep((s) => s + 1);
              else handleSubmit();
            }}
            style={{
              flex: 1, padding: "12px 24px", borderRadius: 10, fontSize: 15, fontWeight: 700,
              background: canProceed() && !isPending ? "var(--green)" : "var(--bg-muted)",
              color:      canProceed() && !isPending ? "#fff" : "var(--text-muted)",
              border: "none",
              cursor: canProceed() && !isPending ? "pointer" : "default",
              outline: "none", transition: "all 0.15s",
            }}
          >
            {isPending
              ? "Création en cours…"
              : step < STEPS.length
                ? "Continuer →"
                : "🚀 Créer mon workspace"}
          </button>
        </div>
      </div>
    </div>
  );
}
