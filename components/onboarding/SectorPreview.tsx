"use client";

import { getSectorItemCounts, getSectorItems, SECTOR_CONFIG, type CompanySize, type Sector } from "@/lib/onboarding/sector-config";

interface SectorPreviewProps {
  sector: Sector;
  size: CompanySize;
}

function CountBadge({ count, label, icon }: { count: number; label: string; icon: string }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 10,
      padding: "10px 14px",
      borderRadius: 10,
      border: "1.5px solid var(--border)",
      background: "var(--bg-primary)",
    }}>
      <span style={{ fontSize: 20 }}>{icon}</span>
      <div>
        <div style={{ fontSize: 20, fontWeight: 700, color: "var(--green)", lineHeight: 1 }}>
          {count}
        </div>
        <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>
          {label}
        </div>
      </div>
    </div>
  );
}

export function SectorPreview({ sector, size }: SectorPreviewProps) {
  const counts = getSectorItemCounts(sector, size);
  const items  = getSectorItems(sector, size);
  const cfg    = SECTOR_CONFIG[sector];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Header */}
      <div style={{
        padding: "14px 16px",
        borderRadius: 12,
        border: "1.5px solid var(--green-border)",
        background: "var(--green-dim)",
        display: "flex", alignItems: "center", gap: 12,
      }}>
        <span style={{ fontSize: 32 }}>{cfg.icon}</span>
        <div>
          <div style={{ fontWeight: 700, fontSize: 15, color: "var(--green)" }}>{cfg.label}</div>
          <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{cfg.description}</div>
        </div>
      </div>

      {/* Count tiles */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        <CountBadge count={counts.capabilities}   label="Capacités"         icon="🎯" />
        <CountBadge count={counts.processes}       label="Processus"         icon="⚙️" />
        <CountBadge count={counts.opportunities}   label="Opportunités IA"   icon="🚀" />
        <CountBadge count={counts.certifications}  label="Certifications"    icon="📋" />
      </div>

      {/* Sample opportunities */}
      {items.opportunities.length > 0 && (
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Exemples d'opportunités IA pré-identifiées
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {items.opportunities.slice(0, 3).map((opp) => (
              <div key={opp.code} style={{
                padding: "8px 12px",
                borderRadius: 8,
                border: "1.5px solid var(--border)",
                background: "var(--bg-card)",
                display: "flex", alignItems: "flex-start", gap: 8,
              }}>
                <span style={{ fontSize: 14, marginTop: 1 }}>
                  {opp.priority === "P0" ? "🔴" : opp.priority === "P1" ? "🟡" : "🟢"}
                </span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: "var(--text-primary)" }}>
                    {opp.title}
                  </div>
                  {opp.gainEstimate && (
                    <div style={{ fontSize: 11, color: "var(--green)", marginTop: 2 }}>
                      {opp.gainEstimate}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Total */}
      <div style={{
        textAlign: "center", fontSize: 13, color: "var(--text-muted)",
        padding: "8px 0", borderTop: "1px solid var(--border)",
      }}>
        <strong style={{ color: "var(--text-primary)" }}>{counts.total} éléments</strong> seront créés automatiquement dans votre workspace
      </div>
    </div>
  );
}
