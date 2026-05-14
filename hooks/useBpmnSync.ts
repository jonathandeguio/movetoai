"use client";

import { useEffect } from "react";

export interface KPI {
  label: string;
  baseline: string | number;
  target: string | number;
  unit?: string;
}

export interface UseCaseForSync {
  kpis?: KPI[];
}

/**
 * Syncs use case KPIs into BPMN task documentation annotations when they change.
 */
export function useBpmnSync(modeler: unknown | null, useCase: UseCaseForSync) {
  useEffect(() => {
    if (!modeler) return;
    const kpis = useCase.kpis;
    if (!kpis?.length) return;

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const m               = modeler as any;
      const modeling        = m.get("modeling");
      const elementRegistry = m.get("elementRegistry");

      kpis.forEach((kpi) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const elements: any[] = elementRegistry.filter((el: any) =>
          el.type === "bpmn:Task" &&
          el.businessObject?.name?.toLowerCase().includes(kpi.label.toLowerCase())
        );
        elements.forEach((el) => {
          modeling.updateProperties(el, {
            documentation: [
              {
                text: `KPI: ${kpi.label}\nBase: ${kpi.baseline} → Cible: ${kpi.target}${kpi.unit ? " " + kpi.unit : ""}`,
              },
            ],
          });
        });
      });
    } catch {
      // Modeler may not be ready — ignore
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modeler, useCase.kpis]);
}
