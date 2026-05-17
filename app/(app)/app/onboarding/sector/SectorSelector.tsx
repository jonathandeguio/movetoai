"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { ONBOARDING_SECTORS } from "@/lib/onboarding/sector-mapping";

const COMPANY_SIZES = [
  { code: "tpe", label: "TPE",  desc: "< 10 salariés"       },
  { code: "pme", label: "PME",  desc: "10 – 250 salariés"   },
  { code: "eti", label: "ETI",  desc: "250 – 5 000 salariés" },
  { code: "ge",  label: "GE",   desc: "> 5 000 salariés"    },
] as const;

export function SectorSelector({ initialSector, initialSize }: {
  initialSector?: string | null;
  initialSize?: string | null;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [sector, setSector]   = useState(initialSector ?? "");
  const [size, setSize]       = useState(initialSize ?? "");
  const [error, setError]     = useState("");

  async function handleSubmit() {
    if (!sector) { setError("Sélectionnez votre secteur d'activité."); return; }
    if (!size)   { setError("Sélectionnez la taille de votre entreprise."); return; }
    setError("");

    const res = await fetch("/api/workspace/onboarding/sector", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sectorCode: sector, companySize: size }),
    });

    if (!res.ok) {
      setError("Erreur lors de la sauvegarde. Réessayez.");
      return;
    }

    startTransition(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      router.push("/app/onboarding/certifications" as any);
    });
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

      {/* Sector grid */}
      <div>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", marginBottom: 12 }}>
          Secteur d&apos;activité
        </h2>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
          gap: 10,
        }}>
          {ONBOARDING_SECTORS.map((s) => (
            <button
              key={s.code}
              type="button"
              onClick={() => setSector(s.code)}
              style={{
                padding: "14px 12px",
                borderRadius: 12,
                border: `2px solid ${sector === s.code ? "var(--blue)" : "var(--border)"}`,
                background: sector === s.code ? "color-mix(in srgb, var(--blue) 12%, var(--bg-card))" : "var(--bg-card)",
                cursor: "pointer",
                textAlign: "left",
                transition: "border-color 0.15s, background 0.15s",
                display: "flex",
                flexDirection: "column",
                gap: 6,
              }}
            >
              <span style={{ fontSize: 22 }}>{s.icon}</span>
              <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-primary)", lineHeight: 1.3 }}>
                {s.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Size selector */}
      <div>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", marginBottom: 12 }}>
          Taille de l&apos;entreprise
        </h2>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {COMPANY_SIZES.map((s) => (
            <button
              key={s.code}
              type="button"
              onClick={() => setSize(s.code)}
              style={{
                padding: "12px 20px",
                borderRadius: 10,
                border: `2px solid ${size === s.code ? "var(--blue)" : "var(--border)"}`,
                background: size === s.code ? "color-mix(in srgb, var(--blue) 12%, var(--bg-card))" : "var(--bg-card)",
                cursor: "pointer",
                textAlign: "left",
                transition: "border-color 0.15s",
              }}
            >
              <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>{s.label}</div>
              <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>{s.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Error */}
      {error && (
        <p style={{ fontSize: 13, color: "var(--red)", margin: 0 }}>{error}</p>
      )}

      {/* CTA */}
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
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
