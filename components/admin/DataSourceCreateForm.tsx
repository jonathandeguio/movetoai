"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function DataSourceCreateForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [systemName, setSystemName] = useState("");
  const [classification, setClassification] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (name.trim().length < 2) { setError("Le nom doit contenir au moins 2 caractères."); return; }
    setLoading(true); setError(null);
    try {
      const res = await fetch("/api/data-sources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          systemName: systemName.trim() || null,
          classification: classification.trim() || null,
          description: description.trim() || null,
        }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({})) as { error?: string };
        throw new Error(d.error ?? "Erreur lors de la création.");
      }
      setSaved(true);
      setName(""); setSystemName(""); setClassification(""); setDescription("");
      setTimeout(() => { setSaved(false); setOpen(false); router.refresh(); }, 1200);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  }

  if (!open) {
    return (
      <Button onClick={() => setOpen(true)} size="sm" className="gap-1.5 bg-[--blue] text-white hover:opacity-90">
        <Plus className="h-4 w-4" />
        Nouvelle source de données
      </Button>
    );
  }

  return (
    <Card className="w-full max-w-md border-[--green-border] shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-base">Nouvelle source de données</CardTitle>
        <button onClick={() => setOpen(false)} className="text-[--text-muted] hover:text-[--text-primary]">
          <X className="h-4 w-4" />
        </button>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="ds-name">Nom *</Label>
            <Input id="ds-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="ex : Base clients SQL Server" required minLength={2} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ds-system">Système source (optionnel)</Label>
            <Input id="ds-system" value={systemName} onChange={(e) => setSystemName(e.target.value)} placeholder="ex : SQL Server, S3, Salesforce" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ds-class">Classification (optionnel)</Label>
            <Input id="ds-class" value={classification} onChange={(e) => setClassification(e.target.value)} placeholder="ex : Confidentiel, Public, Interne" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ds-desc">Description (optionnel)</Label>
            <textarea
              id="ds-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="Contenu, fréquence de mise à jour..."
              className="flex w-full rounded-lg border border-[--border] bg-[--bg-card] px-3 py-2 text-sm text-[--text-primary] placeholder:text-[--text-muted] shadow-sm outline-none focus:ring-2 focus:ring-[--green] resize-none"
            />
          </div>
          {error && <p className="text-sm text-[--red]">{error}</p>}
          <div className="flex gap-2 pt-1">
            <Button type="submit" disabled={loading || saved} size="sm" className="bg-[--blue] text-white hover:opacity-90">
              {saved ? <><Check className="h-3.5 w-3.5 mr-1" />Créé !</> : loading ? "Création..." : "Créer"}
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={() => setOpen(false)}>Annuler</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
