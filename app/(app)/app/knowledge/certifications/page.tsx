import Link from "next/link";
import type { Route } from "next";
import { ArrowRight, CheckCircle2, Clock, Target, AlertTriangle, ShieldOff } from "lucide-react";

import { AriaBanner } from "@/components/aria/AriaBanner";
import { getCurrentWorkspaceContext } from "@/lib/current-workspace";
import { prisma } from "@/lib/prisma";
import { calculateComplianceScore } from "@/lib/certifications/compliance-calculator";
import { FAMILY_LABELS, FAMILY_COLORS } from "@/lib/seed/certifications";

export const dynamic = "force-dynamic";

const STATUS_META: Record<string, { label: string; color: string; icon: string }> = {
  obtained:       { label: "Certifié",          color: "var(--green)",      icon: "✅" },
  in_progress:    { label: "En cours d'audit",  color: "var(--blue)",       icon: "🔄" },
  planned:        { label: "Objectif déclaré",  color: "var(--purple)",     icon: "🎯" },
  not_applicable: { label: "Non applicable",    color: "var(--text-muted)", icon: "—"  },
  expired:        { label: "Expirée",           color: "var(--red)",        icon: "❌" },
};

export default async function KnowledgeCertificationsPage() {
  const { workspace } = await getCurrentWorkspaceContext({ requireMembership: true });
  if (!workspace?.id) return null;

  const [certs, score] = await Promise.all([
    prisma.workspaceCertification.findMany({
      where: { workspaceId: workspace.id },
      include: {
        catalog: {
          select: {
            code: true, name: true, shortName: true, family: true,
            isMandatory: true, certifyingBody: true, validityYears: true,
            aiAutomationPotential: true, linkedProcessCodes: true,
            estimatedCostMin: true, estimatedCostMax: true,
          },
        },
        owner: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    calculateComplianceScore(workspace.id),
  ]);

  const byFamily = certs.reduce<Record<string, typeof certs>>((acc, c) => {
    const fam = c.catalog.family;
    acc[fam] ??= [];
    acc[fam].push(c);
    return acc;
  }, {});

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <AriaBanner />

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
            Certifications
          </h1>
          <p style={{ fontSize: 14, color: "var(--text-muted)", marginTop: 4 }}>
            {certs.length} certification{certs.length !== 1 ? "s" : ""} déclarée{certs.length !== 1 ? "s" : ""} pour{" "}
            <strong>{workspace.name}</strong>
          </p>
        </div>
        <Link
          href={"/app/compliance" as Route}
          style={{
            padding: "10px 18px", borderRadius: 10,
            background: "var(--blue)", color: "#fff",
            fontSize: 13, fontWeight: 700, textDecoration: "none",
            display: "inline-flex", alignItems: "center", gap: 6,
          }}
        >
          + Ajouter une certification
        </Link>
      </div>

      {/* KPI row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12 }}>
        <div style={{
          padding: "20px 22px", borderRadius: 14,
          border: "2px solid var(--green-border)", background: "var(--green-dim)",
          gridColumn: "span 2",
        }}>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 8 }}>
            <span style={{ fontSize: 48, fontWeight: 900, color: "var(--green)", lineHeight: 1 }}>
              {score.score}%
            </span>
            <span style={{ fontSize: 14, color: "var(--green)", fontWeight: 600, marginBottom: 4 }}>
              Score de conformité
            </span>
          </div>
          <div style={{ marginTop: 10, height: 6, borderRadius: 3, background: "var(--bg-primary)" }}>
            <div style={{
              width: `${score.score}%`, height: "100%", borderRadius: 3,
              background: "var(--green)", transition: "width 0.5s",
            }} />
          </div>
          {score.missingMandatory.length > 0 && (
            <p style={{ fontSize: 11, color: "var(--red)", marginTop: 6 }}>
              {score.missingMandatory.length} certification{score.missingMandatory.length > 1 ? "s" : ""} obligatoire{score.missingMandatory.length > 1 ? "s" : ""} manquante{score.missingMandatory.length > 1 ? "s" : ""}
            </p>
          )}
        </div>

        {[
          { label: "Certifiées", value: score.obtained,  color: "var(--green)",  icon: <CheckCircle2 style={{ width: 18, height: 18 }} /> },
          { label: "Expirant",   value: score.expiring,  color: "var(--amber)",  icon: <AlertTriangle style={{ width: 18, height: 18 }} /> },
          { label: "Expirées",   value: score.expired,   color: "var(--red)",    icon: <ShieldOff style={{ width: 18, height: 18 }} /> },
          { label: "Total",      value: score.total,     color: "var(--text-secondary)", icon: <Target style={{ width: 18, height: 18 }} /> },
        ].map((kpi) => (
          <div key={kpi.label} style={{
            padding: "18px 20px", borderRadius: 12,
            border: "1.5px solid var(--border)", background: "var(--bg-card)",
          }}>
            <div style={{ color: kpi.color, marginBottom: 6 }}>{kpi.icon}</div>
            <div style={{ fontSize: 30, fontWeight: 800, color: kpi.color, lineHeight: 1 }}>{kpi.value}</div>
            <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>{kpi.label}</div>
          </div>
        ))}
      </div>

      {/* By family */}
      {certs.length === 0 ? (
        <div style={{
          padding: "48px 24px", textAlign: "center",
          border: "1.5px dashed var(--border)", borderRadius: 14,
        }}>
          <p style={{ fontSize: 14, color: "var(--text-muted)", marginBottom: 12 }}>
            Aucune certification déclarée.
          </p>
          <Link href={"/app/onboarding/certifications" as Route} style={{
            fontSize: 13, color: "var(--blue)", textDecoration: "underline",
          }}>
            Configurer les certifications via l&apos;assistant →
          </Link>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {Object.entries(byFamily).map(([family, familyCerts]) => {
            const color = (FAMILY_COLORS[family] ?? "var(--text-secondary)") as string;
            return (
              <div key={family} style={{
                borderRadius: 14, border: "1.5px solid var(--border)",
                background: "var(--bg-card)", overflow: "hidden",
              }}>
                <div style={{
                  padding: "12px 18px",
                  background: `color-mix(in srgb, ${color} 8%, var(--bg-card))`,
                  borderBottom: "1px solid var(--border)",
                  display: "flex", alignItems: "center", gap: 10,
                }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color }}>
                    {FAMILY_LABELS[family] ?? family}
                  </span>
                  <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
                    {familyCerts.length} certification{familyCerts.length > 1 ? "s" : ""}
                  </span>
                </div>

                {familyCerts.map((cert) => {
                  const meta = STATUS_META[cert.status] ?? STATUS_META.planned;
                  const linkedCount = Array.isArray(cert.catalog.linkedProcessCodes)
                    ? cert.catalog.linkedProcessCodes.length : 0;

                  return (
                    <Link
                      key={cert.id}
                      href={`/app/knowledge/certifications/${cert.id}` as Route}
                      style={{
                        display: "flex", alignItems: "center", gap: 12,
                        padding: "12px 18px", borderBottom: "1px solid var(--border)",
                        textDecoration: "none", transition: "background 0.15s",
                      }}
                    >
                      <span style={{ fontSize: 18, flexShrink: 0 }}>{meta.icon}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                          <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>
                            {cert.catalog.shortName}
                          </span>
                          <span style={{
                            fontSize: 10, padding: "1px 6px", borderRadius: 999,
                            background: `color-mix(in srgb, ${meta.color} 15%, transparent)`,
                            color: meta.color, border: `1px solid ${meta.color}`, fontWeight: 600,
                          }}>
                            {meta.label}
                          </span>
                          {cert.catalog.isMandatory && (
                            <span style={{
                              fontSize: 10, padding: "1px 6px", borderRadius: 999,
                              background: "var(--red-dim)", color: "var(--red)", fontWeight: 700,
                            }}>Obligatoire</span>
                          )}
                        </div>
                        <div style={{ display: "flex", gap: 12, marginTop: 3, flexWrap: "wrap" }}>
                          {linkedCount > 0 && (
                            <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
                              🔗 {linkedCount} processus lié{linkedCount > 1 ? "s" : ""}
                            </span>
                          )}
                          {cert.expiryDate && (
                            <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
                              Expire : {new Date(cert.expiryDate).toLocaleDateString("fr-FR")}
                            </span>
                          )}
                          {cert.owner?.name && (
                            <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
                              Owner : {cert.owner.name}
                            </span>
                          )}
                          {cert.catalog.aiAutomationPotential && (
                            <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
                              IA : {cert.catalog.aiAutomationPotential}
                            </span>
                          )}
                        </div>
                      </div>
                      <ArrowRight style={{ width: 14, height: 14, color: "var(--text-muted)", flexShrink: 0 }} />
                    </Link>
                  );
                })}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
