"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import type { CertCatalogueEntry } from "@/lib/seed/certification-catalogue";

interface ProcessGroup {
  certCode: string;
  certName: string;
  processes: Array<{
    code: string;
    name: string;
    domain: string;
    description: string;
  }>;
}

interface Props {
  groups: ProcessGroup[];
  alreadyImportedCodes: string[];
}

export function ProcessSelector({ groups, alreadyImportedCodes }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  // Initialize: select all not-already-imported
  const [selected, setSelected] = useState<Set<string>>(() => {
    const allCodes = groups.flatMap((g) => g.processes.map((p) => p.code));
    return new Set(allCodes.filter((c) => !alreadyImportedCodes.includes(c)));
  });

  const toggle = (code: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(code)) next.delete(code);
      else next.add(code);
      return next;
    });
  };

  const toggleGroup = (codes: string[]) => {
    const allSelected = codes.every((c) => selected.has(c));
    setSelected((prev) => {
      const next = new Set(prev);
      if (allSelected) codes.forEach((c) => next.delete(c));
      else codes.forEach((c) => next.add(c));
      return next;
    });
  };

  async function handleSubmit() {
    setError("");
    const codesToImport = [...selected].filter((c) => !alreadyImportedCodes.includes(c));

    if (codesToImport.length === 0) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      startTransition(() => router.push("/app/onboarding/opportunities" as any));
      return;
    }

    const res = await fetch("/api/processes/catalog/import", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ codes: codesToImport }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: "Erreur inconnue" }));
      // If no domain yet, continue anyway
      if (err.error?.includes("domaine")) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        startTransition(() => router.push("/app/onboarding/opportunities" as any));
        return;
      }
      setError("Erreur lors de l'import. Réessayez ou passez cette étape.");
      return;
    }

    startTransition(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      router.push("/app/onboarding/opportunities" as any);
    });
  }

  const totalSelected = selected.size;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {groups.map((group) => {
        const codes = group.processes.map((p) => p.code);
        const allGroupSelected = codes.every((c) => selected.has(c));

        return (
          <div key={group.certCode} style={{
            borderRadius: 12,
            border: "1.5px solid var(--border)",
            background: "var(--bg-card)",
            overflow: "hidden",
          }}>
            {/* Group header */}
            <div style={{
              padding: "12px 16px",
              background: "var(--bg-primary)",
              borderBottom: "1px solid var(--border)",
              display: "flex", alignItems: "center", justifyContent: "space-between",
            }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>
                {group.certCode} — {group.certName}
              </span>
              <button
                type="button"
                onClick={() => toggleGroup(codes)}
                style={{
                  fontSize: 11, padding: "4px 10px", borderRadius: 8,
                  border: "1px solid var(--border)", background: "var(--bg-card)",
                  cursor: "pointer", color: "var(--text-secondary)", fontWeight: 600,
                }}
              >
                {allGroupSelected ? "Tout désélectionner" : "Tout sélectionner"}
              </button>
            </div>

            {/* Process list */}
            <div>
              {group.processes.map((proc) => {
                const isImported = alreadyImportedCodes.includes(proc.code);
                const isSelected = selected.has(proc.code);

                return (
                  <div
                    key={proc.code}
                    style={{
                      display: "flex", alignItems: "flex-start", gap: 12,
                      padding: "12px 16px",
                      borderBottom: "1px solid var(--border)",
                      opacity: isImported ? 0.6 : 1,
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected || isImported}
                      disabled={isImported}
                      onChange={() => !isImported && toggle(proc.code)}
                      style={{ marginTop: 2, cursor: isImported ? "default" : "pointer", flexShrink: 0 }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                        <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text-muted)", fontFamily: "monospace" }}>
                          {proc.code}
                        </span>
                        <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>
                          {proc.name}
                        </span>
                        {isImported && (
                          <span style={{ fontSize: 10, color: "var(--green)", fontWeight: 700 }}>Déjà importé</span>
                        )}
                      </div>
                      <p style={{ fontSize: 11, color: "var(--text-muted)", margin: "3px 0 0", lineHeight: 1.5 }}>
                        {proc.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {groups.length === 0 && (
        <div style={{ padding: "40px 0", textAlign: "center", color: "var(--text-muted)", fontSize: 14 }}>
          Aucun processus à importer. Commencez par sélectionner des certifications à l&apos;étape précédente.
        </div>
      )}

      {error && <p style={{ fontSize: 13, color: "var(--red)", margin: 0 }}>{error}</p>}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 13, color: "var(--text-muted)" }}>
          {totalSelected} processus sélectionné{totalSelected > 1 ? "s" : ""}
        </span>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isPending}
          style={{
            padding: "12px 28px", borderRadius: 10,
            background: "var(--blue)", color: "#fff",
            fontSize: 14, fontWeight: 700,
            border: "none", cursor: isPending ? "not-allowed" : "pointer",
            opacity: isPending ? 0.7 : 1,
          }}
        >
          {isPending ? "Import en cours..." : `Importer ${totalSelected > 0 ? totalSelected + " processus" : "et continuer"} →`}
        </button>
      </div>
    </div>
  );
}

// re-export type for page
export type { ProcessGroup };
