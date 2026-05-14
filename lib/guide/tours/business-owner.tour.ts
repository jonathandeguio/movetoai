import type { TourStep } from "./admin.tour";

export const businessOwnerTour: TourStep[] = [
  {
    element: "[data-tour='sidebar']",
    popover: {
      title: "Navigation",
      description: "Accédez à vos espaces métier depuis ce menu.",
      side: "right",
    },
  },
  {
    element: "[data-tour='nav-opportunities']",
    popover: {
      title: "Opportunités IA",
      description:
        "Proposez et suivez vos idées de cas d'usage IA pour votre domaine métier.",
      side: "right",
    },
  },
  {
    element: "[data-tour='nav-processes']",
    popover: {
      title: "Processus métier",
      description:
        "Cartographiez vos processus pour identifier les leviers d'automatisation IA.",
      side: "right",
    },
  },
  {
    element: "[data-tour='help-button']",
    popover: {
      title: "Centre d'aide",
      description:
        "Consultez les guides et tutoriels pour tirer le meilleur parti de la plateforme.",
      side: "left",
    },
  },
];
