"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Plus, Trash2, Save, GitCompare, X, Check } from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────

export type ScenarioItem = {
  id: string;
  title: string;
  investmentEuros: number;
  expectedGainEuros: number;
  timelineMonths: number;
  effort: "low" | "medium" | "high";
  opportunityId?: string;
};

export type ScenarioData = {
  id: string;
  title: string;
  description?: string | null;
  status: "draft" | "active" | "archived";
  items?: ScenarioItem[] | null;
  totalInvestment?: number | null;
  totalExpectedGain?: number | null;
  roi?: number | null;
};

type Props = {
  scenarioId: string;
  initialData: ScenarioData;
  allScenarios?: { id: string; title: string }[];
};

// ── Helpers ───────────────────────────────────────────────────────────────────

const fmt = (n: number) =>
  new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(n);

function computeItemRoi(item: ScenarioItem): number | null {
  if (item.investmentEuros <= 0) return null;
  return ((item.expectedGainEuros - item.investmentEuros) / item.investmentEuros) * 100;
}

function generateId() {
  return Math.random().toString(36).slice(2, 10);
}

const EFFORT_LABELS: Record<string, string> = {
  low: "Faible",
  medium: "Moyen",
  high: "Élevé",
};

const STATUS_LABELS: Record<string, string> = {
  draft: "Brouillon",
  active: "Actif",
  archived: "Archivé",
};

const STATUS_COLORS: Record<string, string> = {
  draft: "var(--amber)",
  active: "var(--green)",
  archived: "var(--text-muted)",
};

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

// ── Compare Modal ─────────────────────────────────────────────────────────────

function CompareModal({
  currentId,
  currentTitle,
  currentItems,
  allScenarios,
  onClose,
}: {
  currentId: string;
  currentTitle: string;
  currentItems: ScenarioItem[];
  allScenarios: { id: string; title: string }[];
  onClose: () => void;
}) {
  const [compareId, setCompareId] = useState<string>(
    allScenarios.find((s) => s.id !== currentId)?.id ?? ""
  );
  const [compareData, setCompareData] = useState<ScenarioData | null>(null);
  const [loading, setLoading] = useState(false);

  const currentTotal = currentItems.reduce((acc, i) => acc + i.investmentEuros, 0);
  const currentGain = currentItems.reduce((acc, i) => acc + i.expectedGainEuros, 0);
  const currentRoi =
    currentTotal > 0 ? ((currentGain - currentTotal) / currentTotal) * 100 : null;

  useEffect(() => {
    if (!compareId) return;
    setLoading(true);
    fetch(`/api/scenarios/${compareId}`)
      .then((r) => r.json())
      .then((d) => setCompareData(d))
      .finally(() => setLoading(false));
  }, [compareId]);

  const others = allScenarios.filter((s) => s.id !== currentId);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 50,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0,0,0,0.5)",
        padding: "1rem",
      }}
    >
      <div
        style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border)",
          borderRadius: "var(--r-xl, 16px)",
          padding: "1.5rem",
          maxWidth: "860px",
          width: "100%",
          maxHeight: "80vh",
          overflowY: "auto",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem" }}>
          <h2 style={{ fontSize: "16px", fontWeight: 600, color: "var(--text-primary)" }}>
            Comparer des scénarios
          </h2>
          <button
            onClick={onClose}
            style={{
              display: "flex", alignItems: "center", justifyContent: "center",
              width: "32px", height: "32px", borderRadius: "8px",
              border: "1px solid var(--border)", background: "transparent",
              color: "var(--text-muted)", cursor: "pointer",
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Selector */}
        <div style={{ marginBottom: "1rem" }}>
          <label style={{ fontSize: "12px", fontWeight: 500, color: "var(--text-muted)", display: "block", marginBottom: "4px" }}>
            Comparer avec
          </label>
          <select
            value={compareId}
            onChange={(e) => setCompareId(e.target.value)}
            style={{
              height: "36px", borderRadius: "10px",
              border: "1px solid var(--border)",
              background: "var(--bg-card)",
              color: "var(--text-primary)",
              padding: "0 12px", fontSize: "14px",
              minWidth: "220px",
            }}
          >
            {others.map((s) => (
              <option key={s.id} value={s.id}>{s.title}</option>
            ))}
          </select>
        </div>

        {/* Comparison grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          {/* Current */}
          <div style={{ border: "1px solid var(--green-border)", borderRadius: "12px", padding: "1rem", background: "var(--green-dim)" }}>
            <p style={{ fontSize: "11px", fontWeight: 600, color: "var(--green)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "8px" }}>
              Scénario actuel
            </p>
            <p style={{ fontSize: "15px", fontWeight: 600, color: "var(--text-primary)", marginBottom: "12px" }}>{currentTitle}</p>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <MetaRow label="Investissement" value={fmt(currentTotal)} />
              <MetaRow label="Gain attendu" value={fmt(currentGain)} />
              <MetaRow
                label="ROI global"
                value={currentRoi !== null ? `${currentRoi.toFixed(1)} %` : "—"}
                color={currentRoi !== null ? (currentRoi >= 0 ? "var(--green)" : "var(--red)") : undefined}
              />
              <MetaRow label="Initiatives" value={String(currentItems.length)} />
            </div>
          </div>

          {/* Compare */}
          <div style={{ border: "1px solid var(--border)", borderRadius: "12px", padding: "1rem", background: "var(--bg-card)" }}>
            {loading ? (
              <p style={{ fontSize: "14px", color: "var(--text-muted)" }}>Chargement…</p>
            ) : compareData ? (
              <>
                <p style={{ fontSize: "11px", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "8px" }}>
                  Comparaison
                </p>
                <p style={{ fontSize: "15px", fontWeight: 600, color: "var(--text-primary)", marginBottom: "12px" }}>{compareData.title}</p>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <MetaRow label="Investissement" value={fmt(compareData.totalInvestment ?? 0)} />
                  <MetaRow label="Gain attendu" value={fmt(compareData.totalExpectedGain ?? 0)} />
                  <MetaRow
                    label="ROI global"
                    value={compareData.roi !== null && compareData.roi !== undefined ? `${compareData.roi.toFixed(1)} %` : "—"}
                    color={
                      compareData.roi !== null && compareData.roi !== undefined
                        ? compareData.roi >= 0 ? "var(--green)" : "var(--red)"
                        : undefined
                    }
                  />
                  <MetaRow label="Initiatives" value={String((compareData.items ?? []).length)} />
                </div>
              </>
            ) : (
              <p style={{ fontSize: "14px", color: "var(--text-muted)" }}>Sélectionnez un scénario</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function MetaRow({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <span style={{ fontSize: "13px", color: "var(--text-muted)" }}>{label}</span>
      <span style={{ fontSize: "13px", fontWeight: 600, color: color ?? "var(--text-primary)" }}>{value}</span>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export function ScenarioBuilder({ scenarioId, initialData, allScenarios = [] }: Props) {
  const [title, setTitle] = useState(initialData.title);
  const [description, setDescription] = useState(initialData.description ?? "");
  const [status, setStatus] = useState<ScenarioData["status"]>(initialData.status);
  const [items, setItems] = useState<ScenarioItem[]>(
    (initialData.items as ScenarioItem[] | undefined | null) ?? []
  );
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCompare, setShowCompare] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);
  const titleInputRef = useRef<HTMLInputElement>(null);

  // Totals
  const totalInvestment = items.reduce((acc, i) => acc + i.investmentEuros, 0);
  const totalGain = items.reduce((acc, i) => acc + i.expectedGainEuros, 0);
  const globalRoi =
    totalInvestment > 0 ? ((totalGain - totalInvestment) / totalInvestment) * 100 : null;

  const handleSave = useCallback(async () => {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/scenarios/${scenarioId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, status, items }),
      });
      if (!res.ok) {
        const d = await res.json();
        setError(d.error ?? "Erreur lors de la sauvegarde");
      } else {
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
      }
    } catch {
      setError("Erreur réseau");
    } finally {
      setSaving(false);
    }
  }, [scenarioId, title, description, status, items]);

  const updateItem = (idx: number, patch: Partial<ScenarioItem>) => {
    setItems((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], ...patch };
      return next;
    });
  };

  const addItem = () => {
    setItems((prev) => [...prev, emptyItem()]);
  };

  const removeItem = (idx: number) => {
    setItems((prev) => prev.filter((_, i) => i !== idx));
  };

  const canCompare = allScenarios.filter((s) => s.id !== scenarioId).length > 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      {/* Header card */}
      <div
        style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border)",
          borderRadius: "16px",
          padding: "1.25rem 1.5rem",
        }}
      >
        {/* Title row */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: "1rem", flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: "200px" }}>
            {editingTitle ? (
              <input
                ref={titleInputRef}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={() => setEditingTitle(false)}
                onKeyDown={(e) => { if (e.key === "Enter") setEditingTitle(false); }}
                autoFocus
                style={{
                  fontSize: "20px",
                  fontWeight: 700,
                  color: "var(--text-primary)",
                  border: "none",
                  borderBottom: "2px solid var(--green)",
                  background: "transparent",
                  outline: "none",
                  width: "100%",
                  paddingBottom: "2px",
                }}
              />
            ) : (
              <h1
                onClick={() => setEditingTitle(true)}
                style={{
                  fontSize: "20px",
                  fontWeight: 700,
                  color: "var(--text-primary)",
                  cursor: "text",
                  borderBottom: "2px solid transparent",
                  paddingBottom: "2px",
                  transition: "border-color 0.15s",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = "var(--border)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = "transparent";
                }}
              >
                {title || "Sans titre"}
              </h1>
            )}
          </div>

          {/* Status badge */}
          <div>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as ScenarioData["status"])}
              style={{
                fontSize: "12px",
                fontWeight: 600,
                color: STATUS_COLORS[status],
                border: `1px solid ${STATUS_COLORS[status]}`,
                borderRadius: "999px",
                background: "transparent",
                padding: "3px 12px",
                cursor: "pointer",
                outline: "none",
              }}
            >
              {Object.entries(STATUS_LABELS).map(([v, l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Description */}
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description du scénario (optionnel)…"
          rows={2}
          style={{
            marginTop: "0.75rem",
            width: "100%",
            resize: "vertical",
            fontSize: "14px",
            color: "var(--text-secondary)",
            background: "transparent",
            border: "1px solid transparent",
            borderRadius: "8px",
            padding: "6px 8px",
            outline: "none",
            transition: "border-color 0.15s",
            fontFamily: "inherit",
          }}
          onFocus={(e) => { e.currentTarget.style.borderColor = "var(--border)"; }}
          onBlur={(e) => { e.currentTarget.style.borderColor = "transparent"; }}
        />
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
              {items.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    style={{
                      padding: "2.5rem",
                      textAlign: "center",
                      color: "var(--text-muted)",
                      fontSize: "14px",
                    }}
                  >
                    Aucune initiative — cliquez sur &quot;Ajouter une initiative&quot; pour commencer.
                  </td>
                </tr>
              )}
              {items.map((item, idx) => {
                const itemRoi = computeItemRoi(item);
                return (
                  <tr
                    key={item.id}
                    style={{
                      borderBottom: "1px solid var(--border)",
                    }}
                  >
                    {/* Title */}
                    <td style={{ padding: "8px 14px", minWidth: "200px" }}>
                      <input
                        value={item.title}
                        onChange={(e) => updateItem(idx, { title: e.target.value })}
                        placeholder="Nom de l'initiative"
                        style={{
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
                        }}
                        onFocus={(e) => { e.currentTarget.style.borderColor = "var(--border)"; }}
                        onBlur={(e) => { e.currentTarget.style.borderColor = "transparent"; }}
                      />
                    </td>

                    {/* Investment */}
                    <td style={{ padding: "8px 14px", minWidth: "140px" }}>
                      <input
                        type="number"
                        min={0}
                        value={item.investmentEuros}
                        onChange={(e) => updateItem(idx, { investmentEuros: parseFloat(e.target.value) || 0 })}
                        style={{
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
                        }}
                        onFocus={(e) => { e.currentTarget.style.borderColor = "var(--border)"; }}
                        onBlur={(e) => { e.currentTarget.style.borderColor = "transparent"; }}
                      />
                    </td>

                    {/* Expected gain */}
                    <td style={{ padding: "8px 14px", minWidth: "140px" }}>
                      <input
                        type="number"
                        min={0}
                        value={item.expectedGainEuros}
                        onChange={(e) => updateItem(idx, { expectedGainEuros: parseFloat(e.target.value) || 0 })}
                        style={{
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
                        }}
                        onFocus={(e) => { e.currentTarget.style.borderColor = "var(--border)"; }}
                        onBlur={(e) => { e.currentTarget.style.borderColor = "transparent"; }}
                      />
                    </td>

                    {/* Timeline */}
                    <td style={{ padding: "8px 14px", minWidth: "100px" }}>
                      <input
                        type="number"
                        min={1}
                        value={item.timelineMonths}
                        onChange={(e) => updateItem(idx, { timelineMonths: parseInt(e.target.value) || 1 })}
                        style={{
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
                        }}
                        onFocus={(e) => { e.currentTarget.style.borderColor = "var(--border)"; }}
                        onBlur={(e) => { e.currentTarget.style.borderColor = "transparent"; }}
                      />
                    </td>

                    {/* Effort */}
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

                    {/* ROI item */}
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

                    {/* Delete */}
                    <td style={{ padding: "8px 10px" }}>
                      <button
                        onClick={() => removeItem(idx)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          width: "28px",
                          height: "28px",
                          borderRadius: "6px",
                          border: "1px solid transparent",
                          background: "transparent",
                          color: "var(--text-muted)",
                          cursor: "pointer",
                          transition: "all 0.15s",
                        }}
                        onMouseEnter={(e) => {
                          const el = e.currentTarget as HTMLElement;
                          el.style.background = "var(--red-dim)";
                          el.style.color = "var(--red)";
                          el.style.borderColor = "var(--red)";
                        }}
                        onMouseLeave={(e) => {
                          const el = e.currentTarget as HTMLElement;
                          el.style.background = "transparent";
                          el.style.color = "var(--text-muted)";
                          el.style.borderColor = "transparent";
                        }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>

            {/* Footer totals */}
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

        {/* Add row button */}
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

      {/* Action bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          flexWrap: "wrap",
        }}
      >
        {error && (
          <p style={{ fontSize: "13px", color: "var(--red)", flex: 1 }}>{error}</p>
        )}

        {canCompare && (
          <button
            onClick={() => setShowCompare(true)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              height: "36px",
              padding: "0 16px",
              borderRadius: "10px",
              border: "1px solid var(--border)",
              background: "transparent",
              color: "var(--text-secondary)",
              fontSize: "13px",
              fontWeight: 500,
              cursor: "pointer",
              transition: "all 0.15s",
            }}
          >
            <GitCompare size={14} />
            Comparer
          </button>
        )}

        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            height: "36px",
            padding: "0 20px",
            borderRadius: "10px",
            border: "1px solid var(--green-border)",
            background: saved ? "var(--green-dim)" : "var(--green)",
            color: saved ? "var(--green)" : "#fff",
            fontSize: "13px",
            fontWeight: 600,
            cursor: saving ? "not-allowed" : "pointer",
            opacity: saving ? 0.7 : 1,
            transition: "all 0.15s",
            marginLeft: "auto",
          }}
        >
          {saved ? (
            <>
              <Check size={14} />
              Sauvegardé
            </>
          ) : (
            <>
              <Save size={14} />
              {saving ? "Sauvegarde…" : "Sauvegarder"}
            </>
          )}
        </button>
      </div>

      {/* Compare modal */}
      {showCompare && (
        <CompareModal
          currentId={scenarioId}
          currentTitle={title}
          currentItems={items}
          allScenarios={allScenarios}
          onClose={() => setShowCompare(false)}
        />
      )}
    </div>
  );
}
