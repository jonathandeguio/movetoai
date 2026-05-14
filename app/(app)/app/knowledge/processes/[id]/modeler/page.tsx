"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import type { Route } from "next";
import {
  ArrowLeft, Save, ZoomIn, ZoomOut, Maximize2,
  Undo2, Redo2, Download, Loader2, AlertTriangle,
  MessageSquare, Users, Clock, History,
} from "lucide-react";

// bpmn-js styles — must be imported in a 'use client' component
import "bpmn-js/dist/assets/bpmn-js.css";
import "bpmn-js/dist/assets/diagram-js.css";
import "bpmn-js/dist/assets/bpmn-font/css/bpmn.css";
import "@/styles/bpmn-theme.css";

import { CommentsPanel }     from "@/components/use-cases/modeler/CommentsPanel";
import { AssignmentsPanel }  from "@/components/use-cases/modeler/AssignmentsPanel";
import { BAPropertiesPanel } from "@/components/use-cases/modeler/BAPropertiesPanel";
import { downloadBlob, svgToPng } from "@/lib/bpmn/bpmn-utils";

// ── Types ─────────────────────────────────────────────────────────────────────

type SaveStatus = "idle" | "saving" | "saved" | "error";
type PanelTab   = "history" | "comments" | "assignments";

interface ProcessInfo {
  id:   string;
  name: string;
}

interface Version {
  versionNumber: number;
  changeSummary: string | null;
  createdAt:     string;
  author:        { name: string | null } | null;
}

// ── Toolbar button ────────────────────────────────────────────────────────────

function ToolBtn({
  title, onClick, children, disabled = false, active = false,
}: {
  title: string; onClick: () => void; children: React.ReactNode;
  disabled?: boolean; active?: boolean;
}) {
  return (
    <button
      title={title}
      onClick={onClick}
      disabled={disabled}
      style={{
        display: "flex", alignItems: "center", justifyContent: "center",
        width: 30, height: 30, borderRadius: 6,
        border: `1px solid ${active ? "var(--green-border)" : "var(--border)"}`,
        background: active ? "var(--green-dim)" : "transparent",
        color: active ? "var(--green)" : "var(--text-muted)",
        cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.4 : 1,
      }}
    >{children}</button>
  );
}

// ── Version history side panel ────────────────────────────────────────────────

function VersionHistoryPanel({ processId, currentVersion }: { processId: string; currentVersion: number }) {
  const [versions, setVersions] = useState<Version[]>([]);
  const [loading,  setLoading]  = useState(false);
  const [restoring, setRestoring] = useState(false);

  useEffect(() => {
    fetch(`/api/use-cases/${processId}/diagram/versions`).then(r => r.json()).then(d => {
      if (Array.isArray(d)) setVersions(d);
    }).catch(() => {});
  }, [processId, currentVersion]);

  async function restore(vnum: number) {
    if (!confirm(`Restaurer la version ${vnum} ?`)) return;
    setRestoring(true);
    try {
      const r    = await fetch(`/api/use-cases/${processId}/diagram/versions/${vnum}`);
      const data = await r.json();
      if (data.xml) {
        await fetch(`/api/processes/${processId}/diagram`, {
          method: "PUT", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ xml: data.xml, changeSummary: `Restauration v${vnum}` }),
        });
        window.location.reload();
      }
    } finally { setRestoring(false); }
  }

  return (
    <div style={{ flex: 1, overflowY: "auto", padding: "8px 12px" }}>
      <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--green)", marginBottom: 10 }}>
        {loading ? "…" : `${versions.length} versions`}
      </p>
      {versions.length === 0 && !loading && (
        <p style={{ fontSize: 11, color: "var(--text-disabled)" }}>Aucune version.</p>
      )}
      {versions.map(v => (
        <div key={v.versionNumber} style={{ paddingBottom: 10, marginBottom: 10, borderBottom: "1px solid var(--border-subtle)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
            <span style={{ fontSize: 12, fontWeight: 500, color: v.versionNumber === currentVersion ? "var(--green)" : "var(--text-secondary)" }}>
              v{v.versionNumber}{v.versionNumber === currentVersion && <span style={{ fontSize: 9, marginLeft: 5, color: "var(--green)" }}>(actuelle)</span>}
            </span>
          </div>
          {v.changeSummary && <p style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 2 }}>{v.changeSummary}</p>}
          {v.author?.name && <p style={{ fontSize: 10, color: "var(--text-disabled)" }}>par {v.author.name}</p>}
          {v.versionNumber !== currentVersion && (
            <button
              onClick={() => restore(v.versionNumber)}
              disabled={restoring}
              style={{ marginTop: 4, fontSize: 11, padding: "2px 8px", borderRadius: 4, border: "1px solid var(--green-border)", background: "var(--green-dim)", color: "var(--green)", cursor: "pointer" }}
            >Restaurer</button>
          )}
        </div>
      ))}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function ProcessModelerPage() {
  const params    = useParams<{ id: string }>();
  const processId = params?.id ?? "";

  const containerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const modelerRef   = useRef<any>(null);

  const [process,    setProcess]    = useState<ProcessInfo | null>(null);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [version,    setVersion]    = useState(0);
  const [isLoading,  setIsLoading]  = useState(true);
  const [error,      setError]      = useState<string | null>(null);
  const [activeTab,  setActiveTab]  = useState<PanelTab>("history");
  const [selectedEl, setSelectedEl] = useState<{ id: string; type: string; name?: string } | null>(null);
  const [exportOpen, setExportOpen] = useState(false);

  // ── Fetch process info ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!processId) return;
    fetch(`/api/processes/${processId}`)
      .then(r => r.ok ? r.json() : null)
      .then(d => d && setProcess({ id: d.id, name: d.name }))
      .catch(() => {});
  }, [processId]);

  // ── Save ─────────────────────────────────────────────────────────────────────
  const save = useCallback(async (summary?: string) => {
    if (!modelerRef.current) return;
    setSaveStatus("saving");
    try {
      const { xml } = await modelerRef.current.saveXML({ format: true });
      const { svg } = await modelerRef.current.saveSVG();
      const res = await fetch(`/api/processes/${processId}/diagram`, {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body:   JSON.stringify({ xml, svg, changeSummary: summary }),
      });
      if (!res.ok) throw new Error("save failed");
      const data = await res.json();
      setSaveStatus("saved"); setVersion(data.version);
      setTimeout(() => setSaveStatus("idle"), 3000);
    } catch { setSaveStatus("error"); }
  }, [processId]);

  // ── Init bpmn-js ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!containerRef.current || !processId) return;
    let mounted = true;

    const init = async () => {
      const BpmnModeler = (await import("bpmn-js/lib/Modeler")).default;
      if (!mounted || !containerRef.current) return;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const modeler = new (BpmnModeler as any)({
        container: containerRef.current,
        keyboard:  { bindTo: window },
      });
      modelerRef.current = modeler;

      try {
        const res  = await fetch(`/api/processes/${processId}/diagram`);
        const data = await res.json();
        if (!mounted) return;

        await modeler.importXML(data.xml);
        setVersion(data.version ?? 0);
        setIsLoading(false);
        modeler.get("canvas").zoom("fit-viewport", "auto");
      } catch {
        if (mounted) { setError("Impossible de charger le diagramme."); setIsLoading(false); }
      }

      // Auto-save on change (debounced)
      let saveTimer: ReturnType<typeof setTimeout>;
      modeler.on("commandStack.changed", () => {
        clearTimeout(saveTimer);
        saveTimer = setTimeout(() => save("Auto-sauvegarde"), 2500);
      });

      // Track selected element for BA panel
      modeler.on("selection.changed", (e: { newSelection: unknown[] }) => {
        if (e.newSelection.length === 1) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const el = e.newSelection[0] as any;
          setSelectedEl({ id: el.id, type: el.type ?? "", name: el.businessObject?.name });
        } else {
          setSelectedEl(null);
        }
      });
    };

    init();
    return () => {
      mounted = false;
      if (modelerRef.current) { modelerRef.current.destroy(); modelerRef.current = null; }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [processId]);

  // ── Keyboard Ctrl+S ──────────────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") { e.preventDefault(); save("Sauvegarde manuelle"); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [save]);

  const zoom = (dir: "in" | "out" | "fit") => {
    if (!modelerRef.current) return;
    const c = modelerRef.current.get("canvas");
    if (dir === "fit") c.zoom("fit-viewport", "auto");
    else c.zoom(c.zoom() + (dir === "in" ? 0.15 : -0.15));
  };

  const exportAs = async (fmt: "svg" | "png" | "bpmn") => {
    if (!modelerRef.current) return;
    const name = process?.name ?? "process";
    if (fmt === "bpmn") {
      const { xml } = await modelerRef.current.saveXML({ format: true });
      downloadBlob(xml, `${name}.bpmn`, "application/xml");
    } else if (fmt === "svg") {
      const { svg } = await modelerRef.current.saveSVG();
      downloadBlob(svg, `${name}.svg`, "image/svg+xml");
    } else {
      const { svg } = await modelerRef.current.saveSVG();
      const blob    = await svgToPng(svg);
      downloadBlob(blob, `${name}.png`, "image/png");
    }
    setExportOpen(false);
  };

  const STATUS_LABEL: Record<SaveStatus, string> = {
    idle:   `v${version}`,
    saving: "Sauvegarde…",
    saved:  "Sauvegardé ✓",
    error:  "Erreur",
  };
  const STATUS_COLOR: Record<SaveStatus, string> = {
    idle:   "var(--text-disabled)",
    saving: "var(--text-muted)",
    saved:  "var(--green)",
    error:  "var(--red)",
  };

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", overflow: "hidden", background: "var(--bg-primary)" }}>
      {/* ── Topbar ── */}
      <div style={{
        height: 48, flexShrink: 0, display: "flex", alignItems: "center", gap: 8,
        padding: "0 12px", borderBottom: "1px solid var(--border)", background: "var(--bg-primary)",
      }}>
        <Link
          href={`/app/knowledge/processes/${processId}` as Route}
          style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 28, height: 28, borderRadius: 6, border: "1px solid var(--border)", color: "var(--text-muted)", textDecoration: "none" }}
        >
          <ArrowLeft size={14} />
        </Link>

        <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {process?.name ?? "Processus"}
        </span>

        <div style={{ flex: 1 }} />

        {/* Toolbar buttons */}
        <ToolBtn title="Annuler (Ctrl+Z)" onClick={() => modelerRef.current?.get("commandStack")?.undo()}>
          <Undo2 size={13} />
        </ToolBtn>
        <ToolBtn title="Refaire (Ctrl+Y)" onClick={() => modelerRef.current?.get("commandStack")?.redo()}>
          <Redo2 size={13} />
        </ToolBtn>

        <div style={{ width: 1, height: 18, background: "var(--border)", margin: "0 4px" }} />

        <ToolBtn title="Zoom avant" onClick={() => zoom("in")}><ZoomIn size={13} /></ToolBtn>
        <ToolBtn title="Ajuster" onClick={() => zoom("fit")}><Maximize2 size={13} /></ToolBtn>
        <ToolBtn title="Zoom arrière" onClick={() => zoom("out")}><ZoomOut size={13} /></ToolBtn>

        <div style={{ width: 1, height: 18, background: "var(--border)", margin: "0 4px" }} />

        <span style={{ fontSize: 11, color: STATUS_COLOR[saveStatus], minWidth: 80, textAlign: "right" }}>
          {STATUS_LABEL[saveStatus]}
        </span>

        <ToolBtn title="Sauvegarder (Ctrl+S)" onClick={() => save("Sauvegarde manuelle")}>
          <Save size={13} />
        </ToolBtn>

        <div style={{ position: "relative" }}>
          <ToolBtn title="Exporter" onClick={() => setExportOpen(o => !o)}>
            <Download size={13} />
          </ToolBtn>
          {exportOpen && (
            <div style={{
              position: "absolute", right: 0, top: "100%", marginTop: 4,
              background: "var(--bg-secondary)", border: "1px solid var(--border)",
              borderRadius: 8, overflow: "hidden", zIndex: 50, minWidth: 140,
            }}>
              {(["svg", "png", "bpmn"] as const).map(fmt => (
                <button key={fmt} onClick={() => exportAs(fmt)} style={{
                  display: "block", width: "100%", padding: "7px 12px", textAlign: "left",
                  fontSize: 12, color: "var(--text-secondary)", background: "transparent", border: "none", cursor: "pointer",
                }}>Exporter en .{fmt.toUpperCase()}</button>
              ))}
            </div>
          )}
        </div>

        <div style={{ width: 1, height: 18, background: "var(--border)", margin: "0 4px" }} />

        {/* Panel tabs */}
        {(["history", "comments", "assignments"] as PanelTab[]).map(tab => {
          const icons: Record<PanelTab, React.ReactNode> = {
            history:     <History size={13} />,
            comments:    <MessageSquare size={13} />,
            assignments: <Users size={13} />,
          };
          return (
            <ToolBtn key={tab} title={tab} onClick={() => setActiveTab(tab)} active={activeTab === tab}>
              {icons[tab]}
            </ToolBtn>
          );
        })}
      </div>

      {/* ── Content row ── */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        {/* Canvas */}
        <div style={{ flex: 1, position: "relative" }}>
          {isLoading && (
            <div style={{ position: "absolute", inset: 0, zIndex: 10, display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg-primary)" }}>
              <Loader2 size={24} style={{ color: "var(--green)", animation: "spin 1s linear infinite" }} />
            </div>
          )}
          {error && !isLoading && (
            <div style={{ position: "absolute", inset: 0, zIndex: 10, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, background: "var(--bg-primary)" }}>
              <AlertTriangle size={32} style={{ color: "var(--red)" }} />
              <p style={{ fontSize: 13, color: "var(--red)" }}>{error}</p>
              <button onClick={() => window.location.reload()} style={{ fontSize: 12, padding: "6px 14px", borderRadius: 6, border: "1px solid var(--border)", background: "var(--bg-secondary)", color: "var(--text-secondary)", cursor: "pointer" }}>
                Réessayer
              </button>
            </div>
          )}
          <div ref={containerRef} style={{ width: "100%", height: "100%" }} aria-label="Éditeur BPMN" />

          {/* BA Properties floating panel */}
          <BAPropertiesPanel
            useCaseId={processId}
            apiBase={`/api/processes/${processId}/diagram`}
            selectedElement={selectedEl}
          />
        </div>

        {/* Right side panel */}
        <div style={{ width: 256, flexShrink: 0, display: "flex", flexDirection: "column", borderLeft: "1px solid var(--border)", height: "100%", overflow: "hidden" }}>
          {activeTab === "history" && (
            <VersionHistoryPanel processId={processId} currentVersion={version} />
          )}
          {activeTab === "comments" && (
            <CommentsPanel
              useCaseId={processId}
              selectedElementId={selectedEl?.id}
            />
          )}
          {activeTab === "assignments" && (
            <AssignmentsPanel
              useCaseId={processId}
              selectedElementId={selectedEl?.id}
            />
          )}
        </div>
      </div>
    </div>
  );
}
