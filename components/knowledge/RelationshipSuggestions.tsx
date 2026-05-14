"use client";

import { useState, useEffect, useCallback } from "react";
import { Loader2, CheckCircle2, XCircle, Search, RefreshCw, ArrowRight } from "lucide-react";

interface Suggestion {
  id: string;
  sourceType: string;
  sourceId: string;
  targetType: string;
  targetId: string;
  confidence: number;
  rationale: string;
  status: string;
  sourceName: string;
  targetName: string;
}

function ConfidenceBadge({ value }: { value: number }) {
  const pct = Math.round(value * 100);
  let bg: string;
  let color: string;

  if (value >= 0.7) {
    bg = "var(--green-dim, rgba(34,197,94,0.12))";
    color = "var(--green, #22c55e)";
  } else if (value >= 0.4) {
    bg = "var(--amber-dim, rgba(251,191,36,0.12))";
    color = "var(--amber, #f59e0b)";
  } else {
    bg = "var(--red-dim, rgba(239,68,68,0.12))";
    color = "var(--red, #ef4444)";
  }

  return (
    <span
      style={{
        backgroundColor: bg,
        color,
        padding: "2px 8px",
        borderRadius: 9999,
        fontSize: 12,
        fontWeight: 600,
        whiteSpace: "nowrap",
      }}
    >
      {pct}% confiance
    </span>
  );
}

function TypeBadge({ type }: { type: string }) {
  const labels: Record<string, string> = {
    application: "Application",
    capability: "Capacité",
    process: "Processus",
  };
  return (
    <span
      style={{
        fontSize: 11,
        padding: "1px 6px",
        borderRadius: 4,
        backgroundColor: "var(--bg-muted, rgba(255,255,255,0.06))",
        color: "var(--text-muted, #888)",
        fontWeight: 500,
        marginLeft: 4,
      }}
    >
      {labels[type] ?? type}
    </span>
  );
}

export function RelationshipSuggestions() {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actioning, setActioning] = useState<string | null>(null);

  const fetchSuggestions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/ai/suggest-relationships");
      if (!res.ok) throw new Error("Erreur lors du chargement");
      const data = await res.json();
      setSuggestions(data.suggestions ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSuggestions();
  }, [fetchSuggestions]);

  async function handleAnalyze() {
    setAnalyzing(true);
    setError(null);
    try {
      const res = await fetch("/api/ai/suggest-relationships", { method: "POST" });
      if (!res.ok) throw new Error("Erreur lors de l'analyse");
      await fetchSuggestions();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur inconnue");
    } finally {
      setAnalyzing(false);
    }
  }

  async function handleAction(id: string, status: "accepted" | "rejected") {
    setActioning(id);
    setError(null);
    try {
      const res = await fetch(`/api/ai/suggest-relationships/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Erreur lors de l'action");
      setSuggestions((prev) => prev.filter((s) => s.id !== id));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur inconnue");
    } finally {
      setActioning(null);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: "var(--text-primary)" }}>
            Relations suggérées par l'IA
          </h3>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--text-muted, #888)" }}>
            {suggestions.length} suggestion{suggestions.length !== 1 ? "s" : ""} en attente
          </p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={fetchSuggestions}
            disabled={loading || analyzing}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "8px 14px",
              borderRadius: 8,
              border: "1px solid var(--border)",
              backgroundColor: "transparent",
              color: "var(--text-primary)",
              cursor: loading || analyzing ? "not-allowed" : "pointer",
              fontSize: 13,
              opacity: loading || analyzing ? 0.5 : 1,
            }}
          >
            {loading ? <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> : <RefreshCw size={14} />}
            Actualiser
          </button>
          <button
            onClick={handleAnalyze}
            disabled={loading || analyzing}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "8px 16px",
              borderRadius: 8,
              border: "none",
              backgroundColor: "var(--green, #22c55e)",
              color: "#fff",
              cursor: loading || analyzing ? "not-allowed" : "pointer",
              fontSize: 13,
              fontWeight: 600,
              opacity: loading || analyzing ? 0.7 : 1,
            }}
          >
            {analyzing ? (
              <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} />
            ) : (
              <Search size={14} />
            )}
            {analyzing ? "Analyse en cours…" : "Analyser les relations manquantes"}
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div
          style={{
            padding: "10px 14px",
            borderRadius: 8,
            backgroundColor: "var(--red-dim, rgba(239,68,68,0.1))",
            color: "var(--red, #ef4444)",
            fontSize: 13,
          }}
        >
          {error}
        </div>
      )}

      {/* Loading skeleton */}
      {loading && suggestions.length === 0 && (
        <div style={{ color: "var(--text-muted, #888)", fontSize: 14, padding: "24px 0", textAlign: "center" }}>
          <Loader2 size={20} style={{ animation: "spin 1s linear infinite", display: "inline-block" }} />
          <span style={{ marginLeft: 8 }}>Chargement…</span>
        </div>
      )}

      {/* Empty state */}
      {!loading && suggestions.length === 0 && !error && (
        <div
          style={{
            padding: "32px 24px",
            textAlign: "center",
            borderRadius: 10,
            border: "1px dashed var(--border)",
            color: "var(--text-muted, #888)",
          }}
        >
          <Search size={32} style={{ marginBottom: 12, opacity: 0.4 }} />
          <p style={{ margin: 0, fontWeight: 500 }}>Aucune suggestion en attente</p>
          <p style={{ margin: "6px 0 0", fontSize: 13 }}>
            Cliquez sur « Analyser les relations manquantes » pour lancer l'analyse IA.
          </p>
        </div>
      )}

      {/* Suggestions list */}
      {suggestions.map((s) => {
        const isActioning = actioning === s.id;
        return (
          <div
            key={s.id}
            style={{
              padding: "14px 16px",
              borderRadius: 10,
              border: "1px solid var(--border)",
              backgroundColor: "var(--bg-card)",
              display: "flex",
              flexDirection: "column",
              gap: 10,
            }}
          >
            {/* Relation row */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <span style={{ fontWeight: 600, color: "var(--text-primary)", fontSize: 14 }}>
                {s.sourceName}
              </span>
              <TypeBadge type={s.sourceType} />
              <ArrowRight size={14} color="var(--text-muted, #888)" style={{ flexShrink: 0 }} />
              <span style={{ fontWeight: 600, color: "var(--text-primary)", fontSize: 14 }}>
                {s.targetName}
              </span>
              <TypeBadge type={s.targetType} />
              <div style={{ marginLeft: "auto" }}>
                <ConfidenceBadge value={s.confidence} />
              </div>
            </div>

            {/* Rationale */}
            <p style={{ margin: 0, fontSize: 13, color: "var(--text-muted, #888)", lineHeight: 1.5 }}>
              {s.rationale}
            </p>

            {/* Actions */}
            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={() => handleAction(s.id, "accepted")}
                disabled={isActioning}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  padding: "6px 12px",
                  borderRadius: 6,
                  border: "1px solid var(--green-border, #22c55e)",
                  backgroundColor: "var(--green-dim, rgba(34,197,94,0.1))",
                  color: "var(--green, #22c55e)",
                  cursor: isActioning ? "not-allowed" : "pointer",
                  fontSize: 13,
                  fontWeight: 500,
                  opacity: isActioning ? 0.5 : 1,
                }}
              >
                {isActioning ? (
                  <Loader2 size={13} style={{ animation: "spin 1s linear infinite" }} />
                ) : (
                  <CheckCircle2 size={13} />
                )}
                Accepter
              </button>
              <button
                onClick={() => handleAction(s.id, "rejected")}
                disabled={isActioning}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  padding: "6px 12px",
                  borderRadius: 6,
                  border: "1px solid var(--border)",
                  backgroundColor: "transparent",
                  color: "var(--text-muted, #888)",
                  cursor: isActioning ? "not-allowed" : "pointer",
                  fontSize: 13,
                  fontWeight: 500,
                  opacity: isActioning ? 0.5 : 1,
                }}
              >
                <XCircle size={13} />
                Rejeter
              </button>
            </div>
          </div>
        );
      })}

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
