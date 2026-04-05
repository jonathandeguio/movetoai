import type { Locale } from "@/lib/i18n/config";

const opportunityStatusLabels = {
  DRAFT: { en: "Draft", fr: "Brouillon", es: "Borrador" },
  IDENTIFIED: { en: "Identified", fr: "Identifiee", es: "Identificada" },
  ASSESSING: { en: "Assessing", fr: "En evaluation", es: "En evaluacion" },
  PRIORITIZED: { en: "Prioritized", fr: "Priorisee", es: "Priorizada" },
  APPROVED: { en: "Approved", fr: "Approuvee", es: "Aprobada" },
  IN_PROGRESS: { en: "In progress", fr: "En cours", es: "En progreso" },
  LIVE: { en: "Live", fr: "En live", es: "En vivo" },
  BLOCKED: { en: "Blocked", fr: "Bloquee", es: "Bloqueada" },
  ARCHIVED: { en: "Archived", fr: "Archivee", es: "Archivada" }
} as const;

const opportunityBadgeLabels = {
  NONE: { en: "Standard", fr: "Standard", es: "Estandar" },
  QUICK_WIN: { en: "Quick win", fr: "Quick win", es: "Quick win" },
  STRATEGIC: { en: "Strategic", fr: "Strategique", es: "Estrategica" },
  TRANSFORMATIONAL: { en: "Transformational", fr: "Transformation", es: "Transformacional" },
  HIGH_CONFIDENCE: { en: "High confidence", fr: "Haute confiance", es: "Alta confianza" },
  AT_RISK: { en: "At risk", fr: "A risque", es: "En riesgo" }
} as const;

const decisionStatusLabels = {
  PENDING: { en: "Pending", fr: "En attente", es: "Pendiente" },
  APPROVED: { en: "Approved", fr: "Approuvee", es: "Aprobada" },
  REJECTED: { en: "Rejected", fr: "Rejetee", es: "Rechazada" },
  DEFERRED: { en: "Deferred", fr: "Differee", es: "Diferida" },
  NEEDS_INFO: { en: "Needs info", fr: "Infos requises", es: "Falta info" }
} as const;

const workflowStatusLabels = {
  DRAFT: { en: "Draft", fr: "Brouillon", es: "Borrador" },
  ASSESSED: { en: "Assessed", fr: "Evaluee", es: "Evaluada" },
  UNDER_REVIEW: { en: "Under review", fr: "En revue", es: "En revision" },
  APPROVED: { en: "Approved", fr: "Approuvee", es: "Aprobada" },
  DEFERRED: { en: "Deferred", fr: "Differee", es: "Diferida" },
  REJECTED: { en: "Rejected", fr: "Rejetee", es: "Rechazada" },
  IN_DELIVERY: { en: "In delivery", fr: "En delivery", es: "En entrega" },
  LIVE: { en: "Live", fr: "En live", es: "En vivo" },
  ARCHIVED: { en: "Archived", fr: "Archivee", es: "Archivada" }
} as const;

const riskSeverityLabels = {
  LOW: { en: "Low", fr: "Faible", es: "Bajo" },
  MEDIUM: { en: "Medium", fr: "Moyen", es: "Medio" },
  HIGH: { en: "High", fr: "Eleve", es: "Alto" },
  CRITICAL: { en: "Critical", fr: "Critique", es: "Critico" }
} as const;

const riskStatusLabels = {
  OPEN: { en: "Open", fr: "Ouvert", es: "Abierto" },
  MITIGATED: { en: "Mitigated", fr: "Mitige", es: "Mitigado" },
  ACCEPTED: { en: "Accepted", fr: "Accepte", es: "Aceptado" },
  CLOSED: { en: "Closed", fr: "Clos", es: "Cerrado" }
} as const;

const complianceStatusLabels = {
  NOT_STARTED: { en: "Not started", fr: "Non demarre", es: "No iniciado" },
  IN_REVIEW: { en: "In review", fr: "En revue", es: "En revision" },
  PASSED: { en: "Passed", fr: "Valide", es: "Aprobado" },
  FAILED: { en: "Failed", fr: "Echoue", es: "Fallido" },
  WAIVED: { en: "Waived", fr: "Exempte", es: "Eximido" }
} as const;

const dataReadinessLabels = {
  UNKNOWN: { en: "Unknown", fr: "Inconnu", es: "Desconocido" },
  LOW: { en: "Low readiness", fr: "Faible maturite", es: "Baja madurez" },
  MEDIUM: { en: "Medium readiness", fr: "Maturite moyenne", es: "Madurez media" },
  HIGH: { en: "High readiness", fr: "Haute maturite", es: "Alta madurez" },
  PRODUCTION_READY: { en: "Production ready", fr: "Pret production", es: "Listo para produccion" }
} as const;

const approvalStatusLabels = {
  PENDING: { en: "Pending", fr: "En attente", es: "Pendiente" },
  APPROVED: { en: "Approved", fr: "Approuvee", es: "Aprobada" },
  REJECTED: { en: "Rejected", fr: "Rejetee", es: "Rechazada" },
  SKIPPED: { en: "Skipped", fr: "Ignoree", es: "Omitida" }
} as const;

const initiativeStatusLabels = {
  PLANNED: { en: "Planned", fr: "Planifiee", es: "Planificada" },
  IN_PROGRESS: { en: "In progress", fr: "En cours", es: "En progreso" },
  AT_RISK: { en: "At risk", fr: "A risque", es: "En riesgo" },
  COMPLETED: { en: "Completed", fr: "Terminee", es: "Completada" },
  CANCELED: { en: "Canceled", fr: "Annulee", es: "Cancelada" }
} as const;

const metricTypeLabels = {
  FINANCIAL: { en: "Financial", fr: "Financier", es: "Financiero" },
  EFFICIENCY: { en: "Efficiency", fr: "Efficacite", es: "Eficiencia" },
  QUALITY: { en: "Quality", fr: "Qualite", es: "Calidad" },
  RISK: { en: "Risk", fr: "Risque", es: "Riesgo" },
  ADOPTION: { en: "Adoption", fr: "Adoption", es: "Adopcion" },
  TIME: { en: "Time", fr: "Temps", es: "Tiempo" },
  CUSTOMER: { en: "Customer", fr: "Client", es: "Cliente" }
} as const;

export type OpportunityWorkflowStatus =
  | "DRAFT"
  | "ASSESSED"
  | "UNDER_REVIEW"
  | "APPROVED"
  | "DEFERRED"
  | "REJECTED"
  | "IN_DELIVERY"
  | "LIVE"
  | "ARCHIVED";

function pickLabel<
  T extends Record<string, { en: string; fr: string; es: string }>
>(labels: T, locale: Locale, key: string) {
  return labels[key as keyof T]?.[locale] ?? key.replaceAll("_", " ");
}

export function deriveOpportunityWorkflowStatus(
  opportunityStatus: string,
  decisionStatus?: string | null
): OpportunityWorkflowStatus {
  if (opportunityStatus === "ARCHIVED") {
    return "ARCHIVED";
  }

  if (opportunityStatus === "LIVE") {
    return "LIVE";
  }

  if (opportunityStatus === "IN_PROGRESS") {
    return "IN_DELIVERY";
  }

  if (decisionStatus === "REJECTED") {
    return "REJECTED";
  }

  if (decisionStatus === "DEFERRED") {
    return "DEFERRED";
  }

  if (opportunityStatus === "APPROVED" || decisionStatus === "APPROVED") {
    return "APPROVED";
  }

  if (opportunityStatus === "PRIORITIZED" || decisionStatus === "PENDING" || decisionStatus === "NEEDS_INFO") {
    return "UNDER_REVIEW";
  }

  if (opportunityStatus === "IDENTIFIED" || opportunityStatus === "ASSESSING" || opportunityStatus === "BLOCKED") {
    return "ASSESSED";
  }

  return "DRAFT";
}

export function getOpportunityStatusLabel(locale: Locale, key: string) {
  return pickLabel(opportunityStatusLabels, locale, key);
}

export function getOpportunityBadgeLabel(locale: Locale, key: string) {
  return pickLabel(opportunityBadgeLabels, locale, key);
}

export function getDecisionStatusLabel(locale: Locale, key: string) {
  return pickLabel(decisionStatusLabels, locale, key);
}

export function getOpportunityWorkflowLabel(
  locale: Locale,
  opportunityStatus: string,
  decisionStatus?: string | null
) {
  const workflowKey = opportunityStatus in workflowStatusLabels
    ? (opportunityStatus as OpportunityWorkflowStatus)
    : deriveOpportunityWorkflowStatus(opportunityStatus, decisionStatus);

  return pickLabel(
    workflowStatusLabels,
    locale,
    workflowKey
  );
}

export function getRiskSeverityLabel(locale: Locale, key: string) {
  return pickLabel(riskSeverityLabels, locale, key);
}

export function getRiskStatusLabel(locale: Locale, key: string) {
  return pickLabel(riskStatusLabels, locale, key);
}

export function getComplianceStatusLabel(locale: Locale, key: string) {
  return pickLabel(complianceStatusLabels, locale, key);
}

export function getDataReadinessLabel(locale: Locale, key: string) {
  return pickLabel(dataReadinessLabels, locale, key);
}

export function getApprovalStatusLabel(locale: Locale, key: string) {
  return pickLabel(approvalStatusLabels, locale, key);
}

export function getInitiativeStatusLabel(locale: Locale, key: string) {
  return pickLabel(initiativeStatusLabels, locale, key);
}

export function getMetricTypeLabel(locale: Locale, key: string) {
  return pickLabel(metricTypeLabels, locale, key);
}
