"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface CapabilityCreateFormProps {
  domainId: string;
}

export function CapabilityCreateForm({ domainId }: CapabilityCreateFormProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (name.trim().length < 2) { setError("Le nom doit contenir au moins 2 caractères."); return; }
    setLoading(true); setError(null);
    try {
      const res = await fetch("/api/capabilities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), description: description.trim() || null, domainId }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({})) as { error?: string };
        throw new Error(d.error ?? "Erreur lors de la création.");
      }
      setSaved(true);
      setName(""); setDescription("");
      setTimeout(() => { setSaved(false); setOpen(false); router.refresh(); }, 1200);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1 text-sm font-medium text-[--blue] hover:underline"
      >
        <Plus className="h-3.5 w-3.5" />
        Ajouter une capacité
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-[--border] bg-[--bg-hover] p-4 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-[--text-primary]">Nouvelle capacité</p>
        <button type="button" onClick={() => setOpen(false)} className="text-[--text-muted] hover:text-[--text-primary]">
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="cap-name">Nom *</Label>
        <Input id="cap-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="ex: Gestion des talents" required minLength={2} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="cap-desc">Description (optionnel)</Label>
        <textarea
          id="cap-desc" value={description} onChange={(e) => setDescription(e.target.value)}
          placeholder="Description de la capacité..." rows={2}
          className="flex w-full rounded-lg border border-[--border] bg-[--bg-card] px-3 py-2 text-sm text-[--text-primary] placeholder:text-[--text-muted] outline-none focus:ring-2 focus:ring-[--green] resize-none"
        />
      </div>
      {error && <p className="text-sm text-[--red]">{error}</p>}
      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={loading || saved} className="bg-[--blue] text-white hover:opacity-90">
          {saved ? <><Check className="h-3.5 w-3.5 mr-1" />Ajouté</> : loading ? "Création..." : "Créer"}
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={() => setOpen(false)}>Annuler</Button>
      </div>
    </form>
  );
}
