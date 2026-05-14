import "server-only";
import { certificationRepo } from "@/lib/repositories/certification.repo";

export interface ComplianceSummary {
  total:             number;
  obtained:          number;
  inProgress:        number;
  planned:           number;
  expired:           number;
  score:             number;  // 0-100
  mandatoryObtained: number;
  mandatoryTotal:    number;
  expiringSoon:      number;
}

export interface CertificationRow {
  id:              string;
  code:            string;
  name:            string;
  shortName:       string;
  family:          string;
  status:          string;
  isMandatory:     boolean;
  source:          string;
  notes:           string | null;
  obtainedDate:    Date | null;
  expiryDate:      Date | null;
  ownerName:       string | null;
  daysUntilExpiry: number | null;
  expiryLevel:     "expired" | "critical" | "warning" | null;
  // Champs catalogue additionnels
  riskIfMissing:   string | null;
  certifyingBody:  string | null;
  costEstimate:    string | null;
  officialUrl:     string | null;
}

function daysUntil(date: Date | null): number | null {
  if (!date) return null;
  return Math.ceil((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}

function expiryLevel(date: Date | null): "expired" | "critical" | "warning" | null {
  const d = daysUntil(date);
  if (d === null) return null;
  if (d <= 0)  return "expired";
  if (d <= 30) return "critical";
  if (d <= 90) return "warning";
  return null;
}

export const complianceService = {
  /** Données complètes pour la page compliance */
  async getPageData(workspaceId: string) {
    const certs = await certificationRepo.findByWorkspace(workspaceId);

    const total      = certs.length;
    const obtained   = certs.filter((c) => c.status === "obtained").length;
    const inProgress = certs.filter((c) => c.status === "in_progress").length;
    const planned    = certs.filter((c) => c.status === "planned").length;
    const expired    = certs.filter((c) => c.status === "expired").length;

    const mandatory         = certs.filter((c) => c.catalog.isMandatory);
    const mandatoryObtained = mandatory.filter((c) => c.status === "obtained").length;

    const score = total > 0
      ? Math.round(((obtained + inProgress * 0.5) / total) * 100)
      : 0;

    const in90d        = Date.now() + 90 * 24 * 60 * 60 * 1000;
    const expiringSoon = certs.filter(
      (c) => c.expiryDate && c.expiryDate.getTime() <= in90d && c.status !== "expired"
    ).length;

    const summary: ComplianceSummary = {
      total, obtained, inProgress, planned, expired,
      score, mandatoryObtained,
      mandatoryTotal: mandatory.length,
      expiringSoon,
    };

    const rows: CertificationRow[] = certs.map((c) => ({
      id:              c.id,
      code:            c.catalog.code,
      name:            c.catalog.name,
      shortName:       c.catalog.shortName,
      family:          c.catalog.family,
      status:          c.status,
      isMandatory:     c.catalog.isMandatory,
      source:          c.source,
      notes:           c.notes ?? null,
      obtainedDate:    c.obtainedDate,
      expiryDate:      c.expiryDate,
      ownerName:       c.owner?.name ?? null,
      daysUntilExpiry: daysUntil(c.expiryDate),
      expiryLevel:     expiryLevel(c.expiryDate),
      riskIfMissing:   c.catalog.riskIfMissing ?? null,
      certifyingBody:  c.catalog.certifyingBody ?? null,
      costEstimate:    c.catalog.costEstimate   ?? null,
      officialUrl:     c.catalog.officialUrl    ?? null,
    }));

    return { summary, rows };
  },
};
