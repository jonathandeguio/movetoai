"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface PainPointCreateFormProps {
  processId: string;
}

const SEVERITY_OPTIONS = [
  { value: "LOW",      label: "Faible" },
  { value: "MEDIUM",   label: "Moyen" },
  { value: "HIGH",     label: "Élevé" },
  { value: "CRITICAL", label: "Critique" },
];

const textareaClass =
  "flex w-full rounded-lg border border-[--border] bg-[--bg-card] px-3 py-2 text-sm text-[--text-primary] placeholder:text-[--text-muted] outline-none focus:ring-2 focus:ring-[--green] resize-none";
const selectClass =
  "flex h-10 w-full rounded-lg border border-[--border] bg-[--bg-card] px-3 text-sm text-[--text-primary] shadow-sm outline-none focus:ring-2 focus:ring-[--green]";

export function PainPointCreateForm({ processId }: PainPointCreateFormProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [severity, setSeverity] = useState("MEDIUM");
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (title.trim().length < 3) { setError("Le titre doit contenir au moins 3 caractères."); return; }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/pain-points", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim(), description: description.trim() || null, severity, processId }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({})) as { error?: string };
        throw new Error(d.error ?? "Erreur lors de l'ajout.");
      }
      setSaved(true);
      setTitle(""); setDescription(""); setSeverity("MEDIUM");
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
        className="flex items-center gap-1 text-sm font-medium text-[--amber] hover:underline"
      >
        <AlertTriangle className="h-3.5 w-3.5" />
        Signaler un point de douleur
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-[--amber-border] bg-[--amber-dim] p-4 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-[--text-primary]">Nouveau point de douleur</p>
        <button type="button" onClick={() => setOpen(false)} className="text-[--text-muted] hover:text-[--text-primary]">
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="pp-title">Titre *</Label>
        <textarea
          id="pp-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="ex : Saisie manuelle chronophage des commandes"
          rows={2}
          className={textareaClass}
          required
          minLength={3}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="pp-severity">Sévérité</Label>
        <select id="pp-severity" value={severity} onChange={(e) => setSeverity(e.target.value)} className={selectClass}>
          {SEVERITY_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="pp-desc">Description (optionnel)</Label>
        <textarea
          id="pp-desc"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Contexte, fréquence, impact estimé..."
          rows={2}
          className={textareaClass}
        />
      </div>
      {error && <p className="text-sm text-[--red]">{error}</p>}
      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={loading || saved} className="bg-[--amber] text-white hover:opacity-90">
          {saved ? <><Check className="h-3.5 w-3.5 mr-1" />Ajouté</> : loading ? "Ajout..." : "Signaler"}
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={() => setOpen(false)}>
          Annuler
        </Button>
      </div>
    </form>
  );
}
