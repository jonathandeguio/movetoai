import type { TourStep } from "./admin.tour";

export const executiveTour: TourStep[] = [
  {
    element: "[data-tour='sidebar']",
    popover: {
      title: "Navigation",
      description: "Accédez à toutes les vues stratégiques depuis ce menu.",
      side: "right",
    },
  },
  {
    element: "[data-tour='dashboard-header']",
    popover: {
      title: "Tableau de bord exécutif",
      description:
        "Votre vue consolidée : score de maturité, valeur créée et initiatives en cours.",
      side: "bottom",
    },
  },
  {
    element: "[data-tour='nav-copilot']",
    popover: {
      title: "Copilot IA",
      description:
        "Interrogez en langage naturel l'ensemble de vos données de transformation IA.",
      side: "right",
    },
  },
  {
    element: "[data-tour='nav-roi']",
    popover: {
      title: "ROI Dashboard",
      description: "Mesurez la valeur générée par chaque initiative IA.",
      side: "right",
    },
  },
  {
    element: "[data-tour='nav-briefing']",
    popover: {
      title: "Briefing hebdomadaire",
      description:
        "Une synthèse IA chaque semaine pour rester informé sans effort.",
      side: "right",
    },
  },
  {
    element: "[data-tour='help-button']",
    popover: {
      title: "Besoin d'aide ?",
      description: "Guides et documentation accessibles en un clic.",
      side: "left",
    },
  },
];
