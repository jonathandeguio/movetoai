import type { TourStep } from "./admin.tour";

export const consultantTour: TourStep[] = [
  {
    element: "[data-tour='sidebar']",
    popover: {
      title: "Navigation",
      description: "Accédez aux analyses, opportunités et scénarios depuis ce menu.",
      side: "right",
    },
  },
  {
    element: "[data-tour='nav-opportunities']",
    popover: {
      title: "Pipeline IA",
      description:
        "Explorez et analysez l'ensemble des opportunités IA de l'organisation.",
      side: "right",
    },
  },
  {
    element: "[data-tour='nav-copilot']",
    popover: {
      title: "Copilot IA",
      description:
        "Interrogez les données de transformation et générez des analyses en langage naturel.",
      side: "right",
    },
  },
  {
    element: "[data-tour='help-button']",
    popover: {
      title: "Centre d'aide",
      description:
        "Retrouvez méthodologies et bonnes pratiques pour vos missions de conseil.",
      side: "left",
    },
  },
];
