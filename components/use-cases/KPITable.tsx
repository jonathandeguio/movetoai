"use client";

import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export type KPI = {
  label: string;
  baseline: string;
  target: string;
  unit: string;
};

interface KPITableProps {
  kpis: KPI[];
  onChange: (kpis: KPI[]) => void;
  readOnly?: boolean;
}

export function KPITable({ kpis, onChange, readOnly = false }: KPITableProps) {
  function updateKPI(index: number, field: keyof KPI, value: string) {
    const next = kpis.map((k, i) => (i === index ? { ...k, [field]: value } : k));
    onChange(next);
  }

  function addKPI() {
    onChange([...kpis, { label: "", baseline: "", target: "", unit: "" }]);
  }

  function removeKPI(index: number) {
    onChange(kpis.filter((_, i) => i !== index));
  }

  return (
    <div className="space-y-3">
      <div className="overflow-hidden rounded-xl border border-[--border]">
        <table className="w-full text-sm">
          <thead className="bg-[--bg-hover]">
            <tr>
              {["Indicateur", "Baseline", "Cible", "Unité", readOnly ? "" : ""].map((h, i) => (
                <th key={i} className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-[--text-muted]">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[--border]">
            {kpis.length === 0 && (
              <tr>
                <td colSpan={5} className="px-3 py-4 text-center text-sm text-[--text-muted]">
                  Aucun KPI défini
                </td>
              </tr>
            )}
            {kpis.map((kpi, i) => (
              <tr key={i} className="bg-[--bg-card]">
                <td className="px-3 py-2">
                  {readOnly ? <span className="font-medium text-[--text-primary]">{kpi.label}</span> : (
                    <Input value={kpi.label} onChange={(e) => updateKPI(i, "label", e.target.value)} placeholder="Temps économisé" className="h-8 text-sm" />
                  )}
                </td>
                <td className="px-3 py-2">
                  {readOnly ? <span className="text-[--text-secondary]">{kpi.baseline}</span> : (
                    <Input value={kpi.baseline} onChange={(e) => updateKPI(i, "baseline", e.target.value)} placeholder="3h/sem" className="h-8 text-sm" />
                  )}
                </td>
                <td className="px-3 py-2">
                  {readOnly ? (
                    <span className="font-semibold text-[--green]">{kpi.target}</span>
                  ) : (
                    <Input value={kpi.target} onChange={(e) => updateKPI(i, "target", e.target.value)} placeholder="30min/sem" className="h-8 text-sm" />
                  )}
                </td>
                <td className="px-3 py-2">
                  {readOnly ? <span className="text-[--text-muted]">{kpi.unit}</span> : (
                    <Input value={kpi.unit} onChange={(e) => updateKPI(i, "unit", e.target.value)} placeholder="heures" className="h-8 text-sm" />
                  )}
                </td>
                {!readOnly && (
                  <td className="px-3 py-2">
                    <button
                      type="button"
                      onClick={() => removeKPI(i)}
                      aria-label="Supprimer ce KPI"
                      className="rounded p-1 text-[--text-muted] hover:bg-[--red-dim] hover:text-[--red]"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {!readOnly && (
        <Button type="button" variant="outline" size="sm" onClick={addKPI} className="gap-1.5">
          <Plus className="h-3.5 w-3.5" />
          Ajouter un KPI
        </Button>
      )}
    </div>
  );
}
