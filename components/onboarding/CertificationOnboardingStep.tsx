"use client";

import { useState, useMemo } from "react";
import {
  getCertificationsForContext,
  groupByFamily,
  FAMILY_LABELS,
  FAMILY_COLORS,
  type CatalogEntry,
} from "@/lib/seed/certifications";
import type { CompanySize } from "@/lib/onboarding/sector-config";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface CertificationSelection {
  code: string;
  name: string;
  shortName: string;
  family: string;
  type: "current" | "target";
  obtainedDate?: string;
  expiryDate?: string;
  horizon?: string;
}

interface Props {
  sector: string;
  companySize: CompanySize;
  value: CertificationSelection[];
  onChange: (selections: CertificationSelection[]) => void;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const TAB_CURRENT = "current";
const TAB_TARGET  = "target";

const HORIZON_OPTIONS = [
  { value: "lt_6m",   label: "< 6 mois"    },
  { value: "6_12m",   label: "6 à 12 mois" },
  { value: "12_24m",  label: "12 à 24 mois" },
];

// ── Styles partagés ───────────────────────────────────────────────────────────

const s = {
  badge: (color: string): React.CSSProperties => ({
    display: "inline-block",
    fontSize: 10, fontWeight: 700, padding: "2px 7px",
    borderRadius: 999, background: `color-mix(in srgb, ${color} 15%, transparent)`,
    color, border: `1px solid ${color}`, whiteSpace: "nowrap",
  }),
  mandatoryBadge: {
    display: "inline-block",
    fontSize: 10, fontWeight: 700, padding: "2px 7px",
    borderRadius: 999,
    background: "color-mix(in srgb, var(--red) 15%, transparent)",
    color: "var(--red)", border: "1px solid var(--red)", whiteSpace: "nowrap",
  } as React.CSSProperties,
};

// ── Main component ─────────────────────────────────────────────────────────────

export function CertificationOnboardingStep({
  sector,
  companySize,
  value,
  onChange,
}: Props) {
  const [tab, setTab]         = useState<"current" | "target">(TAB_CURRENT);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  // Catalog filtered for this sector + size
  const catalog = useMemo(
    () => getCertificationsForContext(sector, companySize),
    [sector, companySize]
  );
  const groups = useMemo(() => groupByFamily(catalog), [catalog]);

  // ── Selection helpers ────────────────────────────────────────────────────────

  const getSelection = (code: string, type: "current" | "target") =>
    value.find((s) => s.code === code && s.type === type);

  const isSelected = (code: string, type: "current" | "target") =>
    !!getSelection(code, type);

  const toggle = (cert: CatalogEntry, type: "current" | "target") => {
    if (isSelected(cert.code, type)) {
      onChange(value.filter((s) => !(s.code === cert.code && s.type === type)));
    } else {
      onChange([
        ...value,
        {
          code:      cert.code,
          name:      cert.name,
          shortName: cert.shortName,
          family:    cert.family,
          type,
        },
      ]);
    }
  };

  const updateField = (
    code: string,
    type: "current" | "target",
    field: keyof CertificationSelection,
    val: string
  ) => {
    onChange(
      value.map((s) =>
        s.code === code && s.type === type ? { ...s, [field]: val } : s
      )
    );
  };

  const toggleFamily = (family: string) =>
    setExpanded((e) => ({ ...e, [family]: !e[family] }));

  // ── Summary counters ─────────────────────────────────────────────────────────

  const currentCount = value.filter((s) => s.type === "current").length;
  const targetCount  = value.filter((s) => s.type === "target").length;

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div>
      {/* ── Tab bar ─────────────────────────────────────────────────────────── */}
      <div style={{ display: "flex", gap: 4, marginBottom: 20 }}>
        {[
          { key: TAB_CURRENT, label: `Déjà certifié${currentCount ? ` (${currentCount})` : ""}` },
          { key: TAB_TARGET,  label: `Je vise${targetCount ? ` (${targetCount})` : ""}`          },
        ].map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key as "current" | "target")}
            style={{
              flex: 1, padding: "9px 16px", borderRadius: 10, fontSize: 13, fontWeight: 600,
              border: `2px solid ${tab === key ? "var(--green)" : "var(--border)"}`,
              background: tab === key ? "var(--green-dim)" : "var(--bg-primary)",
              color: tab === key ? "var(--green)" : "var(--text-secondary)",
              cursor: "pointer", outline: "none", transition: "all 0.12s",
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ── Hint ────────────────────────────────────────────────────────────── */}
      <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 16, marginTop: 0 }}>
        {tab === TAB_CURRENT
          ? "Cochez les certifications que votre entreprise possède déjà."
          : "Cochez les certifications que vous souhaitez obtenir dans les 12–24 prochains mois."}
      </p>

      {/* ── Groups by family ────────────────────────────────────────────────── */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {Object.entries(groups).map(([family, certs]) => {
          const isOpen = expanded[family] ?? true;
          const color  = FAMILY_COLORS[family] ?? "var(--text-secondary)";
          const selectedInFamily = certs.filter((c) => isSelected(c.code, tab)).length;

          return (
            <div
              key={family}
              style={{
                borderRadius: 10,
                border: `1.5px solid ${selectedInFamily > 0 ? color : "var(--border)"}`,
                overflow: "hidden",
                transition: "border-color 0.15s",
              }}
            >
              {/* Family header */}
              <button
                type="button"
                onClick={() => toggleFamily(family)}
                style={{
                  width: "100%", display: "flex", alignItems: "center",
                  justifyContent: "space-between", padding: "10px 14px",
                  background: selectedInFamily > 0
                    ? `color-mix(in srgb, ${color} 8%, var(--bg-card))`
                    : "var(--bg-card)",
                  border: "none", cursor: "pointer", outline: "none",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>
                    {FAMILY_LABELS[family] ?? family}
                  </span>
                  <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
                    {certs.length} certification{certs.length > 1 ? "s" : ""}
                  </span>
                  {selectedInFamily > 0 && (
                    <span style={s.badge(color)}>
                      {selectedInFamily} sélectionnée{selectedInFamily > 1 ? "s" : ""}
                    </span>
                  )}
                </div>
                <span style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 700 }}>
                  {isOpen ? "▲" : "▼"}
                </span>
              </button>

              {/* Certification rows */}
              {isOpen && (
                <div style={{ borderTop: "1px solid var(--border)" }}>
                  {certs.map((cert) => {
                    const sel     = getSelection(cert.code, tab);
                    const checked = !!sel;
                    const isRgpd  = cert.code === "RGPD";

                    return (
                      <div
                        key={cert.code}
                        style={{
                          borderBottom: "1px solid var(--border)",
                          background: checked
                            ? `color-mix(in srgb, ${color} 5%, var(--bg-primary))`
                            : "var(--bg-primary)",
                        }}
                      >
                        {/* Row */}
                        <div
                          style={{
                            display: "flex", alignItems: "flex-start",
                            gap: 12, padding: "12px 14px", cursor: "pointer",
                          }}
                          onClick={() => !isRgpd && toggle(cert, tab)}
                        >
                          {/* Checkbox */}
                          <div
                            style={{
                              width: 18, height: 18, borderRadius: 5, flexShrink: 0,
                              marginTop: 2,
                              border: `2px solid ${checked ? color : "var(--border)"}`,
                              background: checked ? color : "transparent",
                              display: "flex", alignItems: "center", justifyContent: "center",
                              transition: "all 0.12s",
                            }}
                          >
                            {checked && (
                              <span style={{ color: "#fff", fontSize: 11, fontWeight: 800, lineHeight: 1 }}>✓</span>
                            )}
                          </div>

                          {/* Content */}
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 6 }}>
                              <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>
                                {cert.shortName}
                              </span>
                              <span style={s.badge(color)}>{FAMILY_LABELS[family] ?? family}</span>
                              {cert.isMandatory && tab === TAB_TARGET && (
                                <span style={s.mandatoryBadge}>⚠ Obligatoire</span>
                              )}
                              {isRgpd && (
                                <span style={s.mandatoryBadge}>Obligatoire universel</span>
                              )}
                            </div>
                            <p style={{
                              fontSize: 11, color: "var(--text-muted)",
                              margin: "3px 0 0", lineHeight: 1.4,
                              display: "-webkit-box", WebkitLineClamp: 2,
                              WebkitBoxOrient: "vertical", overflow: "hidden",
                            }}>
                              {cert.description}
                            </p>
                            {cert.validityYears && (
                              <span style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 2, display: "inline-block" }}>
                                Validité : {cert.validityYears} an{cert.validityYears > 1 ? "s" : ""}
                                {cert.costEstimate ? ` · ${cert.costEstimate}` : ""}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Expanded fields when selected */}
                        {checked && (
                          <div style={{
                            padding: "0 14px 14px 44px",
                            display: "flex", flexWrap: "wrap", gap: 12,
                          }}>
                            {tab === TAB_CURRENT && (
                              <>
                                <div>
                                  <label style={{
                                    fontSize: 11, fontWeight: 600,
                                    color: "var(--text-secondary)", display: "block", marginBottom: 4,
                                  }}>
                                    Date d'obtention
                                  </label>
                                  <input
                                    type="date"
                                    value={sel?.obtainedDate ?? ""}
                                    onChange={(e) =>
                                      updateField(cert.code, tab, "obtainedDate", e.target.value)
                                    }
                                    style={{
                                      padding: "6px 10px", borderRadius: 8, fontSize: 12,
                                      border: "1.5px solid var(--border)",
                                      background: "var(--bg-input)", color: "var(--text-primary)",
                                      outline: "none",
                                    }}
                                  />
                                </div>
                                <div>
                                  <label style={{
                                    fontSize: 11, fontWeight: 600,
                                    color: "var(--text-secondary)", display: "block", marginBottom: 4,
                                  }}>
                                    Date d'expiration
                                    {cert.validityYears && (
                                      <span style={{ fontWeight: 400, marginLeft: 4 }}>
                                        (calculée auto si laissée vide)
                                      </span>
                                    )}
                                  </label>
                                  <input
                                    type="date"
                                    value={sel?.expiryDate ?? ""}
                                    onChange={(e) =>
                                      updateField(cert.code, tab, "expiryDate", e.target.value)
                                    }
                                    style={{
                                      padding: "6px 10px", borderRadius: 8, fontSize: 12,
                                      border: "1.5px solid var(--border)",
                                      background: "var(--bg-input)", color: "var(--text-primary)",
                                      outline: "none",
                                    }}
                                  />
                                </div>
                              </>
                            )}

                            {tab === TAB_TARGET && (
                              <div>
                                <label style={{
                                  fontSize: 11, fontWeight: 600,
                                  color: "var(--text-secondary)", display: "block", marginBottom: 4,
                                }}>
                                  Horizon cible
                                </label>
                                <div style={{ display: "flex", gap: 6 }}>
                                  {HORIZON_OPTIONS.map((h) => (
                                    <button
                                      key={h.value}
                                      type="button"
                                      onClick={() => updateField(cert.code, tab, "horizon", h.value)}
                                      style={{
                                        padding: "5px 10px", borderRadius: 8, fontSize: 11, fontWeight: 600,
                                        border: `1.5px solid ${sel?.horizon === h.value ? color : "var(--border)"}`,
                                        background: sel?.horizon === h.value
                                          ? `color-mix(in srgb, ${color} 15%, transparent)`
                                          : "var(--bg-card)",
                                        color: sel?.horizon === h.value ? color : "var(--text-secondary)",
                                        cursor: "pointer", outline: "none",
                                      }}
                                    >
                                      {h.label}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ── Bottom note ─────────────────────────────────────────────────────── */}
      <div style={{
        marginTop: 16, padding: "10px 14px", borderRadius: 10,
        background: "var(--bg-card)", border: "1px solid var(--border)",
        fontSize: 11, color: "var(--text-muted)", lineHeight: 1.6,
      }}>
        {tab === TAB_TARGET
          ? "Les certifications obligatoires non déclarées seront automatiquement ajoutées à votre plan de conformité."
          : "Les dates d'expiration non renseignées seront calculées automatiquement selon la durée de validité standard."}
      </div>
    </div>
  );
}
