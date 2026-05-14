"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, RefreshCw } from "lucide-react";

export function DataQualityRefreshButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleRefresh() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/ai/data-quality", { method: "POST" });
      if (!res.ok) throw new Error("Erreur lors de l'analyse");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur inconnue");
      setLoading(false);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 6 }}>
      <button
        onClick={handleRefresh}
        disabled={loading}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "10px 20px",
          borderRadius: 8,
          border: "none",
          backgroundColor: "var(--green, #22c55e)",
          color: "#fff",
          cursor: loading ? "not-allowed" : "pointer",
          fontSize: 14,
          fontWeight: 600,
          opacity: loading ? 0.7 : 1,
        }}
      >
        {loading ? (
          <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} />
        ) : (
          <RefreshCw size={16} />
        )}
        {loading ? "Analyse en cours…" : "Analyser maintenant"}
      </button>
      {error && (
        <span style={{ fontSize: 13, color: "var(--red, #ef4444)" }}>{error}</span>
      )}
      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
