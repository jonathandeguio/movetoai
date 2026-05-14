"use client";

import { useEffect, useState, useCallback, useRef } from "react";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface BAElementProps {
  actor?:       string;
  tool?:        string;
  duration?:    number;
  painScore?:   number; // 1-5
  automatable?: boolean;
  kpi?:         string;
}

interface Props {
  /**
   * Either a useCaseId (use-cases modeler) or a processId (process modeler).
   * The component will use `apiBase` to determine the API path.
   */
  useCaseId:       string;
  /**
   * Override the base API path. Defaults to `/api/use-cases/${useCaseId}/diagram`.
   * For process modeler pass `/api/processes/${processId}/diagram`.
   */
  apiBase?:        string;
  selectedElement: { id: string; type: string; name?: string } | null;
}

// ── Debounce helper ────────────────────────────────────────────────────────────

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

// ── Task element types ────────────────────────────────────────────────────────

const TASK_TYPES = ["bpmn:Task", "bpmn:UserTask", "bpmn:ServiceTask", "bpmn:ScriptTask",
  "bpmn:SendTask", "bpmn:ReceiveTask", "bpmn:ManualTask", "bpmn:BusinessRuleTask",
  "bpmn:SubProcess", "bpmn:CallActivity"];

// ── Stars ─────────────────────────────────────────────────────────────────────

function StarRating({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div style={{ display: "flex", gap: 2 }}>
      {[1, 2, 3, 4, 5].map(n => (
        <button
          key={n}
          onClick={() => onChange(n === value ? 0 : n)}
          style={{
            background: "none", border: "none", cursor: "pointer", padding: 0,
            fontSize: 14, color: n <= value ? "var(--amber)" : "var(--border)",
          }}
        >★</button>
      ))}
    </div>
  );
}

// ── Panel ─────────────────────────────────────────────────────────────────────

export function BAPropertiesPanel({ useCaseId, apiBase, selectedElement }: Props) {
  const base = apiBase ?? `/api/use-cases/${useCaseId}/diagram`;
  const [meta,    setMeta]    = useState<BAElementProps>({});
  const [loading, setLoading] = useState(false);
  const [saved,   setSaved]   = useState(false);
  const loadedRef             = useRef<string | null>(null);

  const debouncedMeta = useDebounce(meta, 1500);

  // Load BA metadata for the selected element
  useEffect(() => {
    if (!selectedElement) return;
    if (loadedRef.current === selectedElement.id) return; // already loaded
    setLoading(true);
    fetch(`${base}/ba-metadata`)
      .then(r => r.json())
      .then((all: Record<string, BAElementProps>) => {
        setMeta(all[selectedElement.id] ?? {});
        loadedRef.current = selectedElement.id;
      })
      .catch(() => setMeta({}))
      .finally(() => setLoading(false));
  }, [selectedElement, useCaseId]);

  // Reset when element changes
  useEffect(() => {
    if (!selectedElement) { loadedRef.current = null; return; }
  }, [selectedElement?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-save on debounced change
  useEffect(() => {
    if (!selectedElement || loadedRef.current !== selectedElement.id) return;
    fetch(`${base}/ba-metadata`, {
      method:  "PATCH",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ elementId: selectedElement.id, metadata: debouncedMeta }),
    }).then(() => { setSaved(true); setTimeout(() => setSaved(false), 2000); })
      .catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedMeta]);

  const update = useCallback((patch: Partial<BAElementProps>) => {
    setMeta(prev => ({ ...prev, ...patch }));
  }, []);

  // Only show for task-like elements
  const isTask = selectedElement && TASK_TYPES.some(t =>
    selectedElement.type === t || selectedElement.type.toLowerCase().includes("task")
  );

  const visible = !!selectedElement && !!isTask;

  const S = {
    panel: {
      position: "absolute" as const, bottom: 12, left: 12, zIndex: 20,
      width: 272,
      background: "var(--bg-secondary)",
      border: "1px solid var(--border)",
      borderRadius: 10,
      boxShadow: "0 4px 24px rgba(0,0,0,0.4)",
      overflow: "hidden",
      opacity: visible ? 1 : 0,
      pointerEvents: visible ? "all" as const : "none" as const,
      transform: visible ? "translateY(0)" : "translateY(8px)",
      transition: "opacity 0.2s, transform 0.2s",
    },
    header: {
      padding: "7px 10px", borderBottom: "1px solid var(--border)",
      display: "flex", alignItems: "center", justifyContent: "space-between",
    },
    title: {
      fontSize: 10, fontWeight: 600, textTransform: "uppercase" as const,
      letterSpacing: "0.08em", color: "var(--green)",
    },
    savedLabel: {
      fontSize: 9, color: "var(--green)", transition: "opacity 0.3s",
      opacity: saved ? 1 : 0,
    },
    body: { padding: "8px 10px", display: "flex", flexDirection: "column" as const, gap: 6 },
    row: { display: "flex", flexDirection: "column" as const, gap: 2 },
    label: { fontSize: 9, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase" as const, letterSpacing: "0.06em" },
    input: {
      padding: "4px 8px", borderRadius: 5,
      border: "1px solid var(--border)", background: "var(--bg-primary)",
      color: "var(--text-primary)", fontSize: 11, fontFamily: "inherit",
    },
    toggle: (active: boolean) => ({
      display: "inline-flex", alignItems: "center", gap: 4, cursor: "pointer",
      fontSize: 11, color: active ? "var(--green)" : "var(--text-muted)",
      background: active ? "var(--green-dim)" : "var(--bg-hover)",
      border: `1px solid ${active ? "var(--green-border)" : "var(--border)"}`,
      borderRadius: 5, padding: "3px 10px", userSelect: "none" as const,
    }),
  };

  return (
    <div style={S.panel}>
      <div style={S.header}>
        <span style={S.title}>
          {loading ? "Chargement…" : (selectedElement?.name || selectedElement?.id?.slice(0, 16) || "Élément")}
        </span>
        <span style={S.savedLabel}>Sauvegardé ✓</span>
      </div>
      <div style={S.body}>
        {/* Actor */}
        <div style={S.row}>
          <span style={S.label}>Acteur</span>
          <input style={S.input} value={meta.actor ?? ""} placeholder="ex : RH, Finance…"
            onChange={e => update({ actor: e.target.value })} />
        </div>

        {/* Tool */}
        <div style={S.row}>
          <span style={S.label}>Outil</span>
          <input style={S.input} value={meta.tool ?? ""} placeholder="ex : SAP, Excel…"
            onChange={e => update({ tool: e.target.value })} />
        </div>

        {/* Duration */}
        <div style={S.row}>
          <span style={S.label}>Durée (min)</span>
          <input type="number" min={0} style={S.input}
            value={meta.duration ?? ""}
            placeholder="0"
            onChange={e => update({ duration: e.target.value ? Number(e.target.value) : undefined })} />
        </div>

        {/* Pain score */}
        <div style={S.row}>
          <span style={S.label}>Niveau de douleur</span>
          <StarRating value={meta.painScore ?? 0} onChange={v => update({ painScore: v })} />
        </div>

        {/* Automatable */}
        <div style={S.row}>
          <span style={S.label}>Automatisable</span>
          <button style={S.toggle(!!meta.automatable)}
            onClick={() => update({ automatable: !meta.automatable })}>
            {meta.automatable ? "✓ Oui" : "Non"}
          </button>
        </div>

        {/* KPI */}
        <div style={S.row}>
          <span style={S.label}>KPI lié</span>
          <input style={S.input} value={meta.kpi ?? ""} placeholder="ex : Taux de traitement"
            onChange={e => update({ kpi: e.target.value })} />
        </div>
      </div>
    </div>
  );
}
