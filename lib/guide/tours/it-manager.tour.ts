import type { TourStep } from "./admin.tour";

export const itManagerTour: TourStep[] = [
  {
    element: "[data-tour='sidebar']",
    popover: {
      title: "Navigation",
      description: "Accédez au catalogue, au radar technologique et aux intégrations.",
      side: "right",
    },
  },
  {
    element: "[data-tour='nav-applications']",
    popover: {
      title: "Catalogue d'applications",
      description:
        "Référencez et gérez l'ensemble des outils et systèmes de votre organisation.",
      side: "right",
    },
  },
  {
    element: "[data-tour='nav-insights']",
    popover: {
      title: "Tech Radar",
      description:
        "Visualisez le positionnement de vos technologies : ADOPT, TRIAL, HOLD, EMERGING.",
      side: "right",
    },
  },
  {
    element: "[data-tour='help-button']",
    popover: {
      title: "Documentation technique",
      description:
        "Accédez aux guides d'intégration, webhooks et architecture.",
      side: "left",
    },
  },
];
