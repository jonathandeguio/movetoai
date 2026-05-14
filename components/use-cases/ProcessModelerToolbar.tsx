"use client";

import { useState } from "react";
import { Undo2, Redo2, ZoomIn, ZoomOut, Maximize2, Save, Download, Sparkles } from "lucide-react";
import { formatRelativeTime } from "@/lib/bpmn/bpmn-utils";

export type SaveStatus = "idle" | "saving" | "saved" | "error";

interface ProcessModelerToolbarProps {
  saveStatus: SaveStatus;
  version: number;
  lastSaved: Date | null;
  readonly: boolean;
  aiSuggesting: boolean;
  onSuggestAI: () => void;
  onExport: (format: "svg" | "png" | "bpmn") => void;
  onZoom: (dir: "in" | "out" | "fit") => void;
  onUndo: () => void;
  onRedo: () => void;
  onSaveNow: () => void;
}

const STATUS_LABEL: Record<SaveStatus, string> = {
  idle:   "",
  saving: "Sauvegarde…",
  saved:  "Sauvegardé ✓",
  error:  "Erreur de sauvegarde",
};

const STATUS_COLOR: Record<SaveStatus, string> = {
  idle:   "transparent",
  saving: "var(--text-muted)",
  saved:  "var(--green)",
  error:  "var(--red)",
};

function ToolBtn({
  title,
  onClick,
  children,
  disabled = false,
}: {
  title: string;
  onClick: () => void;
  children: React.ReactNode;
  disabled?: boolean;
}) {
  return (
    <button
      title={title}
      onClick={onClick}
      disabled={disabled}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: 30,
        height: 30,
        borderRadius: 6,
        border: "1px solid var(--border)",
        background: "transparent",
        color: "var(--text-muted)",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.4 : 1,
      }}
      onMouseEnter={(e) => {
        if (!disabled) {
          const el = e.currentTarget as HTMLButtonElement;
          el.style.background = "var(--green-dim)";
          el.style.color = "var(--green)";
        }
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLButtonElement;
        el.style.background = "transparent";
        el.style.color = "var(--text-muted)";
      }}
    >
      {children}
    </button>
  );
}

function Divider() {
  return (
    <div
      style={{
        width: 1,
        height: 20,
        background: "var(--border)",
        margin: "0 2px",
        flexShrink: 0,
      }}
    />
  );
}

export function ProcessModelerToolbar({
  saveStatus,
  version,
  lastSaved,
  readonly,
  aiSuggesting,
  onSuggestAI,
  onExport,
  onZoom,
  onUndo,
  onRedo,
  onSaveNow,
}: ProcessModelerToolbarProps) {
  const [exportOpen, setExportOpen] = useState(false);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 6,
        padding: "6px 10px",
        background: "var(--bg-primary)",
        borderBottom: "1px solid var(--border)",
        flexWrap: "wrap",
        minHeight: 44,
      }}
    >
      {!readonly && (
        <>
          <ToolBtn title="Annuler (Ctrl+Z)" onClick={onUndo}>
            <Undo2 size={14} />
          </ToolBtn>
          <ToolBtn title="Refaire (Ctrl+Y)" onClick={onRedo}>
            <Redo2 size={14} />
          </ToolBtn>
          <Divider />
        </>
      )}

      <ToolBtn title="Zoom avant" onClick={() => onZoom("in")}>
        <ZoomIn size={14} />
      </ToolBtn>
      <ToolBtn title="Ajuster la vue" onClick={() => onZoom("fit")}>
        <Maximize2 size={14} />
      </ToolBtn>
      <ToolBtn title="Zoom arrière" onClick={() => onZoom("out")}>
        <ZoomOut size={14} />
      </ToolBtn>

      <Divider />

      {!readonly && (
        <button
          onClick={onSuggestAI}
          disabled={aiSuggesting}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            fontSize: 12,
            fontWeight: 500,
            padding: "5px 12px",
            borderRadius: 6,
            border: "1px solid var(--green-border)",
            background: "var(--green-dim)",
            color: "var(--green)",
            cursor: aiSuggesting ? "wait" : "pointer",
            opacity: aiSuggesting ? 0.6 : 1,
          }}
        >
          <Sparkles size={13} />
          {aiSuggesting ? "Génération IA…" : "Générer avec l'IA"}
        </button>
      )}

      <div style={{ flex: 1 }} />

      <span
        style={{
          fontSize: 11,
          color: STATUS_COLOR[saveStatus],
          minWidth: 110,
          textAlign: "right",
        }}
      >
        {STATUS_LABEL[saveStatus]}
        {saveStatus === "idle" && lastSaved && (
          <span style={{ color: "var(--text-disabled)" }}>
            v{version} · {formatRelativeTime(lastSaved)}
          </span>
        )}
      </span>

      {!readonly && (
        <ToolBtn title="Sauvegarder (Ctrl+S)" onClick={onSaveNow}>
          <Save size={14} />
        </ToolBtn>
      )}

      <div style={{ position: "relative" }}>
        <ToolBtn title="Exporter" onClick={() => setExportOpen((o) => !o)}>
          <Download size={14} />
        </ToolBtn>
        {exportOpen && (
          <div
            style={{
              position: "absolute",
              right: 0,
              top: "100%",
              marginTop: 4,
              background: "var(--bg-secondary)",
              border: "1px solid var(--border)",
              borderRadius: 8,
              overflow: "hidden",
              zIndex: 50,
              minWidth: 150,
            }}
          >
            {(["svg", "png", "bpmn"] as const).map((fmt) => (
              <button
                key={fmt}
                onClick={() => { onExport(fmt); setExportOpen(false); }}
                style={{
                  display: "block",
                  width: "100%",
                  padding: "8px 14px",
                  textAlign: "left",
                  fontSize: 12,
                  color: "var(--text-secondary)",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background = "var(--green-dim)";
                  (e.currentTarget as HTMLButtonElement).style.color = "var(--green)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                  (e.currentTarget as HTMLButtonElement).style.color = "var(--text-secondary)";
                }}
              >
                Exporter en .{fmt.toUpperCase()}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
