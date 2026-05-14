"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ProcessCreateFormProps {
  domains: { id: string; name: string }[];
}

export function ProcessCreateForm({ domains }: ProcessCreateFormProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [domainId, setDomainId] = useState(domains[0]?.id ?? "");
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!domainId) { setError("Sélectionnez un domaine."); return; }
    if (name.trim().length < 2) { setError("Le nom doit contenir au moins 2 caractères."); return; }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/processes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), description: description.trim() || null, domainId }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({})) as { error?: string };
        throw new Error(data.error ?? "Erreur lors de la création.");
      }
      setSaved(true);
      setName("");
      setDescription("");
      setTimeout(() => {
        setSaved(false);
        setOpen(false);
        router.refresh();
      }, 1200);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  }

  if (!open) {
    return (
      <Button
        onClick={() => setOpen(true)}
        size="sm"
        className="gap-1.5 bg-[--blue] text-white hover:opacity-90"
      >
        <Plus className="h-4 w-4" />
        Nouveau processus
      </Button>
    );
  }

  const selectClass = "flex h-11 w-full rounded-lg border border-[--border] bg-[--bg-card] px-3 text-sm text-[--text-primary] shadow-sm outline-none focus:ring-2 focus:ring-[--green]";

  return (
    <Card className="w-full max-w-lg border-[--green-border] shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-base">Nouveau processus</CardTitle>
        <button onClick={() => setOpen(false)} className="text-[--text-muted] hover:text-[--text-primary]">
          <X className="h-4 w-4" />
        </button>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="proc-name">Nom du processus *</Label>
            <Input
              id="proc-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="ex: Gestion des congés"
              required
              minLength={2}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="proc-domain">Domaine métier *</Label>
            <select
              id="proc-domain"
              value={domainId}
              onChange={(e) => setDomainId(e.target.value)}
              className={selectClass}
              required
            >
              {domains.length === 0 && <option value="">Aucun domaine disponible</option>}
              {domains.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="proc-desc">Description (optionnel)</Label>
            <textarea
              id="proc-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Décrivez brièvement ce processus..."
              rows={2}
              className="flex w-full rounded-lg border border-[--border] bg-[--bg-card] px-3 py-2 text-sm text-[--text-primary] placeholder:text-[--text-muted] shadow-sm outline-none focus:ring-2 focus:ring-[--green] resize-none"
            />
          </div>
          {error && <p className="text-sm text-[--red]">{error}</p>}
          <div className="flex gap-2 pt-1">
            <Button type="submit" disabled={loading || saved} size="sm" className="bg-[--blue] hover:opacity-90 text-white">
              {saved ? <><Check className="h-3.5 w-3.5 mr-1" />Créé !</> : loading ? "Création..." : "Créer le processus"}
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={() => setOpen(false)}>
              Annuler
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
