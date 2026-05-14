"use client";

import { useState, useEffect } from "react";
import { useDebouncedCallback } from "use-debounce";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface WorkspaceSlugInputProps {
  value: string;
  onChange: (value: string) => void;
}

type SlugStatus = "idle" | "checking" | "available" | "taken" | "invalid";

function toSlug(raw: string) {
  return raw
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function WorkspaceSlugInput({ value, onChange }: WorkspaceSlugInputProps) {
  const [status, setStatus] = useState<SlugStatus>("idle");

  const checkSlug = useDebouncedCallback(async (slug: string) => {
    if (!slug || slug.length < 3) { setStatus("invalid"); return; }
    setStatus("checking");
    try {
      const res = await fetch(`/api/workspaces/check-slug?slug=${encodeURIComponent(slug)}`);
      const data = (await res.json()) as { available: boolean };
      setStatus(data.available ? "available" : "taken");
    } catch {
      setStatus("idle");
    }
  }, 500);

  useEffect(() => {
    if (value) checkSlug(value);
    else setStatus("idle");
  }, [value, checkSlug]);

  function handleChange(raw: string) {
    const slug = toSlug(raw);
    onChange(slug);
  }

  const statusConfig: Record<SlugStatus, { text: string; color: string } | null> = {
    idle: null,
    checking: { text: "Vérification…", color: "var(--text-muted)" },
    available: { text: "✓ Disponible", color: "var(--green)" },
    taken: { text: "✗ Déjà utilisé", color: "var(--red)" },
    invalid: { text: "Minimum 3 caractères (a-z, 0-9, -)", color: "var(--text-muted)" },
  };

  const hint = statusConfig[status];

  return (
    <div className="space-y-1.5">
      <Label htmlFor="workspace-slug">Identifiant du workspace (optionnel)</Label>
      <div className="relative">
        <Input
          id="workspace-slug"
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="mon-entreprise"
          className={
            status === "taken"
              ? "border-[--red] focus-visible:ring-[--red]/20"
              : status === "available"
              ? "border-[--green] focus-visible:ring-[--green]/20"
              : ""
          }
        />
        {status === "checking" && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2">
            <svg className="h-4 w-4 animate-spin text-[--text-muted]" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3V4a10 10 0 100 20v-2a8 8 0 01-8-8z" />
            </svg>
          </span>
        )}
      </div>
      {hint && (
        <p className="text-xs" style={{ color: hint.color }}>
          {hint.text}
        </p>
      )}
      {value && (
        <p className="text-xs text-[--text-muted]">
          URL : <span className="font-mono">move.ai/{value}</span>
        </p>
      )}
    </div>
  );
}
