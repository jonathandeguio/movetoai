"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { X, Check } from "lucide-react";

interface CatalogItem {
  code: string;
  level: 1 | 2 | 3;
  parent: string | null;
  name_fr: string;
  name_en: string;
  description_fr: string;
  ai_potential: "high" | "medium" | "low";
}

interface GroupedDomain {
  domain: CatalogItem;
  subdomains: {
    subdomain: CatalogItem;
    processes: CatalogItem[];
  }[];
}

const AI_POTENTIAL_COLORS: Record<string, string> = {
  high: "var(--green)",
  medium: "var(--amber)",
  low: "var(--text-muted)",
};

interface CatalogImportButtonProps {
  workspaceId: string;
}

export function CatalogImportButton({ workspaceId: _workspaceId }: CatalogImportButtonProps) {
  const [open, setOpen] = useState(false);
  const [allItems, setAllItems] = useState<CatalogItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{ created: number; skipped: number } | null>(null);
  const [search, setSearch] = useState("");
  const dialogRef = useRef<HTMLDivElement>(null);

  async function loadCatalog() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/processes/catalog");
      if (!res.ok) throw new Error("Erreur de chargement du catalogue");
      const data = (await res.json()) as { items: CatalogItem[] };
      setAllItems(data.items);
    } catch {
      setError("Impossible de charger le catalogue.");
    } finally {
      setLoading(false);
    }
  }

  function handleOpen() {
    setOpen(true);
    setImportResult(null);
    setSelected(new Set());
    setSearch("");
    void loadCatalog();
  }

  function handleClose() {
    setOpen(false);
  }

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") handleClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  function toggleSelect(code: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(code)) {
        next.delete(code);
      } else {
        next.add(code);
      }
      return next;
    });
  }

  function toggleAll(codes: string[]) {
    setSelected((prev) => {
      const next = new Set(prev);
      const allIn = codes.every((c) => next.has(c));
      if (allIn) {
        codes.forEach((c) => next.delete(c));
      } else {
        codes.forEach((c) => next.add(c));
      }
      return next;
    });
  }

  async function handleImport() {
    if (selected.size === 0) return;
    setImporting(true);
    setError(null);
    try {
      const res = await fetch("/api/processes/catalog/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ codes: Array.from(selected) }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({})) as { error?: string };
        throw new Error(d.error ?? "Erreur lors de l'import.");
      }
      const result = (await res.json()) as { created: number; skipped: number };
      setImportResult(result);
      setSelected(new Set());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setImporting(false);
    }
  }

  // Group items: L1 → L2 → L3
  const filteredL3 = allItems.filter((i) => {
    if (i.level !== 3) return false;
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return i.name_fr.toLowerCase().includes(q) || i.code.toLowerCase().includes(q);
  });

  const l1 = allItems.filter((i) => i.level === 1);
  const l2 = allItems.filter((i) => i.level === 2);

  const grouped: GroupedDomain[] = l1.map((domain) => ({
    domain,
    subdomains: l2
      .filter((s) => s.parent === domain.code)
      .map((subdomain) => ({
        subdomain,
        processes: filteredL3.filter((p) => p.parent === subdomain.code),
      }))
      .filter((s) => s.processes.length > 0),
  })).filter((d) => d.subdomains.length > 0);

  const l3Codes = filteredL3.map((i) => i.code);

  return (
    <>
      <Button variant="outline" size="sm" onClick={handleOpen} className="gap-1.5">
        Importer du catalogue
        <span aria-hidden className="text-[--green]">✦</span>
      </Button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
          onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
        >
          <div
            ref={dialogRef}
            className="relative flex flex-col w-full max-w-3xl max-h-[90vh] rounded-2xl border border-[--border] bg-[--bg-card] shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-[--border]">
              <div>
                <h2 className="text-lg font-semibold text-[--text-primary]">
                  Catalogue de processus
                  <span aria-hidden className="ml-1.5 text-[--green]">✦</span>
                </h2>
                <p className="text-sm text-[--text-secondary]">
                  Sélectionnez des processus L3 à importer dans votre workspace.
                </p>
              </div>
              <button
                onClick={handleClose}
                className="text-[--text-muted] hover:text-[--text-primary] transition-colors"
                aria-label="Fermer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Search bar */}
            <div className="px-6 py-3 border-b border-[--border]">
              <input
                type="search"
                placeholder="Rechercher un processus..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-lg border border-[--border] bg-[--bg-primary] px-3 py-2 text-sm text-[--text-primary] placeholder:text-[--text-muted] outline-none focus:ring-2 focus:ring-[--green]"
              />
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
              {loading && (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-10 rounded-xl bg-[--bg-hover] animate-pulse" />
                  ))}
                </div>
              )}

              {error && <p className="text-sm text-[--red]">{error}</p>}

              {importResult && (
                <div className="flex items-start gap-3 rounded-xl border border-[--green-border] bg-[--green-dim] p-4">
                  <Check className="h-5 w-5 shrink-0 mt-0.5 text-[--green]" />
                  <div>
                    <p className="text-sm font-semibold text-[--text-primary]">Import réussi</p>
                    <p className="text-sm text-[--text-secondary]">
                      {importResult.created} processus créé{importResult.created > 1 ? "s" : ""}
                      {importResult.skipped > 0 ? `, ${importResult.skipped} déjà présent${importResult.skipped > 1 ? "s" : ""}` : ""}.
                    </p>
                  </div>
                </div>
              )}

              {!loading && !error && grouped.length === 0 && (
                <p className="text-sm text-[--text-muted] italic">Aucun résultat pour cette recherche.</p>
              )}

              {!loading && grouped.map(({ domain, subdomains }) => (
                <div key={domain.code}>
                  <p className="mb-3 text-sm font-bold uppercase tracking-[0.14em] text-[--text-primary]">
                    {domain.name_fr}
                  </p>
                  <div className="space-y-4">
                    {subdomains.map(({ subdomain, processes }) => {
                      const codes = processes.map((p) => p.code);
                      const allIn = codes.every((c) => selected.has(c));
                      return (
                        <div key={subdomain.code} className="rounded-xl border border-[--border] overflow-hidden">
                          <button
                            type="button"
                            onClick={() => toggleAll(codes)}
                            className="flex w-full items-center gap-3 px-4 py-2.5 bg-[--bg-hover] hover:bg-[--border] transition-colors text-left"
                          >
                            <span
                              className="flex h-4 w-4 shrink-0 items-center justify-center rounded border border-[--border]"
                              style={allIn ? { backgroundColor: "var(--green)", borderColor: "var(--green)" } : {}}
                            >
                              {allIn && <Check className="h-3 w-3 text-black" />}
                            </span>
                            <span className="text-xs font-semibold text-[--text-secondary] uppercase tracking-wider">
                              {subdomain.name_fr}
                            </span>
                            <span className="ml-auto text-xs text-[--text-muted]">{codes.length} processus</span>
                          </button>
                          <div className="divide-y divide-[--border]">
                            {processes.map((proc) => (
                              <label
                                key={proc.code}
                                className="flex cursor-pointer items-start gap-3 px-4 py-3 hover:bg-[--bg-hover] transition-colors"
                              >
                                <input
                                  type="checkbox"
                                  checked={selected.has(proc.code)}
                                  onChange={() => toggleSelect(proc.code)}
                                  className="mt-0.5 h-4 w-4 shrink-0 rounded border-[--border] accent-[--green]"
                                />
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-[--text-primary]">{proc.name_fr}</p>
                                  <p className="text-xs text-[--text-muted]">{proc.code}</p>
                                </div>
                                <span
                                  className="shrink-0 text-xs font-medium capitalize"
                                  style={{ color: AI_POTENTIAL_COLORS[proc.ai_potential] ?? "var(--text-muted)" }}
                                >
                                  IA {proc.ai_potential === "high" ? "élevé" : proc.ai_potential === "medium" ? "moyen" : "faible"}
                                </span>
                              </label>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between gap-4 px-6 py-4 border-t border-[--border]">
              <div className="flex items-center gap-3">
                {l3Codes.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      if (selected.size === l3Codes.length) {
                        setSelected(new Set());
                      } else {
                        setSelected(new Set(l3Codes));
                      }
                    }}
                    className="text-xs text-[--text-muted] underline hover:text-[--text-secondary] transition-colors"
                  >
                    {selected.size === l3Codes.length ? "Tout désélectionner" : "Tout sélectionner"}
                  </button>
                )}
                {selected.size > 0 && (
                  <span className="text-xs text-[--text-secondary]">
                    {selected.size} sélectionné{selected.size > 1 ? "s" : ""}
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleClose}>
                  Fermer
                </Button>
                <Button
                  size="sm"
                  onClick={() => { void handleImport(); }}
                  disabled={selected.size === 0 || importing}
                >
                  {importing
                    ? "Import en cours..."
                    : selected.size > 0
                    ? `Importer ${selected.size} processus`
                    : "Importer du catalogue"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
