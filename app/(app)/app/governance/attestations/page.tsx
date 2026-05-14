export const dynamic = "force-dynamic";

import { Badge } from "@/components/ui/badge";
import { MetricCard } from "@/components/app/metric-card";
import { governanceRepo }         from "@/lib/repositories/governance.repo";
import { requireAnyPermission }  from "@/server/permissions";

function formatDate(date: Date | null | undefined): string {
  if (!date) return "—";
  return date.toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
}

function getEntityTypeBadgeVariant(entityType: string): "blue" | "green" | "amber" {
  switch (entityType) {
    case "application": return "blue";
    case "capability": return "green";
    default: return "amber";
  }
}

function getEntityTypeLabel(entityType: string): string {
  switch (entityType) {
    case "application": return "Application";
    case "process": return "Processus";
    case "capability": return "Capacité";
    default: return entityType;
  }
}

function getStatusBadgeVariant(status: string): "green" | "gray" | "red" {
  switch (status) {
    case "attested": return "green";
    case "expired": return "red";
    default: return "gray";
  }
}

function getStatusLabel(status: string): string {
  switch (status) {
    case "attested": return "Attesté";
    case "expired": return "Expiré";
    default: return "En attente";
  }
}

function truncate(str: string, max = 24): string {
  return str.length > max ? str.slice(0, max) + "…" : str;
}

export default async function AttestationsPage() {
  const { workspace } = await requireAnyPermission([
    "business-structure.manage",
    "analytics.view",
  ]);

  const attestations = await governanceRepo.findAttestations(workspace!.id);

  const total = attestations.length;
  const attested = attestations.filter((a) => a.status === "attested").length;
  const pending = attestations.filter((a) => a.status === "pending").length;
  const expired = attestations.filter((a) => a.status === "expired").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <section className="rounded-3xl border border-[--green-border] bg-[--bg-card] p-8 shadow-soft-sm">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-4">
            <Badge>Gouvernance</Badge>
            <h2 className="max-w-2xl text-4xl font-semibold tracking-tight text-[--text-primary] text-balance">
              Attestations
            </h2>
            <p className="max-w-2xl text-base leading-8 text-[--text-secondary]">
              Suivez les certifications et validations associées à vos entités métier (applications, processus, capacités).
            </p>
          </div>
          <button
            disabled
            title="Fonctionnalité à venir"
            className="shrink-0 cursor-not-allowed rounded-lg border border-[--border] bg-[--bg-hover] px-4 py-2 text-sm font-medium text-[--text-disabled] opacity-50"
          >
            + Nouvelle attestation
          </button>
        </div>
      </section>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <MetricCard label="Total" value={String(total)} />
        <MetricCard label="Attestées" value={String(attested)} />
        <MetricCard label="En attente" value={String(pending)} />
        <MetricCard label="Expirées" value={String(expired)} />
      </div>

      {/* Table */}
      {attestations.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[--border] bg-[--bg-card] py-16 text-center">
          <p className="text-sm font-medium text-[--text-secondary]">Aucune attestation enregistrée</p>
          <p className="mt-1 text-xs text-[--text-muted]">
            Les attestations seront créées lors des campagnes de certification.
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-[--border] bg-[--bg-card] overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[--border] bg-[--bg-hover]">
                <th className="px-4 py-3 text-left text-xs font-semibold text-[--text-muted] uppercase tracking-wide">
                  Type
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[--text-muted] uppercase tracking-wide">
                  Entité ID
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[--text-muted] uppercase tracking-wide">
                  Statut
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[--text-muted] uppercase tracking-wide">
                  Attesté le
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[--text-muted] uppercase tracking-wide">
                  Valide jusqu&apos;au
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[--text-muted] uppercase tracking-wide">
                  Notes
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[--border-subtle]">
              {attestations.map((att) => (
                <tr key={att.id} className="hover:bg-[--bg-hover] transition-colors">
                  <td className="px-4 py-3">
                    <Badge variant={getEntityTypeBadgeVariant(att.entityType)}>
                      {getEntityTypeLabel(att.entityType)}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-xs font-mono text-[--text-secondary]">
                    {truncate(att.entityId, 20)}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={getStatusBadgeVariant(att.status)}>
                      {getStatusLabel(att.status)}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-xs text-[--text-secondary]">
                    {formatDate(att.attestedAt)}
                  </td>
                  <td className="px-4 py-3 text-xs text-[--text-secondary]">
                    {formatDate(att.validUntil)}
                  </td>
                  <td className="px-4 py-3 text-xs text-[--text-muted] max-w-xs truncate">
                    {att.notes ?? "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
