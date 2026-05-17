import { Users, Building2, Zap, TrendingUp, ShieldCheck, Settings } from "lucide-react";
import Link from "next/link";

import { AriaBanner } from "@/components/aria/AriaBanner";

import { getWorkspaceAdminDashboardData } from "@/modules/dashboard/workspace-admin/server/get-dashboard-data";

export const dynamic = "force-dynamic";

export default async function WorkspaceAdminDashboardPage() {
  const { workspace, data } = await getWorkspaceAdminDashboardData();
  if (!workspace || !data) return null;

  const { counts } = data;
  const ws = data.workspace;

  const stats = [
    { icon: Users,      label: "Membres actifs",         value: counts.members,       href: "/app/admin/team",              color: "var(--blue)"   },
    { icon: Zap,        label: "Opportunités IA",         value: counts.opportunities, href: "/app/opportunities",           color: "var(--purple)" },
    { icon: Building2,  label: "Processus cartographiés", value: counts.processes,     href: "/app/processes",               color: "var(--green)"  },
    { icon: TrendingUp, label: "Capacités identifiées",   value: counts.capabilities,  href: "/app/knowledge/capabilities",  color: "var(--amber)"  },
  ];

  const quickActions = [
    { href: "/app/admin/team",              icon: Users,       label: "Gérer l'équipe"        },
    { href: "/app/admin/settings",          icon: Settings,    label: "Paramètres workspace"  },
    { href: "/app/governance/attestations", icon: ShieldCheck, label: "Attestations"          },
    { href: "/app/opportunities",           icon: Zap,         label: "Voir les opportunités" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
      <AriaBanner />
      {/* Header */}
      <div>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
          Tableau de bord administrateur
        </h1>
        <p style={{ fontSize: 14, color: "var(--text-muted)", marginTop: 4 }}>
          Vue d&apos;ensemble de <strong>{ws.name}</strong>
          {ws.sectorCode && (
            <span style={{ marginLeft: 8, padding: "2px 8px", borderRadius: 999, fontSize: 12, background: "var(--bg-card)", border: "1px solid var(--border)" }}>
              {ws.sectorCode}
            </span>
          )}
        </p>
      </div>

      {/* Plan banner */}
      <div style={{
        padding: "12px 18px", borderRadius: 12,
        border: "1.5px solid var(--green-border)", background: "var(--green-dim)",
        display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
      }}>
        <div>
          <span style={{ fontWeight: 700, color: "var(--green)", fontSize: 14 }}>
            Plan {ws.planType}
          </span>
          <span style={{ color: "var(--text-muted)", fontSize: 13, marginLeft: 12 }}>
            {ws.seatsUsed}/{ws.seatsLimit} sièges utilisés
          </span>
        </div>
        {ws.certCount > 0 && (
          <span style={{ fontSize: 13, color: "var(--text-muted)" }}>
            📋 {ws.certCount} certifications configurées
          </span>
        )}
      </div>

      {/* KPI grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12 }}>
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href as Parameters<typeof Link>[0]["href"]}
            style={{ textDecoration: "none" }}
          >
            <div style={{
              padding: "18px 20px", borderRadius: 12,
              border: "1.5px solid var(--border)", background: "var(--bg-card)",
              transition: "border-color 0.15s",
            }}>
              <stat.icon style={{ width: 20, height: 20, color: stat.color, marginBottom: 10 }} />
              <div style={{ fontSize: 28, fontWeight: 800, color: "var(--text-primary)", lineHeight: 1 }}>
                {stat.value}
              </div>
              <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>{stat.label}</div>
            </div>
          </Link>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {/* Workspace health */}
        <div style={{ padding: "20px 24px", borderRadius: 14, border: "1.5px solid var(--border)", background: "var(--bg-card)" }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 16px", color: "var(--text-primary)" }}>
            Santé du workspace
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              { label: "Opportunités en attente de revue", value: counts.pendingOpps, warn: counts.pendingOpps > 10 },
              { label: "Détectées par IA",                 value: counts.aiOpps,     warn: false },
              { label: "Certifications configurées",       value: ws.certCount,      warn: ws.certCount === 0 },
            ].map((item) => (
              <div key={item.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>{item.label}</span>
                <span style={{
                  fontSize: 14, fontWeight: 700,
                  color: item.warn ? "var(--amber)" : "var(--text-primary)",
                }}>
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick actions */}
        <div style={{ padding: "20px 24px", borderRadius: 14, border: "1.5px solid var(--border)", background: "var(--bg-card)" }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 16px", color: "var(--text-primary)" }}>
            Actions rapides
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {quickActions.map((action) => (
              <Link
                key={action.href}
                href={action.href as Parameters<typeof Link>[0]["href"]}
                style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "9px 12px", borderRadius: 8,
                  border: "1px solid var(--border)", background: "var(--bg-primary)",
                  textDecoration: "none", color: "var(--text-primary)",
                  fontSize: 13, fontWeight: 500,
                  transition: "border-color 0.15s",
                }}
              >
                <action.icon style={{ width: 15, height: 15, color: "var(--text-muted)" }} />
                {action.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
