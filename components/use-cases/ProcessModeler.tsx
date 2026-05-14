"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { debounce } from "lodash";

// bpmn-js styles — imported here (contains @font-face, must be in 'use client')
import "bpmn-js/dist/assets/bpmn-js.css";
import "bpmn-js/dist/assets/diagram-js.css";
import "bpmn-js/dist/assets/bpmn-font/css/bpmn.css";
import "@/styles/bpmn-theme.css";

import { ProcessModelerToolbar, type SaveStatus } from "./ProcessModelerToolbar";
import { ProcessContextPanel, type KPI, type DataSource } from "./ProcessContextPanel";
import { ProcessModelerSkeleton } from "./ProcessModelerSkeleton";
import { ProcessModelerError }    from "./ProcessModelerError";
import { CommentsPanel }     from "./modeler/CommentsPanel";
import { AssignmentsPanel }  from "./modeler/AssignmentsPanel";
import { BAPropertiesPanel } from "./modeler/BAPropertiesPanel";
import { DiagramHistory }    from "./DiagramHistory";
import { useBpmnSync }            from "@/hooks/useBpmnSync";
import { downloadBlob, svgToPng } from "@/lib/bpmn/bpmn-utils";

interface ProcessModelerProps {
  useCaseId: string;
  useCase: {
    title: string;
    kpis?: KPI[];
    dataRequired?: DataSource[] | string[];
    assignedTo?: string | null;
    technicalOwner?: string | null;
    consultantId?: string | null;
  };
  readonly?: boolean;
  onSave?: (version: number) => void;
}

export default function ProcessModeler({
  useCaseId,
  useCase,
  readonly = false,
  onSave,
}: ProcessModelerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const modelerRef   = useRef<any>(null);

  const [saveStatus,   setSaveStatus]   = useState<SaveStatus>("idle");
  const [version,      setVersion]      = useState(0);
  const [lastSaved,    setLastSaved]    = useState<Date | null>(null);
  const [isLoading,    setIsLoading]    = useState(true);
  const [error,        setError]        = useState<string | null>(null);
  const [aiSuggesting, setAiSuggesting] = useState(false);
  const [activePanel,  setActivePanel]  = useState<"history" | "comments" | "assignments">("history");
  const [selectedEl,   setSelectedEl]   = useState<{ id: string; type: string; name?: string } | null>(null);

  // ── Save to DB ──────────────────────────────────────────────────────────────
  const saveToDb = useCallback(
    async (changeSummary?: string) => {
      if (!modelerRef.current || readonly) return;
      setSaveStatus("saving");
      try {
        const { xml } = await modelerRef.current.saveXML({ format: true });
        const { svg } = await modelerRef.current.saveSVG();

        const res = await fetch(`/api/use-cases/${useCaseId}/diagram`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ xml, svg, changeSummary }),
        });

        if (!res.ok) throw new Error("save failed");
        const data = await res.json();

        setSaveStatus("saved");
        setVersion(data.version);
        setLastSaved(new Date());
        onSave?.(data.version);
        setTimeout(() => setSaveStatus("idle"), 3000);
      } catch {
        setSaveStatus("error");
      }
    },
    [useCaseId, readonly, onSave]
  );

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSave = useCallback(debounce(() => saveToDb(), 2000), [saveToDb]);

  // ── Auto-layout (optional dependency) ──────────────────────────────────────
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async function autoLayout(modeler: any) {
    try {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore — bpmn-auto-layout is an optional peer dependency
      const { layoutProcess } = await import("bpmn-auto-layout");
      const { xml }  = await modeler.saveXML();
      const layouted = await layoutProcess(xml);
      await modeler.importXML(layouted);
    } catch {
      // bpmn-auto-layout not installed — skip auto-layout
    }
  }

  // ── Init ─────────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!containerRef.current) return;
    let mounted = true;

    const init = async () => {
      const BpmnModeler = (await import("bpmn-js/lib/Modeler")).default;
      if (!mounted || !containerRef.current) return;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const modeler = new (BpmnModeler as any)({
        container: containerRef.current,
        keyboard: { bindTo: window },
      });
      modelerRef.current = modeler;

      try {
        const res  = await fetch(`/api/use-cases/${useCaseId}/diagram`);
        const data = await res.json();
        if (!mounted) return;

        await modeler.importXML(data.xml);
        setVersion(data.version ?? 0);
        setIsLoading(false);

        const canvas = modeler.get("canvas");
        canvas.zoom("fit-viewport", "auto");

        if (data.isNew) {
          await autoLayout(modeler);
          await saveToDb("Diagramme initial généré");
        }
      } catch {
        if (mounted) {
          setError("Impossible de charger le diagramme BPMN.");
          setIsLoading(false);
        }
      }

      if (!readonly) {
        modeler.on("commandStack.changed", () => {
          setSaveStatus("idle");
          debouncedSave();
        });
      }

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
      debouncedSave.cancel();
      if (modelerRef.current) {
        modelerRef.current.destroy();
        modelerRef.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [useCaseId]);

  // ── Bidirectional sync ──────────────────────────────────────────────────────
  useBpmnSync(modelerRef.current, { kpis: useCase.kpis });

  // ── AI suggestion ───────────────────────────────────────────────────────────
  const suggestTasksFromAI = async () => {
    setAiSuggesting(true);
    try {
      const res = await fetch(`/api/use-cases/${useCaseId}/diagram/suggest`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kpis: useCase.kpis,
          actors: {
            assignedTo:     useCase.assignedTo,
            technicalOwner: useCase.technicalOwner,
            consultantId:   useCase.consultantId,
          },
        }),
      });
      const data = await res.json();
      if (modelerRef.current && data.xml) {
        await modelerRef.current.importXML(data.xml);
        await saveToDb("Diagramme généré par IA");
      }
    } catch {
      // ignore
    } finally {
      setAiSuggesting(false);
    }
  };

  // ── Export ──────────────────────────────────────────────────────────────────
  const exportAs = async (format: "svg" | "png" | "bpmn") => {
    if (!modelerRef.current) return;
    const title = useCase.title ?? "diagram";
    if (format === "bpmn") {
      const { xml } = await modelerRef.current.saveXML({ format: true });
      downloadBlob(xml, `${title}.bpmn`, "application/xml");
    } else if (format === "svg") {
      const { svg } = await modelerRef.current.saveSVG();
      downloadBlob(svg, `${title}.svg`, "image/svg+xml");
    } else {
      const { svg } = await modelerRef.current.saveSVG();
      const blob    = await svgToPng(svg);
      downloadBlob(blob, `${title}.png`, "image/png");
    }
  };

  // ── Zoom / Undo / Redo ──────────────────────────────────────────────────────
  const zoom = (dir: "in" | "out" | "fit") => {
    if (!modelerRef.current) return;
    const canvas = modelerRef.current.get("canvas");
    if (dir === "fit") canvas.zoom("fit-viewport", "auto");
    else canvas.zoom(canvas.zoom() + (dir === "in" ? 0.1 : -0.1));
  };

  const undo = () => modelerRef.current?.get("commandStack")?.undo();
  const redo = () => modelerRef.current?.get("commandStack")?.redo();

  // ── Panel tab bar ─────────────────────────────────────────────────────────
  const panelTabs: { key: "history" | "comments" | "assignments"; label: string }[] = [
    { key: "history",     label: "Versions" },
    { key: "comments",    label: "Commentaires" },
    { key: "assignments", label: "Assignations" },
  ];

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        width: "100%",
        background: "var(--bg-primary)",
      }}
    >
      <ProcessModelerToolbar
        saveStatus={saveStatus}
        version={version}
        lastSaved={lastSaved}
        readonly={readonly}
        aiSuggesting={aiSuggesting}
        onSuggestAI={suggestTasksFromAI}
        onExport={exportAs}
        onZoom={zoom}
        onUndo={undo}
        onRedo={redo}
        onSaveNow={() => saveToDb("Sauvegarde manuelle")}
      />

      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        {/* Canvas area */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
          <div style={{ flex: 1, position: "relative", minHeight: 300 }}>
            {isLoading && (
              <div style={{ position: "absolute", inset: 0, zIndex: 10 }}>
                <ProcessModelerSkeleton />
              </div>
            )}
            {error && !isLoading && (
              <div style={{ position: "absolute", inset: 0, zIndex: 10 }}>
                <ProcessModelerError
                  message={error}
                  onRetry={() => window.location.reload()}
                />
              </div>
            )}
            <div
              ref={containerRef}
              style={{ width: "100%", height: "100%" }}
              aria-label="Éditeur de processus BPMN"
            />
            {/* BA properties floating panel */}
            <BAPropertiesPanel
              useCaseId={useCaseId}
              selectedElement={selectedEl}
            />
          </div>
          <ProcessContextPanel useCase={useCase} modeler={modelerRef.current} />
        </div>

        {/* Right panel */}
        <div style={{ width: 256, flexShrink: 0, display: "flex", flexDirection: "column", borderLeft: "1px solid var(--border)", height: "100%", overflow: "hidden" }}>
          {/* Tab bar */}
          <div style={{ display: "flex", borderBottom: "1px solid var(--border)", flexShrink: 0 }}>
            {panelTabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActivePanel(tab.key)}
                style={{
                  flex: 1, padding: "6px 4px", fontSize: 9, fontWeight: 600,
                  textTransform: "uppercase", letterSpacing: "0.06em", border: "none",
                  borderBottom: `2px solid ${activePanel === tab.key ? "var(--green)" : "transparent"}`,
                  background: "transparent",
                  color: activePanel === tab.key ? "var(--green)" : "var(--text-muted)",
                  cursor: "pointer",
                }}
              >{tab.label}</button>
            ))}
          </div>

          {activePanel === "history" && (
            <DiagramHistory
              useCaseId={useCaseId}
              currentVersion={version}
              onVersionRestored={() => window.location.reload()}
            />
          )}
          {activePanel === "comments" && (
            <CommentsPanel
              useCaseId={useCaseId}
              selectedElementId={selectedEl?.id}
            />
          )}
          {activePanel === "assignments" && (
            <AssignmentsPanel
              useCaseId={useCaseId}
              selectedElementId={selectedEl?.id}
            />
          )}
        </div>
      </div>
    </div>
  );
}
