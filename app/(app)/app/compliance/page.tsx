import Link from "next/link";
import { ArrowRight, CheckCircle2, Clock, Target, AlertTriangle, ShieldOff } from "lucide-react";

import { AriaBanner }              from "@/components/aria/AriaBanner";
import { getCompliancePageData }   from "@/modules/compliance/server/get-compliance-page-data";
import { FAMILY_LABELS, FAMILY_COLORS } from "@/lib/seed/certifications";
import type { CertificationRow }   from "@/lib/services/compliance.service";

export const dynamic = "force-dynamic";

// ── Status helpers ────────────────────────────────────────────────────────────

const STATUS_META: Record<string, { label: string; color: string; icon: string }> = {
  obtained:       { label: "Certifié",          color: "var(--green)",      icon: "✅" },
  in_progress:    { label: "En cours d'audit",  color: "var(--blue)",       icon: "🔄" },
  planned:        { label: "Objectif déclaré",  color: "var(--purple)",     icon: "🎯" },
  not_applicable: { label: "Non applicable",    color: "var(--text-muted)", icon: "—"  },
  expired:        { label: "Expirée",           color: "var(--red)",        icon: "❌" },
};

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function CompliancePage() {
  const result = await getCompliancePageData();
  if (!result) return null;

  const { workspace, summary, rows } = result;

  const mandatoryScore = summary.mandatoryTotal > 0
    ? Math.round((summary.mandatoryObtained / summary.mandatoryTotal) * 100)
    : 100;

  // Vues dérivées des rows (calculs dans le service, groupement ici)
  const expiringSoonRows   = rows.filter((r) => r.expiryLevel === "warning" || r.expiryLevel === "critical");
  const unhandledMandatory = rows.filter((r) => r.isMandatory && (r.status === "planned" || r.status === "expired"));
  const plannedRows        = rows.filter((r) => r.status === "planned");

  const byFamily = rows.reduce<Record<string, CertificationRow[]>>((acc, r) => {
    acc[r.family] ??= [];
    acc[r.family].push(r);
    return acc;
  }, {});

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
      <AriaBanner />

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
          Tableau de bord Conformité
        </h1>
        <p style={{ fontSize: 14, color: "var(--text-muted)", marginTop: 4 }}>
          Certifications obtenues, objectifs et obligations réglementaires pour{" "}
          <strong>{workspace.name}</strong>
        </p>
      </div>

      {/* ── KPI row ─────────────────────────────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12 }}>
        {/* Score global */}
        <div style={{
          padding: "20px 22px", borderRadius: 14,
          border: "2px solid var(--green-border)", background: "var(--green-dim)",
          gridColumn: "span 2",
        }}>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 8 }}>
            <span style={{ fontSize: 48, fontWeight: 900, color: "var(--green)", lineHeight: 1 }}>
              {summary.score}%
            </span>
            <span style={{ fontSize: 14, color: "var(--green)", fontWeight: 600, marginBottom: 4 }}>
              Score de conformité
            </span>
          </div>
          <div style={{ marginTop: 10, height: 6, borderRadius: 3, background: "var(--bg-primary)" }}>
            <div style={{ width: `${summary.score}%`, height: "100%", borderRadius: 3, background: "var(--green)", transition: "width 0.5s" }} />
          </div>
          <p style={{ fontSize: 11, color: "var(--green)", marginTop: 6 }}>
            Obligations : {mandatoryScore}% couvertes ({summary.mandatoryObtained}/{summary.mandatoryTotal})
          </p>
        </div>

        {[
          { label: "Certifiées", value: summary.obtained,   color: "var(--green)",  icon: <CheckCircle2 style={{ width: 18, height: 18 }} /> },
          { label: "En cours",   value: summary.inProgress, color: "var(--blue)",   icon: <Clock         style={{ width: 18, height: 18 }} /> },
          { label: "Objectifs",  value: summary.planned,    color: "var(--purple)", icon: <Target        style={{ width: 18, height: 18 }} /> },
          { label: "Expirées",   value: summary.expired,    color: "var(--red)",    icon: <ShieldOff     style={{ width: 18, height: 18 }} /> },
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

      {/* ── Alertes expiration ───────────────────────────────────────────────── */}
      {expiringSoonRows.length > 0 && (
        <div style={{
          padding: "14px 18px", borderRadius: 12,
          border: "1.5px solid var(--amber-border)", background: "var(--amber-dim)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <AlertTriangle style={{ width: 16, height: 16, color: "var(--amber)" }} />
            <span style={{ fontSize: 13, fontWeight: 700, color: "var(--amber)" }}>
              {expiringSoonRows.length} certification{expiringSoonRows.length > 1 ? "s" : ""} expire{expiringSoonRows.length > 1 ? "nt" : ""} bientôt
            </span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {expiringSoonRows.map((r) => (
              <Link
                key={r.id}
                href={`/app/compliance/${r.id}`}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "8px 12px", borderRadius: 8, background: "var(--bg-card)",
                  border: `1px solid ${r.expiryLevel === "critical" ? "var(--red-border)" : "var(--amber-border)"}`,
                  textDecoration: "none",
                }}
              >
                <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>
                  {r.shortName}
                </span>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{
                    fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 999,
                    background: r.expiryLevel === "critical" ? "var(--red-dim)" : "var(--amber-dim)",
                    color:      r.expiryLevel === "critical" ? "var(--red)"     : "var(--amber)",
                  }}>
                    J{(r.daysUntilExpiry ?? 0) > 0 ? `-${r.daysUntilExpiry}` : "0"} — {r.expiryDate?.toLocaleDateString("fr-FR") ?? ""}
                  </span>
                  <ArrowRight style={{ width: 12, height: 12, color: "var(--text-muted)" }} />
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* ── Obligations non traitées ─────────────────────────────────────────── */}
      {unhandledMandatory.length > 0 && (
        <div style={{
          padding: "16px 20px", borderRadius: 14,
          border: "1.5px solid var(--red-border)", background: "var(--bg-card)",
        }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, margin: "0 0 12px", color: "var(--red)" }}>
            ⚠ Obligations non encore couvertes ({unhandledMandatory.length})
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {unhandledMandatory.map((r) => (
              <div key={r.id} style={{
                display: "flex", alignItems: "flex-start", gap: 12,
                padding: "10px 14px", borderRadius: 10,
                border: "1px solid var(--red-border)", background: "var(--red-dim)",
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>{r.name}</span>
                    <span style={{
                      fontSize: 10, padding: "1px 6px", borderRadius: 999,
                      background: "var(--red)", color: "#fff", fontWeight: 700,
                    }}>Obligatoire</span>
                    <span style={{
                      fontSize: 10, padding: "1px 6px", borderRadius: 999,
                      background: "color-mix(in srgb, var(--purple) 15%, transparent)",
                      color: "var(--purple)", border: "1px solid var(--purple)", fontWeight: 600,
                    }}>
                      {r.source === "auto_sector" ? "Auto-détectée" : "Déclarée"}
                    </span>
                  </div>
                  {r.riskIfMissing && (
                    <p style={{ fontSize: 11, color: "var(--red)", marginTop: 4 }}>
                      Risque : {r.riskIfMissing}
                    </p>
                  )}
                </div>
                <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                  {r.officialUrl && (
                    <a href={r.officialUrl} target="_blank" rel="noopener noreferrer" style={{
                      fontSize: 11, padding: "4px 10px", borderRadius: 8,
                      border: "1px solid var(--border)", background: "var(--bg-card)",
                      color: "var(--text-secondary)", textDecoration: "none", fontWeight: 600,
                    }}>Info ↗</a>
                  )}
                  <Link href={`/app/compliance/${r.id}`} style={{
                    fontSize: 11, padding: "4px 10px", borderRadius: 8,
                    border: "1px solid var(--border)", background: "var(--bg-card)",
                    color: "var(--text-secondary)", textDecoration: "none", fontWeight: 600,
                    display: "inline-flex", alignItems: "center", gap: 4,
                  }}>
                    Détail <ArrowRight style={{ width: 10, height: 10 }} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Objectifs de certification ───────────────────────────────────────── */}
      {plannedRows.length > 0 && (
        <div style={{
          padding: "16px 20px", borderRadius: 14,
          border: "1.5px solid var(--purple-border)", background: "var(--bg-card)",
        }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, margin: "0 0 12px", color: "var(--purple)" }}>
            🎯 Mes objectifs de certification
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {plannedRows.map((r) => {
              const familyColor = (FAMILY_COLORS[r.family] ?? "var(--text-secondary)") as string;
              return (
                <div key={r.id} style={{
                  display: "flex", alignItems: "flex-start", gap: 12,
                  padding: "10px 14px", borderRadius: 10,
                  border: "1px solid var(--border)", background: "var(--bg-primary)",
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>{r.shortName}</span>
                      <span style={{
                        fontSize: 10, padding: "1px 6px", borderRadius: 999,
                        background: `color-mix(in srgb, ${familyColor} 15%, transparent)`,
                        color: familyColor, border: `1px solid ${familyColor}`, fontWeight: 600,
                      }}>
                        {FAMILY_LABELS[r.family] ?? r.family}
                      </span>
                      {r.isMandatory && (
                        <span style={{
                          fontSize: 10, padding: "1px 6px", borderRadius: 999,
                          background: "var(--red-dim)", color: "var(--red)", fontWeight: 700,
                        }}>⚠ Obligatoire</span>
                      )}
                      {r.source === "onboarding_target" && (
                        <span style={{ fontSize: 10, color: "var(--text-muted)", fontStyle: "italic" }}>
                          Déclaré lors de l&apos;inscription
                        </span>
                      )}
                      {r.source === "auto_sector" && (
                        <span style={{ fontSize: 10, color: "var(--text-muted)", fontStyle: "italic" }}>
                          Recommandé pour votre secteur
                        </span>
                      )}
                    </div>
                    {r.notes && (
                      <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 3 }}>{r.notes}</p>
                    )}
                    {r.certifyingBody && (
                      <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>
                        {r.certifyingBody}{r.costEstimate ? ` · ${r.costEstimate}` : ""}
                      </p>
                    )}
                  </div>
                  <div style={{ flexShrink: 0 }}>
                    <Link href={`/app/compliance/${r.id}`} style={{
                      fontSize: 11, padding: "4px 10px", borderRadius: 8,
                      border: "1px solid var(--border)", background: "var(--bg-primary)",
                      color: "var(--text-secondary)", textDecoration: "none", fontWeight: 600,
                      display: "inline-flex", alignItems: "center", gap: 4,
                    }}>
                      Détail <ArrowRight style={{ width: 10, height: 10 }} />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Toutes les certifications par famille ────────────────────────────── */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>
          Toutes les certifications
        </h2>

        {summary.total === 0 ? (
          <div style={{
            padding: "40px 24px", textAlign: "center",
            border: "1.5px dashed var(--border)", borderRadius: 14,
          }}>
            <p style={{ fontSize: 14, color: "var(--text-muted)", marginBottom: 12 }}>
              Aucune certification déclarée pour l&apos;instant.
            </p>
            <p style={{ fontSize: 13, color: "var(--text-muted)" }}>
              Les certifications sont renseignées lors de l&apos;onboarding ou peuvent être ajoutées manuellement.
            </p>
          </div>
        ) : (
          Object.entries(byFamily).map(([family, certRows]) => {
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
                    {certRows.length} certification{certRows.length > 1 ? "s" : ""}
                  </span>
                </div>

                {certRows.map((r) => {
                  const meta = STATUS_META[r.status] ?? STATUS_META.planned;
                  return (
                    <Link
                      key={r.id}
                      href={`/app/compliance/${r.id}`}
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
                            {r.shortName}
                          </span>
                          <span style={{
                            fontSize: 10, padding: "1px 6px", borderRadius: 999,
                            background: `color-mix(in srgb, ${meta.color} 15%, transparent)`,
                            color: meta.color, border: `1px solid ${meta.color}`, fontWeight: 600,
                          }}>
                            {meta.label}
                          </span>
                          {r.isMandatory && (
                            <span style={{
                              fontSize: 10, padding: "1px 6px", borderRadius: 999,
                              background: "var(--red-dim)", color: "var(--red)", fontWeight: 700,
                            }}>⚠ Obligatoire</span>
                          )}
                        </div>
                        <div style={{ display: "flex", gap: 12, marginTop: 3, flexWrap: "wrap" }}>
                          {r.obtainedDate && (
                            <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
                              Obtenu : {r.obtainedDate.toLocaleDateString("fr-FR")}
                            </span>
                          )}
                          {r.expiryDate && (
                            <span style={{
                              fontSize: 11,
                              color: r.expiryLevel === "critical" ? "var(--red)"
                                   : r.expiryLevel === "warning"  ? "var(--amber)"
                                   : "var(--text-muted)",
                              fontWeight: r.expiryLevel ? 700 : 400,
                            }}>
                              Expire : {r.expiryDate.toLocaleDateString("fr-FR")}
                              {r.daysUntilExpiry !== null && r.daysUntilExpiry > 0 && ` (J-${r.daysUntilExpiry})`}
                              {r.daysUntilExpiry !== null && r.daysUntilExpiry <= 0 && " (EXPIRÉ)"}
                            </span>
                          )}
                          {r.ownerName && (
                            <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
                              Owner : {r.ownerName}
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
          })
        )}
      </div>
    </div>
  );
}
