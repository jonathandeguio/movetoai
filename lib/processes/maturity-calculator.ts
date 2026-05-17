// lib/processes/maturity-calculator.ts
// Score de maturité CMMI adapté — 0 à 100 points, 5 critères de 20 pts chacun

import { prisma } from "@/lib/prisma";

export interface MaturityResult {
  score:       number;
  level:       string;
  label_fr:    string;
  description: string;
  next_action: string;
  color:       string;
  details:     {
    description: number;
    steps:       number;
    bpmn:        number;
    kpis:        number;
    governance:  number;
  };
}

const MATURITY_LEVELS = [
  { max: 20,  level: "initial",                 label_fr: "Niveau initial",
    description: "Processus ad hoc, peu documenté.",
    next_action: "Complétez la description du processus (minimum 80 mots).",
    color: "#f87171" },
  { max: 40,  level: "managed",                 label_fr: "Processus géré",
    description: "Partiellement documenté, sans gouvernance formelle.",
    next_action: "Documentez les étapes et assignez un Business Process Owner.",
    color: "#fb923c" },
  { max: 60,  level: "defined",                 label_fr: "Processus défini",
    description: "Documenté avec étapes claires et propriétaire assigné.",
    next_action: "Générez ou importez le BPMN, puis définissez des KPIs mesurables.",
    color: "#fbbf24" },
  { max: 80,  level: "quantitatively_managed",  label_fr: "Processus maîtrisé",
    description: "Mesuré et piloté avec KPIs suivis régulièrement.",
    next_action: "Liez les certifications et identifiez les opportunités d'automatisation.",
    color: "#38bdf8" },
  { max: 100, level: "optimizing",              label_fr: "En optimisation continue",
    description: "Pleinement documenté, mesuré et en amélioration continue.",
    next_action: "Créez un use case IA pour automatiser les tâches répétitives.",
    color: "#6ee7b7" },
] as const;

export async function calculateMaturityScore(processId: string): Promise<MaturityResult> {
  const p = await prisma.process.findUnique({
    where:   { id: processId },
    include: {
      steps:       true,
      processKpis: true,
      diagram:     { select: { id: true, validationStatus: true } },
    },
  });

  if (!p) throw new Error(`Process ${processId} not found`);

  const details = { description: 0, steps: 0, bpmn: 0, kpis: 0, governance: 0 };

  // Critère 1 — Description (20 pts)
  const words = (p.description ?? "").split(/\s+/).filter(Boolean).length;
  details.description = words >= 150 ? 20 : words >= 80 ? 12 : words >= 30 ? 5 : 0;

  // Critère 2 — Étapes documentées (20 pts)
  const steps = p.steps.length;
  details.steps = steps >= 5 ? 20 : steps >= 3 ? 12 : steps >= 1 ? 6 : 0;

  // Critère 3 — BPMN (20 pts)
  if (p.diagram) {
    details.bpmn = p.diagram.validationStatus === "validated" ? 20 : 10;
  }

  // Critère 4 — KPIs mesurables (20 pts)
  const kpisWithTarget = p.processKpis.filter((k) => k.targetValue != null).length;
  details.kpis =
    kpisWithTarget >= 3 ? 20 :
    kpisWithTarget >= 2 ? 14 :
    kpisWithTarget >= 1 ? 8  :
    p.processKpis.length >= 1 ? 4 : 0;

  // Critère 5 — Gouvernance (20 pts)
  if (p.ownerId)                details.governance += 8;
  if (p.stewardId)              details.governance += 4;
  if (p.isCertified)            details.governance += 5;
  if (p.sla)                    details.governance += 3;

  const score = Object.values(details).reduce((a, b) => a + b, 0);
  const level = MATURITY_LEVELS.find((l) => score <= l.max) ?? MATURITY_LEVELS[MATURITY_LEVELS.length - 1]!;

  // Persist
  await prisma.process.update({
    where: { id: processId },
    data:  { maturityScore: score, maturityLevel: level.level },
  });

  return { score, ...level, details };
}

export function getMaturityFromScore(score: number): (typeof MATURITY_LEVELS)[number] {
  return MATURITY_LEVELS.find((l) => score <= l.max) ?? MATURITY_LEVELS[MATURITY_LEVELS.length - 1]!;
}
