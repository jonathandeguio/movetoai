/**
 * /app/compliance/[id] — Certification detail page
 *
 * Shows full catalog info, current status/dates, linked processes,
 * and a server action to update the status.
 */

import { notFound }     from "next/navigation";
import Link             from "next/link";
import {
  ArrowLeft, CheckCircle2, Clock, Target, ShieldOff, ExternalLink,
  AlertTriangle, CalendarDays, User, Tag, Building2, BookOpen,
} from "lucide-react";

import { getCurrentWorkspaceContext } from "@/lib/current-workspace";
import { prisma }                     from "@/lib/prisma";
import { certificationRepo }          from "@/lib/repositories/certification.repo";
import { FAMILY_LABELS, FAMILY_COLORS } from "@/lib/seed/certifications";

export const dynamic = "force-dynamic";

// ── Types ─────────────────────────────────────────────────────────────────────

type Status = "obtained" | "in_progress" | "planned" | "not_applicable" | "expired";

const STATUS_META: Record<Status, { label: string; color: string; icon: React.ReactNode }> = {
  obtained:       { label: "Certifié",         color: "var(--green)",       icon: <CheckCircle2 style={{ width: 16, height: 16 }} /> },
  in_progress:    { label: "Audit en cours",   color: "var(--blue)",        icon: <Clock         style={{ width: 16, height: 16 }} /> },
  planned:        { label: "Objectif déclaré", color: "var(--purple)",      icon: <Target        style={{ width: 16, height: 16 }} /> },
  not_applicable: { label: "Non applicable",   color: "var(--text-muted)",  icon: <span>—</span> },
  expired:        { label: "Expirée",          color: "var(--red)",         icon: <ShieldOff     style={{ width: 16, height: 16 }} /> },
};

const SOURCE_LABELS: Record<string, string> = {
  onboarding_current: "Déclarée lors de l'inscription (certifiée)",
  onboarding_target:  "Déclarée lors de l'inscription (objectif)",
  manual:             "Ajoutée manuellement",
  auto_sector:        "Détectée automatiquement (secteur)",
};

function daysUntil(date: Date | null): number | null {
  if (!date) return null;
  return Math.ceil((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}

// ── Server action ─────────────────────────────────────────────────────────────

async function updateCertStatus(formData: FormData) {
  "use server";

  const id          = formData.get("id")          as string;
  const status      = formData.get("status")      as string;
  const notes       = formData.get("notes")       as string | null;
  const obtainedStr = formData.get("obtainedDate") as string | null;
  const expiryStr   = formData.get("expiryDate")  as string | null;

  if (!id || !status) return;

  await prisma.workspaceCertification.update({
    where: { id },
    data: {
      status,
      notes:       notes   || null,
      obtainedDate: obtainedStr ? new Date(obtainedStr) : undefined,
      expiryDate:   expiryStr   ? new Date(expiryStr)   : undefined,
      updatedAt:   new Date(),
    },
  });
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function CertificationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { workspace } = await getCurrentWorkspaceContext({ requireMembership: true });
  if (!workspace) return null;

  // Fetch certification (workspace-scoped for security)
  const cert = await certificationRepo.findByIdWithLinks(id, workspace.id);

  if (!cert) notFound();

  // Fetch linked processes
  const processLinkIds = cert.links
    .filter((l) => l.entityType === "process")
    .map((l) => l.entityId);

  const linkedProcesses = await certificationRepo.findLinkedProcesses(processLinkIds, workspace.id);

  const statusMeta  = STATUS_META[cert.status as Status] ?? STATUS_META.planned;
  const familyColor = (FAMILY_COLORS[cert.catalog.family] ?? "var(--text-secondary)") as string;
  const familyLabel = FAMILY_LABELS[cert.catalog.family] ?? cert.catalog.family;

  const days     = daysUntil(cert.expiryDate);
  const isExpired = days !== null && days <= 0;
  const isCrit    = days !== null && days > 0 && days <= 30;
  const isWarn    = days !== null && days > 30 && days <= 90;

  const keyRequirements  = (cert.catalog.keyRequirements  as string[]) ?? [];
  const typicalProcesses = (cert.catalog.typicalProcesses as string[]) ?? [];
  const typicalDomains   = (cert.catalog.typicalDomains   as string[]) ?? [];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, maxWidth: 900, margin: "0 auto" }}>

      {/* ── Back + breadcrumb ────────────────────────────────────────────────── */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <Link
          href="/app/compliance"
          style={{
            display: "flex", alignItems: "center", gap: 6,
            fontSize: 13, color: "var(--text-muted)", textDecoration: "none", fontWeight: 500,
          }}
        >
          <ArrowLeft style={{ width: 14, height: 14 }} />
          Conformité
        </Link>
        <span style={{ color: "var(--text-muted)", fontSize: 13 }}>/</span>
        <span style={{ fontSize: 13, color: "var(--text-primary)", fontWeight: 600 }}>
          {cert.catalog.shortName}
        </span>
      </div>

      {/* ── Header card ──────────────────────────────────────────────────────── */}
      <div style={{
        padding: "24px 28px", borderRadius: 16,
        border: "1.5px solid var(--border)", background: "var(--bg-card)",
      }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>

          <div style={{ flex: 1, minWidth: 220 }}>
            {/* Family badge */}
            <span style={{
              display: "inline-flex", alignItems: "center", gap: 4,
              fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 999, marginBottom: 10,
              background: `color-mix(in srgb, ${familyColor} 15%, transparent)`,
              color: familyColor, border: `1px solid ${familyColor}`,
            }}>
              {familyLabel}
            </span>

            <h1 style={{ fontSize: 22, fontWeight: 800, color: "var(--text-primary)", margin: "0 0 4px" }}>
              {cert.catalog.name}
            </h1>
            <p style={{ fontSize: 13, color: "var(--text-muted)", margin: 0 }}>
              {cert.catalog.certifyingBody ?? ""}
            </p>
          </div>

          {/* Status badge */}
          <div style={{
            display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8, flexShrink: 0,
          }}>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              padding: "6px 14px", borderRadius: 999,
              background: `color-mix(in srgb, ${statusMeta.color} 15%, transparent)`,
              color: statusMeta.color, border: `1.5px solid ${statusMeta.color}`, fontWeight: 700, fontSize: 13,
            }}>
              {statusMeta.icon}
              {statusMeta.label}
            </div>

            {cert.catalog.isMandatory && (
              <span style={{
                fontSize: 11, padding: "2px 8px", borderRadius: 999,
                background: "var(--red-dim)", color: "var(--red)", fontWeight: 700,
              }}>
                ⚠ Obligation réglementaire
              </span>
            )}

            {/* External link */}
            {cert.catalog.officialUrl && (
              <a
                href={cert.catalog.officialUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "inline-flex", alignItems: "center", gap: 4,
                  fontSize: 12, color: "var(--text-secondary)", textDecoration: "none", fontWeight: 500,
                }}
              >
                Référentiel officiel <ExternalLink style={{ width: 12, height: 12 }} />
              </a>
            )}
          </div>
        </div>

        {/* Expiry alert */}
        {cert.expiryDate && (isExpired || isCrit || isWarn) && (
          <div style={{
            marginTop: 16, padding: "10px 14px", borderRadius: 10,
            background: isExpired || isCrit ? "var(--red-dim)" : "var(--amber-dim)",
            border: `1px solid ${isExpired || isCrit ? "var(--red-border)" : "var(--amber-border)"}`,
            display: "flex", alignItems: "center", gap: 8,
          }}>
            <AlertTriangle style={{ width: 14, height: 14, color: isExpired || isCrit ? "var(--red)" : "var(--amber)", flexShrink: 0 }} />
            <span style={{ fontSize: 13, fontWeight: 600, color: isExpired || isCrit ? "var(--red)" : "var(--amber)" }}>
              {isExpired
                ? `Certification expirée depuis ${Math.abs(days!)} jour${Math.abs(days!) > 1 ? "s" : ""}`
                : `Expire dans ${days} jour${days! > 1 ? "s" : ""} — le ${cert.expiryDate.toLocaleDateString("fr-FR")}`}
            </span>
          </div>
        )}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 20, alignItems: "start" }}>

        {/* ── Left column ─────────────────────────────────────────────────────── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

          {/* Description */}
          <div style={{ padding: "20px 22px", borderRadius: 14, border: "1.5px solid var(--border)", background: "var(--bg-card)" }}>
            <h2 style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", margin: "0 0 10px", display: "flex", alignItems: "center", gap: 6 }}>
              <BookOpen style={{ width: 14, height: 14, color: "var(--text-muted)" }} />
              Description
            </h2>
            <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.7, margin: 0 }}>
              {cert.catalog.description}
            </p>

            {cert.catalog.scope && (
              <>
                <h3 style={{ fontSize: 12, fontWeight: 700, color: "var(--text-muted)", margin: "14px 0 6px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Périmètre
                </h3>
                <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6, margin: 0 }}>
                  {cert.catalog.scope}
                </p>
              </>
            )}
          </div>

          {/* Key requirements */}
          {keyRequirements.length > 0 && (
            <div style={{ padding: "20px 22px", borderRadius: 14, border: "1.5px solid var(--border)", background: "var(--bg-card)" }}>
              <h2 style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", margin: "0 0 12px" }}>
                Exigences clés
              </h2>
              <ul style={{ margin: 0, padding: "0 0 0 18px", display: "flex", flexDirection: "column", gap: 6 }}>
                {keyRequirements.map((req, i) => (
                  <li key={i} style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.5 }}>
                    {req}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Linked processes */}
          <div style={{ padding: "20px 22px", borderRadius: 14, border: "1.5px solid var(--border)", background: "var(--bg-card)" }}>
            <h2 style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", margin: "0 0 12px" }}>
              Processus liés ({linkedProcesses.length})
            </h2>
            {linkedProcesses.length === 0 ? (
              <p style={{ fontSize: 13, color: "var(--text-muted)", margin: 0 }}>
                Aucun processus lié. Les liens sont créés automatiquement lors de l&apos;onboarding
                ou peuvent être ajoutés manuellement.
              </p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {linkedProcesses.map((p) => {
                  const link = cert.links.find((l) => l.entityId === p.id);
                  return (
                    <Link
                      key={p.id}
                      href={`/app/processes/${p.id}`}
                      style={{
                        display: "flex", alignItems: "center", justifyContent: "space-between",
                        padding: "8px 12px", borderRadius: 8,
                        border: "1px solid var(--border)", background: "var(--bg-primary)",
                        textDecoration: "none",
                      }}
                    >
                      <div>
                        <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>
                          {p.name}
                        </span>
                        <span style={{ fontSize: 11, color: "var(--text-muted)", marginLeft: 8 }}>
                          {p.domain.name}
                        </span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        {link?.coverage === "partial" && (
                          <span style={{
                            fontSize: 10, padding: "1px 6px", borderRadius: 999,
                            background: "var(--amber-dim)", color: "var(--amber)", fontWeight: 600,
                          }}>
                            Partiel
                          </span>
                        )}
                        {link?.notes && link.notes.includes("onboarding") && (
                          <span style={{ fontSize: 10, color: "var(--text-muted)", fontStyle: "italic" }}>
                            Auto
                          </span>
                        )}
                        <ExternalLink style={{ width: 12, height: 12, color: "var(--text-muted)" }} />
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}

            {/* Typical domains info */}
            {typicalDomains.length > 0 && (
              <div style={{ marginTop: 14, paddingTop: 12, borderTop: "1px solid var(--border)" }}>
                <p style={{ fontSize: 11, color: "var(--text-muted)", margin: "0 0 6px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                  Domaines typiquement couverts
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {typicalDomains.map((d) => (
                    <span key={d} style={{
                      fontSize: 11, padding: "2px 8px", borderRadius: 999,
                      background: "var(--bg-primary)", border: "1px solid var(--border)",
                      color: "var(--text-secondary)",
                    }}>
                      {d}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {typicalProcesses.length > 0 && (
              <div style={{ marginTop: 12 }}>
                <p style={{ fontSize: 11, color: "var(--text-muted)", margin: "0 0 6px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                  Processus typiques du référentiel
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {typicalProcesses.map((p) => (
                    <span key={p} style={{
                      fontSize: 11, padding: "2px 8px", borderRadius: 999,
                      background: "var(--bg-primary)", border: "1px solid var(--border)",
                      color: "var(--text-secondary)",
                    }}>
                      {p}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Right column ─────────────────────────────────────────────────────── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Certification info card */}
          <div style={{ padding: "18px 20px", borderRadius: 14, border: "1.5px solid var(--border)", background: "var(--bg-card)" }}>
            <h2 style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)", margin: "0 0 14px" }}>
              Informations
            </h2>

            {[
              {
                icon: <CalendarDays style={{ width: 14, height: 14 }} />,
                label: "Date d'obtention",
                value: cert.obtainedDate?.toLocaleDateString("fr-FR") ?? "—",
              },
              {
                icon: <CalendarDays style={{ width: 14, height: 14 }} />,
                label: "Date d'expiration",
                value: cert.expiryDate
                  ? `${cert.expiryDate.toLocaleDateString("fr-FR")}${days !== null ? ` (J${days > 0 ? `-${days}` : "0"})` : ""}`
                  : "—",
              },
              {
                icon: <CalendarDays style={{ width: 14, height: 14 }} />,
                label: "Prochain audit",
                value: cert.nextAuditDate?.toLocaleDateString("fr-FR") ?? "—",
              },
              {
                icon: <User style={{ width: 14, height: 14 }} />,
                label: "Responsable",
                value: cert.owner?.name ?? cert.owner?.email ?? "—",
              },
              {
                icon: <Tag style={{ width: 14, height: 14 }} />,
                label: "Référence certificat",
                value: cert.certificateRef ?? "—",
              },
              {
                icon: <Building2 style={{ width: 14, height: 14 }} />,
                label: "Organisme certificateur",
                value: cert.certifyingBody ?? cert.catalog.certifyingBody ?? "—",
              },
              {
                icon: <Tag style={{ width: 14, height: 14 }} />,
                label: "Source",
                value: SOURCE_LABELS[cert.source] ?? cert.source,
              },
            ].map(({ icon, label, value }) => (
              <div key={label} style={{
                display: "flex", alignItems: "flex-start", gap: 8, padding: "8px 0",
                borderBottom: "1px solid var(--border)",
              }}>
                <span style={{ color: "var(--text-muted)", marginTop: 1, flexShrink: 0 }}>{icon}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                    {label}
                  </div>
                  <div style={{ fontSize: 13, color: "var(--text-primary)", marginTop: 2, wordBreak: "break-word" }}>
                    {value}
                  </div>
                </div>
              </div>
            ))}

            {/* Catalog metadata */}
            {cert.catalog.validityYears && (
              <div style={{ padding: "8px 0", borderBottom: "1px solid var(--border)" }}>
                <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                  Validité
                </div>
                <div style={{ fontSize: 13, color: "var(--text-primary)", marginTop: 2 }}>
                  {cert.catalog.validityYears} an{cert.catalog.validityYears > 1 ? "s" : ""}{" "}
                  {cert.catalog.auditFrequency ? `· ${cert.catalog.auditFrequency}` : ""}
                </div>
              </div>
            )}

            {cert.catalog.costEstimate && (
              <div style={{ paddingTop: 8 }}>
                <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                  Coût estimé
                </div>
                <div style={{ fontSize: 13, color: "var(--text-primary)", marginTop: 2 }}>
                  {cert.catalog.costEstimate}
                </div>
              </div>
            )}
          </div>

          {/* Notes */}
          {cert.notes && (
            <div style={{ padding: "16px 18px", borderRadius: 12, border: "1.5px solid var(--border)", background: "var(--bg-card)" }}>
              <h2 style={{ fontSize: 12, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.04em", margin: "0 0 8px" }}>
                Notes
              </h2>
              <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: 0, lineHeight: 1.6 }}>
                {cert.notes}
              </p>
            </div>
          )}

          {/* Risk warning */}
          {cert.catalog.riskIfMissing && cert.status !== "obtained" && (
            <div style={{
              padding: "14px 16px", borderRadius: 12,
              border: "1px solid var(--red-border)", background: "var(--red-dim)",
            }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: "var(--red)", margin: "0 0 4px", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                Risque en l&apos;absence de certification
              </p>
              <p style={{ fontSize: 12, color: "var(--red)", margin: 0, lineHeight: 1.5 }}>
                {cert.catalog.riskIfMissing}
              </p>
            </div>
          )}

          {/* Update status form */}
          <div style={{ padding: "18px 20px", borderRadius: 14, border: "1.5px solid var(--border)", background: "var(--bg-card)" }}>
            <h2 style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)", margin: "0 0 14px" }}>
              Mettre à jour
            </h2>
            <form action={updateCertStatus} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <input type="hidden" name="id" value={cert.id} />

              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", display: "block", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                  Statut
                </label>
                <select
                  name="status"
                  defaultValue={cert.status}
                  style={{
                    width: "100%", padding: "8px 10px", borderRadius: 8, fontSize: 13,
                    border: "1.5px solid var(--border)", background: "var(--bg-input)",
                    color: "var(--text-primary)", outline: "none",
                  }}
                >
                  <option value="obtained">✅ Certifié</option>
                  <option value="in_progress">🔄 Audit en cours</option>
                  <option value="planned">🎯 Objectif déclaré</option>
                  <option value="not_applicable">— Non applicable</option>
                  <option value="expired">❌ Expirée</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", display: "block", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                  Date d&apos;obtention
                </label>
                <input
                  type="date"
                  name="obtainedDate"
                  defaultValue={cert.obtainedDate?.toISOString().slice(0, 10) ?? ""}
                  style={{
                    width: "100%", padding: "8px 10px", borderRadius: 8, fontSize: 13,
                    border: "1.5px solid var(--border)", background: "var(--bg-input)",
                    color: "var(--text-primary)", outline: "none", boxSizing: "border-box",
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", display: "block", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                  Date d&apos;expiration
                </label>
                <input
                  type="date"
                  name="expiryDate"
                  defaultValue={cert.expiryDate?.toISOString().slice(0, 10) ?? ""}
                  style={{
                    width: "100%", padding: "8px 10px", borderRadius: 8, fontSize: 13,
                    border: "1.5px solid var(--border)", background: "var(--bg-input)",
                    color: "var(--text-primary)", outline: "none", boxSizing: "border-box",
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", display: "block", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                  Notes
                </label>
                <textarea
                  name="notes"
                  defaultValue={cert.notes ?? ""}
                  rows={3}
                  style={{
                    width: "100%", padding: "8px 10px", borderRadius: 8, fontSize: 13,
                    border: "1.5px solid var(--border)", background: "var(--bg-input)",
                    color: "var(--text-primary)", outline: "none", resize: "vertical",
                    fontFamily: "inherit", boxSizing: "border-box",
                  }}
                />
              </div>

              <button
                type="submit"
                style={{
                  padding: "9px 16px", borderRadius: 8, fontSize: 13, fontWeight: 700,
                  background: "var(--blue)", color: "#fff", border: "none", cursor: "pointer",
                  textAlign: "center",
                }}
              >
                Enregistrer les modifications
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
