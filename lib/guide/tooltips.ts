export interface TooltipContent {
  title: string;
  description: string;
  learnMoreHref?: string;
}

export const TOOLTIPS: Record<string, TooltipContent> = {
  maturity_score: {
    title: "Score de maturité IA",
    description:
      "Évalue la capacité de votre organisation à adopter et déployer des solutions d'IA.",
  },
  opportunity_stage: {
    title: "Étape de l'opportunité",
    description:
      "Représente l'avancement d'une idée IA, de l'identification à la mise en production.",
  },
  roi_estimated: {
    title: "ROI estimé",
    description:
      "Estimation financière du retour sur investissement attendu pour ce projet IA.",
  },
  tech_radar_ring: {
    title: "Anneau du radar",
    description:
      "ADOPT = utilisé en production. TRIAL = en expérimentation. HOLD = à éviter. EMERGING = à surveiller.",
  },
  usecase_status: {
    title: "Statut du cas d'usage",
    description:
      "Cycle de vie d'un use case, de la conception à la mise en œuvre.",
  },
  risk_severity: {
    title: "Sévérité du risque",
    description:
      "Niveau d'impact potentiel : LOW, MEDIUM, HIGH ou CRITICAL.",
  },
  copilot: {
    title: "Assistant IA (Copilot)",
    description:
      "Posez des questions en langage naturel sur vos données de transformation IA.",
    learnMoreHref: "/app/help/member/ai-features",
  },
  webhook: {
    title: "Webhook",
    description:
      "Notification HTTP envoyée automatiquement vers vos systèmes lors d'événements clés.",
    learnMoreHref: "/app/help/admin/settings",
  },
  prisma_db_push: {
    title: "Synchronisation DB",
    description:
      "Applique le schéma Prisma à la base de données sans perte de données.",
  },
  assessment: {
    title: "Assessment de maturité",
    description:
      "Questionnaire évaluant la maturité IA d'une organisation selon 6 dimensions.",
    learnMoreHref: "/app/help/member/getting-started",
  },
  scenario: {
    title: "Scénario IA",
    description:
      "Simulation comparative de plusieurs approches pour un projet IA donné.",
  },
  briefing: {
    title: "Briefing hebdomadaire",
    description:
      "Synthèse générée par l'IA chaque semaine résumant l'avancement de la transformation.",
  },
};
