"use client";

import { useState } from "react";
import type { Route } from "next";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, Plus, Trash2, Layers } from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────

type ScenarioItem = {
  id: string;
  title: string;
  investmentEuros: number;
  expectedGainEuros: number;
  timelineMonths: number;
  effort: "low" | "medium" | "high";
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function generateId() {
  return Math.random().toString(36).slice(2, 10);
}

function emptyItem(): ScenarioItem {
  return {
    id: generateId(),
    title: "",
    investmentEuros: 0,
    expectedGainEuros: 0,
    timelineMonths: 3,
    effort: "medium",
  };
}

function computeItemRoi(item: ScenarioItem): number | null {
  if (item.investmentEuros <= 0) return null;
  return ((item.expectedGainEuros - item.investmentEuros) / item.investmentEuros) * 100;
}

const fmt = (n: number) =>
  new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(n);

const EFFORT_LABELS: Record<string, string> = {
  low: "Faible",
  medium: "Moyen",
  high: "Élevé",
};

const INPUT_STYLE: React.CSSProperties = {
  width: "100%",
  fontSize: "13px",
  color: "var(--text-primary)",
  background: "transparent",
  border: "1px solid transparent",
  borderRadius: "6px",
  padding: "4px 6px",
  outline: "none",
  fontFamily: "inherit",
  transition: "border-color 0.15s",
};

// ── Page ──────────────────────────────────────────────────────────────────────

export default function NewScenarioPage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [items, setItems] = useState<ScenarioItem[]>([emptyItem()]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const totalInvestment = items.reduce((acc, i) => acc + i.investmentEuros, 0);
  const totalGain = items.reduce((acc, i) => acc + i.expectedGainEuros, 0);
  const globalRoi =
    totalInvestment > 0 ? ((totalGain - totalInvestment) / totalInvestment) * 100 : null;

  const updateItem = (idx: number, patch: Partial<ScenarioItem>) => {
    setItems((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], ...patch };
      return next;
    });
  };

  const addItem = () => setItems((prev) => [...prev, emptyItem()]);
  const removeItem = (idx: number) => setItems((prev) => prev.filter((_, i) => i !== idx));

  const handleSubmit = async () => {
    if (!title.trim()) {
      setError("Le titre est requis.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/scenarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || undefined,
          items: items.map(({ id: _id, ...rest }) => rest),
        }),
      });
      if (!res.ok) {
        const d = await res.json();
        setError(d.error ?? "Erreur lors de la création");
        setSubmitting(false);
        return;
      }
      const { id } = await res.json();
      router.push(`/app/scenarios/${id}` as Route);
    } catch {
      setError("Erreur réseau");
      setSubmitting(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      {/* Breadcrumb */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <Link
          href={"/app/scenarios" as Route}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "4px",
            fontSize: "13px",
            color: "var(--text-muted)",
            textDecoration: "none",
          }}
        >
          <ChevronLeft size={14} />
          Scénarios
        </Link>
        <span style={{ fontSize: "13px", color: "var(--text-muted)" }}>/</span>
        <span style={{ fontSize: "13px", color: "var(--text-secondary)", fontWeight: 500 }}>
          Nouveau scénario
        </span>
      </div>

      {/* Page header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          background: "var(--bg-card)",
          border: "1px solid var(--green-border)",
          borderRadius: "16px",
          padding: "1.25rem 1.5rem",
        }}
      >
        <span
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "40px",
            height: "40px",
            borderRadius: "12px",
            background: "var(--green-dim)",
            color: "var(--green)",
          }}
        >
          <Layers size={18} />
        </span>
        <div>
          <h1 style={{ fontSize: "18px", fontWeight: 700, color: "var(--text-primary)" }}>
            Nouveau scénario
          </h1>
          <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>
            Définissez vos initiatives et estimez leur impact financier.
          </p>
        </div>
      </div>

      {/* Meta fields */}
      <div
        style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border)",
          borderRadius: "16px",
          padding: "1.25rem 1.5rem",
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
        }}
      >
        <div>
          <label
            style={{
              display: "block",
              fontSize: "12px",
              fontWeight: 600,
              color: "var(--text-muted)",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              marginBottom: "6px",
            }}
          >
            Titre <span style={{ color: "var(--red)" }}>*</span>
          </label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ex : Scénario optimiste 2025"
            style={{
              width: "100%",
              height: "40px",
              fontSize: "15px",
              fontWeight: 600,
              color: "var(--text-primary)",
              background: "var(--bg-hover)",
              border: "1px solid var(--border)",
              borderRadius: "10px",
              padding: "0 12px",
              outline: "none",
              fontFamily: "inherit",
              boxSizing: "border-box",
            }}
          />
        </div>

        <div>
          <label
            style={{
              display: "block",
              fontSize: "12px",
              fontWeight: 600,
              color: "var(--text-muted)",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              marginBottom: "6px",
            }}
          >
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description optionnelle du scénario…"
            rows={3}
            style={{
              width: "100%",
              fontSize: "14px",
              color: "var(--text-secondary)",
              background: "var(--bg-hover)",
              border: "1px solid var(--border)",
              borderRadius: "10px",
              padding: "10px 12px",
              outline: "none",
              resize: "vertical",
              fontFamily: "inherit",
              boxSizing: "border-box",
            }}
          />
        </div>
      </div>

      {/* Items table */}
      <div
        style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border)",
          borderRadius: "16px",
          overflow: "hidden",
        }}
      >
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
            <thead>
              <tr style={{ background: "var(--bg-hover)" }}>
                {["Initiative", "Investissement (€)", "Gain attendu (€)", "Délai (mois)", "Effort", "ROI", ""].map((h) => (
                  <th
                    key={h}
                    style={{
                      padding: "10px 14px",
                      textAlign: "left",
                      fontSize: "11px",
                      fontWeight: 600,
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                      color: "var(--text-muted)",
                      whiteSpace: "nowrap",
                      borderBottom: "1px solid var(--border)",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => {
                const itemRoi = computeItemRoi(item);
                return (
                  <tr key={item.id} style={{ borderBottom: "1px solid var(--border)" }}>
                    <td style={{ padding: "8px 14px", minWidth: "200px" }}>
                      <input
                        value={item.title}
                        onChange={(e) => updateItem(idx, { title: e.target.value })}
                        placeholder="Nom de l'initiative"
                        style={INPUT_STYLE}
                        onFocus={(e) => { e.currentTarget.style.borderColor = "var(--border)"; }}
                        onBlur={(e) => { e.currentTarget.style.borderColor = "transparent"; }}
                      />
                    </td>
                    <td style={{ padding: "8px 14px", minWidth: "140px" }}>
                      <input
                        type="number"
                        min={0}
                        value={item.investmentEuros}
                        onChange={(e) => updateItem(idx, { investmentEuros: parseFloat(e.target.value) || 0 })}
                        style={INPUT_STYLE}
                        onFocus={(e) => { e.currentTarget.style.borderColor = "var(--border)"; }}
                        onBlur={(e) => { e.currentTarget.style.borderColor = "transparent"; }}
                      />
                    </td>
                    <td style={{ padding: "8px 14px", minWidth: "140px" }}>
                      <input
                        type="number"
                        min={0}
                        value={item.expectedGainEuros}
                        onChange={(e) => updateItem(idx, { expectedGainEuros: parseFloat(e.target.value) || 0 })}
                        style={INPUT_STYLE}
                        onFocus={(e) => { e.currentTarget.style.borderColor = "var(--border)"; }}
                        onBlur={(e) => { e.currentTarget.style.borderColor = "transparent"; }}
                      />
                    </td>
                    <td style={{ padding: "8px 14px", minWidth: "100px" }}>
                      <input
                        type="number"
                        min={1}
                        value={item.timelineMonths}
                        onChange={(e) => updateItem(idx, { timelineMonths: parseInt(e.target.value) || 1 })}
                        style={INPUT_STYLE}
                        onFocus={(e) => { e.currentTarget.style.borderColor = "var(--border)"; }}
                        onBlur={(e) => { e.currentTarget.style.borderColor = "transparent"; }}
                      />
                    </td>
                    <td style={{ padding: "8px 14px" }}>
                      <select
                        value={item.effort}
                        onChange={(e) => updateItem(idx, { effort: e.target.value as ScenarioItem["effort"] })}
                        style={{
                          fontSize: "13px",
                          color: "var(--text-secondary)",
                          background: "var(--bg-hover)",
                          border: "1px solid var(--border)",
                          borderRadius: "6px",
                          padding: "4px 8px",
                          outline: "none",
                          cursor: "pointer",
                        }}
                      >
                        {Object.entries(EFFORT_LABELS).map(([v, l]) => (
                          <option key={v} value={v}>{l}</option>
                        ))}
                      </select>
                    </td>
                    <td style={{ padding: "8px 14px", whiteSpace: "nowrap" }}>
                      <span
                        style={{
                          fontSize: "13px",
                          fontWeight: 600,
                          color:
                            itemRoi === null
                              ? "var(--text-muted)"
                              : itemRoi >= 0
                              ? "var(--green)"
                              : "var(--red)",
                        }}
                      >
                        {itemRoi !== null ? `${itemRoi.toFixed(1)} %` : "—"}
                      </span>
                    </td>
                    <td style={{ padding: "8px 10px" }}>
                      <button
                        onClick={() => removeItem(idx)}
                        disabled={items.length === 1}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          width: "28px",
                          height: "28px",
                          borderRadius: "6px",
                          border: "1px solid transparent",
                          background: "transparent",
                          color: items.length === 1 ? "var(--border)" : "var(--text-muted)",
                          cursor: items.length === 1 ? "not-allowed" : "pointer",
                        }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>

            {items.length > 0 && (
              <tfoot>
                <tr style={{ background: "var(--bg-hover)", borderTop: "2px solid var(--border)" }}>
                  <td style={{ padding: "10px 14px", fontWeight: 600, fontSize: "13px", color: "var(--text-primary)" }}>
                    Totaux
                  </td>
                  <td style={{ padding: "10px 14px", fontWeight: 700, fontSize: "13px", color: "var(--text-primary)" }}>
                    {fmt(totalInvestment)}
                  </td>
                  <td style={{ padding: "10px 14px", fontWeight: 700, fontSize: "13px", color: "var(--text-primary)" }}>
                    {fmt(totalGain)}
                  </td>
                  <td colSpan={2} />
                  <td style={{ padding: "10px 14px", whiteSpace: "nowrap" }}>
                    <span
                      style={{
                        fontSize: "14px",
                        fontWeight: 700,
                        color:
                          globalRoi === null
                            ? "var(--text-muted)"
                            : globalRoi >= 0
                            ? "var(--green)"
                            : "var(--red)",
                      }}
                    >
                      {globalRoi !== null ? `${globalRoi.toFixed(1)} %` : "—"}
                    </span>
                  </td>
                  <td />
                </tr>
              </tfoot>
            )}
          </table>
        </div>

        <div style={{ padding: "12px 14px", borderTop: "1px solid var(--border)" }}>
          <button
            onClick={addItem}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              fontSize: "13px",
              fontWeight: 500,
              color: "var(--green)",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              padding: "4px 0",
            }}
          >
            <Plus size={14} />
            Ajouter une initiative
          </button>
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px", justifyContent: "flex-end", flexWrap: "wrap" }}>
        {error && (
          <p style={{ fontSize: "13px", color: "var(--red)", flex: 1 }}>{error}</p>
        )}

        <Link
          href={"/app/scenarios" as Route}
          style={{
            display: "inline-flex",
            alignItems: "center",
            height: "36px",
            padding: "0 16px",
            borderRadius: "10px",
            border: "1px solid var(--border)",
            background: "transparent",
            color: "var(--text-secondary)",
            fontSize: "13px",
            fontWeight: 500,
            textDecoration: "none",
          }}
        >
          Annuler
        </Link>

        <button
          onClick={handleSubmit}
          disabled={submitting}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            height: "36px",
            padding: "0 20px",
            borderRadius: "10px",
            border: "1px solid var(--green-border)",
            background: "var(--green)",
            color: "#fff",
            fontSize: "13px",
            fontWeight: 600,
            cursor: submitting ? "not-allowed" : "pointer",
            opacity: submitting ? 0.7 : 1,
          }}
        >
          {submitting ? "Création…" : "Créer le scénario"}
        </button>
      </div>
    </div>
  );
}
