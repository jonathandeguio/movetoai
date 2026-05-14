// lib/aria/context-builder.ts
// Construit les métriques de page depuis la BDD pour alimenter les configs Aria.

import { prisma } from "@/lib/prisma";
import type { PageContext } from "./page-configs";

// ── Dispatcher principal ──────────────────────────────────────────────────────

export async function buildPageContext(
  pagePath: string,
  workspaceId: string
): Promise<PageContext> {
  try {
    // Normalise les query strings éventuels (/app/opportunities?filter=x → /app/opportunities)
    const base = pagePath.split("?")[0];

    switch (base) {
      case "/app":
        return await dashboardCtx(workspaceId);
      case "/app/opportunities":
        return await opportunitiesCtx(workspaceId);
      case "/app/use-cases":
        return await useCasesCtx(workspaceId);
      case "/app/knowledge/processes":
        return await processesCtx(workspaceId);
      case "/app/knowledge/applications":
        return await applicationsCtx(workspaceId);
      case "/app/compliance":
        return await complianceCtx(workspaceId);
      case "/app/roadmap":
        return await roadmapCtx(workspaceId);
      default:
        return {};
    }
  } catch {
    return {};
  }
}

// ── Builders par page ─────────────────────────────────────────────────────────

async function dashboardCtx(wsId: string): Promise<PageContext> {
  const [opps, processes, withBpmn, expiringCerts] = await Promise.all([
    prisma.opportunity.count({ where: { workspaceId: wsId } }),
    prisma.process.count({ where: { workspaceId: wsId } }),
    prisma.process
      .count({ where: { workspaceId: wsId, diagram: { isNot: null } } })
      .catch(() => 0),
    prisma.workspaceCertification
      .count({
        where: {
          workspaceId: wsId,
          expiryDate:  { lte: new Date(Date.now() + 90 * 86_400_000) },
          status:      { not: "expired" },
        },
      })
      .catch(() => 0),
  ]);

  return {
    opportunities_count:    opps,
    processes_count:        processes,
    processes_without_bpmn: processes - withBpmn,
    expiring_certs_count:   expiringCerts,
    compliance_score:       0, // calculé dans complianceCtx si besoin
    pending_validations:    0,
  };
}

async function opportunitiesCtx(wsId: string): Promise<PageContext> {
  const [total, draft, p0] = await Promise.all([
    prisma.opportunity.count({ where: { workspaceId: wsId } }),
    prisma.opportunity.count({ where: { workspaceId: wsId, status: "DRAFT" } }),
    prisma.opportunity
      .count({ where: { workspaceId: wsId, status: "DRAFT", priorityLevel: { in: ["P0", "CRITICAL"] } } })
      .catch(() => 0),
  ]);
  return {
    opportunities_count:        total,
    draft_count:                draft,
    high_potential_unvalidated: p0,
  };
}

async function useCasesCtx(wsId: string): Promise<PageContext> {
  const [useCases, validatedOpps] = await Promise.all([
    prisma.useCase.count({ where: { workspaceId: wsId } }),
    prisma.opportunity.count({ where: { workspaceId: wsId, status: "VALIDATED" } }),
  ]);
  return {
    use_cases_count:                        useCases,
    stalled_use_cases:                      0, // nécessiterait un champ lastActivityAt
    validated_opportunities_not_converted:  validatedOpps,
  };
}

async function processesCtx(wsId: string): Promise<PageContext> {
  const [total, withBpmn, highPain] = await Promise.all([
    prisma.process.count({ where: { workspaceId: wsId } }),
    prisma.process.count({ where: { workspaceId: wsId, diagramXml: { not: null } } }).catch(() => 0),
    prisma.process.count({ where: { workspaceId: wsId, painLevel: { gte: 4 } } }).catch(() => 0),
  ]);
  return {
    processes_count:        total,
    high_potential_unmodeled: total - withBpmn,
    high_pain_processes:    highPain,
  };
}

async function applicationsCtx(wsId: string): Promise<PageContext> {
  const count = await prisma.application.count({ where: { workspaceId: wsId } }).catch(() => 0);
  return { applications_count: count };
}

async function complianceCtx(wsId: string): Promise<PageContext> {
  const [total, planned, expiringSoon, expired] = await Promise.all([
    prisma.workspaceCertification.count({ where: { workspaceId: wsId } }).catch(() => 0),
    prisma.workspaceCertification.count({ where: { workspaceId: wsId, status: "planned" } }).catch(() => 0),
    prisma.workspaceCertification
      .count({
        where: {
          workspaceId: wsId,
          expiryDate:  { lte: new Date(Date.now() + 90 * 86_400_000) },
          status:      { not: "expired" },
        },
      })
      .catch(() => 0),
    prisma.workspaceCertification.count({ where: { workspaceId: wsId, status: "expired" } }).catch(() => 0),
  ]);

  const obtained    = Math.max(0, total - planned - expired);
  const globalScore = total > 0 ? Math.round((obtained / total) * 100) : 0;

  return {
    total_certs:             total,
    missing_mandatory_certs: planned,
    expiring_soon:           expiringSoon,
    expired_count:           expired,
    global_score:            globalScore,
  };
}

async function roadmapCtx(wsId: string): Promise<PageContext> {
  const count = await prisma.initiative.count({ where: { workspaceId: wsId } }).catch(() => 0);
  return { initiatives_count: count };
}

// ── Snapshot workspace complet (pour system prompt + recommandations) ─────────

export async function buildWorkspaceSnapshot(
  workspaceId: string
): Promise<Record<string, unknown>> {
  const [ws, opps, processes, useCases, certs] = await Promise.all([
    prisma.workspace.findUnique({
      where:  { id: workspaceId },
      select: { name: true, sectorCode: true, companySize: true, aiMaturity: true },
    }),
    prisma.opportunity.count({ where: { workspaceId } }),
    prisma.process.count({ where: { workspaceId } }),
    prisma.useCase.count({ where: { workspaceId } }),
    prisma.workspaceCertification.count({ where: { workspaceId } }).catch(() => 0),
  ]);

  return {
    workspace:     ws,
    opportunities: opps,
    processes,
    use_cases:     useCases,
    certifications: certs,
  };
}
