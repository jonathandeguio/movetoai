"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ProcessEditFormProps {
  processId: string;
  initialName: string;
  initialDescription: string | null;
}

export function ProcessEditForm({ processId, initialName, initialDescription }: ProcessEditFormProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(initialName);
  const [description, setDescription] = useState(initialDescription ?? "");
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (name.trim().length < 2) { setError("Le nom doit contenir au moins 2 caractères."); return; }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/processes/${processId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), description: description.trim() || null }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Erreur lors de la sauvegarde.");
      }
      setSaved(true);
      setTimeout(() => {
        setSaved(false);
        setOpen(false);
        router.refresh();
      }, 1500);
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
    <form onSubmit={handleSubmit} className="w-full max-w-lg space-y-4 rounded-2xl border border-[--border] bg-[--bg-card] p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-[--text-primary]">Modifier le processus</p>
        <button type="button" onClick={() => setOpen(false)} className="text-[--text-muted] hover:text-[--text-primary]">
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="space-y-2">
        <Label htmlFor="proc-name">Nom</Label>
        <Input
          id="proc-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nom du processus"
          required
          minLength={2}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="proc-desc">Description</Label>
        <textarea
          id="proc-desc"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description du processus (optionnel)"
          rows={3}
          className="flex w-full rounded-lg border border-[--border] bg-[--bg-card] px-3 py-2 text-sm text-[--text-primary] placeholder:text-[--text-muted] shadow-sm outline-none focus:ring-2 focus:ring-[--green] resize-none"
        />
      </div>
      {error && <p className="text-sm text-[--red]">{error}</p>}
      <div className="flex items-center gap-2">
        <Button type="submit" disabled={loading || saved} size="sm">
          {saved ? <><Check className="h-3.5 w-3.5 mr-1" />Enregistré</> : loading ? "Enregistrement..." : "Enregistrer"}
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={() => setOpen(false)}>
          Annuler
        </Button>
      </div>
    </form>
  );
}
