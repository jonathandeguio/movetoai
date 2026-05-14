"use client";

import { useState } from "react";
import { Pencil, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface UseCaseEditFormProps {
  useCaseId: string;
  initialTitle: string;
  initialSolutionDescription: string | null;
  initialEffortDays: number | null;
  initialConstraints: string | null;
  initialPriorityLevel: string | null;
  onSaved?: () => void;
}

const selectClass =
  "flex h-10 w-full rounded-lg border border-[--border] bg-[--bg-card] px-3 text-sm text-[--text-primary] shadow-sm outline-none focus:ring-2 focus:ring-[--green]";
const textareaClass =
  "flex w-full rounded-lg border border-[--border] bg-[--bg-card] px-3 py-2 text-sm text-[--text-primary] placeholder:text-[--text-muted] shadow-sm outline-none focus:ring-2 focus:ring-[--green] resize-none";

export function UseCaseEditForm({
  useCaseId,
  initialTitle,
  initialSolutionDescription,
  initialEffortDays,
  initialConstraints,
  initialPriorityLevel,
  onSaved,
}: UseCaseEditFormProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(initialTitle);
  const [solutionDescription, setSolutionDescription] = useState(initialSolutionDescription ?? "");
  const [effortDays, setEffortDays] = useState(initialEffortDays?.toString() ?? "");
  const [constraints, setConstraints] = useState(initialConstraints ?? "");
  const [priorityLevel, setPriorityLevel] = useState(initialPriorityLevel ?? "P1");
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (title.trim().length < 5) { setError("Le titre doit contenir au moins 5 caractères."); return; }
    setLoading(true);
    setError(null);
    try {
      const body: Record<string, unknown> = {
        title: title.trim(),
        solutionDescription: solutionDescription.trim() || null,
        priorityLevel,
        constraints: constraints.trim() || null,
      };
      if (effortDays !== "") body.effortDays = parseInt(effortDays, 10);
      const res = await fetch(`/api/use-cases/${useCaseId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({})) as { error?: string };
        throw new Error(d.error ?? "Erreur lors de la sauvegarde.");
      }
      setSaved(true);
      setTimeout(() => { setSaved(false); setOpen(false); onSaved?.(); }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  }

  if (!open) {
    return (
      <Button variant="outline" size="sm" onClick={() => setOpen(true)} className="gap-1.5">
        <Pencil className="h-3.5 w-3.5" />
        Modifier
      </Button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-2xl space-y-4 rounded-2xl border border-[--border] bg-[--bg-card] p-5 shadow-sm"
    >
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-[--text-primary]">Modifier le cas d'usage</p>
        <button type="button" onClick={() => setOpen(false)} className="text-[--text-muted] hover:text-[--text-primary]">
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="space-y-2">
        <Label htmlFor="uc-title">Titre *</Label>
        <Input
          id="uc-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          minLength={5}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="uc-sol">Description de la solution</Label>
        <textarea
          id="uc-sol"
          value={solutionDescription}
          onChange={(e) => setSolutionDescription(e.target.value)}
          rows={3}
          placeholder="Décrivez la solution IA proposée..."
          className={textareaClass}
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="uc-effort">Effort estimé (jours)</Label>
          <Input
            id="uc-effort"
            type="number"
            min="0"
            value={effortDays}
            onChange={(e) => setEffortDays(e.target.value)}
            placeholder="ex : 30"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="uc-priority">Priorité</Label>
          <select
            id="uc-priority"
            value={priorityLevel}
            onChange={(e) => setPriorityLevel(e.target.value)}
            className={selectClass}
          >
            <option value="P0">P0 — Critique</option>
            <option value="P1">P1 — Haute</option>
            <option value="P2">P2 — Normale</option>
          </select>
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="uc-constraints">Contraintes / Blocages</Label>
        <textarea
          id="uc-constraints"
          value={constraints}
          onChange={(e) => setConstraints(e.target.value)}
          rows={2}
          placeholder="RGPD, ressources, dépendances techniques..."
          className={textareaClass}
        />
      </div>
      {error && <p className="text-sm text-[--red]">{error}</p>}
      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={loading || saved}>
          {saved ? <><Check className="h-3.5 w-3.5 mr-1" />Enregistré</> : loading ? "Enregistrement..." : "Enregistrer"}
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={() => setOpen(false)}>
          Annuler
        </Button>
      </div>
    </form>
  );
}
