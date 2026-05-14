"use client";

import { useState, useTransition } from "react";
import { Plus, Search, Shield, Users } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Note: real user list would be a server component. This page is client for the
// provision form. In production split into a server component + client form.

const MOCK_SUPER_ADMINS = [
  { id: "u1", name: "Alice Moreau", email: "alice@movetoai.io", scope: "global", provisionedAt: "1 avril 2026", lastLoginAt: "Il y a 2h" },
  { id: "u2", name: "Benoît Dumas", email: "benoit@movetoai.io", scope: "support", provisionedAt: "15 mars 2026", lastLoginAt: "Hier" },
];

export default function AdminUsersPage() {
  const [showForm, setShowForm] = useState(false);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [scope, setScope] = useState<"global" | "support">("global");
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleProvision() {
    if (!email || !name) return;
    setResult(null);

    startTransition(() => {
      void (async () => {
        const response = await fetch("/api/admin/users/provision", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, name, scope }),
        });
        const payload = (await response.json().catch(() => null)) as { ok?: boolean; message?: string; code?: string } | null;
        if (response.ok && payload?.ok) {
          setResult({ ok: true, message: payload.message ?? "Super Admin provisionné." });
          setEmail("");
          setName("");
          setShowForm(false);
        } else {
          setResult({ ok: false, message: `Erreur : ${payload?.code ?? "inconnue"}` });
        }
      })();
    });
  }

  const inputClass =
    "flex h-10 w-full rounded-lg border border-slate-700 bg-slate-800 px-3 text-sm text-slate-100 placeholder-slate-500 outline-none transition focus:border-rose-500/50";

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-xl font-semibold text-slate-50">Utilisateurs Super Admin</h1>
          <p className="text-sm text-slate-400">
            Provisionnement manuel uniquement — jamais via l'inscription publique.
          </p>
        </div>
        <Button
          onClick={() => setShowForm((v) => !v)}
          className="bg-rose-700 hover:bg-rose-600 text-white"
          size="sm"
        >
          <Plus className="mr-2 h-4 w-4" />
          Provisionner
        </Button>
      </div>

      {/* Provision form */}
      {showForm && (
        <Card className="border-rose-900/50 bg-slate-900">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold text-rose-400">
              <Shield className="h-4 w-4" />
              Nouveau Super Admin
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-xl border border-rose-900/40 bg-rose-950/30 px-4 py-3 text-xs text-rose-400">
              ⚠️ Cette action est irréversible et auditée. L'utilisateur aura accès à tous les workspaces de la plateforme.
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-slate-300">Nom complet *</Label>
                <input
                  type="text"
                  placeholder="Alice Moreau"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-300">Email *</Label>
                <input
                  type="email"
                  placeholder="alice@movetoai.io"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-slate-300">Scope</Label>
              <div className="flex gap-3">
                {(["global", "support"] as const).map((s) => (
                  <label
                    key={s}
                    className={`flex cursor-pointer items-center gap-2 rounded-xl border px-4 py-2.5 text-sm transition ${
                      scope === s
                        ? "border-rose-600 bg-rose-950/40 text-rose-300"
                        : "border-slate-700 bg-slate-800 text-slate-400 hover:border-slate-600"
                    }`}
                  >
                    <input
                      type="radio"
                      name="scope"
                      value={s}
                      checked={scope === s}
                      onChange={() => setScope(s)}
                      className="sr-only"
                    />
                    <span
                      className={`h-3.5 w-3.5 rounded-full border-2 ${scope === s ? "border-rose-500 bg-rose-500" : "border-slate-600"}`}
                    />
                    {s === "global" ? "Global (accès total)" : "Support (accès limité)"}
                  </label>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="border-slate-700 text-slate-300 hover:bg-slate-800"
                onClick={() => setShowForm(false)}
              >
                Annuler
              </Button>
              <Button
                type="button"
                size="sm"
                className="bg-rose-700 hover:bg-rose-600 text-white"
                disabled={!email || !name || isPending}
                onClick={handleProvision}
              >
                {isPending ? "Provisionnement…" : "Confirmer le provisionnement"}
              </Button>
            </div>

            {result && (
              <p
                className={`rounded-xl border px-4 py-3 text-sm ${
                  result.ok
                    ? "border-emerald-800 bg-emerald-950/40 text-emerald-400"
                    : "border-rose-800 bg-rose-950/40 text-rose-400"
                }`}
              >
                {result.message}
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Users list */}
      <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
        <div className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-4 border-b border-slate-800 px-5 py-3 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
          <span>Utilisateur</span>
          <span>Scope</span>
          <span>Provisionné</span>
          <span>Dernière connexion</span>
        </div>
        <div className="divide-y divide-slate-800">
          {MOCK_SUPER_ADMINS.map((u) => (
            <div
              key={u.id}
              className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-4 px-5 py-4"
            >
              <div>
                <p className="font-medium text-slate-100">{u.name}</p>
                <p className="text-[11px] text-slate-500">{u.email}</p>
              </div>
              <span
                className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${
                  u.scope === "global"
                    ? "border-rose-800 bg-rose-950/50 text-rose-400"
                    : "border-slate-700 bg-slate-800 text-slate-400"
                }`}
              >
                {u.scope}
              </span>
              <span className="text-xs text-slate-500">{u.provisionedAt}</span>
              <span className="text-xs text-slate-500">{u.lastLoginAt}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
