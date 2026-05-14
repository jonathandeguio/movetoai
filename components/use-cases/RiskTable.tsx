"use client";

import { Plus, Trash2, AlertTriangle, Info, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export type Risk = {
  description: string;
  mitigation: string;
  level: "low" | "medium" | "high";
};

const LEVEL_CONFIG = {
  low:    { label: "Faible",  className: "bg-[--green-dim] text-[--green] border-[--green-border]", Icon: Info },
  medium: { label: "Moyen",   className: "bg-[--amber-dim] text-[--amber] border-[--amber-border]", Icon: AlertTriangle },
  high:   { label: "Élevé",   className: "bg-[--red-dim] text-[--red] border-[--red-dim]",          Icon: Shield },
} as const;

interface RiskTableProps {
  risks: Risk[];
  onChange: (risks: Risk[]) => void;
  readOnly?: boolean;
}

export function RiskTable({ risks, onChange, readOnly = false }: RiskTableProps) {
  function updateRisk(index: number, field: keyof Risk, value: string) {
    const next = risks.map((r, i) => (i === index ? { ...r, [field]: value } : r));
    onChange(next);
  }

  function addRisk() {
    onChange([...risks, { description: "", mitigation: "", level: "medium" }]);
  }

  function removeRisk(index: number) {
    onChange(risks.filter((_, i) => i !== index));
  }

  return (
    <div className="space-y-3">
      <div className="overflow-hidden rounded-xl border border-[--border]">
        <table className="w-full text-sm">
          <thead className="bg-[--bg-hover]">
            <tr>
              <th className="w-1/3 px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-[--text-muted]">Risque</th>
              <th className="w-1/3 px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-[--text-muted]">Mitigation</th>
              <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-[--text-muted]">Niveau</th>
              {!readOnly && <th className="w-10" />}
            </tr>
          </thead>
          <tbody className="divide-y divide-[--border]">
            {risks.length === 0 && (
              <tr>
                <td colSpan={4} className="px-3 py-4 text-center text-sm text-[--text-muted]">Aucun risque identifié</td>
              </tr>
            )}
            {risks.map((risk, i) => {
              const levelCfg = LEVEL_CONFIG[risk.level];
              const LevelIcon = levelCfg.Icon;
              return (
                <tr key={i} className="bg-[--bg-card]">
                  <td className="px-3 py-2">
                    {readOnly ? (
                      <p className="text-sm text-[--text-primary]">{risk.description}</p>
                    ) : (
                      <Input value={risk.description} onChange={(e) => updateRisk(i, "description", e.target.value)} placeholder="Description du risque" className="h-8 text-sm" />
                    )}
                  </td>
                  <td className="px-3 py-2">
                    {readOnly ? (
                      <p className="text-sm text-[--text-secondary]">{risk.mitigation}</p>
                    ) : (
                      <Input value={risk.mitigation} onChange={(e) => updateRisk(i, "mitigation", e.target.value)} placeholder="Mesure de mitigation" className="h-8 text-sm" />
                    )}
                  </td>
                  <td className="px-3 py-2">
                    {readOnly ? (
                      <span className={cn("inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium", levelCfg.className)}>
                        <LevelIcon className="h-3 w-3" />
                        {levelCfg.label}
                      </span>
                    ) : (
                      <select
                        value={risk.level}
                        onChange={(e) => updateRisk(i, "level", e.target.value)}
                        className="rounded-lg border border-[--border] bg-[--bg-input] px-2 py-1 text-xs text-[--text-primary] focus:outline-none focus:ring-1 focus:ring-[--green-dim]"
                      >
                        {Object.entries(LEVEL_CONFIG).map(([val, cfg]) => (
                          <option key={val} value={val}>{cfg.label}</option>
                        ))}
                      </select>
                    )}
                  </td>
                  {!readOnly && (
                    <td className="px-3 py-2">
                      <button type="button" onClick={() => removeRisk(i)} aria-label="Supprimer" className="rounded p-1 text-[--text-muted] hover:bg-[--red-dim] hover:text-[--red]">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {!readOnly && (
        <Button type="button" variant="outline" size="sm" onClick={addRisk} className="gap-1.5">
          <Plus className="h-3.5 w-3.5" />
          Ajouter un risque
        </Button>
      )}
    </div>
  );
}
