"use client";

import { useState, useEffect } from "react";
import { Check, Globe, Bell, Shield, Database } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Section = "general" | "notifications" | "security" | "data";

const SECTIONS: { id: Section; label: string; icon: React.ElementType }[] = [
  { id: "general", label: "Général", icon: Globe },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "security", label: "Sécurité", icon: Shield },
  { id: "data", label: "Données", icon: Database }
];

const NOTIF_KEYS = [
  { key: "notifyOnNewMember", label: "Nouveaux membres invités", desc: "Recevoir un email quand un membre rejoint le workspace." },
  { key: "weeklyReport", label: "Rapport hebdomadaire", desc: "Synthèse de l'activité chaque lundi matin." },
  { key: "notifyOnAnomalies", label: "Alertes d'anomalie IA", desc: "Notification si un processus IA dépasse les seuils de risque." },
  { key: "notifyOnProductUpdates", label: "Mises à jour produit", desc: "Annonces des nouvelles fonctionnalités Move to AI." },
] as const;

type NotifKey = typeof NOTIF_KEYS[number]["key"];

export default function AdminSettingsPage() {
  const [section, setSection] = useState<Section>("general");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // General
  const [workspaceName, setWorkspaceName] = useState("");
  const [defaultLocale, setDefaultLocale] = useState("FR");

  // Notifications
  const [notifSettings, setNotifSettings] = useState<Record<NotifKey, boolean>>({
    notifyOnNewMember: true,
    weeklyReport: true,
    notifyOnAnomalies: true,
    notifyOnProductUpdates: true,
  });

  // Load initial data
  useEffect(() => {
    fetch("/api/workspace/settings")
      .then((r) => r.json())
      .then((data) => {
        if (data.name) setWorkspaceName(data.name);
        if (data.defaultLocale) setDefaultLocale(data.defaultLocale);
        const s = data.settings ?? {};
        setNotifSettings({
          notifyOnNewMember: s.notifyOnNewMember ?? true,
          weeklyReport: s.weeklyReport ?? true,
          notifyOnAnomalies: s.notifyOnAnomalies ?? true,
          notifyOnProductUpdates: s.notifyOnProductUpdates ?? true,
        });
      })
      .catch(() => {/* ignore — use defaults */});
  }, []);

  async function handleSave() {
    setSaving(true);
    setSaveError(null);
    try {
      let body: Record<string, unknown> = {};
      if (section === "general") {
        body = { name: workspaceName, defaultLocale };
      } else if (section === "notifications") {
        body = { settings: { ...notifSettings } };
      }
      const res = await fetch("/api/workspace/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Erreur lors de la sauvegarde.");
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-[--text-primary]">Paramètres du workspace</h1>
        <p className="mt-1 text-sm text-[--text-muted]">Configurez votre workspace et vos préférences.</p>
      </div>

      <div className="flex gap-6">
        {/* Section nav */}
        <nav className="flex w-44 shrink-0 flex-col gap-1">
          {SECTIONS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => { setSection(id); setSaved(false); setSaveError(null); }}
              className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors text-left ${
                section === id
                  ? "bg-[--blue-dim] text-[--blue]"
                  : "text-[--text-secondary] hover:bg-[--bg-hover]"
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </nav>

        {/* Section content */}
        <div className="flex-1 rounded-2xl border border-[--border] bg-[--bg-card] p-6 shadow-sm">
          {section === "general" && (
            <div className="space-y-5">
              <h2 className="font-semibold text-[--text-secondary]">Informations générales</h2>
              <div className="space-y-2">
                <Label htmlFor="ws-name">Nom du workspace</Label>
                <Input
                  id="ws-name"
                  value={workspaceName}
                  onChange={(e) => setWorkspaceName(e.target.value)}
                  className="max-w-sm"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ws-locale">Langue par défaut</Label>
                <select
                  id="ws-locale"
                  value={defaultLocale}
                  onChange={(e) => setDefaultLocale(e.target.value)}
                  className="flex h-11 w-full max-w-sm rounded-lg border border-[--border] bg-[--bg-card] px-3 text-sm text-[--text-primary] shadow-sm outline-none"
                >
                  <option value="FR">Français</option>
                  <option value="EN">English</option>
                  <option value="ES">Español</option>
                </select>
              </div>
            </div>
          )}

          {section === "notifications" && (
            <div className="space-y-5">
              <h2 className="font-semibold text-[--text-secondary]">Notifications email</h2>
              {NOTIF_KEYS.map(({ key, label, desc }) => (
                <label key={key} className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifSettings[key]}
                    onChange={(e) => setNotifSettings((prev) => ({ ...prev, [key]: e.target.checked }))}
                    className="mt-0.5 h-4 w-4 accent-[--blue]"
                  />
                  <div>
                    <p className="text-sm font-medium text-[--text-secondary]">{label}</p>
                    <p className="text-xs text-[--text-muted]">{desc}</p>
                  </div>
                </label>
              ))}
            </div>
          )}

          {section === "security" && (
            <div className="space-y-5">
              <h2 className="font-semibold text-[--text-secondary]">Sécurité du workspace</h2>
              <div className="rounded-xl border border-[--border] bg-[--bg-hover] p-4 text-sm text-[--text-secondary]">
                <p className="font-medium text-[--text-secondary]">Authentification à deux facteurs (2FA)</p>
                <p className="mt-1 text-xs text-[--text-muted]">Disponible dans le plan Pro. Renforcez la sécurité de votre équipe.</p>
                <button className="mt-3 rounded-lg border border-[--blue-border] bg-[--bg-card] px-3 py-1.5 text-xs font-medium text-[--blue] hover:bg-[--blue-dim]">
                  Passer au plan Pro →
                </button>
              </div>
              <div className="space-y-3">
                <p className="text-sm font-medium text-[--text-secondary]">Domaines autorisés pour l'inscription</p>
                <Input placeholder="@monentreprise.fr" className="max-w-sm" disabled />
                <p className="text-xs text-[--text-disabled]">Fonctionnalité Enterprise — contactez-nous pour l'activer.</p>
              </div>
              <div>
                <p className="text-sm font-medium text-[--text-secondary]">Sessions actives</p>
                <div className="mt-2 rounded-xl border border-[--border] bg-[--bg-card] p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-[--text-secondary]">Session actuelle</p>
                      <p className="text-xs text-[--text-muted]">Chrome · Paris, France · Il y a quelques secondes</p>
                    </div>
                    <span className="rounded-full bg-[--green-dim] px-2 py-0.5 text-xs text-[--green]">Active</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {section === "data" && (
            <div className="space-y-5">
              <h2 className="font-semibold text-[--text-secondary]">Gestion des données</h2>
              <div className="space-y-4">
                <div className="rounded-xl border border-[--border] bg-[--bg-card] p-4">
                  <p className="font-medium text-[--text-secondary]">Export des données workspace</p>
                  <p className="mt-1 text-xs text-[--text-muted]">Exportez tous les processus, opportunités et membres au format CSV ou JSON.</p>
                  <Button size="sm" variant="outline" className="mt-3 border-[--blue-border] text-[--blue] hover:bg-[--blue-dim]">
                    Exporter les données
                  </Button>
                </div>
                <div className="rounded-xl border border-[--red-dim] bg-[--red-dim] p-4">
                  <p className="font-medium text-[--red]">Zone de danger</p>
                  <p className="mt-1 text-xs text-[--red]">La suppression du workspace est irréversible. Toutes les données seront perdues.</p>
                  <Button size="sm" variant="outline" className="mt-3 border-[--red-dim] text-[--red] hover:bg-[--red-dim]">
                    Supprimer le workspace
                  </Button>
                </div>
              </div>
            </div>
          )}

          <div className="mt-6 flex items-center gap-3 border-t border-[--border-subtle] pt-4">
            {(section === "general" || section === "notifications") ? (
              <>
                <Button onClick={handleSave} disabled={saving || saved} className="bg-[--blue] hover:bg-[--blue]">
                  {saved ? (
                    <span className="flex items-center gap-1.5"><Check className="h-4 w-4" /> Enregistré</span>
                  ) : saving ? "Enregistrement..." : "Enregistrer"}
                </Button>
                {saveError && <p className="text-xs text-[--red]">{saveError}</p>}
                {!saveError && (
                  <p className="text-xs text-[--text-disabled]">
                    Les modifications s'appliquent immédiatement à tous les membres.
                  </p>
                )}
              </>
            ) : (
              <p className="text-xs text-[--text-disabled]">
                Les modifications s'appliquent immédiatement à tous les membres.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
