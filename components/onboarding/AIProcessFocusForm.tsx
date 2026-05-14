"use client";

import type { Route } from "next";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader2 } from "lucide-react";

import type { RecommendedProcess } from "@/lib/claude";
import { DomainSelector } from "@/components/onboarding/DomainSelector";
import { ProcessCard } from "@/components/onboarding/ProcessCard";
import { LoadingSkeleton } from "@/components/onboarding/LoadingSkeleton";

type Step = "domains" | "loading" | "recommendations";

type AIProcessFocusFormProps = {
  userFunction: string;
  companySize: string;
  copy: {
    domainsTitle: string;
    domainsSubtitle: string;
    domainsConfirm: string;
    domainsMin: string;
    loadingTitle: string;
    loadingSubtitle: string;
    recommendationsTitle: string;
    recommendationsSubtitle: string;
    profileLabel: string;
    gainLabel: string;
    complexityLabel: string;
    complexity: { low: string; medium: string; high: string };
    confirmButton: string;
    selectAll: string;
    domains: string[];
    errors: { apiError: string; saveError: string };
  };
};

const MAX_DOMAINS = 3;

// ── Shared button style ───────────────────────────────────────────────────────

function PrimaryButton({
  onClick,
  disabled,
  children,
}: {
  onClick?: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        width: "100%",
        padding: "12px 20px",
        borderRadius: 10,
        background: disabled ? "var(--bg-hover)" : "var(--green)",
        color: disabled ? "var(--text-tertiary)" : "#fff",
        fontWeight: 600,
        fontSize: 14,
        border: "none",
        cursor: disabled ? "not-allowed" : "pointer",
        transition: "background 0.15s, color 0.15s",
      }}
    >
      {children}
    </button>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────

export function AIProcessFocusForm({ userFunction, companySize, copy }: AIProcessFocusFormProps) {
  const [step,               setStep]               = useState<Step>("domains");
  const [selectedDomains,    setSelectedDomains]    = useState<string[]>([]);
  const [processes,          setProcesses]          = useState<RecommendedProcess[]>([]);
  const [selectedProcessIds, setSelectedProcessIds] = useState<string[]>([]);
  const [profileSummary,     setProfileSummary]     = useState("");
  const [errorMessage,       setErrorMessage]       = useState("");
  const [isPending,          startTransition]       = useTransition();
  const router = useRouter();

  function toggleDomain(domain: string) {
    setSelectedDomains((cur) => {
      if (cur.includes(domain)) return cur.filter((d) => d !== domain);
      if (cur.length >= MAX_DOMAINS) return cur;
      return [...cur, domain];
    });
  }

  function toggleProcess(id: string) {
    setSelectedProcessIds((cur) =>
      cur.includes(id) ? cur.filter((p) => p !== id) : [...cur, id]
    );
  }

  function handleGetRecommendations() {
    if (selectedDomains.length === 0) return;
    setStep("loading");
    setErrorMessage("");

    startTransition(() => {
      void (async () => {
        try {
          const res = await fetch("/api/onboarding/recommend-processes", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ companySize, userFunction, selectedDomains }),
          });

          const payload = await res.json().catch(() => null) as {
            ok: boolean;
            recommended_processes?: RecommendedProcess[];
            profile_summary?: string;
            fallback?: boolean;
          } | null;

          if (!payload?.ok || !payload.recommended_processes) {
            setErrorMessage(copy.errors.apiError);
            setStep("domains");
            return;
          }

          setProcesses(payload.recommended_processes);
          setSelectedProcessIds(payload.recommended_processes.map((p) => p.id));
          setProfileSummary(payload.profile_summary ?? "");
          if (payload.fallback) setErrorMessage(copy.errors.apiError);
          setStep("recommendations");
        } catch {
          setErrorMessage(copy.errors.apiError);
          setStep("domains");
        }
      })();
    });
  }

  function handleConfirmSelection() {
    if (selectedProcessIds.length === 0) return;
    setErrorMessage("");

    startTransition(() => {
      void (async () => {
        try {
          const res = await fetch("/api/onboarding/complete", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              selectedDomains,
              selectedProcesses: processes.filter((p) => selectedProcessIds.includes(p.id)),
              profileSummary,
            }),
          });

          const payload = await res.json().catch(() => null) as {
            ok: boolean;
            redirectTo?: string;
          } | null;

          if (!res.ok || !payload?.ok) {
            setErrorMessage(copy.errors.saveError);
            return;
          }

          router.push((payload.redirectTo ?? "/app") as Route);
          router.refresh();
        } catch {
          setErrorMessage(copy.errors.saveError);
        }
      })();
    });
  }

  return (
    <div style={{
      background: "var(--bg-card)",
      border: "1px solid var(--border)",
      borderRadius: "var(--r-xl, 16px)",
      padding: "2rem",
      display: "flex",
      flexDirection: "column",
      gap: 24,
    }}>

      {/* ── Étape 1 : sélection des domaines ─────────────────────────────── */}
      {step === "domains" && (
        <>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <p style={{ fontSize: 16, fontWeight: 600, color: "var(--text-primary)", margin: 0 }}>
              {copy.domainsTitle}
            </p>
            <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: 0, lineHeight: 1.6 }}>
              {copy.domainsSubtitle}
            </p>
            <p style={{ fontSize: 12, fontWeight: 500, color: "var(--green)", margin: "4px 0 0" }}>
              {selectedDomains.length} / {MAX_DOMAINS} sélectionné{selectedDomains.length > 1 ? "s" : ""}
            </p>
          </div>

          <DomainSelector
            domains={copy.domains}
            selected={selectedDomains}
            maxSelectable={MAX_DOMAINS}
            onToggle={toggleDomain}
          />

          <PrimaryButton
            onClick={handleGetRecommendations}
            disabled={selectedDomains.length === 0 || isPending}
          >
            {isPending ? (
              <><Loader2 size={15} className="animate-spin" /> Analyse en cours…</>
            ) : (
              <>{copy.domainsConfirm} <ArrowRight size={15} /></>
            )}
          </PrimaryButton>

          {selectedDomains.length === 0 && (
            <p style={{ textAlign: "center", fontSize: 12, color: "var(--text-tertiary)", margin: 0 }}>
              {copy.domainsMin}
            </p>
          )}
        </>
      )}

      {/* ── Étape 2 : chargement ─────────────────────────────────────────── */}
      {step === "loading" && (
        <LoadingSkeleton title={copy.loadingTitle} subtitle={copy.loadingSubtitle} />
      )}

      {/* ── Étape 3 : processus recommandés ──────────────────────────────── */}
      {step === "recommendations" && (
        <>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <p style={{ fontSize: 16, fontWeight: 600, color: "var(--text-primary)", margin: 0 }}>
              {copy.recommendationsTitle}
            </p>
            <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: 0, lineHeight: 1.6 }}>
              {copy.recommendationsSubtitle}
            </p>
            {profileSummary && (
              <div style={{
                marginTop: 4,
                padding: "8px 12px",
                borderRadius: 8,
                background: "var(--green-dim)",
                border: "1px solid var(--green-border)",
                fontSize: 12,
                color: "var(--green)",
              }}>
                {copy.profileLabel} : {profileSummary}
              </div>
            )}
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <p style={{ fontSize: 12, color: "var(--text-tertiary)", margin: 0 }}>
              {selectedProcessIds.length} / {processes.length} sélectionnés
            </p>
            <button
              type="button"
              onClick={() => setSelectedProcessIds(processes.map((p) => p.id))}
              style={{
                background: "none", border: "none", cursor: "pointer",
                fontSize: 12, fontWeight: 500, color: "var(--green)",
                textDecoration: "underline", textUnderlineOffset: 3, padding: 0,
              }}
            >
              {copy.selectAll}
            </button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {processes.map((process) => (
              <ProcessCard
                key={process.id}
                process={process}
                isSelected={selectedProcessIds.includes(process.id)}
                isLocked={false}
                onToggle={toggleProcess}
                copy={{
                  gainLabel:       copy.gainLabel,
                  complexityLabel: copy.complexityLabel,
                  complexity:      copy.complexity,
                }}
              />
            ))}
          </div>

          <PrimaryButton
            onClick={handleConfirmSelection}
            disabled={selectedProcessIds.length === 0 || isPending}
          >
            {isPending ? (
              <><Loader2 size={15} className="animate-spin" /> Enregistrement…</>
            ) : (
              <>{copy.confirmButton} <ArrowRight size={15} /></>
            )}
          </PrimaryButton>
        </>
      )}

      {/* ── Erreur ───────────────────────────────────────────────────────── */}
      {errorMessage && (
        <div style={{
          padding: "10px 14px",
          borderRadius: 8,
          background: "rgba(239,68,68,0.08)",
          border: "1px solid rgba(239,68,68,0.25)",
          fontSize: 13,
          color: "var(--red)",
        }}>
          {errorMessage}
        </div>
      )}
    </div>
  );
}
