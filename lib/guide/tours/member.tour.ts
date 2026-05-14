import type { TourStep } from "./admin.tour";

export const memberTour: TourStep[] = [
  {
    element: "[data-tour='sidebar']",
    popover: {
      title: "Navigation",
      description: "Découvrez les différentes sections de la plateforme depuis ce menu.",
      side: "right",
    },
  },
  {
    element: "[data-tour='dashboard-header']",
    popover: {
      title: "Tableau de bord",
      description:
        "Consultez l'avancement de la transformation IA de votre organisation.",
      side: "bottom",
    },
  },
  {
    element: "[data-tour='nav-copilot']",
    popover: {
      title: "Copilot IA",
      description:
        "Posez vos questions en langage naturel et obtenez des réponses instantanées.",
      side: "right",
    },
  },
  {
    element: "[data-tour='help-button']",
    popover: {
      title: "Besoin d'aide ?",
      description:
        "Accédez aux guides de démarrage et à la documentation à tout moment.",
      side: "left",
    },
  },
];
