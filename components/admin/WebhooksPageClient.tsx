"use client";

import { useState, useCallback } from "react";
import { Plus, Trash2, Play, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { WebhookCreateModal } from "@/components/admin/WebhookCreateModal";

interface Webhook {
  id: string;
  url: string;
  events: unknown;
  active: boolean;
  description: string | null;
  createdAt: Date | string;
  _count: { deliveries: number };
}

interface Props {
  initialWebhooks: Webhook[];
}

export function WebhooksPageClient({ initialWebhooks }: Props) {
  const [webhooks, setWebhooks] = useState<Webhook[]>(initialWebhooks);
  const [showModal, setShowModal] = useState(false);
  const [testingId, setTestingId] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<Record<string, { success: boolean; statusCode: number | null }>>({});
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const res = await fetch("/api/webhooks");
    if (res.ok) {
      const data = await res.json();
      setWebhooks(data);
    }
  }, []);

  async function handleTest(id: string) {
    setTestingId(id);
    try {
      const res = await fetch(`/api/webhooks/${id}/test`, { method: "POST" });
      const data = await res.json();
      setTestResults((prev) => ({
        ...prev,
        [id]: { success: data.success, statusCode: data.statusCode },
      }));
    } catch {
      setTestResults((prev) => ({ ...prev, [id]: { success: false, statusCode: null } }));
    } finally {
      setTestingId(null);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Supprimer ce webhook ?")) return;
    setDeletingId(id);
    try {
      await fetch(`/api/webhooks/${id}`, { method: "DELETE" });
      setWebhooks((prev) => prev.filter((w) => w.id !== id));
    } finally {
      setDeletingId(null);
    }
  }

  function truncateUrl(url: string, max = 45) {
    return url.length > max ? url.slice(0, max) + "…" : url;
  }

  return (
    <>
      <div className="rounded-2xl border border-[--border] bg-[--bg-card] shadow-sm">
        {/* Toolbar */}
        <div className="flex items-center justify-between border-b border-[--border] px-5 py-4">
          <p className="text-sm text-[--text-muted]">{webhooks.length} webhook{webhooks.length !== 1 ? "s" : ""} configuré{webhooks.length !== 1 ? "s" : ""}</p>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-[--green] px-4 py-2 text-sm font-medium text-white hover:opacity-90 transition-opacity"
          >
            <Plus className="h-4 w-4" />
            Ajouter un webhook
          </button>
        </div>

        {webhooks.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-16 text-[--text-muted]">
            <p className="text-sm">Aucun webhook configuré.</p>
            <button
              onClick={() => setShowModal(true)}
              className="text-sm text-[--blue] hover:underline"
            >
              Ajouter votre premier webhook
            </button>
          </div>
        ) : (
          <div className="divide-y divide-[--border-subtle]">
            {webhooks.map((wh) => {
              const events = Array.isArray(wh.events) ? (wh.events as string[]) : [];
              const result = testResults[wh.id];
              return (
                <div key={wh.id} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0 flex-1 space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-sm text-[--text-primary]" title={wh.url}>
                        {truncateUrl(wh.url)}
                      </span>
                      <span
                        className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium ${
                          wh.active
                            ? "bg-[--green-dim] text-[--green] border-[--green-border]"
                            : "bg-[--bg-hover] text-[--text-muted] border-[--border]"
                        }`}
                      >
                        {wh.active ? "Actif" : "Inactif"}
                      </span>
                      {result && (
                        <span
                          className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium ${
                            result.success
                              ? "bg-[--green-dim] text-[--green] border-[--green-border]"
                              : "bg-[--red-dim] text-[--red] border-[--red-dim]"
                          }`}
                        >
                          {result.success ? (
                            <CheckCircle2 className="h-3 w-3" />
                          ) : (
                            <XCircle className="h-3 w-3" />
                          )}
                          {result.statusCode ?? "Erreur"}
                        </span>
                      )}
                    </div>
                    {wh.description && (
                      <p className="text-xs text-[--text-muted]">{wh.description}</p>
                    )}
                    <div className="flex flex-wrap gap-1.5">
                      {events.map((ev) => (
                        <span
                          key={ev}
                          className="inline-flex items-center rounded-full border border-[--border] bg-[--bg-hover] px-2 py-0.5 text-[10px] font-mono text-[--text-secondary]"
                        >
                          {ev}
                        </span>
                      ))}
                    </div>
                    <p className="text-xs text-[--text-muted]">{wh._count.deliveries} livraison{wh._count.deliveries !== 1 ? "s" : ""}</p>
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    <button
                      onClick={() => handleTest(wh.id)}
                      disabled={testingId === wh.id}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-[--border] bg-[--bg-card] px-3 py-1.5 text-xs font-medium text-[--text-secondary] hover:bg-[--bg-hover] disabled:opacity-50 transition-colors"
                    >
                      {testingId === wh.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Play className="h-3.5 w-3.5" />
                      )}
                      Test
                    </button>
                    <button
                      onClick={() => handleDelete(wh.id)}
                      disabled={deletingId === wh.id}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-[--red-dim] bg-[--red-dim] px-3 py-1.5 text-xs font-medium text-[--red] hover:opacity-80 disabled:opacity-50 transition-opacity"
                    >
                      {deletingId === wh.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="h-3.5 w-3.5" />
                      )}
                      Supprimer
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showModal && (
        <WebhookCreateModal
          onClose={() => setShowModal(false)}
          onCreated={() => refresh()}
        />
      )}
    </>
  );
}
