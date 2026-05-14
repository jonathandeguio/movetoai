"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { Route } from "next";
import { Search, X, Monitor, BookOpen, Network, Lightbulb, Sparkles, Cpu, ClipboardList, FileCog } from "lucide-react";

type ResultType =
  | "application"
  | "capability"
  | "process"
  | "use_case"
  | "opportunity"
  | "technology"
  | "survey"
  | "decision";

type SearchResult = {
  type: ResultType;
  id: string;
  label: string;
  subtitle: string | null;
  href: string;
};

const TYPE_META: Record<ResultType, { label: string; icon: React.ElementType; color: string }> = {
  application: { label: "Application", icon: Monitor, color: "text-[--blue]" },
  capability: { label: "Capability", icon: BookOpen, color: "text-[--purple]" },
  process: { label: "Processus", icon: Network, color: "text-[--amber]" },
  use_case: { label: "Cas d'usage", icon: Lightbulb, color: "text-[--green]" },
  opportunity: { label: "Opportunité", icon: Sparkles, color: "text-[--green]" },
  technology: { label: "Technologie", icon: Cpu, color: "text-[--text-muted]" },
  survey: { label: "Sondage", icon: ClipboardList, color: "text-[--amber]" },
  decision: { label: "Décision", icon: FileCog, color: "text-[--red]" },
};

interface Props {
  open: boolean;
  onClose: () => void;
}

export function GlobalSearchModal({ open, onClose }: Props) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // focus input on open
  useEffect(() => {
    if (open) {
      setQuery("");
      setResults([]);
      setActive(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  // search
  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      return;
    }
    const ctrl = new AbortController();
    setLoading(true);
    fetch(`/api/search?q=${encodeURIComponent(query)}`, { signal: ctrl.signal })
      .then((r) => r.json())
      .then((data) => {
        setResults(data.results ?? []);
        setActive(0);
      })
      .catch(() => null)
      .finally(() => setLoading(false));
    return () => ctrl.abort();
  }, [query]);

  const navigate = useCallback(
    (href: string) => {
      onClose();
      router.push(href as Route);
    },
    [router, onClose]
  );

  // keyboard nav
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActive((a) => Math.min(a + 1, results.length - 1));
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setActive((a) => Math.max(a - 1, 0));
      }
      if (e.key === "Enter" && results[active]) {
        navigate(results[active].href);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, results, active, navigate, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 pt-[15vh]"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl rounded-2xl border border-[--border] bg-[--bg-card] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Input row */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-[--border]">
          <Search size={18} className="text-[--text-muted] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Rechercher applications, cas d'usage, processus…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-sm text-[--text-primary] placeholder:text-[--text-muted] outline-none"
          />
          {query && (
            <button onClick={() => setQuery("")} className="text-[--text-muted] hover:text-[--text-primary]">
              <X size={16} />
            </button>
          )}
          <kbd className="hidden sm:inline-flex h-5 items-center rounded border border-[--border] px-1.5 text-[10px] text-[--text-muted]">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div className="max-h-96 overflow-y-auto py-2">
          {loading && (
            <p className="px-4 py-3 text-sm text-[--text-muted]">Recherche…</p>
          )}

          {!loading && query.length >= 2 && results.length === 0 && (
            <p className="px-4 py-3 text-sm text-[--text-muted]">Aucun résultat pour « {query} »</p>
          )}

          {!loading && results.length > 0 && (
            <ul>
              {results.map((r, i) => {
                const meta = TYPE_META[r.type] ?? TYPE_META.application;
                const Icon = meta.icon;
                return (
                  <li key={`${r.type}-${r.id}`}>
                    <button
                      onClick={() => navigate(r.href)}
                      onMouseEnter={() => setActive(i)}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                        i === active ? "bg-[--bg-hover]" : "hover:bg-[--bg-hover]"
                      }`}
                    >
                      <span className={`shrink-0 ${meta.color}`}>
                        <Icon size={16} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-[--text-primary] truncate">{r.label}</p>
                        {r.subtitle && (
                          <p className="text-xs text-[--text-muted] truncate">{r.subtitle}</p>
                        )}
                      </div>
                      <span className="shrink-0 text-xs text-[--text-muted]">{meta.label}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}

          {!query && (
            <p className="px-4 py-3 text-xs text-[--text-muted]">
              Tapez au moins 2 caractères pour rechercher dans votre espace de travail.
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center gap-3 px-4 py-2 border-t border-[--border]">
          <span className="text-[10px] text-[--text-muted]">↑↓ naviguer</span>
          <span className="text-[10px] text-[--text-muted]">↵ ouvrir</span>
          <span className="text-[10px] text-[--text-muted]">ESC fermer</span>
        </div>
      </div>
    </div>
  );
}
