"use client";

import type { Route } from "next";
import Link from "next/link";
import { SECTOR_CONFIG, getSectorItemCounts, type Sector, type CompanySize } from "@/lib/onboarding/sector-config";

interface WelcomeSummaryProps {
  userName: string;
  workspaceName: string;
  sector: Sector | null;
  companySize: CompanySize | null;
  seeded: {
    capabilities: number;
    processes: number;
    opportunities: number;
    certifications: number;
  };
}

export function WelcomeSummary({
  userName,
  workspaceName,
  sector,
  companySize,
  seeded,
}: WelcomeSummaryProps) {
  const sectorCfg = sector ? SECTOR_CONFIG[sector] : null;

  return (
    <div style={{
      width: "100%", maxWidth: 560, margin: "0 auto",
      display: "flex", flexDirection: "column", alignItems: "center", gap: 24,
    }}>
      {/* Hero */}
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 56, marginBottom: 12 }}>🎉</div>
        <h1 style={{
          fontSize: 28, fontWeight: 800,
          color: "var(--text-primary)", margin: 0, lineHeight: 1.2,
        }}>
          Bienvenue, {userName.split(" ")[0]} !
        </h1>
        <p style={{ fontSize: 15, color: "var(--text-muted)", marginTop: 8 }}>
          Votre workspace <strong style={{ color: "var(--text-primary)" }}>{workspaceName}</strong> est prêt.
        </p>
      </div>

      {/* Sector badge */}
      {sectorCfg && (
        <div style={{
          padding: "12px 20px",
          borderRadius: 12,
          border: "1.5px solid var(--green-border)",
          background: "var(--green-dim)",
          display: "flex", alignItems: "center", gap: 12,
          width: "100%", boxSizing: "border-box",
        }}>
          <span style={{ fontSize: 32 }}>{sectorCfg.icon}</span>
          <div>
            <div style={{ fontWeight: 700, color: "var(--green)", fontSize: 15 }}>{sectorCfg.label}</div>
            <div style={{ fontSize: 12, color: "var(--text-muted)" }}>Secteur configuré</div>
          </div>
        </div>
      )}

      {/* What was created */}
      <div style={{
        width: "100%", padding: "20px 24px", boxSizing: "border-box",
        borderRadius: 14, border: "1.5px solid var(--border)",
        background: "var(--bg-card)",
      }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-muted)", marginBottom: 14, textTransform: "uppercase", letterSpacing: "0.05em" }}>
          Créé automatiquement dans votre workspace
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {[
            { icon: "🎯", count: seeded.capabilities,  label: "Capacités"       },
            { icon: "⚙️", count: seeded.processes,      label: "Processus"       },
            { icon: "🚀", count: seeded.opportunities,  label: "Opportunités IA" },
            { icon: "📋", count: seeded.certifications, label: "Certifications"  },
          ].map(item => (
            <div key={item.label} style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "10px 14px", borderRadius: 10,
              border: "1px solid var(--border)", background: "var(--bg-primary)",
            }}>
              <span style={{ fontSize: 20 }}>{item.icon}</span>
              <div>
                <div style={{ fontSize: 22, fontWeight: 800, color: "var(--text-primary)", lineHeight: 1 }}>
                  {item.count}
                </div>
                <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>
                  {item.label}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Next steps */}
      <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>
          Par où commencer ?
        </div>
        {[
          { href: "/app/opportunities", icon: "🚀", title: "Explorer vos opportunités IA",      sub: "Priorisez et enrichissez les cas d'usage identifiés" },
          { href: "/app/processes",     icon: "⚙️", title: "Affiner vos processus",             sub: "Ajoutez les détails de vos processus métier" },
          { href: "/app/knowledge/capabilities", icon: "🎯", title: "Valider votre carte des capacités", sub: "Vérifiez et complétez les capacités détectées" },
        ].map(item => (
          <Link
            key={item.href}
            href={item.href as Route}
            style={{
              display: "flex", alignItems: "center", gap: 14,
              padding: "12px 16px", borderRadius: 10,
              border: "1.5px solid var(--border)", background: "var(--bg-card)",
              textDecoration: "none", color: "inherit",
              transition: "border-color 0.15s",
            }}
          >
            <span style={{ fontSize: 22 }}>{item.icon}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>{item.title}</div>
              <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{item.sub}</div>
            </div>
            <span style={{ color: "var(--text-muted)", fontSize: 16 }}>→</span>
          </Link>
        ))}
      </div>

      {/* Go to app CTA */}
      <Link
        href={"/app" as Route}
        style={{
          width: "100%", display: "block", textAlign: "center",
          padding: "14px 24px", borderRadius: 12,
          background: "var(--green)", color: "#fff",
          fontWeight: 700, fontSize: 16, textDecoration: "none",
          boxSizing: "border-box",
        }}
      >
        Accéder à mon workspace →
      </Link>
    </div>
  );
}
