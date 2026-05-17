"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ProcessRef {
  id: string;
  name: string;
  domain: { name: string };
}

interface Dependency {
  id: string;
  sourceId: string;
  targetId: string;
  dependencyType: string;
  description: string | null;
  target?: ProcessRef;
  source?: ProcessRef;
}

interface DepData {
  upstream: Dependency[];
  downstream: Dependency[];
}

const DEP_TYPE_LABELS: Record<string, string> = {
  SEQUENCE: "Séquence",
  DATA: "Données",
  TRIGGER: "Déclencheur",
  upstream: "Amont",
};

interface ProcessDepsPanelProps {
  processId: string;
  canManage: boolean;
}

export function ProcessDepsPanel({ processId, canManage }: ProcessDepsPanelProps) {
  const [data, setData] = useState<DepData>({ upstream: [], downstream: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [targetId, setTargetId] = useState("");
  const [depType, setDepType] = useState<"SEQUENCE" | "DATA" | "TRIGGER">("SEQUENCE");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  async function loadDeps() {
    try {
      const res = await fetch(`/api/processes/${processId}/dependencies`);
      if (!res.ok) throw new Error("Erreur de chargement");
      const json = (await res.json()) as DepData;
      setData(json);
    } catch {
      setError("Impossible de charger les dépendances.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadDeps();
  }, [processId]);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!targetId.trim()) { setFormError("L'identifiant du processus cible est requis."); return; }
    setSubmitting(true);
    setFormError(null);
    try {
      const res = await fetch(`/api/processes/${processId}/dependencies`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetId: targetId.trim(), dependencyType: depType }),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({})) as { error?: string };
        throw new Error(json.error ?? "Erreur lors de l'ajout.");
      }
      setTargetId("");
      setDepType("SEQUENCE");
      setShowForm(false);
      await loadDeps();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-2">
        {[1, 2].map((i) => (
          <div key={i} className="h-12 rounded-xl bg-[--bg-hover] animate-pulse" />
        ))}
      </div>
    );
  }

  if (error) {
    return <p className="text-sm text-[--red]">{error}</p>;
  }

  const hasNone = data.upstream.length === 0 && data.downstream.length === 0;

  return (
    <div className="space-y-4">
      {hasNone ? (
        <p className="text-sm text-[--text-muted] italic">Aucune dépendance définie pour ce processus.</p>
      ) : (
        <div className="space-y-4">
          {data.upstream.length > 0 && (
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.15em] text-[--text-muted]">
                ← Amont (ce processus alimente)
              </p>
              <div className="space-y-2">
                {data.upstream.map((dep) => (
                  <div
                    key={dep.id}
                    className="flex items-center gap-3 rounded-xl border border-[--border] bg-[--bg-hover] px-4 py-3"
                  >
                    <span className="text-lg" aria-hidden>→</span>
                    <div>
                      <p className="text-sm font-medium text-[--text-primary]">
                        {dep.target?.name ?? dep.targetId}
                      </p>
                      <p className="text-xs text-[--text-muted]">
                        {dep.target?.domain.name} · {DEP_TYPE_LABELS[dep.dependencyType] ?? dep.dependencyType}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {data.downstream.length > 0 && (
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.15em] text-[--text-muted]">
                → Aval (alimente ce processus)
              </p>
              <div className="space-y-2">
                {data.downstream.map((dep) => (
                  <div
                    key={dep.id}
                    className="flex items-center gap-3 rounded-xl border border-[--border] bg-[--bg-hover] px-4 py-3"
                  >
                    <span className="text-lg" aria-hidden>←</span>
                    <div>
                      <p className="text-sm font-medium text-[--text-primary]">
                        {dep.source?.name ?? dep.sourceId}
                      </p>
                      <p className="text-xs text-[--text-muted]">
                        {dep.source?.domain.name} · {DEP_TYPE_LABELS[dep.dependencyType] ?? dep.dependencyType}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {canManage && (
        <>
          {!showForm ? (
            <Button variant="outline" size="sm" onClick={() => setShowForm(true)}>
              + Ajouter une dépendance
            </Button>
          ) : (
            <form
              onSubmit={(e) => { void handleAdd(e); }}
              className="space-y-3 rounded-2xl border border-[--border] bg-[--bg-card] p-4"
            >
              <p className="text-sm font-semibold text-[--text-primary]">Nouvelle dépendance</p>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1">
                  <Label htmlFor="dep-target">ID du processus cible *</Label>
                  <Input
                    id="dep-target"
                    value={targetId}
                    onChange={(e) => setTargetId(e.target.value)}
                    placeholder="ID du processus"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="dep-type">Type</Label>
                  <select
                    id="dep-type"
                    value={depType}
                    onChange={(e) => setDepType(e.target.value as "SEQUENCE" | "DATA" | "TRIGGER")}
                    className="flex h-9 w-full rounded-lg border border-[--border] bg-[--bg-card] px-3 py-1 text-sm text-[--text-primary] shadow-sm outline-none focus:ring-2 focus:ring-[--green]"
                  >
                    <option value="SEQUENCE">Séquence</option>
                    <option value="DATA">Données</option>
                    <option value="TRIGGER">Déclencheur</option>
                  </select>
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
