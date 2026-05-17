"use client";

import { useEffect, useState } from "react";

interface HistoryEntry {
  id: string;
  action: string;
  detail: string | null;
  createdAt: string;
  user: { name: string | null; image: string | null } | null;
}

interface ProcessHistoryPanelProps {
  processId: string;
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export function ProcessHistoryPanel({ processId }: ProcessHistoryPanelProps) {
  const [items, setItems] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/processes/${processId}/history`);
        if (!res.ok) throw new Error("Erreur de chargement");
        const data = (await res.json()) as { items: HistoryEntry[] };
        setItems(data.items.slice(0, 20));
      } catch {
        setError("Impossible de charger l'historique.");
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, [processId]);

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-14 rounded-xl bg-[--bg-hover] animate-pulse" />
        ))}
      </div>
    );
  }

  if (error) {
    return <p className="text-sm text-[--red]">{error}</p>;
  }

  if (items.length === 0) {
    return (
      <p className="text-sm text-[--text-muted] italic">Aucun événement enregistré pour ce processus.</p>
    );
  }

  return (
    <div className="relative pl-6">
      {/* Vertical timeline line */}
      <div
        className="absolute left-2 top-2 bottom-2 w-px"
        style={{ backgroundColor: "var(--border)" }}
      />
      <div className="space-y-4">
        {items.map((item) => (
          <div key={item.id} className="relative">
            {/* Dot */}
            <div
              className="absolute -left-[1.35rem] top-1.5 h-2.5 w-2.5 rounded-full border-2"
              style={{
                borderColor: "var(--green)",
                backgroundColor: "var(--bg-primary)",
              }}
            />
            <div className="rounded-xl border border-[--border] bg-[--bg-hover] px-4 py-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-sm font-medium text-[--text-primary]">{item.action}</span>
                <span className="text-xs text-[--text-muted]">{formatDate(item.createdAt)}</span>
              </div>
              {item.detail && (
                <p className="mt-1 text-sm text-[--text-secondary]">{item.detail}</p>
              )}
              {item.user?.name && (
                <p className="mt-1 text-xs text-[--text-muted]">par {item.user.name}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
