export interface ChecklistStep {
  id: string;
  label: string;
  description: string;
  href: string;
  icon?: string;
}

export const CHECKLIST_BY_ROLE: Record<string, ChecklistStep[]> = {
  workspace_admin: [
    {
      id: "invite_team",
      label: "Inviter votre équipe",
      description: "Ajoutez vos collègues à l'espace de travail",
      href: "/app/admin/members",
    },
    {
      id: "configure_workspace",
      label: "Configurer l'espace de travail",
      description: "Paramètres généraux et intégrations",
      href: "/app/admin/workspace",
    },
    {
      id: "add_application",
      label: "Ajouter une application",
      description: "Cartographiez votre premier outil",
      href: "/app/applications/new",
    },
    {
      id: "create_opportunity",
      label: "Créer une opportunité IA",
      description: "Identifiez votre premier cas d'usage potentiel",
      href: "/app/opportunities/new",
    },
    {
      id: "run_assessment",
      label: "Lancer un assessment",
      description: "Évaluez la maturité IA de votre organisation",
      href: "/app/assessments",
    },
    {
      id: "explore_radar",
      label: "Explorer le Tech Radar",
      description: "Visualisez votre paysage technologique",
      href: "/app/insights/tech-radar",
    },
    {
      id: "configure_webhooks",
      label: "Configurer les webhooks",
      description: "Connectez vos outils externes",
      href: "/app/admin/webhooks",
    },
  ],

  transformation_manager: [
    {
      id: "view_dashboard",
      label: "Voir le tableau de bord",
      description: "Vue d'ensemble de la transformation IA",
      href: "/app/dashboard",
    },
    {
      id: "create_opportunity",
      label: "Créer une opportunité IA",
      description: "Proposez un cas d'usage IA",
      href: "/app/opportunities/new",
    },
    {
      id: "read_briefing",
      label: "Lire le briefing hebdomadaire",
      description: "Synthèse IA de l'avancement",
      href: "/app/insights/briefing",
    },
    {
      id: "explore_roi",
      label: "Explorer le ROI",
      description: "Analysez la valeur générée par vos projets IA",
      href: "/app/value/roi-dashboard",
    },
    {
      id: "view_roadmap",
      label: "Voir la roadmap",
      description: "Suivez l'avancement des initiatives",
      href: "/app/roadmap",
    },
    {
      id: "ask_copilot",
      label: "Interroger le Copilot",
      description: "Posez une question à votre assistant IA",
      href: "/app/copilot",
    },
  ],

  enterprise_architect: [
    {
      id: "add_application",
      label: "Référencer une application",
      description: "Ajoutez un outil au catalogue",
      href: "/app/applications/new",
    },
    {
      id: "map_process",
      label: "Cartographier un processus",
      description: "Documentez un processus métier",
      href: "/app/processes/new",
    },
    {
      id: "add_technology",
      label: "Ajouter une technologie",
      description: "Enrichissez le radar technologique",
      href: "/app/insights/tech-radar",
    },
    {
      id: "create_adr",
      label: "Créer une décision d'architecture",
      description: "Documentez un choix technique",
      href: "/app/architecture",
    },
    {
      id: "review_risks",
      label: "Analyser les risques",
      description: "Identifiez et gérez les risques IA",
      href: "/app/governance/risks",
    },
    {
      id: "configure_integrations",
      label: "Configurer les intégrations",
      description: "Connectez vos systèmes",
      href: "/app/admin/workspace",
    },
  ],
};

// Legacy aliases so existing code that reads old role keys still works
CHECKLIST_BY_ROLE["admin"]           = CHECKLIST_BY_ROLE["workspace_admin"];
CHECKLIST_BY_ROLE["executive"]       = CHECKLIST_BY_ROLE["transformation_manager"];
CHECKLIST_BY_ROLE["business-owner"]  = CHECKLIST_BY_ROLE["transformation_manager"];
CHECKLIST_BY_ROLE["it-manager"]      = CHECKLIST_BY_ROLE["enterprise_architect"];
CHECKLIST_BY_ROLE["consultant"]      = CHECKLIST_BY_ROLE["enterprise_architect"];
CHECKLIST_BY_ROLE["member"]          = CHECKLIST_BY_ROLE["transformation_manager"];

export const DEFAULT_CHECKLIST: ChecklistStep[] = CHECKLIST_BY_ROLE["transformation_manager"];
