export interface TourStep {
  element?: string;
  popover: {
    title: string;
    description: string;
    side?: "top" | "bottom" | "left" | "right";
    align?: "start" | "center" | "end";
  };
}

export const adminTour: TourStep[] = [
  {
    element: "[data-tour='sidebar']",
    popover: {
      title: "Navigation",
      description: "Accédez à toutes les sections depuis la barre latérale.",
      side: "right",
    },
  },
  {
    element: "[data-tour='dashboard-header']",
    popover: {
      title: "Tableau de bord",
      description:
        "Vue d'ensemble de votre transformation IA : score de maturité, pipeline d'opportunités et KPIs clés.",
      side: "bottom",
    },
  },
  {
    element: "[data-tour='nav-opportunities']",
    popover: {
      title: "Opportunités IA",
      description:
        "Gérez le pipeline des idées IA : de l'identification à la mise en production.",
      side: "right",
    },
  },
  {
    element: "[data-tour='nav-applications']",
    popover: {
      title: "Catalogue d'applications",
      description:
        "Référencez tous vos outils et systèmes pour identifier les synergies IA.",
      side: "right",
    },
  },
  {
    element: "[data-tour='nav-insights']",
    popover: {
      title: "Insights & Radar",
      description:
        "Visualisez votre paysage technologique et obtenez des briefings hebdomadaires.",
      side: "right",
    },
  },
  {
    element: "[data-tour='nav-admin']",
    popover: {
      title: "Administration",
      description:
        "Gérez les membres, webhooks, audit logs et paramètres de l'espace de travail.",
      side: "right",
    },
  },
  {
    element: "[data-tour='help-button']",
    popover: {
      title: "Centre d'aide",
      description:
        "Retrouvez guides, tooltips et documentation à tout moment.",
      side: "left",
    },
  },
];
