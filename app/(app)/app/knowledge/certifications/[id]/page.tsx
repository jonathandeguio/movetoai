import Link from "next/link";
import type { Route } from "next";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";

import { AriaBanner } from "@/components/aria/AriaBanner";
import { getCurrentWorkspaceContext } from "@/lib/current-workspace";
import { prisma } from "@/lib/prisma";
import { getLinkedCertsForProcess } from "@/lib/certifications/process-linker";
import { FAMILY_LABELS, FAMILY_COLORS } from "@/lib/seed/certifications";

export const dynamic = "force-dynamic";

type PageProps = { params: Promise<{ id: string }> };

const STATUS_META: Record<string, { label: string; color: string }> = {
  obtained:       { label: "Certifié",          color: "var(--green)"      },
  in_progress:    { label: "En cours d'audit",  color: "var(--blue)"       },
  planned:        { label: "Objectif déclaré",  color: "var(--purple)"     },
  not_applicable: { label: "Non applicable",    color: "var(--text-muted)" },
  expired:        { label: "Expirée",           color: "var(--red)"        },
};

export default async function KnowledgeCertificationDetailPage({ params }: PageProps) {
  const { workspace } = await getCurrentWorkspaceContext({ requireMembership: true });
  if (!workspace?.id) return null;

  const { id } = await params;

  const cert = await prisma.workspaceCertification.findFirst({
    where: { id, workspaceId: workspace.id },
    include: {
      catalog: true,
      links: true,
      owner: { select: { id: true, name: true, email: true } },
    },
  });

  if (!cert) notFound();

  const statusMeta = STATUS_META[cert.status] ?? STATUS_META.planned;
  const familyColor = (FAMILY_COLORS[cert.catalog.family] ?? "var(--text-secondary)") as string;

  // Get linked processes from linkedProcessCodes
  const linkedProcessCodes = cert.catalog.linkedProcessCodes as string[];

  // Fetch workspace processes that match these catalog codes
  const linkedProcesses = linkedProcessCodes.length > 0
    ? await prisma.process.findMany({
        where: {
          workspaceId: workspace.id,
          deletedAt: null,
          catalogCode: { in: linkedProcessCodes },
        },
        select: {
          id: true, name: true, catalogCode: true,
          domain: { select: { name: true } },
        },
      })
    : [];

  const importedCodes = new Set(linkedProcesses.map((p) => p.catalogCode).filter(Boolean));
  const totalLinked = linkedProcessCodes.length;
  const documented = linkedProcesses.length;
  const coveragePercent = totalLinked > 0 ? Math.round((documented / totalLinked) * 100) : 0;

  const keyRequirements = cert.catalog.keyRequirements as string[];
  const typicalProcesses = cert.catalog.typicalProcesses as string[];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <AriaBanner />

      {/* Back */}
      <Link href={"/app/knowledge/certifications" as Route} style={{
        display: "inline-flex", alignItems: "center", gap: 6,
        fontSize: 13, color: "var(--text-muted)", textDecoration: "none",
      }}>
        <ArrowLeft style={{ width: 14, height: 14 }} /> Retour aux certifications
      </Link>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 6 }}>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
              {cert.catalog.shortName}
            </h1>
            <span style={{
              fontSize: 12, padding: "3px 10px", borderRadius: 999, fontWeight: 700,
              background: `color-mix(in srgb, ${statusMeta.color} 15%, transparent)`,
              color: statusMeta.color, border: `1px solid ${statusMeta.color}`,
            }}>
              {statusMeta.label}
            </span>
            <span style={{
              fontSize: 11, padding: "2px 8px", borderRadius: 999,
              background: `color-mix(in srgb, ${familyColor} 12%, transparent)`,
              color: familyColor, border: `1px solid ${familyColor}`, fontWeight: 600,
            }}>
              {FAMILY_LABELS[cert.catalog.family] ?? cert.catalog.family}
            </span>
          </div>
          <p style={{ fontSize: 14, color: "var(--text-muted)", margin: 0 }}>
            {cert.catalog.name}
          </p>
        </div>
        {cert.catalog.officialUrl && (
          <a href={cert.catalog.officialUrl} target="_blank" rel="noopener noreferrer" style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            fontSize: 12, padding: "8px 14px", borderRadius: 8,
            border: "1px solid var(--border)", background: "var(--bg-card)",
            color: "var(--text-secondary)", textDecoration: "none", fontWeight: 600,
          }}>
            Site officiel <ExternalLink style={{ width: 12, height: 12 }} />
          </a>
        )}
      </div>

      {/* Main info grid */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16, alignItems: "start" }}>
        {/* Left */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Description */}
          <div style={{ padding: "20px", borderRadius: 14, border: "1.5px solid var(--border)", background: "var(--bg-card)" }}>
            <h2 style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", marginBottom: 10 }}>Description</h2>
            <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6, margin: 0 }}>
              {cert.catalog.description}
            </p>
          </div>

          {/* Key requirements */}
          {keyRequirements.length > 0 && (
            <div style={{ padding: "20px", borderRadius: 14, border: "1.5px solid var(--border)", background: "var(--bg-card)" }}>
              <h2 style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", marginBottom: 10 }}>
                Exigences clés
              </h2>
              <ul style={{ margin: 0, paddingLeft: 20, display: "flex", flexDirection: "column", gap: 6 }}>
                {keyRequirements.map((req, i) => (
                  <li key={i} style={{ fontSize: 13, color: "var(--text-secondary)" }}>{req}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Linked processes coverage */}
          <div style={{ padding: "20px", borderRadius: 14, border: "1.5px solid var(--border)", background: "var(--bg-card)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <h2 style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>
                Processus liés
              </h2>
              {totalLinked > 0 && (
                <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
                  Couverture : {documented}/{totalLinked} ({coveragePercent}%)
                </span>
              )}
            </div>

            {/* Coverage bar */}
            {totalLinked > 0 && (
              <div style={{ marginBottom: 14, height: 6, borderRadius: 3, background: "var(--bg-primary)" }}>
                <div style={{
                  width: `${coveragePercent}%`, height: "100%", borderRadius: 3,
                  background: coveragePercent >= 80 ? "var(--green)" : coveragePercent >= 40 ? "var(--amber)" : "var(--red)",
                  transition: "width 0.5s",
                }} />
              </div>
            )}

            {linkedProcessCodes.length === 0 ? (
              <p style={{ fontSize: 13, color: "var(--text-muted)", margin: 0 }}>
                Aucun processus défini pour cette certification.
              </p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {linkedProcessCodes.map((code) => {
                  const proc = linkedProcesses.find((p) => p.catalogCode === code);
                  const isDocumented = importedCodes.has(code);

                  return (
                    <div key={code} style={{
                      display: "flex", alignItems: "center", gap: 10,
                      padding: "10px 12px", borderRadius: 8,
                      border: "1px solid var(--border)", background: "var(--bg-primary)",
                    }}>
                      <span style={{
                        fontSize: 10, color: isDocumented ? "var(--green)" : "var(--text-muted)",
                        fontWeight: 700,
                      }}>
                        {isDocumented ? "✓" : "○"}
                      </span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text-muted)", fontFamily: "monospace" }}>
                        {code}
                      </span>
                      {proc ? (
                        <Link
                          href={`/app/processes/${proc.id}` as Route}
                          style={{ fontSize: 13, color: "var(--blue)", textDecoration: "none", fontWeight: 600 }}
                        >
                          {proc.name}
                        </Link>
                      ) : (
                        <span style={{ fontSize: 13, color: "var(--text-muted)" }}>
                          Non importé
                        </span>
                      )}
                      {proc?.domain?.name && (
                        <span style={{ fontSize: 11, color: "var(--text-muted)", marginLeft: "auto" }}>
                          {proc.domain.name}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right sidebar */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Dates */}
          <div style={{ padding: "18px", borderRadius: 14, border: "1.5px solid var(--border)", background: "var(--bg-card)" }}>
            <h2 style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)", marginBottom: 12 }}>Informations</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[
                { label: "Organisme",    value: cert.certifyingBody ?? cert.catalog.certifyingBody },
                { label: "Référence",    value: cert.certificateRef },
                { label: "Obtenu le",    value: cert.obtainedDate   ? new Date(cert.obtainedDate).toLocaleDateString("fr-FR")   : null },
                { label: "Expire le",    value: cert.expiryDate     ? new Date(cert.expiryDate).toLocaleDateString("fr-FR")     : null },
                { label: "Prochain audit", value: cert.nextAuditDate ? new Date(cert.nextAuditDate).toLocaleDateString("fr-FR") : null },
                { label: "Responsable",  value: cert.owner?.name },
                { label: "Validité",     value: cert.catalog.validityYears ? `${cert.catalog.validityYears} ans` : null },
              ].filter((r) => r.value).map((row) => (
                <div key={row.label} style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <span style={{ fontSize: 10, color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase" }}>
                    {row.label}
                  </span>
                  <span style={{ fontSize: 13, color: "var(--text-primary)" }}>{row.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Notes */}
          {cert.notes && (
            <div style={{ padding: "16px", borderRadius: 12, border: "1.5px solid var(--border)", background: "var(--bg-card)" }}>
              <h2 style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)", marginBottom: 8 }}>Notes</h2>
              <p style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.5, margin: 0 }}>{cert.notes}</p>
            </div>
          )}

          {/* AI potential */}
          {cert.catalog.aiAutomationPotential && (
            <div style={{
              padding: "14px 16px", borderRadius: 12,
              border: "1.5px solid var(--blue-border)", background: "color-mix(in srgb, var(--blue) 8%, var(--bg-card))",
            }}>
              <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase", marginBottom: 4 }}>
                Potentiel IA
              </div>
              <span style={{
                fontSize: 13, fontWeight: 700,
                color: cert.catalog.aiAutomationPotential === "high" ? "var(--green)"
                     : cert.catalog.aiAutomationPotential === "medium" ? "var(--amber)"
                     : "var(--text-muted)",
              }}>
                {cert.catalog.aiAutomationPotential === "high"   ? "🚀 Élevé"
                 : cert.catalog.aiAutomationPotential === "medium" ? "⚡ Moyen"
                 : "📊 Faible"}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
