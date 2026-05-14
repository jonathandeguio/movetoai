"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface BusinessUnitEditFormProps {
  businessUnitId: string;
  initialName: string;
  initialDescription: string | null;
  initialCode: string | null;
}

export function BusinessUnitEditForm({
  businessUnitId,
  initialName,
  initialDescription,
  initialCode,
}: BusinessUnitEditFormProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(initialName);
  const [description, setDescription] = useState(initialDescription ?? "");
  const [code, setCode] = useState(initialCode ?? "");
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (name.trim().length < 2) { setError("Le nom doit contenir au moins 2 caractères."); return; }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/business-units/${businessUnitId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || null,
          code: code.trim() || null,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({})) as { error?: string };
        throw new Error(data.error ?? "Erreur lors de la sauvegarde.");
      }
      setSaved(true);
      setTimeout(() => { setSaved(false); setOpen(false); router.refresh(); }, 1500);
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
      className="w-full max-w-sm space-y-3 rounded-xl border border-[--border] bg-[--bg-card] p-4 shadow-sm"
    >
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-[--text-primary]">Modifier l'unité métier</p>
        <button type="button" onClick={() => setOpen(false)} className="text-[--text-muted] hover:text-[--text-primary]">
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor={`bu-edit-name-${businessUnitId}`}>Nom</Label>
        <Input
          id={`bu-edit-name-${businessUnitId}`}
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          minLength={2}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor={`bu-edit-code-${businessUnitId}`}>Code</Label>
        <Input
          id={`bu-edit-code-${businessUnitId}`}
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="FIN, RH, IT..."
          maxLength={20}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor={`bu-edit-desc-${businessUnitId}`}>Description</Label>
        <textarea
          id={`bu-edit-desc-${businessUnitId}`}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
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
