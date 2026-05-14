"use client";

import { useState } from "react";
import { SECTOR_LIST, type Sector } from "@/lib/onboarding/sector-config";

interface SectorPickerProps {
  value: Sector | "";
  onChange: (sector: Sector) => void;
}

export function SectorPicker({ value, onChange }: SectorPickerProps) {
  const [search, setSearch] = useState("");

  const filtered = search
    ? SECTOR_LIST.filter(s =>
        s.label.toLowerCase().includes(search.toLowerCase()) ||
        s.description.toLowerCase().includes(search.toLowerCase())
      )
    : SECTOR_LIST;

  return (
    <div>
      {/* Search */}
      <input
        type="text"
        placeholder="Rechercher un secteur…"
        value={search}
        onChange={e => setSearch(e.target.value)}
        style={{
          width: "100%", padding: "10px 14px",
          borderRadius: 10, border: "1.5px solid var(--border)",
          background: "var(--bg-input)",
          color: "var(--text-primary)", fontSize: 14,
          marginBottom: 12, outline: "none",
          boxSizing: "border-box",
        }}
      />
      {/* Grid */}
      <div style={{
        display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
        gap: 8, maxHeight: 340, overflowY: "auto",
      }}>
        {filtered.map((sector) => {
          const selected = value === sector.key;
          return (
            <button
              key={sector.key}
              type="button"
              onClick={() => onChange(sector.key)}
              title={sector.description}
              style={{
                padding: "12px 14px",
                borderRadius: 10,
                border: `2px solid ${selected ? "var(--green)" : "var(--border)"}`,
                background: selected ? "var(--green-dim)" : "var(--bg-card)",
                cursor: "pointer",
                textAlign: "left",
                transition: "all 0.15s",
                outline: "none",
                display: "flex", alignItems: "center", gap: 8,
              }}
            >
              <span style={{ fontSize: 22 }}>{sector.icon}</span>
              <span style={{
                fontSize: 13, fontWeight: selected ? 600 : 500,
                color: selected ? "var(--green)" : "var(--text-primary)",
                lineHeight: 1.3,
              }}>
                {sector.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
