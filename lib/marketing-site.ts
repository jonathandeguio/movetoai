import type { Locale } from "@/lib/i18n/config";

export type ScenarioSizeKey = "pme" | "eti" | "grandGroupe";
export type ScenarioIndustryKey =
  | "industrie"
  | "retailDistribution"
  | "banqueAssurance"
  | "santePharmaceutique"
  | "servicesConseilEsn"
  | "secteurPublic";

export type MarketingScenario = {
  context: string;
  painPoints: string[];
  priorityProcesses: string[];
  diagnostic: string;
  moveToAi: string;
  platform: string;
  expectedBenefits: string[];
};

export type MarketingSiteContent = {
  navigation: Record<
    | "method"
    | "platform"
    | "examples"
    | "diagnostic",
    string
  >;
  shared: {
    programLabel: string;
    platformLabel: string;
    primaryCta: string;
    secondaryCta: string;
    tertiaryCta: string;
    login: string;
    footerNote: string;
    legal: {
      privacy: string;
      terms: string;
      cookies: string;
    };
  };
  footer: {
    description: string;
    sections: Array<{
      title: string;
      links: Array<{ label: string; href: string }>;
    }>;
  };
  labels: {
    companySize: string;
    industry: string;
    context: string;
    painPoints: string;
    priorityProcesses: string;
    diagnostic: string;
    moveToAi: string;
    platform: string;
    expectedBenefits: string;
  };
};

export const companySizeOptions: Array<{
  key: ScenarioSizeKey;
  label: string;
}> = [
  { key: "pme", label: "PME" },
  { key: "eti", label: "ETI" },
  { key: "grandGroupe", label: "Grand groupe" }
];

export const industryOptions: Array<{
  key: ScenarioIndustryKey;
  label: string;
}> = [
  { key: "industrie", label: "Industrie" },
  { key: "retailDistribution", label: "Retail / Distribution" },
  { key: "banqueAssurance", label: "Banque / Assurance" },
  { key: "santePharmaceutique", label: "Sante / Pharmaceutique" },
  { key: "servicesConseilEsn", label: "Services / Conseil / ESN" },
  { key: "secteurPublic", label: "Secteur public" }
];

const siteContent: MarketingSiteContent = {
  navigation: {
    method: "Methode",
    platform: "Plateforme",
    examples: "Cas d'usage & Exemples",
    diagnostic: "Lancer Move to AI"
  },
  shared: {
    programLabel: "Move to AI",
    platformLabel: "Plateforme Move to AI",
    primaryCta: "Lancer le diagnostic",
    secondaryCta: "Voir la plateforme",
    tertiaryCta: "Decouvrir les cas d'usage",
    login: "Connexion",
    footerNote:
      "Move to AI structure la transformation et outille son execution dans la plateforme.",
    legal: {
      privacy: "Confidentialite",
      terms: "Conditions",
      cookies: "Cookies"
    }
  },
  footer: {
    description:
      "Move to AI aide a passer d'intentions et pilotes IA disperses a une trajectoire de transformation process claire, puis a piloter l'execution dans la plateforme.",
    sections: [
      {
        title: "Parcours",
        links: [
          { label: "Accueil", href: "/" },
          { label: "Methode", href: "/methode" },
          { label: "Lancer Move to AI", href: "/diagnostic-ia" }
        ]
      },
      {
        title: "Plateforme",
        links: [
          { label: "La plateforme", href: "/plateforme" },
          { label: "Cas d'usage & Exemples", href: "/exemples" },
          { label: "Exemples par taille", href: "/exemples#taille" }
        ]
      },
      {
        title: "References",
        links: [
          { label: "Exemples par secteur", href: "/exemples#secteur" },
          { label: "Confidentialite", href: "/legal/privacy" },
          { label: "Conditions", href: "/legal/terms" }
        ]
      }
    ]
  },
  labels: {
    companySize: "Taille d'entreprise",
    industry: "Secteur",
    context: "Contexte typique",
    painPoints: "Points de friction",
    priorityProcesses: "Processus prioritaires",
    diagnostic: "Diagnostic guide dans la plateforme (LLM)",
    moveToAi: "Ce que Move to AI apporte",
    platform: "Move to AI en pratique",
    expectedBenefits: "Benefices attendus"
  }
};

export function getMarketingSiteContent(locale: Locale): MarketingSiteContent {
  void locale;
  return siteContent;
}

const sizeProfiles: Record<
  ScenarioSizeKey,
  {
    context: string;
    moveToAi: string;
    platform: string;
    expectedBenefits: string[];
  }
> = {
  pme: {
    context:
      "Organisation qui veut avancer vite avec des priorites claires.",
    moveToAi:
      "Aide a retenir 3 processus a fort levier et cadrer des usages IA utiles.",
    platform:
      "Apporte un cockpit simple pour suivre opportunites, actions et progression.",
    expectedBenefits: [
      "Decision plus rapide",
      "Valeur visible plus tot"
    ]
  },
  eti: {
    context:
      "Organisation intermediaire qui doit aligner plusieurs equipes.",
    moveToAi:
      "Cadre la trajectoire, arbitre les priorites et la gouvernance.",
    platform:
      "Structure portefeuille, workflows de decision et suivi de valeur.",
    expectedBenefits: [
      "Priorisation plus claire",
      "Execution mieux alignee"
    ]
  },
  grandGroupe: {
    context:
      "Organisation multi-entites avec un portefeuille IA vaste.",
    moveToAi:
      "Structure le programme et clarifie les domaines prioritaires.",
    platform:
      "Devient le cockpit transverse pour prioriser, arbitrer et suivre la valeur.",
    expectedBenefits: [
      "Portefeuille plus arbitre",
      "Passage a l'echelle plus credible"
    ]
  }
};

const industryProfiles: Record<
  ScenarioIndustryKey,
  {
    context: string;
    painPoints: string[];
    priorityProcesses: string[];
    expectedBenefits: string[];
  }
> = {
  industrie: {
    context:
      "Contexte industriel avec besoin de mieux structurer qualite, maintenance, supply ou amelioration continue.",
    painPoints: [
      "Documentation et routines terrain dispersees",
      "Actions correctives difficilement suivies"
    ],
    priorityProcesses: [
      "Qualite",
      "Maintenance",
      "Gestion des non-conformites"
    ],
    expectedBenefits: [
      "Meilleure discipline d'execution",
      "Boucles d'amelioration plus visibles"
    ]
  },
  retailDistribution: {
    context:
      "Organisation retail ou distribution qui doit standardiser les operations reseau et fiabiliser les pratiques terrain.",
    painPoints: [
      "Processus magasins heterogenes",
      "Back-office surcharge"
    ],
    priorityProcesses: [
      "Procedures magasins",
      "Support operationnel",
      "Back-office documentaire"
    ],
    expectedBenefits: [
      "Operations plus homogenes",
      "Support terrain plus fluide"
    ]
  },
  banqueAssurance: {
    context:
      "Organisation financee ou assurantielle qui veut fluidifier des workflows internes tout en maintenant un niveau de conformite eleve.",
    painPoints: [
      "Workflows documentaires lents",
      "Validation et decision peu lisibles"
    ],
    priorityProcesses: [
      "Traitement documentaire",
      "Demandes internes",
      "Arbitrage et workflow de decision"
    ],
    expectedBenefits: [
      "Moins de friction operationnelle",
      "Meilleure tracabilite"
    ]
  },
  santePharmaceutique: {
    context:
      "Environnement sante ou pharma avec forte sensibilite documentaire, qualite et conformite.",
    painPoints: [
      "Referentiels et procedures difficiles a diffuser",
      "Niveau de confiance exigeant"
    ],
    priorityProcesses: [
      "Workflow qualite",
      "Gestion des procedures",
      "CAPA et suivi d'ecarts"
    ],
    expectedBenefits: [
      "Confiance plus forte dans l'execution",
      "Documentation critique mieux exploitee"
    ]
  },
  servicesConseilEsn: {
    context:
      "Organisation de services qui doit mieux reutiliser sa connaissance et rendre ses operations plus reproductibles.",
    painPoints: [
      "Connaissance peu mutualisee",
      "Delivery heterogene"
    ],
    priorityProcesses: [
      "Knowledge management",
      "Propositions commerciales",
      "Operations internes"
    ],
    expectedBenefits: [
      "Meilleure reutilisation de l'expertise",
      "Cycle commercial et delivery plus fiables"
    ]
  },
  secteurPublic: {
    context:
      "Organisation publique qui veut moderniser progressivement des parcours internes tout en gardant un niveau de gouvernance clair.",
    painPoints: [
      "Processus administratifs lourds",
      "Connaissance diffuse"
    ],
    priorityProcesses: [
      "Instruction et reponse",
      "Gestion documentaire",
      "Suivi de plans d'action"
    ],
    expectedBenefits: [
      "Parcours plus fluides",
      "Transformation plus progressive et visible"
    ]
  }
};

const scenarioOverrides: Partial<
  Record<`${ScenarioSizeKey}:${ScenarioIndustryKey}`, Partial<MarketingScenario>>
> = {
  "pme:industrie": {
    priorityProcesses: [
      "Structuration des processus qualite",
      "Automatisation documentaire",
      "Suivi d'actions d'amelioration"
    ]
  },
  "pme:servicesConseilEsn": {
    priorityProcesses: [
      "Capitalisation de connaissances",
      "Industrialisation des propositions commerciales",
      "Pilotage de productivite"
    ]
  },
  "eti:industrie": {
    priorityProcesses: [
      "Amelioration continue multi-sites",
      "Gestion des non-conformites",
      "Pilotage des plans d'action"
    ]
  },
  "eti:retailDistribution": {
    priorityProcesses: [
      "Optimisation magasins / back-office",
      "Animation de la performance reseau",
      "Centralisation des procedures"
    ]
  },
  "eti:banqueAssurance": {
    priorityProcesses: [
      "Rationalisation des workflows documentaires",
      "Gouvernance des processus internes",
      "Pilotage des demandes et decisions"
    ]
  },
  "grandGroupe:industrie": {
    priorityProcesses: [
      "Transformation de processus critiques",
      "Gouvernance multi-entites",
      "Priorisation d'un portefeuille de cas d'usage IA"
    ]
  },
  "grandGroupe:banqueAssurance": {
    priorityProcesses: [
      "Transformation des parcours internes",
      "Gouvernance, conformite, documentation",
      "Pilotage transverse des initiatives IA"
    ]
  },
  "grandGroupe:santePharmaceutique": {
    priorityProcesses: [
      "Structuration documentaire",
      "Workflow qualite et conformite",
      "Gouvernance des initiatives IA"
    ]
  },
  "grandGroupe:secteurPublic": {
    priorityProcesses: [
      "Simplification de processus administratifs",
      "Capitalisation et diffusion de la connaissance",
      "Gouvernance des cas d'usage"
    ]
  }
};

export function buildMarketingScenario(
  size: ScenarioSizeKey,
  industry: ScenarioIndustryKey
): MarketingScenario {
  const sizeProfile = sizeProfiles[size];
  const industryProfile = industryProfiles[industry];
  const override = scenarioOverrides[`${size}:${industry}`];

  return {
    context: `${sizeProfile.context} ${industryProfile.context}`,
    painPoints: override?.painPoints ?? industryProfile.painPoints,
    priorityProcesses: override?.priorityProcesses ?? industryProfile.priorityProcesses,
    diagnostic:
      "Le diagnostic se realise dans la plateforme. Le LLM guide l'exploration des processus et propose une priorisation actionnable.",
    moveToAi:
      override?.moveToAi ??
      `${sizeProfile.moveToAi} Le travail se concentre sur des processus reels et des priorites explicites.`,
    platform:
      override?.platform ??
      `${sizeProfile.platform} La plateforme relie priorisation, gouvernance, plans d'action et valeur attendue.`,
    expectedBenefits: [
      ...sizeProfile.expectedBenefits,
      ...industryProfile.expectedBenefits,
      ...(override?.expectedBenefits ?? [])
    ].slice(0, 3)
  };
}
