"use client";

import { AlertTriangle, Euro, Clock, TrendingUp } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export type ROIData = {
  savings_hours_per_month: number;
  savings_euros_per_year: number;
  payback_months: number;
  assumptions: string;
};

interface ROICardProps {
  roi: ROIData;
  onChange?: (roi: ROIData) => void;
  readOnly?: boolean;
}

export function ROICard({ roi, onChange, readOnly = false }: ROICardProps) {
  function update(field: keyof ROIData, value: string | number) {
    onChange?.({ ...roi, [field]: value });
  }

  const metrics = [
    {
      icon: Euro,
      label: "Économies annuelles",
      value: `${roi.savings_euros_per_year.toLocaleString("fr-FR")} €/an`,
      field: "savings_euros_per_year" as const,
      rawValue: roi.savings_euros_per_year,
      colorClass: "text-[--green]",
    },
    {
      icon: Clock,
      label: "Heures économisées",
      value: `${roi.savings_hours_per_month}h/mois`,
      field: "savings_hours_per_month" as const,
      rawValue: roi.savings_hours_per_month,
      colorClass: "text-[--blue]",
    },
    {
      icon: TrendingUp,
      label: "Retour sur investissement",
      value: `${roi.payback_months} mois`,
      field: "payback_months" as const,
      rawValue: roi.payback_months,
      colorClass: "text-[--purple]",
    },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        {metrics.map((m) => {
          const Icon = m.icon;
          return (
            <div key={m.field} className="rounded-xl border border-[--border] bg-[--bg-card] p-4">
              <Icon className={`mb-2 h-5 w-5 ${m.colorClass}`} />
              {readOnly ? (
                <>
                  <p className={`text-xl font-bold ${m.colorClass}`}>{m.value}</p>
                  <p className="mt-0.5 text-xs text-[--text-muted]">{m.label}</p>
                </>
              ) : (
                <div className="space-y-1">
                  <Label className="text-xs">{m.label}</Label>
                  <Input
                    type="number"
                    value={m.rawValue}
                    onChange={(e) => update(m.field, Number(e.target.value))}
                    className="h-8 text-sm"
                    min={0}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Assumptions */}
      <div className="flex gap-3 rounded-xl border border-[--amber-border] bg-[--amber-dim] p-4">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[--amber]" />
        <div className="flex-1 space-y-2">
          <p className="text-xs font-semibold text-[--amber]">Hypothèses de calcul</p>
          {readOnly ? (
            <p className="text-xs leading-5 text-[--text-secondary]">{roi.assumptions}</p>
          ) : (
            <Textarea
              value={roi.assumptions}
              onChange={(e) => update("assumptions", e.target.value)}
              placeholder="Ex : Basé sur 1 ETP à 45k€/an, gain de 20% de productivité"
              className="min-h-[60px] resize-none text-xs"
            />
          )}
        </div>
      </div>
    </div>
  );
}
