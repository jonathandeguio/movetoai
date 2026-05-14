"use client";

import { useEffect, useState } from "react";

export interface KPI {
  label: string;
  baseline: string | number;
  target: string | number;
  unit?: string;
}

export interface DataSource {
  source: string;
  available: boolean;
}

export interface UseCaseForContext {
  kpis?: KPI[];
  dataRequired?: DataSource[] | string[];
  assignedTo?: string | null;
  technicalOwner?: string | null;
  consultantId?: string | null;
}

interface Props {
  useCase: UseCaseForContext;
  modeler: unknown;
}

function ContextSection({
  title,
  color,
  children,
}: {
  title: string;
  color: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p
        style={{
          fontSize: 10,
          fontWeight: 600,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color,
          marginBottom: 8,
        }}
      >
        {title}
      </p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>{children}</div>
    </div>
  );
}

function ContextChip({
  label,
  value,
  color,
  onClick,
}: {
  label: string;
  value: string;
  color: string;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex",
        flexDirection: "column",
        padding: "4px 8px",
        borderRadius: 6,
        border: `1px solid ${color}40`,
        background: `${color}10`,
        cursor: onClick ? "pointer" : "default",
        textAlign: "left",
        gap: 1,
      }}
    >
      <span style={{ fontSize: 10, color, fontWeight: 500 }}>{label}</span>
      <span style={{ fontSize: 10, color: "var(--text-muted)" }}>{value}</span>
    </button>
  );
}

function selectTaskByKpi(modeler: unknown, kpi: KPI) {
  if (!modeler) return;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const m = modeler as any;
  try {
    const elementRegistry = m.get("elementRegistry");
    const selection       = m.get("selection");
    const canvas          = m.get("canvas");
    const keyword = kpi.label.toLowerCase().split(" ")[0];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const el = elementRegistry.filter((e: any) =>
      e.type === "bpmn:Task" &&
      e.businessObject?.name?.toLowerCase().includes(keyword)
    )[0];
    if (el) {
      selection.select(el);
      canvas.scrollToElement(el);
    }
  } catch {
    // ignore
  }
}

export function ProcessContextPanel({ useCase, modeler }: Props) {
  const [, forceRender] = useState(0);

  useEffect(() => {
    if (!modeler) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const eventBus = (modeler as any).get?.("eventBus");
    if (!eventBus) return;
    const handler = () => forceRender((n) => n + 1);
    eventBus.on("selection.changed", handler);
    return () => eventBus.off("selection.changed", handler);
  }, [modeler]);

  const kpis        = (useCase.kpis ?? []) as KPI[];
  const dataSources = (useCase.dataRequired ?? []) as (DataSource | string)[];
  const actors      = [
    useCase.assignedTo     ? { role: "Responsable Métier", color: "var(--green)"  } : null,
    useCase.technicalOwner ? { role: "DSI / IT",           color: "var(--blue)"   } : null,
    useCase.consultantId   ? { role: "Consultant IA",      color: "var(--coral)"  } : null,
  ].filter(Boolean) as { role: string; color: string }[];

  if (kpis.length === 0 && dataSources.length === 0 && actors.length === 0) return null;

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
        gap: 16,
        padding: "12px 16px",
        borderTop: "1px solid var(--border)",
        background: "var(--bg-hover)",
      }}
    >
      {kpis.length > 0 && (
        <ContextSection title="KPIs liés" color="var(--green)">
          {kpis.map((kpi) => (
            <ContextChip
              key={kpi.label}
              label={kpi.label}
              value={`${kpi.baseline} → ${kpi.target}${kpi.unit ? " " + kpi.unit : ""}`}
              color="var(--green)"
              onClick={() => selectTaskByKpi(modeler, kpi)}
            />
          ))}
        </ContextSection>
      )}

      {actors.length > 0 && (
        <ContextSection title="Acteurs & swimlanes" color="var(--blue)">
          {actors.map((a) => (
            <ContextChip key={a.role} label={a.role} value="Assigné" color={a.color} />
          ))}
        </ContextSection>
      )}

      {dataSources.length > 0 && (
        <ContextSection title="Données disponibles" color="var(--purple)">
          {dataSources.map((d, i) => {
            const source    = typeof d === "string" ? d : d.source;
            const available = typeof d === "string" ? true : d.available;
            return (
              <ContextChip
                key={i}
                label={source}
                value={available ? "Disponible" : "À obtenir"}
                color={available ? "var(--green)" : "var(--amber)"}
              />
            );
          })}
        </ContextSection>
      )}
    </div>
  );
}
