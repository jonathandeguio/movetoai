"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ProcessKPI {
  id: string;
  name: string;
  unit: string | null;
  targetValue: number | null;
  currentValue: number | null;
}

interface ProcessKpiPanelProps {
  processId: string;
  canManage: boolean;
}

export function ProcessKpiPanel({ processId, canManage }: ProcessKpiPanelProps) {
  const [kpis, setKpis] = useState<ProcessKPI[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [unit, setUnit] = useState("");
  const [targetValue, setTargetValue] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  async function loadKpis() {
    try {
      const res = await fetch(`/api/processes/${processId}/kpis`);
      if (!res.ok) throw new Error("Erreur de chargement");
      const data = (await res.json()) as { items: ProcessKPI[] };
      setKpis(data.items);
    } catch {
      setError("Impossible de charger les KPIs.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadKpis();
  }, [processId]);

  async function handleAddKpi(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) { setFormError("Le nom est requis."); return; }
    setSubmitting(true);
    setFormError(null);
    try {
      const res = await fetch(`/api/processes/${processId}/kpis`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          unit: unit.trim() || null,
          targetValue: targetValue ? Number(targetValue) : undefined,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({})) as { error?: string };
        throw new Error(data.error ?? "Erreur lors de l'ajout.");
      }
      setName("");
      setUnit("");
      setTargetValue("");
      setShowForm(false);
      await loadKpis();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-12 rounded-xl bg-[--bg-hover] animate-pulse" />
        ))}
      </div>
    );
  }

  if (error) {
    return <p className="text-sm text-[--red]">{error}</p>;
  }

  return (
    <div className="space-y-4">
      {kpis.length === 0 ? (
        <p className="text-sm text-[--text-muted] italic">Aucun KPI défini pour ce processus.</p>
      ) : (
        <div className="space-y-2">
          {kpis.map((kpi) => (
            <div
              key={kpi.id}
              className="flex items-center justify-between rounded-xl border border-[--border] bg-[--bg-hover] px-4 py-3"
            >
              <div>
                <p className="text-sm font-medium text-[--text-primary]">{kpi.name}</p>
                {kpi.unit && (
                  <p className="text-xs text-[--text-muted]">Unité : {kpi.unit}</p>
                )}
              </div>
              <div className="text-right">
                {kpi.currentValue !== null && (
                  <p className="text-sm font-semibold text-[--text-primary]">
                    {kpi.currentValue}
                    {kpi.unit ? ` ${kpi.unit}` : ""}
                  </p>
                )}
                {kpi.targetValue !== null && (
                  <p className="text-xs text-[--text-muted]">
                    Cible : {kpi.targetValue}{kpi.unit ? ` ${kpi.unit}` : ""}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {canManage && (
        <>
          {!showForm ? (
            <Button variant="outline" size="sm" onClick={() => setShowForm(true)}>
              + Ajouter un KPI
            </Button>
          ) : (
            <form
              onSubmit={(e) => { void handleAddKpi(e); }}
              className="space-y-3 rounded-2xl border border-[--border] bg-[--bg-card] p-4"
            >
              <p className="text-sm font-semibold text-[--text-primary]">Nouveau KPI</p>
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="space-y-1">
                  <Label htmlFor="kpi-name">Nom *</Label>
                  <Input
                    id="kpi-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="ex: Taux d'erreur"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="kpi-unit">Unité</Label>
                  <Input
                    id="kpi-unit"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    placeholder="ex: %, jours"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="kpi-target">Valeur cible</Label>
                  <Input
                    id="kpi-target"
                    type="number"
                    step="any"
                    value={targetValue}
                    onChange={(e) => setTargetValue(e.target.value)}
                    placeholder="ex: 95"
                  />
                </div>
              </div>
              {formError && <p className="text-sm text-[--red]">{formError}</p>}
              <div className="flex gap-2">
                <Button type="submit" size="sm" disabled={submitting}>
                  {submitting ? "Ajout..." : "Ajouter"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => { setShowForm(false); setFormError(null); }}
                >
                  Annuler
                </Button>
              </div>
            </form>
          )}
        </>
      )}
    </div>
  );
}
