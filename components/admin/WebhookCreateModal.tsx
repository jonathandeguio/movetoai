"use client";

import { useState, useRef } from "react";
import { X, Copy, Check, Loader2 } from "lucide-react";

const AVAILABLE_EVENTS = [
  { value: "opportunity.created", label: "Opportunité créée" },
  { value: "opportunity.validated", label: "Opportunité validée" },
  { value: "usecase.validated", label: "Use case validé" },
  { value: "adr.created", label: "ADR créée" },
  { value: "survey.published", label: "Survey publié" },
  { value: "ingestion.done", label: "Ingestion terminée" },
] as const;

interface Props {
  onClose: () => void;
  onCreated: () => void;
}

export function WebhookCreateModal({ onClose, onCreated }: Props) {
  const [url, setUrl] = useState("");
  const [events, setEvents] = useState<string[]>([]);
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdSecret, setCreatedSecret] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const backdropRef = useRef<HTMLDivElement>(null);

  function toggleEvent(value: string) {
    setEvents((prev) =>
      prev.includes(value) ? prev.filter((e) => e !== value) : [...prev, value]
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!url) { setError("L'URL est obligatoire."); return; }
    if (events.length === 0) { setError("Sélectionnez au moins un événement."); return; }

    setLoading(true);
    try {
      const res = await fetch("/api/webhooks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, events, description: description || undefined }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Erreur lors de la création.");
        return;
      }
      setCreatedSecret(data.secret);
      onCreated();
    } catch {
      setError("Erreur réseau.");
    } finally {
      setLoading(false);
    }
  }

  async function copySecret() {
    if (!createdSecret) return;
    await navigator.clipboard.writeText(createdSecret);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleBackdropClick(e: React.MouseEvent) {
    if (e.target === backdropRef.current) onClose();
  }

  return (
    <div
      ref={backdropRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div className="relative w-full max-w-lg rounded-2xl border border-[--border] bg-[--bg-card] p-6 shadow-2xl">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-[--text-muted] hover:bg-[--bg-hover] hover:text-[--text-primary] transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        <h2 className="mb-5 text-lg font-semibold text-[--text-primary]">Ajouter un webhook</h2>

        {createdSecret ? (
          /* Success state — show secret once */
          <div className="space-y-4">
            <div className="rounded-xl border border-[--green-border] bg-[--green-dim] p-4">
              <p className="mb-2 text-sm font-medium text-[--green]">Webhook créé avec succès !</p>
              <p className="text-xs text-[--text-secondary] mb-3">
                Copiez ce secret maintenant. Il ne sera plus affiché.
              </p>
              <div className="flex items-center gap-2">
                <code className="flex-1 rounded-lg bg-[--bg-hover] px-3 py-2 text-xs font-mono text-[--text-primary] break-all">
                  {createdSecret}
                </code>
                <button
                  onClick={copySecret}
                  className="shrink-0 rounded-lg border border-[--border] bg-[--bg-card] p-2 text-[--text-secondary] hover:bg-[--bg-hover] transition-colors"
                >
                  {copied ? <Check className="h-4 w-4 text-[--green]" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-full rounded-xl bg-[--green] px-4 py-2.5 text-sm font-medium text-white hover:opacity-90 transition-opacity"
            >
              Fermer
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* URL */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[--text-secondary]">URL *</label>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://your-server.com/webhook"
                required
                className="w-full rounded-xl border border-[--border] bg-[--bg-card] px-3 py-2.5 text-sm text-[--text-primary] placeholder:text-[--text-muted] focus:border-[--blue] focus:outline-none focus:ring-1 focus:ring-[--blue] transition-colors"
              />
            </div>

            {/* Events */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[--text-secondary]">Événements *</label>
              <div className="grid grid-cols-2 gap-2">
                {AVAILABLE_EVENTS.map((ev) => (
                  <label
                    key={ev.value}
                    className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors ${
                      events.includes(ev.value)
                        ? "border-[--blue] bg-[--blue-dim] text-[--blue]"
                        : "border-[--border] text-[--text-secondary] hover:bg-[--bg-hover]"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={events.includes(ev.value)}
                      onChange={() => toggleEvent(ev.value)}
                      className="sr-only"
                    />
                    <span
                      className={`h-3.5 w-3.5 shrink-0 rounded border ${
                        events.includes(ev.value)
                          ? "border-[--blue] bg-[--blue]"
                          : "border-[--border] bg-[--bg-card]"
                      }`}
                    />
                    {ev.label}
                  </label>
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[--text-secondary]">Description (optionnel)</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ex : Slack #ai-alerts"
                className="w-full rounded-xl border border-[--border] bg-[--bg-card] px-3 py-2.5 text-sm text-[--text-primary] placeholder:text-[--text-muted] focus:border-[--blue] focus:outline-none focus:ring-1 focus:ring-[--blue] transition-colors"
              />
            </div>

            {error && (
              <p className="rounded-lg bg-[--red-dim] px-3 py-2 text-sm text-[--red]">{error}</p>
            )}

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-xl border border-[--border] bg-[--bg-card] px-4 py-2.5 text-sm font-medium text-[--text-secondary] hover:bg-[--bg-hover] transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-[--green] px-4 py-2.5 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50 transition-opacity"
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                Créer le webhook
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
