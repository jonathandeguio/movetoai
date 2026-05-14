import "server-only";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export interface ReadinessDimensions {
  dataQualityScore: number; // 0-100
  automationPotential: number; // 0-100
  operationalFitScore: number; // 0-100
  integrationScore: number; // 0-100
  complianceScore: number; // 0-100
}

export interface ReadinessResult {
  overallScore: number;
  classification: "leader" | "advanced" | "developing" | "beginner";
  breakdown: ReadinessDimensions;
  recommendations: string[];
}

// ── Shared helpers ────────────────────────────────────────────────────────────

function computeOverallScore(d: ReadinessDimensions): number {
  return (
    d.dataQualityScore * 0.25 +
    d.automationPotential * 0.3 +
    d.operationalFitScore * 0.2 +
    d.integrationScore * 0.15 +
    d.complianceScore * 0.1
  );
}

function classify(score: number): ReadinessResult["classification"] {
  if (score >= 75) return "leader";
  if (score >= 55) return "advanced";
  if (score >= 35) return "developing";
  return "beginner";
}

function buildRecommendations(d: ReadinessDimensions): string[] {
  const recs: string[] = [];
  if (d.dataQualityScore < 40) recs.push("Améliorer la qualité des données sources");
  if (d.automationPotential < 40) recs.push("Documenter les étapes automatisables du processus");
  if (d.integrationScore < 50) recs.push("Lier ce processus aux applications concernées");
  if (d.operationalFitScore < 40) recs.push("Revoir la fréquence et le volume du processus");
  return recs;
}

function integrationScoreFromCount(count: number): number {
  if (count === 0) return 30;
  if (count === 1) return 50;
  if (count === 2) return 65;
  return 80;
}

// ── scoreProcess ──────────────────────────────────────────────────────────────

export async function scoreProcess(
  processId: string,
  workspaceId: string,
): Promise<ReadinessResult> {
  const process = await prisma.process.findFirst({
    where: { id: processId, workspaceId, deletedAt: null },
    select: {
      id: true,
      dataQuality: true,
      aiPotential: true,
      automationRate: true,
      frequency: true,
      volumePerDay: true,
      steps: {
        select: { automatable: true },
      },
      applications: {
        select: { applicationId: true },
      },
    },
  });

  if (!process) {
    throw new Error(`Process ${processId} not found in workspace ${workspaceId}`);
  }

  // 1. dataQualityScore
  const dataQualityMap: Record<string, number> = {
    good: 90,
    partial: 55,
    poor: 20,
  };
  const dataQualityScore =
    process.dataQuality && process.dataQuality in dataQualityMap
      ? dataQualityMap[process.dataQuality]
      : 30;

  // 2. automationPotential
  let automationPotential: number;
  const steps = process.steps;
  const hasSteps = steps.length > 0;
  const hasRate = process.automationRate !== null && process.automationRate !== undefined;

  if (hasSteps && hasRate) {
    const stepScore = (steps.filter((s) => s.automatable).length / steps.length) * 100;
    automationPotential = (stepScore + process.automationRate! * 100) * 0.5;
  } else if (hasSteps) {
    automationPotential = (steps.filter((s) => s.automatable).length / steps.length) * 100;
  } else if (hasRate) {
    automationPotential = process.automationRate! * 100;
  } else {
    // Fallback to aiPotential
    const aiPotentialMap: Record<string, number> = { high: 85, medium: 50, low: 20 };
    automationPotential =
      process.aiPotential && process.aiPotential in aiPotentialMap
        ? aiPotentialMap[process.aiPotential]
        : 50;
  }

  // 3. operationalFitScore
  const frequencyMap: Record<string, number> = {
    realtime: 95,
    daily: 80,
    weekly: 60,
    monthly: 40,
    adhoc: 25,
  };
  let operationalFitScore =
    process.frequency && process.frequency in frequencyMap
      ? frequencyMap[process.frequency]
      : 50;

  if (process.volumePerDay !== null && process.volumePerDay !== undefined) {
    if (process.volumePerDay > 1000) operationalFitScore += 10;
    else if (process.volumePerDay > 100) operationalFitScore += 5;
  }
  operationalFitScore = Math.min(100, operationalFitScore);

  // 4. integrationScore
  const integrationScore = integrationScoreFromCount(process.applications.length);

  // 5. complianceScore
  const complianceScore = 70;

  const breakdown: ReadinessDimensions = {
    dataQualityScore,
    automationPotential,
    operationalFitScore,
    integrationScore,
    complianceScore,
  };

  const overallScore = computeOverallScore(breakdown);
  const classification = classify(overallScore);
  const recommendations = buildRecommendations(breakdown);

  const result: ReadinessResult = { overallScore, classification, breakdown, recommendations };

  // Upsert into AIReadinessAssessment (no @@unique composite — use findFirst + create/update)
  const existing = await prisma.aIReadinessAssessment.findFirst({
    where: { entityType: "process", entityId: processId, workspaceId },
    select: { id: true },
  });

  const assessmentData = {
    workspaceId,
    entityType: "process",
    entityId: processId,
    assessedAt: new Date(),
    assessedBy: "system",
    dataQualityScore,
    automationPotential,
    operationalFitScore,
    integrationScore,
    complianceScore,
    overallScore,
    classification,
    breakdown: breakdown as unknown as Prisma.InputJsonValue,
    recommendations: recommendations as unknown as Prisma.InputJsonValue,
  };

  if (existing) {
    await prisma.aIReadinessAssessment.update({
      where: { id: existing.id },
      data: assessmentData,
    });
  } else {
    await prisma.aIReadinessAssessment.create({ data: assessmentData });
  }

  return result;
}

// ── scoreApplication ──────────────────────────────────────────────────────────

export async function scoreApplication(
  applicationId: string,
  workspaceId: string,
): Promise<ReadinessResult> {
  const application = await prisma.application.findFirst({
    where: { id: applicationId, workspaceId, deletedAt: null },
    select: {
      id: true,
      qualityScore: true,
      criticality: true,
      aiReadinessScore: true,
      capabilities: {
        select: { capabilityId: true },
      },
      processes: {
        select: {
          process: {
            select: { automationRate: true },
          },
        },
      },
    },
  });

  if (!application) {
    throw new Error(`Application ${applicationId} not found in workspace ${workspaceId}`);
  }

  // 1. dataQualityScore
  const dataQualityScore =
    application.qualityScore !== null && application.qualityScore !== undefined
      ? Math.min(100, Math.max(0, application.qualityScore))
      : 50;

  // 2. automationPotential — average automationRate of linked processes
  const linkedRates = application.processes
    .map((pa) => pa.process.automationRate)
    .filter((r): r is number => r !== null && r !== undefined);
  const automationPotential =
    linkedRates.length > 0
      ? (linkedRates.reduce((sum, r) => sum + r, 0) / linkedRates.length) * 100
      : 50;

  // 3. operationalFitScore — based on criticality
  const criticalityMap: Record<string, number> = {
    critical: 90,
    high: 75,
    medium: 55,
    low: 35,
  };
  const operationalFitScore =
    application.criticality && application.criticality in criticalityMap
      ? criticalityMap[application.criticality]
      : 55;

  // 4. integrationScore — number of capability links
  const integrationScore = integrationScoreFromCount(application.capabilities.length);

  // 5. complianceScore
  const complianceScore = 70;

  const breakdown: ReadinessDimensions = {
    dataQualityScore,
    automationPotential,
    operationalFitScore,
    integrationScore,
    complianceScore,
  };

  const overallScore = computeOverallScore(breakdown);
  const classification = classify(overallScore);
  const recommendations = buildRecommendations(breakdown);

  const result: ReadinessResult = { overallScore, classification, breakdown, recommendations };

  // Upsert into AIReadinessAssessment
  const existing = await prisma.aIReadinessAssessment.findFirst({
    where: { entityType: "application", entityId: applicationId, workspaceId },
    select: { id: true },
  });

  const assessmentData = {
    workspaceId,
    entityType: "application",
    entityId: applicationId,
    assessedAt: new Date(),
    assessedBy: "system",
    dataQualityScore,
    automationPotential,
    operationalFitScore,
    integrationScore,
    complianceScore,
    overallScore,
    classification,
    breakdown: breakdown as unknown as Prisma.InputJsonValue,
    recommendations: recommendations as unknown as Prisma.InputJsonValue,
  };

  if (existing) {
    await prisma.aIReadinessAssessment.update({
      where: { id: existing.id },
      data: assessmentData,
    });
  } else {
    await prisma.aIReadinessAssessment.create({ data: assessmentData });
  }

  // Update application.aiReadinessScore
  await prisma.application.update({
    where: { id: applicationId },
    data: { aiReadinessScore: overallScore },
  });

  return result;
}
