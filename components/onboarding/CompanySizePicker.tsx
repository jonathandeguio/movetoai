"use client";

import type { CompanySize } from "@/lib/onboarding/sector-config";

const SIZES: { value: CompanySize; label: string; subtitle: string; range: string }[] = [
  { value: "tpe",  label: "TPE",  subtitle: "Très petite entreprise",  range: "< 10 salariés"   },
  { value: "pme",  label: "PME",  subtitle: "Petite & moyenne entreprise", range: "10–249 salariés" },
  { value: "eti",  label: "ETI",  subtitle: "Entreprise de taille intermédiaire", range: "250–4 999 salariés" },
  { value: "ge",   label: "GE",   subtitle: "Grande entreprise",        range: "5 000+ salariés" },
];

interface CompanySizePickerProps {
  value: CompanySize | "";
  onChange: (size: CompanySize) => void;
}

export function CompanySizePicker({ value, onChange }: CompanySizePickerProps) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
      {SIZES.map((size) => {
        const selected = value === size.value;
        return (
          <button
            key={size.value}
            type="button"
            onClick={() => onChange(size.value)}
            style={{
              padding: "16px 20px",
              borderRadius: 12,
              border: `2px solid ${selected ? "var(--green)" : "var(--border)"}`,
              background: selected ? "var(--green-dim)" : "var(--bg-card)",
              cursor: "pointer",
              textAlign: "left",
              transition: "all 0.15s",
              outline: "none",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <span style={{
                fontSize: 18, fontWeight: 700,
                color: selected ? "var(--green)" : "var(--text-primary)",
              }}>
                {size.label}
              </span>
              {selected && (
                <span style={{
                  fontSize: 11, fontWeight: 600,
                  background: "var(--green)", color: "#fff",
                  borderRadius: 999, padding: "1px 6px",
                }}>
                  ✓
                </span>
              )}
            </div>
            <div style={{ fontSize: 12, fontWeight: 500, color: "var(--text-secondary)", marginBottom: 2 }}>
              {size.subtitle}
            </div>
            <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
              {size.range}
            </div>
          </button>
        );
      })}
    </div>
  );
}
