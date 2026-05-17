"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import type { CertCatalogBasic } from "@/lib/certifications/sector-mapper";

interface Props {
  mandatory: CertCatalogBasic[];
  recommended: CertCatalogBasic[];
  existingCertCatalogIds: string[];
}

function CertCard({
  cert,
  badge,
  selected,
  onToggle,
}: {
  cert: CertCatalogBasic;
  badge: "mandatory" | "recommended";
  selected: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      style={{
        padding: "14px 16px",
        borderRadius: 12,
        border: `2px solid ${selected ? "var(--green)" : "var(--border)"}`,
        background: selected ? "color-mix(in srgb, var(--green) 8%, var(--bg-card))" : "var(--bg-card)",
        cursor: "pointer",
        textAlign: "left",
        transition: "border-color 0.15s, background 0.15s",
        display: "flex",
        flexDirection: "column",
        gap: 6,
        width: "100%",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 6 }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>{cert.shortName}</span>
        <span style={{
          fontSize: 10, padding: "2px 8px", borderRadius: 999, fontWeight: 700,
          background: badge === "mandatory" ? "var(--red-dim)" : "color-mix(in srgb, var(--amber) 15%, transparent)",
          color:      badge === "mandatory" ? "var(--red)"     : "var(--amber)",
          border:     `1px solid ${badge === "mandatory" ? "var(--red)" : "var(--amber)"}`,
        }}>
          {badge === "mandatory" ? "Obligatoire" : "Recommandé"}
        </span>
      </div>
      <p style={{ fontSize: 11, color: "var(--text-muted)", margin: 0, lineHeight: 1.5 }}>
        {cert.description.slice(0, 120)}{cert.description.length > 120 ? "…" : ""}
      </p>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        {cert.estimatedCostMin !== null && cert.estimatedCostMax !== null && (
          <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
            💰 {cert.estimatedCostMin.toLocaleString("fr-FR")} – {cert.estimatedCostMax.toLocaleString("fr-FR")} €
          </span>
        )}
        {cert.implementationMin !== null && cert.implementationMax !== null && (
          <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
            ⏱ {cert.implementationMin} – {cert.implementationMax} mois
          </span>
        )}
        {cert.linkedProcessCount > 0 && (
          <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
            🔗 {cert.linkedProcessCount} processus
          </span>
        )}
      </div>
    </button>
  );
}

export function CertSelector({ mandatory, recommended, existingCertCatalogIds }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [selected, setSelected] = useState<Set<string>>(new Set(existingCertCatalogIds));
  const [error, setError] = useState("");

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  async function handleSubmit() {
    setError("");
    const toAdd = [...selected].filter((id) => !existingCertCatalogIds.includes(id));
    const toRemove = existingCertCatalogIds.filter((id) => !selected.has(id));

    try {
      // Add selected
      for (const catalogId of toAdd) {
        await fetch("/api/certifications", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ catalogId, status: "planned", source: "onboarding_target" }),
        });
      }
      // Note: we don't remove existing — just skip removal to preserve user data

      startTransition(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        router.push("/app/onboarding/processes" as any);
      });
    } catch {
      setError("Erreur lors de la sauvegarde. Réessayez.");
    }

    void toRemove; // acknowledged but not used
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>

      {mandatory.length > 0 && (
        <div>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: "var(--red)", marginBottom: 12 }}>
            Certifications obligatoires pour votre secteur ({mandatory.length})
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {mandatory.map((c) => (
              <CertCard key={c.id} cert={c} badge="mandatory" selected={selected.has(c.id)} onToggle={() => toggle(c.id)} />
            ))}
          </div>
        </div>
      )}

      {recommended.length > 0 && (
        <div>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: "var(--amber)", marginBottom: 12 }}>
            Certifications recommandées ({recommended.length})
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {recommended.map((c) => (
              <CertCard key={c.id} cert={c} badge="recommended" selected={selected.has(c.id)} onToggle={() => toggle(c.id)} />
            ))}
          </div>
        </div>
      )}

      {mandatory.length === 0 && recommended.length === 0 && (
        <div style={{ padding: "40px 0", textAlign: "center", color: "var(--text-muted)", fontSize: 14 }}>
          Aucune certification spécifique identifiée pour votre secteur.
        </div>
      )}

      {error && <p style={{ fontSize: 13, color: "var(--red)", margin: 0 }}>{error}</p>}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 13, color: "var(--text-muted)" }}>
          {selected.size} sélectionnée{selected.size > 1 ? "s" : ""}
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
          {isPending ? "Enregistrement..." : "Continuer →"}
        </button>
      </div>
    </div>
  );
}
