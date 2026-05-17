"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

interface OpportunityItem {
  code: string;
  title: string;
  domain: string;
  aiType: string;
  priority: string;
  gainEstimate?: string;
}

interface Props {
  opportunities: OpportunityItem[];
}

export function OpportunitiesSelector({ opportunities }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [created, setCreated] = useState<Set<string>>(new Set());
  const [error, setError] = useState("");

  async function createOpportunity(opp: OpportunityItem) {
    const res = await fetch("/api/opportunities", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: opp.title,
        description: `Opportunité d'automatisation IA — ${opp.domain}`,
        domain: opp.domain,
        aiType: opp.aiType,
        priorityLevel: opp.priority === "P0" ? "CRITICAL" : opp.priority === "P1" ? "HIGH" : "MEDIUM",
        estimatedGain: opp.gainEstimate,
      }),
    });

    if (res.ok) {
      setCreated((prev) => new Set([...prev, opp.code]));
    } else {
      setError("Erreur lors de la création. Réessayez.");
    }
  }

  function handleFinish() {
    startTransition(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      router.push("/app/onboarding/complete" as any);
    });
  }

  const AI_TYPE_LABELS: Record<string, string> = {
    automation: "Automatisation",
    assistant:  "Assistant IA",
    analysis:   "Analyse",
    generation: "Génération",
  };

  const PRIORITY_COLORS: Record<string, string> = {
    P0: "var(--red)",
    P1: "var(--amber)",
    P2: "var(--blue)",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {opportunities.map((opp) => {
        const isCreated = created.has(opp.code);
        return (
          <div key={opp.code} style={{
            padding: "16px 18px",
            borderRadius: 12,
            border: `1.5px solid ${isCreated ? "var(--green-border)" : "var(--border)"}`,
            background: isCreated ? "var(--green-dim)" : "var(--bg-primary)",
            display: "flex", alignItems: "flex-start", gap: 16,
            transition: "border-color 0.2s, background 0.2s",
          }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 6 }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>{opp.title}</span>
                <span style={{
                  fontSize: 10, padding: "2px 8px", borderRadius: 999, fontWeight: 700,
                  background: `color-mix(in srgb, ${PRIORITY_COLORS[opp.priority] ?? "var(--blue)"} 15%, transparent)`,
                  color: PRIORITY_COLORS[opp.priority] ?? "var(--blue)",
                  border: `1px solid ${PRIORITY_COLORS[opp.priority] ?? "var(--blue)"}`,
                }}>
                  {opp.priority}
                </span>
                <span style={{ fontSize: 10, color: "var(--text-muted)", padding: "2px 8px", borderRadius: 999, border: "1px solid var(--border)" }}>
                  {AI_TYPE_LABELS[opp.aiType] ?? opp.aiType}
                </span>
              </div>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                <span style={{ fontSize: 11, color: "var(--text-muted)" }}>Domaine : {opp.domain}</span>
                {opp.gainEstimate && (
                  <span style={{ fontSize: 11, color: "var(--green)", fontWeight: 600 }}>
                    Gain estimé : {opp.gainEstimate}
                  </span>
                )}
              </div>
            </div>
            <button
              type="button"
              disabled={isCreated}
              onClick={() => createOpportunity(opp)}
              style={{
                padding: "8px 16px", borderRadius: 8, flexShrink: 0,
                border: "none",
                background: isCreated ? "var(--green)" : "var(--blue)",
                color: "#fff", fontSize: 12, fontWeight: 700,
                cursor: isCreated ? "default" : "pointer",
                opacity: 1,
              }}
            >
              {isCreated ? "✓ Créée" : "Créer"}
            </button>
          </div>
        );
      })}

      {opportunities.length === 0 && (
        <div style={{ padding: "40px 0", textAlign: "center", color: "var(--text-muted)", fontSize: 14 }}>
          Aucune suggestion disponible pour votre secteur.
        </div>
      )}

      {error && <p style={{ fontSize: 13, color: "var(--red)", margin: 0 }}>{error}</p>}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
        <span style={{ fontSize: 13, color: "var(--text-muted)" }}>
          {created.size} opportunité{created.size > 1 ? "s" : ""} créée{created.size > 1 ? "s" : ""}
        </span>
        <button
          type="button"
          onClick={handleFinish}
          disabled={isPending}
          style={{
            padding: "12px 28px", borderRadius: 10,
            background: "var(--blue)", color: "#fff",
            fontSize: 14, fontWeight: 700,
            border: "none", cursor: isPending ? "not-allowed" : "pointer",
            opacity: isPending ? 0.7 : 1,
          }}
        >
          {isPending ? "Redirection..." : "Terminer →"}
        </button>
      </div>
    </div>
  );
}
