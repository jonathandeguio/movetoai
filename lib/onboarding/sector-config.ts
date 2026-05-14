/**
 * Sector Intelligence Configuration
 * Central matrix used by the onboarding wizard to pre-populate each workspace
 * with sector-relevant capabilities, certifications, processes and AI opportunities.
 *
 * Structure:
 *  SECTOR_CONFIG[sector].capabilities  — full catalog for the sector
 *  SECTOR_CONFIG[sector].certifications
 *  SECTOR_CONFIG[sector].processes
 *  SECTOR_CONFIG[sector].opportunities
 *  SECTOR_CONFIG[sector].bySize        — how many items to activate per company size
 */

// ── Types ─────────────────────────────────────────────────────────────────────

export type CompanySize = "tpe" | "pme" | "eti" | "ge";

export type Sector =
  | "finance"
  | "insurance"
  | "retail"
  | "healthcare"
  | "manufacturing"
  | "logistics"
  | "energy"
  | "telecom"
  | "public_sector"
  | "real_estate"
  | "education"
  | "media"
  | "agri_food"
  | "pharma"
  | "consulting"
  | "tech"
  | "automotive"
  | "luxury"
  | "tourism"
  | "legal"
  | "other";

export type AiPotential = "low" | "medium" | "high";
export type Priority = "P0" | "P1" | "P2";
export type Complexity = "low" | "medium" | "high";
export type AiType = "automation" | "assistant" | "analysis" | "generation";

export interface CapabilityEntry {
  code: string;
  name: string;
  domain: string;
  aiPotential: AiPotential;
}

export interface CertificationEntry {
  code: string;
  name: string;
  framework: string;
  description: string;
}

export interface ProcessEntry {
  code: string;
  name: string;
  domain: string;
  painLevel: number; // 1–5
  aiPotential: AiPotential;
  frequency?: string;
}

export interface OpportunityEntry {
  code: string;
  title: string;
  domain: string;
  aiType: AiType;
  priority: Priority;
  complexity: Complexity;
  gainEstimate?: string;
  /** If set, only show for these sizes. Omit = show for all. */
  sizeFilter?: CompanySize[];
}

export interface SizeTuning {
  capCount: number;
  certCount: number;
  processCount: number;
  oppCount: number;
}

export interface SectorConfig {
  label: string;
  icon: string;
  description: string;
  capabilities: CapabilityEntry[];
  certifications: CertificationEntry[];
  processes: ProcessEntry[];
  opportunities: OpportunityEntry[];
  bySize: Record<CompanySize, SizeTuning>;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const defaultBySize: Record<CompanySize, SizeTuning> = {
  tpe:  { capCount: 3, certCount: 1, processCount: 3, oppCount: 2 },
  pme:  { capCount: 5, certCount: 2, processCount: 5, oppCount: 4 },
  eti:  { capCount: 8, certCount: 3, processCount: 7, oppCount: 5 },
  ge:   { capCount: 12, certCount: 5, processCount: 10, oppCount: 6 },
};

// ── Sector Catalog ────────────────────────────────────────────────────────────

export const SECTOR_CONFIG: Record<Sector, SectorConfig> = {

  // ── Finance / Banque ────────────────────────────────────────────────────────
  finance: {
    label: "Banque & Finance",
    icon: "🏦",
    description: "Établissements bancaires, gestion d'actifs et marchés financiers",
    capabilities: [
      { code: "fin-credit-scoring",     name: "Scoring de crédit",               domain: "Risque",         aiPotential: "high"   },
      { code: "fin-fraud-detection",    name: "Détection de fraude",              domain: "Sécurité",       aiPotential: "high"   },
      { code: "fin-kyc",                name: "KYC & Conformité client",          domain: "Conformité",     aiPotential: "high"   },
      { code: "fin-reporting",          name: "Reporting réglementaire",           domain: "Conformité",     aiPotential: "medium" },
      { code: "fin-wealth-mgmt",        name: "Gestion de patrimoine",            domain: "Conseil",        aiPotential: "high"   },
      { code: "fin-loan-origination",   name: "Origination de crédit",            domain: "Opérations",     aiPotential: "high"   },
      { code: "fin-treasury",           name: "Gestion de trésorerie",            domain: "Finance",        aiPotential: "medium" },
      { code: "fin-customer-support",   name: "Support client bancaire",          domain: "Service client", aiPotential: "high"   },
      { code: "fin-market-risk",        name: "Analyse du risque de marché",      domain: "Risque",         aiPotential: "high"   },
      { code: "fin-aml",                name: "Lutte contre le blanchiment",      domain: "Conformité",     aiPotential: "high"   },
      { code: "fin-product-mgmt",       name: "Gestion des produits financiers",  domain: "Produits",       aiPotential: "medium" },
      { code: "fin-data-governance",    name: "Gouvernance des données",          domain: "Data",           aiPotential: "medium" },
    ],
    certifications: [
      { code: "cert-dora",     name: "DORA (Digital Operational Resilience Act)", framework: "EU",     description: "Résilience opérationnelle numérique pour les entités financières" },
      { code: "cert-pci-dss",  name: "PCI-DSS",                                   framework: "PCI",    description: "Sécurité des données de l'industrie des cartes de paiement" },
      { code: "cert-bale3",    name: "Bâle III / CRR2",                           framework: "BCBS",   description: "Exigences de fonds propres et de liquidité" },
      { code: "cert-gdpr",     name: "RGPD",                                      framework: "EU",     description: "Protection des données personnelles" },
      { code: "cert-iso27001", name: "ISO 27001",                                 framework: "ISO",    description: "Management de la sécurité de l'information" },
    ],
    processes: [
      { code: "fin-p-credit-review",   name: "Instruction de dossier de crédit",    domain: "Risque",         painLevel: 4, aiPotential: "high",   frequency: "daily"   },
      { code: "fin-p-kyc-onboard",     name: "Onboarding client KYC",               domain: "Conformité",     painLevel: 5, aiPotential: "high",   frequency: "daily"   },
      { code: "fin-p-fraud-alert",     name: "Traitement des alertes fraude",        domain: "Sécurité",       painLevel: 4, aiPotential: "high",   frequency: "realtime" },
      { code: "fin-p-reg-reporting",   name: "Production du reporting réglementaire",domain: "Conformité",     painLevel: 4, aiPotential: "medium", frequency: "monthly" },
      { code: "fin-p-customer-svc",    name: "Gestion des réclamations clients",     domain: "Service client", painLevel: 3, aiPotential: "high",   frequency: "daily"   },
      { code: "fin-p-reconciliation",  name: "Réconciliation comptable",             domain: "Finance",        painLevel: 3, aiPotential: "medium", frequency: "daily"   },
      { code: "fin-p-loan-processing", name: "Traitement des prêts immobiliers",     domain: "Opérations",     painLevel: 4, aiPotential: "high",   frequency: "weekly"  },
      { code: "fin-p-aml-monitoring",  name: "Surveillance LCB-FT",                 domain: "Conformité",     painLevel: 5, aiPotential: "high",   frequency: "realtime" },
      { code: "fin-p-treasury-mgmt",   name: "Optimisation de la trésorerie",        domain: "Finance",        painLevel: 3, aiPotential: "medium", frequency: "daily"   },
      { code: "fin-p-contract-review", name: "Revue des contrats bancaires",         domain: "Juridique",      painLevel: 3, aiPotential: "high",   frequency: "weekly"  },
    ],
    opportunities: [
      { code: "fin-opp-credit-ai",       title: "IA de scoring crédit automatisé",                domain: "Risque",         aiType: "analysis",    priority: "P0", complexity: "medium", gainEstimate: "-60% temps d'instruction" },
      { code: "fin-opp-kyc-ocr",         title: "Automatisation KYC par OCR & NLP",               domain: "Conformité",     aiType: "automation",  priority: "P0", complexity: "medium", gainEstimate: "-70% temps onboarding"    },
      { code: "fin-opp-fraud-ml",        title: "Détection fraude par ML en temps réel",           domain: "Sécurité",       aiType: "analysis",    priority: "P0", complexity: "high",   gainEstimate: "-40% faux positifs"       },
      { code: "fin-opp-chatbot",         title: "Assistant virtuel pour conseillers bancaires",    domain: "Service client", aiType: "assistant",   priority: "P1", complexity: "low",    gainEstimate: "+30% satisfaction client" },
      { code: "fin-opp-report-gen",      title: "Génération automatique de reporting réglementaire",domain: "Conformité",    aiType: "generation",  priority: "P1", complexity: "medium", gainEstimate: "-80% temps de production" },
      { code: "fin-opp-contract-review", title: "Revue automatisée des contrats",                  domain: "Juridique",      aiType: "analysis",    priority: "P1", complexity: "medium", gainEstimate: "-50% coût revue"          },
      { code: "fin-opp-aml-ai",          title: "Analyse LCB-FT augmentée par IA",                domain: "Conformité",     aiType: "analysis",    priority: "P0", complexity: "high",   sizeFilter: ["eti", "ge"]                },
    ],
    bySize: {
      tpe:  { capCount: 3, certCount: 1, processCount: 3, oppCount: 2 },
      pme:  { capCount: 5, certCount: 2, processCount: 5, oppCount: 3 },
      eti:  { capCount: 8, certCount: 3, processCount: 7, oppCount: 5 },
      ge:   { capCount: 12, certCount: 5, processCount: 10, oppCount: 7 },
    },
  },

  // ── Assurance ───────────────────────────────────────────────────────────────
  insurance: {
    label: "Assurance",
    icon: "🛡️",
    description: "Compagnies d'assurance, mutuelles et courtiers",
    capabilities: [
      { code: "ins-underwriting",      name: "Souscription & tarification",       domain: "Souscription",   aiPotential: "high"   },
      { code: "ins-claims-mgmt",       name: "Gestion des sinistres",             domain: "Sinistres",      aiPotential: "high"   },
      { code: "ins-fraud-detection",   name: "Détection de fraude",               domain: "Fraude",         aiPotential: "high"   },
      { code: "ins-customer-svc",      name: "Service client & contrats",         domain: "Service client", aiPotential: "high"   },
      { code: "ins-actuarial",         name: "Modélisation actuarielle",          domain: "Risque",         aiPotential: "medium" },
      { code: "ins-compliance",        name: "Conformité réglementaire",          domain: "Conformité",     aiPotential: "medium" },
      { code: "ins-distribution",      name: "Distribution & courtage digital",   domain: "Commercial",     aiPotential: "high"   },
      { code: "ins-product-dev",       name: "Développement produits assurantiels",domain: "Produits",       aiPotential: "medium" },
    ],
    certifications: [
      { code: "cert-solvency2",  name: "Solvabilité II",  framework: "EU",     description: "Exigences prudentielles pour les assureurs européens" },
      { code: "cert-ias17",      name: "IFRS 17",         framework: "IASB",   description: "Norme comptable internationale pour les contrats d'assurance" },
      { code: "cert-gdpr",       name: "RGPD",            framework: "EU",     description: "Protection des données personnelles" },
      { code: "cert-iso27001",   name: "ISO 27001",       framework: "ISO",    description: "Management de la sécurité de l'information" },
    ],
    processes: [
      { code: "ins-p-claim-intake",     name: "Ouverture de sinistre",             domain: "Sinistres",      painLevel: 4, aiPotential: "high",   frequency: "daily"  },
      { code: "ins-p-claim-assessment", name: "Évaluation et chiffrage sinistre",  domain: "Sinistres",      painLevel: 4, aiPotential: "high",   frequency: "daily"  },
      { code: "ins-p-underwriting",     name: "Souscription et tarification",      domain: "Souscription",   painLevel: 4, aiPotential: "high",   frequency: "daily"  },
      { code: "ins-p-fraud-check",      name: "Détection et investigation fraude", domain: "Fraude",         painLevel: 3, aiPotential: "high",   frequency: "daily"  },
      { code: "ins-p-policy-mgmt",      name: "Gestion des contrats",              domain: "Service client", painLevel: 3, aiPotential: "medium", frequency: "daily"  },
      { code: "ins-p-regulatory-rep",   name: "Reporting Solvabilité II",          domain: "Conformité",     painLevel: 4, aiPotential: "medium", frequency: "quarterly" },
    ],
    opportunities: [
      { code: "ins-opp-claims-ai",    title: "Automatisation de l'instruction sinistre",      domain: "Sinistres",      aiType: "automation", priority: "P0", complexity: "medium", gainEstimate: "-40% délai de traitement" },
      { code: "ins-opp-underwriting", title: "Tarification intelligente par ML",               domain: "Souscription",   aiType: "analysis",   priority: "P0", complexity: "high",   gainEstimate: "-15% ratio sinistres/primes" },
      { code: "ins-opp-fraud-ml",     title: "Détection fraude sinistre par IA",               domain: "Fraude",         aiType: "analysis",   priority: "P0", complexity: "medium", gainEstimate: "-30% fraude non détectée" },
      { code: "ins-opp-chatbot",      title: "Assistant client déclaration sinistre",          domain: "Service client", aiType: "assistant",  priority: "P1", complexity: "low",    gainEstimate: "+25% NPS" },
      { code: "ins-opp-doc-analysis", title: "Analyse automatique des pièces justificatives",  domain: "Sinistres",      aiType: "automation", priority: "P1", complexity: "medium", gainEstimate: "-60% saisie manuelle" },
    ],
    bySize: defaultBySize,
  },

  // ── Distribution & Commerce ─────────────────────────────────────────────────
  retail: {
    label: "Distribution & Commerce",
    icon: "🛒",
    description: "Commerce de détail, e-commerce et grande distribution",
    capabilities: [
      { code: "ret-demand-forecast",  name: "Prévision de la demande",           domain: "Supply Chain",   aiPotential: "high"   },
      { code: "ret-pricing",          name: "Pricing dynamique",                 domain: "Commercial",     aiPotential: "high"   },
      { code: "ret-inventory",        name: "Gestion des stocks",                domain: "Supply Chain",   aiPotential: "high"   },
      { code: "ret-customer360",      name: "Vue client 360°",                   domain: "Marketing",      aiPotential: "high"   },
      { code: "ret-merchandising",    name: "Merchandising & assortiment",       domain: "Commercial",     aiPotential: "medium" },
      { code: "ret-loyalty",          name: "Programme de fidélité",             domain: "Marketing",      aiPotential: "medium" },
      { code: "ret-ecommerce",        name: "Canal e-commerce",                  domain: "Digital",        aiPotential: "high"   },
      { code: "ret-store-ops",        name: "Opérations magasin",                domain: "Opérations",     aiPotential: "medium" },
      { code: "ret-returns",          name: "Gestion des retours",               domain: "Logistique",     aiPotential: "medium" },
    ],
    certifications: [
      { code: "cert-gdpr",    name: "RGPD",     framework: "EU",  description: "Protection des données clients" },
      { code: "cert-pci-dss", name: "PCI-DSS",  framework: "PCI", description: "Sécurité paiement en ligne" },
      { code: "cert-iso9001", name: "ISO 9001", framework: "ISO", description: "Management de la qualité" },
    ],
    processes: [
      { code: "ret-p-order-mgmt",     name: "Gestion des commandes",             domain: "Opérations",   painLevel: 3, aiPotential: "high",   frequency: "daily"   },
      { code: "ret-p-replenishment",  name: "Réapprovisionnement automatique",    domain: "Supply Chain", painLevel: 4, aiPotential: "high",   frequency: "daily"   },
      { code: "ret-p-pricing-review", name: "Révision des prix et promotions",    domain: "Commercial",   painLevel: 3, aiPotential: "high",   frequency: "weekly"  },
      { code: "ret-p-customer-svc",   name: "Service après-vente",               domain: "SAV",          painLevel: 3, aiPotential: "high",   frequency: "daily"   },
      { code: "ret-p-returns",        name: "Traitement des retours produits",    domain: "Logistique",   painLevel: 3, aiPotential: "medium", frequency: "daily"   },
      { code: "ret-p-promo-plan",     name: "Planification promotionnelle",       domain: "Marketing",    painLevel: 4, aiPotential: "medium", frequency: "monthly" },
    ],
    opportunities: [
      { code: "ret-opp-forecast",       title: "Prévision de la demande par IA",                  domain: "Supply Chain", aiType: "analysis",    priority: "P0", complexity: "medium", gainEstimate: "-20% ruptures de stock" },
      { code: "ret-opp-dynamic-price",  title: "Pricing dynamique et promotion intelligente",      domain: "Commercial",   aiType: "analysis",    priority: "P0", complexity: "medium", gainEstimate: "+8% marge brute" },
      { code: "ret-opp-recommender",    title: "Moteur de recommandation produit personnalisé",    domain: "Marketing",    aiType: "analysis",    priority: "P1", complexity: "medium", gainEstimate: "+15% panier moyen" },
      { code: "ret-opp-chatbot",        title: "Assistant e-commerce conversationnel",             domain: "Digital",      aiType: "assistant",   priority: "P1", complexity: "low",    gainEstimate: "+20% taux de conversion" },
      { code: "ret-opp-returns-ai",     title: "Automatisation du traitement des retours",         domain: "Logistique",   aiType: "automation",  priority: "P2", complexity: "low",    gainEstimate: "-30% coût de traitement" },
    ],
    bySize: defaultBySize,
  },

  // ── Santé ───────────────────────────────────────────────────────────────────
  healthcare: {
    label: "Santé",
    icon: "🏥",
    description: "Hôpitaux, cliniques, établissements de soins et e-santé",
    capabilities: [
      { code: "hlt-clinical-ops",     name: "Opérations cliniques",              domain: "Soins",          aiPotential: "medium" },
      { code: "hlt-medical-imaging",  name: "Imagerie médicale",                 domain: "Diagnostic",     aiPotential: "high"   },
      { code: "hlt-patient-journey",  name: "Parcours patient",                  domain: "Soins",          aiPotential: "high"   },
      { code: "hlt-admin",            name: "Gestion administrative",            domain: "Administration", aiPotential: "high"   },
      { code: "hlt-pharmacy",         name: "Gestion pharmaceutique",            domain: "Pharmacie",      aiPotential: "medium" },
      { code: "hlt-telemedicine",     name: "Télémédecine",                      domain: "Digital",        aiPotential: "high"   },
      { code: "hlt-clinical-research",name: "Recherche clinique",                domain: "Recherche",      aiPotential: "high"   },
      { code: "hlt-billing",          name: "Facturation et T2A",                domain: "Finance",        aiPotential: "high"   },
    ],
    certifications: [
      { code: "cert-hds",     name: "HDS (Hébergeur de Données de Santé)", framework: "ANS",   description: "Certification obligatoire pour l'hébergement des données de santé" },
      { code: "cert-gdpr",    name: "RGPD",                                framework: "EU",    description: "Protection des données personnelles de santé" },
      { code: "cert-iso27001",name: "ISO 27001",                           framework: "ISO",   description: "Sécurité de l'information" },
      { code: "cert-dmi",     name: "Programme HOP'EN",                    framework: "DGOS",  description: "Niveau de maturité numérique des hôpitaux" },
    ],
    processes: [
      { code: "hlt-p-admission",    name: "Admission et prise en charge patient",  domain: "Administration", painLevel: 4, aiPotential: "high",   frequency: "daily"   },
      { code: "hlt-p-discharge",    name: "Sortie et compte-rendu d'hospitalisation",domain: "Soins",         painLevel: 4, aiPotential: "high",   frequency: "daily"   },
      { code: "hlt-p-scheduling",   name: "Planification des blocs et consultations",domain: "Opérations",    painLevel: 5, aiPotential: "high",   frequency: "daily"   },
      { code: "hlt-p-billing",      name: "Facturation et codification T2A",        domain: "Finance",        painLevel: 4, aiPotential: "high",   frequency: "daily"   },
      { code: "hlt-p-prescription", name: "Prescription et dispensation médicaments",domain: "Pharmacie",     painLevel: 3, aiPotential: "medium", frequency: "daily"   },
      { code: "hlt-p-reporting",    name: "Reporting qualité et indicateurs",        domain: "Qualité",        painLevel: 3, aiPotential: "medium", frequency: "monthly" },
    ],
    opportunities: [
      { code: "hlt-opp-scheduling",     title: "Optimisation IA des plannings et blocs opératoires",   domain: "Opérations", aiType: "analysis",   priority: "P0", complexity: "high",   gainEstimate: "+15% utilisation des blocs" },
      { code: "hlt-opp-coding",         title: "Aide à la codification T2A automatisée",                domain: "Finance",    aiType: "automation", priority: "P0", complexity: "medium", gainEstimate: "-40% erreurs de codification" },
      { code: "hlt-opp-discharge-doc",  title: "Génération des comptes rendus de sortie par IA",        domain: "Soins",      aiType: "generation", priority: "P1", complexity: "medium", gainEstimate: "-60% temps de rédaction" },
      { code: "hlt-opp-chatbot",        title: "Assistant administratif pour patients",                  domain: "Digital",    aiType: "assistant",  priority: "P1", complexity: "low",    gainEstimate: "-25% appels administratifs" },
      { code: "hlt-opp-readmission",    title: "Prédiction des risques de réhospitalisation",           domain: "Soins",      aiType: "analysis",   priority: "P1", complexity: "high",   gainEstimate: "-20% réadmissions évitables", sizeFilter: ["eti", "ge"] },
    ],
    bySize: defaultBySize,
  },

  // ── Industrie & Manufacturing ───────────────────────────────────────────────
  manufacturing: {
    label: "Industrie & Manufacturing",
    icon: "🏭",
    description: "Industrie manufacturière, équipementiers et sous-traitants",
    capabilities: [
      { code: "mfg-production-planning",  name: "Planification de la production",    domain: "Production",     aiPotential: "high"   },
      { code: "mfg-quality-control",      name: "Contrôle qualité",                  domain: "Qualité",        aiPotential: "high"   },
      { code: "mfg-predictive-maint",     name: "Maintenance prédictive",            domain: "Maintenance",    aiPotential: "high"   },
      { code: "mfg-supply-chain",         name: "Gestion de la chaîne logistique",   domain: "Supply Chain",   aiPotential: "high"   },
      { code: "mfg-r-and-d",              name: "Recherche & développement produit", domain: "R&D",            aiPotential: "medium" },
      { code: "mfg-energy-mgmt",          name: "Gestion de l'énergie",              domain: "Énergie",        aiPotential: "medium" },
      { code: "mfg-inventory",            name: "Gestion des stocks et pièces",      domain: "Supply Chain",   aiPotential: "medium" },
      { code: "mfg-workforce-mgmt",       name: "Gestion des ressources humaines",   domain: "RH",             aiPotential: "medium" },
    ],
    certifications: [
      { code: "cert-iso9001",   name: "ISO 9001",   framework: "ISO", description: "Système de management de la qualité" },
      { code: "cert-iso14001",  name: "ISO 14001",  framework: "ISO", description: "Système de management environnemental" },
      { code: "cert-iso45001",  name: "ISO 45001",  framework: "ISO", description: "Santé et sécurité au travail" },
      { code: "cert-iatf16949", name: "IATF 16949", framework: "IATF",description: "Qualité dans l'industrie automobile (si applicable)" },
    ],
    processes: [
      { code: "mfg-p-production",      name: "Ordonnancement et suivi de production",  domain: "Production",   painLevel: 4, aiPotential: "high",   frequency: "daily"   },
      { code: "mfg-p-quality",         name: "Contrôle qualité en ligne",              domain: "Qualité",      painLevel: 4, aiPotential: "high",   frequency: "daily"   },
      { code: "mfg-p-maintenance",     name: "Maintenance corrective et préventive",   domain: "Maintenance",  painLevel: 4, aiPotential: "high",   frequency: "daily"   },
      { code: "mfg-p-procurement",     name: "Approvisionnement et achats",            domain: "Achats",       painLevel: 3, aiPotential: "medium", frequency: "weekly"  },
      { code: "mfg-p-inventory",       name: "Gestion des stocks et magasin",          domain: "Supply Chain", painLevel: 3, aiPotential: "medium", frequency: "daily"   },
      { code: "mfg-p-energy",          name: "Suivi et optimisation énergétique",      domain: "Énergie",      painLevel: 3, aiPotential: "medium", frequency: "daily"   },
      { code: "mfg-p-non-conformity",  name: "Traitement des non-conformités",         domain: "Qualité",      painLevel: 4, aiPotential: "medium", frequency: "daily"   },
    ],
    opportunities: [
      { code: "mfg-opp-pred-maint",   title: "Maintenance prédictive par IA sur équipements critiques",   domain: "Maintenance",  aiType: "analysis",   priority: "P0", complexity: "high",   gainEstimate: "-30% arrêts non planifiés" },
      { code: "mfg-opp-quality-cv",   title: "Contrôle qualité par vision par ordinateur",                domain: "Qualité",      aiType: "automation", priority: "P0", complexity: "high",   gainEstimate: "-50% défauts non détectés" },
      { code: "mfg-opp-demand-plan",  title: "Prévision de la demande et planification production IA",     domain: "Production",   aiType: "analysis",   priority: "P1", complexity: "medium", gainEstimate: "-15% coûts de stockage" },
      { code: "mfg-opp-energy-ai",    title: "Optimisation de la consommation énergétique",                domain: "Énergie",      aiType: "analysis",   priority: "P1", complexity: "medium", gainEstimate: "-20% consommation énergie" },
      { code: "mfg-opp-copilot-ops",  title: "Copilote opérateur pour assistance à la production",        domain: "Production",   aiType: "assistant",  priority: "P2", complexity: "medium", gainEstimate: "+10% productivité opérateurs" },
    ],
    bySize: defaultBySize,
  },

  // ── Logistique & Transport ──────────────────────────────────────────────────
  logistics: {
    label: "Logistique & Transport",
    icon: "🚚",
    description: "Transporteurs, opérateurs logistiques et commissionnaires",
    capabilities: [
      { code: "log-route-optimization",  name: "Optimisation des tournées",           domain: "Transport",    aiPotential: "high"   },
      { code: "log-fleet-mgmt",          name: "Gestion de flotte",                   domain: "Transport",    aiPotential: "high"   },
      { code: "log-warehouse-ops",       name: "Opérations entrepôt",                 domain: "Entrepôt",     aiPotential: "high"   },
      { code: "log-last-mile",           name: "Livraison du dernier kilomètre",       domain: "Livraison",    aiPotential: "high"   },
      { code: "log-customs",             name: "Dédouanement & conformité",           domain: "Conformité",   aiPotential: "medium" },
      { code: "log-track-trace",         name: "Suivi & traçabilité",                 domain: "Opérations",   aiPotential: "medium" },
      { code: "log-demand-forecast",     name: "Prévision de la demande transport",   domain: "Planification",aiPotential: "high"   },
    ],
    certifications: [
      { code: "cert-iso9001",  name: "ISO 9001",  framework: "ISO",   description: "Management de la qualité" },
      { code: "cert-gdpr",     name: "RGPD",      framework: "EU",    description: "Protection des données" },
      { code: "cert-aeo",      name: "OEA",       framework: "Douanes", description: "Opérateur Économique Agréé" },
    ],
    processes: [
      { code: "log-p-transport-plan",  name: "Planification et optimisation des tournées", domain: "Transport",  painLevel: 4, aiPotential: "high",   frequency: "daily"  },
      { code: "log-p-warehouse",       name: "Gestion opérationnelle de l'entrepôt",       domain: "Entrepôt",   painLevel: 3, aiPotential: "high",   frequency: "daily"  },
      { code: "log-p-delivery",        name: "Livraison et preuve de dépôt",               domain: "Livraison",  painLevel: 3, aiPotential: "medium", frequency: "daily"  },
      { code: "log-p-customs",         name: "Dédouanement et conformité documentaire",    domain: "Conformité", painLevel: 4, aiPotential: "medium", frequency: "daily"  },
      { code: "log-p-tracking",        name: "Suivi en temps réel et gestion des aléas",   domain: "Opérations", painLevel: 4, aiPotential: "high",   frequency: "realtime" },
    ],
    opportunities: [
      { code: "log-opp-routing",    title: "Optimisation IA des tournées de livraison",              domain: "Transport",  aiType: "analysis",   priority: "P0", complexity: "medium", gainEstimate: "-15% coûts carburant" },
      { code: "log-opp-etd",        title: "Prédiction des délais de livraison en temps réel",       domain: "Opérations", aiType: "analysis",   priority: "P0", complexity: "medium", gainEstimate: "+20% satisfaction client" },
      { code: "log-opp-wms-ai",     title: "Optimisation de l'espace et des flux entrepôt",         domain: "Entrepôt",   aiType: "analysis",   priority: "P1", complexity: "high",   gainEstimate: "-10% coûts de picking" },
      { code: "log-opp-customs-ai", title: "Automatisation des déclarations douanières",             domain: "Conformité", aiType: "automation", priority: "P1", complexity: "medium", gainEstimate: "-50% temps de dédouanement" },
    ],
    bySize: defaultBySize,
  },

  // ── Énergie & Utilities ─────────────────────────────────────────────────────
  energy: {
    label: "Énergie & Utilities",
    icon: "⚡",
    description: "Producteurs, distributeurs d'énergie et utilities",
    capabilities: [
      { code: "egy-grid-mgmt",        name: "Gestion du réseau",                  domain: "Réseau",         aiPotential: "high"   },
      { code: "egy-asset-mgmt",       name: "Gestion des actifs industriels",     domain: "Actifs",         aiPotential: "high"   },
      { code: "egy-demand-forecast",  name: "Prévision de la consommation",       domain: "Planification",  aiPotential: "high"   },
      { code: "egy-renewable-int",    name: "Intégration des énergies renouvelables",domain: "Réseau",       aiPotential: "high"   },
      { code: "egy-customer-mgmt",    name: "Gestion des clients",                domain: "Commercial",     aiPotential: "medium" },
      { code: "egy-regulation",       name: "Conformité réglementaire",           domain: "Conformité",     aiPotential: "medium" },
    ],
    certifications: [
      { code: "cert-iso50001", name: "ISO 50001",    framework: "ISO",   description: "Système de management de l'énergie" },
      { code: "cert-iec62443", name: "IEC 62443",    framework: "IEC",   description: "Cybersécurité des systèmes industriels" },
      { code: "cert-nis2",     name: "NIS 2",        framework: "EU",    description: "Sécurité des réseaux et systèmes d'information" },
      { code: "cert-iso14001", name: "ISO 14001",    framework: "ISO",   description: "Management environnemental" },
    ],
    processes: [
      { code: "egy-p-grid-control",   name: "Supervision et contrôle du réseau",      domain: "Réseau",        painLevel: 4, aiPotential: "high",   frequency: "realtime" },
      { code: "egy-p-maintenance",    name: "Maintenance des actifs et équipements",   domain: "Actifs",        painLevel: 4, aiPotential: "high",   frequency: "daily"    },
      { code: "egy-p-billing",        name: "Facturation et gestion clients",          domain: "Commercial",    painLevel: 3, aiPotential: "medium", frequency: "monthly"  },
      { code: "egy-p-forecast",       name: "Prévision de la production et demande",   domain: "Planification", painLevel: 3, aiPotential: "high",   frequency: "daily"    },
      { code: "egy-p-incident",       name: "Gestion des incidents réseau",            domain: "Réseau",        painLevel: 4, aiPotential: "medium", frequency: "daily"    },
    ],
    opportunities: [
      { code: "egy-opp-pred-maint",  title: "Maintenance prédictive des actifs réseau",         domain: "Actifs",        aiType: "analysis",   priority: "P0", complexity: "high",   gainEstimate: "-25% coûts de maintenance" },
      { code: "egy-opp-forecast",    title: "Prévision IA de la consommation et production",    domain: "Planification", aiType: "analysis",   priority: "P0", complexity: "medium", gainEstimate: "-10% déséquilibres réseau" },
      { code: "egy-opp-chatbot",     title: "Assistant client intelligent",                     domain: "Commercial",    aiType: "assistant",  priority: "P1", complexity: "low",    gainEstimate: "-30% appels entrants" },
      { code: "egy-opp-anomaly",     title: "Détection d'anomalies et fraude réseau",           domain: "Réseau",        aiType: "analysis",   priority: "P1", complexity: "high",   gainEstimate: "-20% pertes réseau" },
    ],
    bySize: defaultBySize,
  },

  // ── Télécommunications ──────────────────────────────────────────────────────
  telecom: {
    label: "Télécommunications",
    icon: "📡",
    description: "Opérateurs télécom, FAI et infrastructure réseau",
    capabilities: [
      { code: "tel-network-ops",    name: "Opérations réseau",                  domain: "Réseau",       aiPotential: "high"   },
      { code: "tel-customer-svc",   name: "Service client",                     domain: "Commercial",   aiPotential: "high"   },
      { code: "tel-billing",        name: "Facturation & BSS",                  domain: "Finance",      aiPotential: "medium" },
      { code: "tel-provisioning",   name: "Provisioning et activation",         domain: "Technique",    aiPotential: "high"   },
      { code: "tel-fraud-mgmt",     name: "Gestion de la fraude",               domain: "Sécurité",     aiPotential: "high"   },
      { code: "tel-noc",            name: "Centre opérationnel réseau (NOC)",   domain: "Réseau",       aiPotential: "high"   },
    ],
    certifications: [
      { code: "cert-gdpr",    name: "RGPD",     framework: "EU",  description: "Protection des données clients" },
      { code: "cert-nis2",    name: "NIS 2",    framework: "EU",  description: "Sécurité des réseaux critiques" },
      { code: "cert-iso27001",name: "ISO 27001",framework: "ISO", description: "Sécurité de l'information" },
    ],
    processes: [
      { code: "tel-p-incident",     name: "Gestion des incidents réseau",          domain: "Réseau",     painLevel: 5, aiPotential: "high",   frequency: "realtime" },
      { code: "tel-p-provisioning", name: "Activation des services clients",       domain: "Technique",  painLevel: 3, aiPotential: "high",   frequency: "daily"    },
      { code: "tel-p-billing",      name: "Facturation et gestion des litiges",    domain: "Finance",    painLevel: 3, aiPotential: "medium", frequency: "monthly"  },
      { code: "tel-p-churn",        name: "Gestion du risque de churn",            domain: "Commercial", painLevel: 4, aiPotential: "high",   frequency: "monthly"  },
      { code: "tel-p-fraud",        name: "Détection et blocage de la fraude",     domain: "Sécurité",   painLevel: 4, aiPotential: "high",   frequency: "realtime" },
    ],
    opportunities: [
      { code: "tel-opp-noc-ai",    title: "NOC augmenté par IA — anomalie et remédiation",      domain: "Réseau",     aiType: "analysis",   priority: "P0", complexity: "high",   gainEstimate: "-40% MTTR" },
      { code: "tel-opp-churn",     title: "Prédiction et prévention du churn client",            domain: "Commercial", aiType: "analysis",   priority: "P0", complexity: "medium", gainEstimate: "-15% taux de churn" },
      { code: "tel-opp-chatbot",   title: "Assistant virtuel niveau 1 support client",           domain: "Commercial", aiType: "assistant",  priority: "P1", complexity: "low",    gainEstimate: "-35% appels support" },
      { code: "tel-opp-fraud",     title: "Détection fraude temps réel par ML",                  domain: "Sécurité",   aiType: "analysis",   priority: "P0", complexity: "high",   gainEstimate: "-25% revenus perdus fraude" },
    ],
    bySize: defaultBySize,
  },

  // ── Secteur Public ──────────────────────────────────────────────────────────
  public_sector: {
    label: "Secteur Public",
    icon: "🏛️",
    description: "Collectivités, administrations et services publics",
    capabilities: [
      { code: "pub-citizen-svc",     name: "Service aux usagers",               domain: "Usagers",      aiPotential: "high"   },
      { code: "pub-admin-mgmt",      name: "Gestion administrative",            domain: "Administration",aiPotential: "high"   },
      { code: "pub-procurement",     name: "Marchés publics",                   domain: "Achats",       aiPotential: "medium" },
      { code: "pub-hr-mgmt",         name: "Gestion des ressources humaines",   domain: "RH",           aiPotential: "medium" },
      { code: "pub-data-governance", name: "Gouvernance des données publiques",  domain: "Data",         aiPotential: "medium" },
      { code: "pub-compliance",      name: "Conformité réglementaire",          domain: "Conformité",   aiPotential: "medium" },
    ],
    certifications: [
      { code: "cert-gdpr",      name: "RGPD",        framework: "EU",    description: "Protection des données personnelles" },
      { code: "cert-secnum",    name: "SecNumCloud",  framework: "ANSSI", description: "Qualification cloud souverain français" },
      { code: "cert-ria",       name: "RGS",          framework: "ANSSI", description: "Référentiel général de sécurité" },
      { code: "cert-hds",       name: "HDS",          framework: "ANS",   description: "Hébergement de données de santé (si applicable)" },
    ],
    processes: [
      { code: "pub-p-citizen-req",   name: "Traitement des demandes usagers",    domain: "Usagers",      painLevel: 4, aiPotential: "high",   frequency: "daily"  },
      { code: "pub-p-procurement",   name: "Instruction des marchés publics",    domain: "Achats",       painLevel: 4, aiPotential: "medium", frequency: "weekly" },
      { code: "pub-p-hr",            name: "Gestion carrières et paie",          domain: "RH",           painLevel: 3, aiPotential: "medium", frequency: "monthly"},
      { code: "pub-p-reporting",     name: "Production des rapports et bilans",  domain: "Administration",painLevel: 3, aiPotential: "medium", frequency: "monthly"},
      { code: "pub-p-document-mgmt", name: "Gestion documentaire",              domain: "Administration",painLevel: 3, aiPotential: "high",   frequency: "daily"  },
    ],
    opportunities: [
      { code: "pub-opp-chatbot",     title: "Assistant virtuel pour les démarches usagers",        domain: "Usagers",       aiType: "assistant",  priority: "P0", complexity: "low",    gainEstimate: "-30% appels entrants" },
      { code: "pub-opp-doc-mgmt",    title: "Traitement automatique des courriers et formulaires", domain: "Administration", aiType: "automation", priority: "P0", complexity: "medium", gainEstimate: "-40% traitement manuel" },
      { code: "pub-opp-procurement", title: "Analyse IA des offres de marchés publics",           domain: "Achats",         aiType: "analysis",   priority: "P1", complexity: "medium", gainEstimate: "-20% coûts d'instruction" },
      { code: "pub-opp-reporting",   title: "Génération automatisée des rapports réglementaires",  domain: "Administration", aiType: "generation", priority: "P2", complexity: "low",    gainEstimate: "-60% temps de production" },
    ],
    bySize: {
      tpe:  { capCount: 3, certCount: 2, processCount: 3, oppCount: 2 },
      pme:  { capCount: 4, certCount: 2, processCount: 4, oppCount: 2 },
      eti:  { capCount: 6, certCount: 3, processCount: 5, oppCount: 3 },
      ge:   { capCount: 6, certCount: 4, processCount: 5, oppCount: 4 },
    },
  },

  // ── Immobilier & Construction ───────────────────────────────────────────────
  real_estate: {
    label: "Immobilier & Construction",
    icon: "🏗️",
    description: "Promoteurs, bailleurs, gestionnaires immobiliers et BTP",
    capabilities: [
      { code: "re-asset-mgmt",     name: "Gestion des actifs immobiliers",    domain: "Actifs",       aiPotential: "medium" },
      { code: "re-tenant-mgmt",    name: "Gestion locataire",                 domain: "Gestion",      aiPotential: "medium" },
      { code: "re-construction",   name: "Pilotage des chantiers",            domain: "Construction", aiPotential: "medium" },
      { code: "re-valuation",      name: "Évaluation et valorisation",        domain: "Finance",      aiPotential: "high"   },
      { code: "re-maintenance",    name: "Maintenance et facility management",domain: "Maintenance",  aiPotential: "medium" },
      { code: "re-transaction",    name: "Transaction et commercialisation",  domain: "Commercial",   aiPotential: "high"   },
    ],
    certifications: [
      { code: "cert-gdpr",    name: "RGPD",     framework: "EU",   description: "Protection des données" },
      { code: "cert-hqe",     name: "HQE",      framework: "Cerqual", description: "Haute qualité environnementale" },
      { code: "cert-re2020",  name: "RE 2020",  framework: "DHUP",  description: "Réglementation environnementale bâtiment" },
    ],
    processes: [
      { code: "re-p-lease-mgmt",    name: "Gestion des baux et quittancements",  domain: "Gestion",    painLevel: 3, aiPotential: "medium", frequency: "monthly" },
      { code: "re-p-maintenance",   name: "Traitement des demandes de travaux",  domain: "Maintenance",painLevel: 3, aiPotential: "medium", frequency: "daily"   },
      { code: "re-p-valuation",     name: "Expertise et valorisation des biens", domain: "Finance",    painLevel: 3, aiPotential: "high",   frequency: "weekly"  },
      { code: "re-p-construction",  name: "Suivi d'avancement chantier",         domain: "Construction",painLevel: 4, aiPotential: "medium", frequency: "daily"   },
    ],
    opportunities: [
      { code: "re-opp-valuation-ai",  title: "Estimation automatique des valeurs immobilières",   domain: "Finance",    aiType: "analysis",   priority: "P0", complexity: "medium", gainEstimate: "+30% précision d'estimation" },
      { code: "re-opp-maintenance-ai",title: "Prédiction et planification des travaux",           domain: "Maintenance",aiType: "analysis",   priority: "P1", complexity: "medium", gainEstimate: "-20% coûts de maintenance" },
      { code: "re-opp-doc-mgmt",      title: "Gestion documentaire intelligente des dossiers",    domain: "Gestion",    aiType: "automation", priority: "P1", complexity: "low",    gainEstimate: "-40% temps administratif" },
    ],
    bySize: defaultBySize,
  },

  // ── Éducation & Formation ───────────────────────────────────────────────────
  education: {
    label: "Éducation & Formation",
    icon: "🎓",
    description: "Établissements scolaires, universités, organismes de formation",
    capabilities: [
      { code: "edu-learning-mgmt",    name: "Gestion de l'apprentissage",       domain: "Pédagogie",    aiPotential: "high"   },
      { code: "edu-student-support",  name: "Accompagnement des apprenants",    domain: "Pédagogie",    aiPotential: "high"   },
      { code: "edu-curriculum",       name: "Conception des formations",        domain: "Pédagogie",    aiPotential: "medium" },
      { code: "edu-admin",            name: "Gestion administrative",           domain: "Administration",aiPotential: "high"   },
      { code: "edu-assessment",       name: "Évaluation et certification",      domain: "Pédagogie",    aiPotential: "medium" },
    ],
    certifications: [
      { code: "cert-qualiopi", name: "Qualiopi",  framework: "DGEFP",description: "Certification qualité pour les organismes de formation" },
      { code: "cert-gdpr",     name: "RGPD",      framework: "EU",   description: "Protection des données des apprenants" },
    ],
    processes: [
      { code: "edu-p-enrollment",   name: "Inscription et admission",          domain: "Administration",painLevel: 3, aiPotential: "medium", frequency: "seasonal" },
      { code: "edu-p-learning",     name: "Suivi de la progression apprenante",domain: "Pédagogie",    painLevel: 3, aiPotential: "high",   frequency: "daily"    },
      { code: "edu-p-assessment",   name: "Correction et évaluation",          domain: "Pédagogie",    painLevel: 3, aiPotential: "medium", frequency: "weekly"   },
      { code: "edu-p-reporting",    name: "Reporting pédagogique et qualité",  domain: "Qualité",      painLevel: 3, aiPotential: "medium", frequency: "quarterly"},
    ],
    opportunities: [
      { code: "edu-opp-tutor-ai",    title: "Tuteur IA adaptatif personnalisé",                    domain: "Pédagogie",    aiType: "assistant",  priority: "P0", complexity: "medium", gainEstimate: "+25% réussite des apprenants" },
      { code: "edu-opp-content-gen", title: "Génération automatique de contenus pédagogiques",    domain: "Pédagogie",    aiType: "generation", priority: "P1", complexity: "low",    gainEstimate: "-60% temps de conception" },
      { code: "edu-opp-dropout",     title: "Prédiction du décrochage et alerte précoce",         domain: "Pédagogie",    aiType: "analysis",   priority: "P1", complexity: "medium", gainEstimate: "-20% taux de décrochage" },
      { code: "edu-opp-admin",       title: "Automatisation des tâches administratives RH/Qualiopi",domain: "Administration",aiType: "automation",priority: "P2", complexity: "low",   gainEstimate: "-40% charge administrative" },
    ],
    bySize: defaultBySize,
  },

  // ── Médias & Entertainment ──────────────────────────────────────────────────
  media: {
    label: "Médias & Entertainment",
    icon: "🎬",
    description: "Presse, audiovisuel, streaming et édition numérique",
    capabilities: [
      { code: "med-content-prod",     name: "Production de contenu",            domain: "Éditorial",    aiPotential: "high"   },
      { code: "med-content-distrib",  name: "Distribution et diffusion",        domain: "Distribution", aiPotential: "medium" },
      { code: "med-audience-mgmt",    name: "Connaissance audience",            domain: "Audience",     aiPotential: "high"   },
      { code: "med-monetization",     name: "Monétisation et publicité",        domain: "Commercial",   aiPotential: "high"   },
      { code: "med-moderation",       name: "Modération des contenus",          domain: "Éditorial",    aiPotential: "high"   },
    ],
    certifications: [
      { code: "cert-gdpr",      name: "RGPD",            framework: "EU",     description: "Protection des données utilisateurs" },
      { code: "cert-dsa",       name: "DSA",             framework: "EU",     description: "Digital Services Act — modération des contenus" },
    ],
    processes: [
      { code: "med-p-content-prod",  name: "Production et publication de contenu",  domain: "Éditorial",  painLevel: 3, aiPotential: "high",   frequency: "daily"  },
      { code: "med-p-moderation",    name: "Modération et conformité des contenus", domain: "Éditorial",  painLevel: 4, aiPotential: "high",   frequency: "daily"  },
      { code: "med-p-audience",      name: "Analyse audience et comportements",     domain: "Audience",   painLevel: 3, aiPotential: "high",   frequency: "daily"  },
      { code: "med-p-ad-mgmt",       name: "Gestion et optimisation des campagnes", domain: "Commercial", painLevel: 3, aiPotential: "high",   frequency: "daily"  },
    ],
    opportunities: [
      { code: "med-opp-content-ai",   title: "Génération et enrichissement de contenus par IA",    domain: "Éditorial",  aiType: "generation", priority: "P0", complexity: "low",    gainEstimate: "+50% volume de production" },
      { code: "med-opp-moderation",   title: "Modération automatique des commentaires et UGC",    domain: "Éditorial",  aiType: "automation", priority: "P0", complexity: "medium", gainEstimate: "-80% charge de modération" },
      { code: "med-opp-recommender",  title: "Moteur de recommandation de contenus",              domain: "Audience",   aiType: "analysis",   priority: "P1", complexity: "medium", gainEstimate: "+20% temps de visionnage" },
      { code: "med-opp-ad-optim",     title: "Optimisation IA des revenus publicitaires",         domain: "Commercial", aiType: "analysis",   priority: "P1", complexity: "medium", gainEstimate: "+15% CPM" },
    ],
    bySize: defaultBySize,
  },

  // ── Agroalimentaire ─────────────────────────────────────────────────────────
  agri_food: {
    label: "Agroalimentaire",
    icon: "🌾",
    description: "Industrie agroalimentaire, coopératives et distributeurs alimentaires",
    capabilities: [
      { code: "agr-quality-safety",   name: "Qualité et sécurité alimentaire",    domain: "Qualité",      aiPotential: "high"   },
      { code: "agr-supply-chain",     name: "Traçabilité de la chaîne",           domain: "Supply Chain", aiPotential: "high"   },
      { code: "agr-production",       name: "Planification de la production",     domain: "Production",   aiPotential: "high"   },
      { code: "agr-r-and-d",          name: "R&D et développement produit",       domain: "R&D",          aiPotential: "medium" },
      { code: "agr-compliance",       name: "Conformité réglementaire",           domain: "Conformité",   aiPotential: "medium" },
    ],
    certifications: [
      { code: "cert-ifs",   name: "IFS Food",    framework: "IFS",  description: "Standard international qualité & sécurité alimentaire" },
      { code: "cert-brc",   name: "BRC/BRCGS",   framework: "BRC",  description: "Standard sécurité alimentaire grande distribution" },
      { code: "cert-iso22000", name: "ISO 22000",framework: "ISO",  description: "Management de la sécurité des denrées alimentaires" },
    ],
    processes: [
      { code: "agr-p-quality",      name: "Contrôle qualité et analyses laboratoire",  domain: "Qualité",      painLevel: 4, aiPotential: "high",   frequency: "daily"   },
      { code: "agr-p-traceability", name: "Traçabilité des lots et rappels produits",  domain: "Supply Chain", painLevel: 4, aiPotential: "high",   frequency: "daily"   },
      { code: "agr-p-production",   name: "Ordonnancement et suivi de production",     domain: "Production",   painLevel: 4, aiPotential: "high",   frequency: "daily"   },
      { code: "agr-p-procurement",  name: "Achats matières premières",                domain: "Achats",       painLevel: 3, aiPotential: "medium", frequency: "weekly"  },
    ],
    opportunities: [
      { code: "agr-opp-quality-cv",   title: "Contrôle qualité visuel par IA",                        domain: "Qualité",      aiType: "automation", priority: "P0", complexity: "high",   gainEstimate: "-40% défauts non détectés" },
      { code: "agr-opp-traceability", title: "Traçabilité intelligente et rappels automatisés",        domain: "Supply Chain", aiType: "automation", priority: "P0", complexity: "medium", gainEstimate: "-60% temps de gestion crise" },
      { code: "agr-opp-forecast",     title: "Prévision de la demande et optimisation production",    domain: "Production",   aiType: "analysis",   priority: "P1", complexity: "medium", gainEstimate: "-15% gaspillage matières" },
    ],
    bySize: defaultBySize,
  },

  // ── Pharma & Biotech ────────────────────────────────────────────────────────
  pharma: {
    label: "Pharma & Biotech",
    icon: "💊",
    description: "Industrie pharmaceutique, biotechnologies et dispositifs médicaux",
    capabilities: [
      { code: "pha-clinical-trials",   name: "Essais cliniques",                  domain: "R&D",          aiPotential: "high"   },
      { code: "pha-regulatory",        name: "Affaires réglementaires",           domain: "Conformité",   aiPotential: "high"   },
      { code: "pha-manufacturing-qa",  name: "Fabrication et contrôle qualité",   domain: "Production",   aiPotential: "high"   },
      { code: "pha-pharmacovigilance", name: "Pharmacovigilance",                 domain: "Sécurité",     aiPotential: "high"   },
      { code: "pha-supply-chain",      name: "Chaîne d'approvisionnement",        domain: "Supply Chain", aiPotential: "medium" },
      { code: "pha-r-and-d",           name: "Recherche & découverte médicaments",domain: "R&D",          aiPotential: "high"   },
    ],
    certifications: [
      { code: "cert-gmp",       name: "BPF / GMP",     framework: "EMA",    description: "Bonnes pratiques de fabrication pharmaceutique" },
      { code: "cert-ich-q10",   name: "ICH Q10",       framework: "ICH",    description: "Système pharmaceutique qualité" },
      { code: "cert-gdpr",      name: "RGPD / HIPAA",  framework: "EU/US",  description: "Protection des données de santé" },
      { code: "cert-iso13485",  name: "ISO 13485",     framework: "ISO",    description: "Systèmes de management qualité dispositifs médicaux" },
    ],
    processes: [
      { code: "pha-p-clinical-data",    name: "Gestion et analyse des données cliniques",   domain: "R&D",          painLevel: 5, aiPotential: "high",   frequency: "daily"   },
      { code: "pha-p-regulatory",       name: "Soumission et suivi réglementaire",          domain: "Conformité",   painLevel: 5, aiPotential: "high",   frequency: "monthly" },
      { code: "pha-p-pharmacovig",      name: "Traitement des cas de pharmacovigilance",    domain: "Sécurité",     painLevel: 4, aiPotential: "high",   frequency: "daily"   },
      { code: "pha-p-manufacturing-qa", name: "Contrôle qualité fabrication",               domain: "Production",   painLevel: 4, aiPotential: "high",   frequency: "daily"   },
      { code: "pha-p-supply",           name: "Gestion des stocks API et produits finis",   domain: "Supply Chain", painLevel: 3, aiPotential: "medium", frequency: "daily"   },
    ],
    opportunities: [
      { code: "pha-opp-clinical-ai",   title: "IA pour l'analyse de données cliniques",              domain: "R&D",         aiType: "analysis",   priority: "P0", complexity: "high",   gainEstimate: "-30% durée essais" },
      { code: "pha-opp-pharmacovig",   title: "Automatisation de la pharmacovigilance",              domain: "Sécurité",    aiType: "automation", priority: "P0", complexity: "medium", gainEstimate: "-50% charge traitement cas" },
      { code: "pha-opp-regulatory",    title: "Génération assistée de dossiers réglementaires",      domain: "Conformité",  aiType: "generation", priority: "P1", complexity: "high",   gainEstimate: "-25% temps de soumission" },
      { code: "pha-opp-quality-ai",    title: "Contrôle qualité intelligent en fabrication",         domain: "Production",  aiType: "automation", priority: "P1", complexity: "high",   gainEstimate: "-20% déviations qualité" },
    ],
    bySize: {
      tpe:  { capCount: 3, certCount: 2, processCount: 3, oppCount: 2 },
      pme:  { capCount: 4, certCount: 3, processCount: 4, oppCount: 3 },
      eti:  { capCount: 5, certCount: 3, processCount: 5, oppCount: 4 },
      ge:   { capCount: 6, certCount: 4, processCount: 5, oppCount: 4 },
    },
  },

  // ── Conseil & Services ──────────────────────────────────────────────────────
  consulting: {
    label: "Conseil & Services",
    icon: "💼",
    description: "Cabinets de conseil, ESN, services professionnels et freelances",
    capabilities: [
      { code: "cns-project-mgmt",    name: "Gestion de projets clients",        domain: "Delivery",    aiPotential: "medium" },
      { code: "cns-knowledge-mgmt",  name: "Gestion des connaissances",         domain: "Knowledge",   aiPotential: "high"   },
      { code: "cns-proposal-mgmt",   name: "Gestion des propositions commerciales", domain: "Commercial", aiPotential: "high"  },
      { code: "cns-talent-mgmt",     name: "Gestion des talents et staffing",   domain: "RH",          aiPotential: "medium" },
      { code: "cns-billing",         name: "Facturation et time tracking",      domain: "Finance",     aiPotential: "medium" },
      { code: "cns-delivery",        name: "Qualité du delivery et livrables",  domain: "Delivery",    aiPotential: "medium" },
    ],
    certifications: [
      { code: "cert-gdpr",    name: "RGPD",     framework: "EU",   description: "Protection des données clients" },
      { code: "cert-iso27001",name: "ISO 27001",framework: "ISO",  description: "Sécurité de l'information" },
      { code: "cert-iso9001", name: "ISO 9001", framework: "ISO",  description: "Management de la qualité" },
    ],
    processes: [
      { code: "cns-p-proposal",    name: "Réponse aux appels d'offres",         domain: "Commercial", painLevel: 4, aiPotential: "high",   frequency: "weekly"  },
      { code: "cns-p-delivery",    name: "Pilotage et livrables projet",        domain: "Delivery",   painLevel: 3, aiPotential: "medium", frequency: "daily"   },
      { code: "cns-p-staffing",    name: "Staffing et planning des consultants",domain: "RH",         painLevel: 4, aiPotential: "medium", frequency: "weekly"  },
      { code: "cns-p-billing",     name: "Facturation et suivi CRA",           domain: "Finance",    painLevel: 3, aiPotential: "medium", frequency: "monthly" },
      { code: "cns-p-knowledge",   name: "Capitalisation des connaissances",    domain: "Knowledge",  painLevel: 4, aiPotential: "high",   frequency: "weekly"  },
    ],
    opportunities: [
      { code: "cns-opp-proposal-ai",  title: "Génération assistée de propositions et réponses AO",  domain: "Commercial", aiType: "generation", priority: "P0", complexity: "low",    gainEstimate: "-50% temps de réponse AO" },
      { code: "cns-opp-knowledge",    title: "Base de connaissances augmentée par IA",               domain: "Knowledge",  aiType: "assistant",  priority: "P0", complexity: "medium", gainEstimate: "+30% réutilisation savoirs" },
      { code: "cns-opp-staffing",     title: "Matching IA consultants / missions",                   domain: "RH",         aiType: "analysis",   priority: "P1", complexity: "medium", gainEstimate: "-20% délai de staffing" },
      { code: "cns-opp-report-gen",   title: "Génération de livrables et rapports",                  domain: "Delivery",   aiType: "generation", priority: "P1", complexity: "low",    gainEstimate: "-40% temps de rédaction" },
    ],
    bySize: defaultBySize,
  },

  // ── Technologie & SaaS ──────────────────────────────────────────────────────
  tech: {
    label: "Technologie & SaaS",
    icon: "💻",
    description: "Startups tech, éditeurs de logiciels et scale-ups",
    capabilities: [
      { code: "tch-product-dev",      name: "Développement produit",             domain: "Engineering", aiPotential: "high"   },
      { code: "tch-customer-success", name: "Customer Success",                  domain: "CS",          aiPotential: "high"   },
      { code: "tch-data-science",     name: "Data Science & Analytics",          domain: "Data",        aiPotential: "high"   },
      { code: "tch-devops",           name: "DevOps & Infrastructure",           domain: "Engineering", aiPotential: "high"   },
      { code: "tch-security",         name: "Cybersécurité",                     domain: "Sécurité",    aiPotential: "high"   },
      { code: "tch-support",          name: "Support technique",                 domain: "CS",          aiPotential: "high"   },
      { code: "tch-sales",            name: "Sales & Growth",                    domain: "Commercial",  aiPotential: "medium" },
    ],
    certifications: [
      { code: "cert-soc2",    name: "SOC 2 Type II", framework: "AICPA",description: "Sécurité et confidentialité des données SaaS" },
      { code: "cert-iso27001",name: "ISO 27001",      framework: "ISO",  description: "Management de la sécurité de l'information" },
      { code: "cert-gdpr",    name: "RGPD",           framework: "EU",   description: "Protection des données personnelles" },
    ],
    processes: [
      { code: "tch-p-sprint",        name: "Cycle de développement Agile",             domain: "Engineering", painLevel: 3, aiPotential: "medium", frequency: "weekly"  },
      { code: "tch-p-bug-mgmt",      name: "Gestion des bugs et incidents prod",       domain: "Engineering", painLevel: 4, aiPotential: "high",   frequency: "daily"   },
      { code: "tch-p-support",       name: "Traitement des tickets support",           domain: "CS",          painLevel: 4, aiPotential: "high",   frequency: "daily"   },
      { code: "tch-p-onboarding",    name: "Onboarding client",                        domain: "CS",          painLevel: 3, aiPotential: "medium", frequency: "daily"   },
      { code: "tch-p-monitoring",    name: "Monitoring et alerting applicatif",        domain: "Engineering", painLevel: 3, aiPotential: "high",   frequency: "realtime"},
      { code: "tch-p-sales",         name: "Qualification et suivi commercial",        domain: "Commercial",  painLevel: 3, aiPotential: "medium", frequency: "daily"   },
    ],
    opportunities: [
      { code: "tch-opp-support-ai",   title: "Agent IA support technique niveau 1",              domain: "CS",          aiType: "assistant",  priority: "P0", complexity: "low",    gainEstimate: "-40% volume tickets humains" },
      { code: "tch-opp-code-review",  title: "Code review et génération de tests assistée",      domain: "Engineering", aiType: "automation", priority: "P0", complexity: "low",    gainEstimate: "+20% vélocité engineering" },
      { code: "tch-opp-monitoring",   title: "AIOps — anomalie et auto-remédiation",             domain: "Engineering", aiType: "analysis",   priority: "P1", complexity: "high",   gainEstimate: "-50% MTTR incidents prod" },
      { code: "tch-opp-churn",        title: "Prédiction churn et health score client",          domain: "CS",          aiType: "analysis",   priority: "P1", complexity: "medium", gainEstimate: "-15% taux de churn" },
      { code: "tch-opp-docs-gen",     title: "Génération automatisée de documentation technique",domain: "Engineering", aiType: "generation", priority: "P2", complexity: "low",    gainEstimate: "-60% charge de documentation" },
    ],
    bySize: {
      tpe:  { capCount: 3, certCount: 1, processCount: 3, oppCount: 3 },
      pme:  { capCount: 5, certCount: 2, processCount: 5, oppCount: 4 },
      eti:  { capCount: 6, certCount: 2, processCount: 6, oppCount: 5 },
      ge:   { capCount: 7, certCount: 3, processCount: 6, oppCount: 5 },
    },
  },

  // ── Automobile ──────────────────────────────────────────────────────────────
  automotive: {
    label: "Automobile",
    icon: "🚗",
    description: "Constructeurs, équipementiers et réseaux de distribution automobile",
    capabilities: [
      { code: "aut-r-and-d",          name: "Ingénierie et R&D",                 domain: "R&D",          aiPotential: "high"   },
      { code: "aut-manufacturing",    name: "Fabrication et assemblage",         domain: "Production",   aiPotential: "high"   },
      { code: "aut-quality",          name: "Qualité et homologation",           domain: "Qualité",      aiPotential: "high"   },
      { code: "aut-aftersales",       name: "Service après-vente",               domain: "SAV",          aiPotential: "high"   },
      { code: "aut-supply-chain",     name: "Supply chain et approvisionnement", domain: "Supply Chain", aiPotential: "high"   },
      { code: "aut-connected-svc",    name: "Services connectés et mobilité",    domain: "Digital",      aiPotential: "high"   },
    ],
    certifications: [
      { code: "cert-iatf16949", name: "IATF 16949", framework: "IATF",description: "Qualité industrie automobile" },
      { code: "cert-iso26262",  name: "ISO 26262",  framework: "ISO", description: "Sécurité fonctionnelle systèmes automobiles" },
      { code: "cert-csms",      name: "ISO 21434",  framework: "ISO", description: "Cybersécurité des systèmes embarqués" },
    ],
    processes: [
      { code: "aut-p-quality",        name: "Contrôle qualité et gestion APQP",    domain: "Qualité",      painLevel: 4, aiPotential: "high",   frequency: "daily"  },
      { code: "aut-p-after-sales",    name: "Diagnostic et prise en charge SAV",   domain: "SAV",          painLevel: 4, aiPotential: "high",   frequency: "daily"  },
      { code: "aut-p-supply",         name: "Gestion des approvisionnements",      domain: "Supply Chain", painLevel: 4, aiPotential: "high",   frequency: "daily"  },
      { code: "aut-p-validation",     name: "Tests et homologation véhicules",     domain: "R&D",          painLevel: 4, aiPotential: "medium", frequency: "weekly" },
    ],
    opportunities: [
      { code: "aut-opp-quality-cv",   title: "Contrôle qualité visuel en ligne d'assemblage",      domain: "Qualité",      aiType: "automation", priority: "P0", complexity: "high",   gainEstimate: "-30% défauts en fin de ligne" },
      { code: "aut-opp-pred-maint",   title: "Maintenance prédictive robots et équipements",       domain: "Production",   aiType: "analysis",   priority: "P0", complexity: "high",   gainEstimate: "-25% temps d'arrêt" },
      { code: "aut-opp-diag-ai",      title: "Diagnostic panne assisté par IA pour les techniciens",domain: "SAV",         aiType: "assistant",  priority: "P1", complexity: "medium", gainEstimate: "+20% rapidité de diagnostic" },
      { code: "aut-opp-supply-ai",    title: "Optimisation de la supply chain par IA",             domain: "Supply Chain", aiType: "analysis",   priority: "P1", complexity: "high",   gainEstimate: "-10% coûts approvisionnement", sizeFilter: ["eti", "ge"] },
    ],
    bySize: defaultBySize,
  },

  // ── Luxe & Mode ─────────────────────────────────────────────────────────────
  luxury: {
    label: "Luxe & Mode",
    icon: "💎",
    description: "Maisons de luxe, joaillerie, mode et cosmétiques premium",
    capabilities: [
      { code: "lux-brand-mgmt",      name: "Gestion de la marque",               domain: "Marketing",   aiPotential: "medium" },
      { code: "lux-client-services", name: "Services clients haute gamme",        domain: "Retail",      aiPotential: "high"   },
      { code: "lux-product-dev",     name: "Développement de collection",         domain: "Création",    aiPotential: "medium" },
      { code: "lux-supply-chain",    name: "Supply chain et sourcing",            domain: "Supply Chain",aiPotential: "medium" },
      { code: "lux-retail-ops",      name: "Opérations retail et boutiques",      domain: "Retail",      aiPotential: "medium" },
      { code: "lux-e-commerce",      name: "Commerce digital et omnicanal",       domain: "Digital",     aiPotential: "high"   },
    ],
    certifications: [
      { code: "cert-gdpr",  name: "RGPD",  framework: "EU",  description: "Protection des données clients UHNWI" },
      { code: "cert-bcorp", name: "B Corp", framework: "BLab", description: "Responsabilité sociale et environnementale" },
    ],
    processes: [
      { code: "lux-p-clienteling",   name: "Clienteling et relation client 1:1",     domain: "Retail",      painLevel: 3, aiPotential: "high",   frequency: "daily"   },
      { code: "lux-p-product-dev",   name: "Développement et validation collection",  domain: "Création",    painLevel: 3, aiPotential: "medium", frequency: "seasonal"},
      { code: "lux-p-supply",        name: "Approvisionnement matières nobles",       domain: "Supply Chain",painLevel: 4, aiPotential: "medium", frequency: "monthly" },
      { code: "lux-p-after-sales",   name: "Service après-vente et réparations",      domain: "Retail",      painLevel: 3, aiPotential: "medium", frequency: "daily"   },
    ],
    opportunities: [
      { code: "lux-opp-clienteling",  title: "Recommandation produit ultra-personnalisée",            domain: "Retail",   aiType: "analysis",   priority: "P0", complexity: "medium", gainEstimate: "+25% valeur panier" },
      { code: "lux-opp-hyper-person", title: "Personnalisation hyper-individualisée des communications",domain: "Marketing",aiType: "generation", priority: "P1", complexity: "medium", gainEstimate: "+20% engagement" },
      { code: "lux-opp-supply-trace", title: "Traçabilité matières et certificat d'authenticité NFT", domain: "Supply Chain",aiType: "automation",priority: "P2", complexity: "high",  gainEstimate: "-100% contrefaçons détectées" },
    ],
    bySize: defaultBySize,
  },

  // ── Tourisme & Hôtellerie ───────────────────────────────────────────────────
  tourism: {
    label: "Tourisme & Hôtellerie",
    icon: "✈️",
    description: "Hôtels, agences de voyages, restauration et parcs de loisirs",
    capabilities: [
      { code: "tur-revenue-mgmt",    name: "Revenue management",               domain: "Finance",     aiPotential: "high"   },
      { code: "tur-guest-exp",       name: "Expérience client & conciergerie",  domain: "Hospitality", aiPotential: "high"   },
      { code: "tur-ops",             name: "Opérations hôtelières",             domain: "Opérations",  aiPotential: "medium" },
      { code: "tur-distribution",    name: "Distribution et OTAs",              domain: "Commercial",  aiPotential: "medium" },
      { code: "tur-loyalty",         name: "Programme de fidélité",             domain: "Marketing",   aiPotential: "medium" },
    ],
    certifications: [
      { code: "cert-gdpr",   name: "RGPD",    framework: "EU",  description: "Protection données voyageurs" },
      { code: "cert-pci-dss",name: "PCI-DSS", framework: "PCI", description: "Sécurité paiements en ligne" },
    ],
    processes: [
      { code: "tur-p-booking",     name: "Gestion des réservations",          domain: "Commercial",  painLevel: 3, aiPotential: "medium", frequency: "daily"    },
      { code: "tur-p-pricing",     name: "Pricing et gestion des disponibilités",domain: "Finance",   painLevel: 4, aiPotential: "high",   frequency: "daily"    },
      { code: "tur-p-checkin",     name: "Check-in et accueil clients",        domain: "Hospitality", painLevel: 3, aiPotential: "medium", frequency: "daily"    },
      { code: "tur-p-reviews",     name: "Gestion des avis et réputation",     domain: "Marketing",   painLevel: 3, aiPotential: "high",   frequency: "daily"    },
    ],
    opportunities: [
      { code: "tur-opp-rev-mgmt",   title: "Revenue management dynamique assisté par IA",     domain: "Finance",    aiType: "analysis",  priority: "P0", complexity: "medium", gainEstimate: "+10% RevPAR" },
      { code: "tur-opp-chatbot",    title: "Concierge virtuel multilingue",                   domain: "Hospitality",aiType: "assistant", priority: "P1", complexity: "low",    gainEstimate: "+25% satisfaction client" },
      { code: "tur-opp-reputation", title: "Analyse et réponse automatique aux avis en ligne",domain: "Marketing",  aiType: "automation",priority: "P1", complexity: "low",    gainEstimate: "-70% temps gestion avis" },
    ],
    bySize: defaultBySize,
  },

  // ── Juridique & Compliance ──────────────────────────────────────────────────
  legal: {
    label: "Juridique & Compliance",
    icon: "⚖️",
    description: "Cabinets d'avocats, directions juridiques et compliance officers",
    capabilities: [
      { code: "leg-contract-mgmt",   name: "Gestion des contrats",              domain: "Juridique",   aiPotential: "high"   },
      { code: "leg-compliance",      name: "Conformité réglementaire",          domain: "Conformité",  aiPotential: "high"   },
      { code: "leg-litigation",      name: "Contentieux et litiges",            domain: "Contentieux", aiPotential: "medium" },
      { code: "leg-due-diligence",   name: "Due diligence et audit",            domain: "M&A",         aiPotential: "high"   },
      { code: "leg-ip-mgmt",         name: "Gestion de la propriété intellectuelle",domain: "PI",       aiPotential: "medium" },
    ],
    certifications: [
      { code: "cert-gdpr",    name: "RGPD",      framework: "EU",   description: "Protection des données — rôle clé DPO" },
      { code: "cert-iso27001",name: "ISO 27001", framework: "ISO",  description: "Sécurité des informations confidentielles" },
      { code: "cert-lpa",     name: "LPA/CARPA", framework: "CNB",  description: "Réglementation profession d'avocat" },
    ],
    processes: [
      { code: "leg-p-contract-review",  name: "Revue et rédaction de contrats",       domain: "Juridique",   painLevel: 5, aiPotential: "high",   frequency: "daily"   },
      { code: "leg-p-due-diligence",    name: "Due diligence documentaire",            domain: "M&A",         painLevel: 5, aiPotential: "high",   frequency: "weekly"  },
      { code: "leg-p-compliance-watch", name: "Veille réglementaire et conformité",   domain: "Conformité",  painLevel: 4, aiPotential: "high",   frequency: "weekly"  },
      { code: "leg-p-litigation",       name: "Gestion et préparation des dossiers",  domain: "Contentieux", painLevel: 4, aiPotential: "medium", frequency: "daily"   },
    ],
    opportunities: [
      { code: "leg-opp-contract-ai",    title: "Revue et analyse automatisée des contrats",          domain: "Juridique",  aiType: "analysis",   priority: "P0", complexity: "medium", gainEstimate: "-60% temps de revue" },
      { code: "leg-opp-due-diligence",  title: "Due diligence documentaire par IA",                  domain: "M&A",        aiType: "analysis",   priority: "P0", complexity: "high",   gainEstimate: "-50% charge documentaire" },
      { code: "leg-opp-compliance",     title: "Veille réglementaire et alertes conformité IA",      domain: "Conformité", aiType: "assistant",  priority: "P1", complexity: "low",    gainEstimate: "-40% risques non détectés" },
      { code: "leg-opp-doc-gen",        title: "Génération de documents juridiques standardisés",    domain: "Juridique",  aiType: "generation", priority: "P2", complexity: "low",    gainEstimate: "-50% temps de rédaction" },
    ],
    bySize: defaultBySize,
  },

  // ── Autre ───────────────────────────────────────────────────────────────────
  other: {
    label: "Autre",
    icon: "🏢",
    description: "Secteur non listé ci-dessus",
    capabilities: [
      { code: "oth-operations",    name: "Gestion opérationnelle",              domain: "Opérations",   aiPotential: "medium" },
      { code: "oth-customer-svc",  name: "Service client",                      domain: "Service client",aiPotential: "high"  },
      { code: "oth-finance-admin", name: "Administration financière",           domain: "Finance",       aiPotential: "medium" },
      { code: "oth-hr",            name: "Ressources humaines",                 domain: "RH",            aiPotential: "medium" },
      { code: "oth-reporting",     name: "Reporting et pilotage",               domain: "Management",    aiPotential: "medium" },
      { code: "oth-data-mgmt",     name: "Gestion des données",                 domain: "Data",          aiPotential: "medium" },
    ],
    certifications: [
      { code: "cert-gdpr",    name: "RGPD",     framework: "EU",  description: "Protection des données personnelles" },
      { code: "cert-iso9001", name: "ISO 9001", framework: "ISO", description: "Management de la qualité" },
    ],
    processes: [
      { code: "oth-p-customer-svc",  name: "Traitement des demandes clients",   domain: "Service client",painLevel: 3, aiPotential: "high",   frequency: "daily"   },
      { code: "oth-p-admin",         name: "Gestion administrative courante",   domain: "Administration",painLevel: 3, aiPotential: "medium", frequency: "daily"   },
      { code: "oth-p-reporting",     name: "Production des rapports de gestion",domain: "Management",    painLevel: 3, aiPotential: "medium", frequency: "monthly" },
      { code: "oth-p-hr",            name: "Onboarding et gestion RH",          domain: "RH",            painLevel: 3, aiPotential: "medium", frequency: "monthly" },
    ],
    opportunities: [
      { code: "oth-opp-chatbot",    title: "Assistant virtuel service client",                     domain: "Service client",aiType: "assistant",  priority: "P0", complexity: "low",    gainEstimate: "-30% volume demandes traitées" },
      { code: "oth-opp-admin-auto", title: "Automatisation des tâches administratives répétitives",domain: "Administration",aiType: "automation", priority: "P1", complexity: "low",    gainEstimate: "-40% temps administratif" },
      { code: "oth-opp-report-gen", title: "Génération de rapports et synthèses automatique",     domain: "Management",    aiType: "generation", priority: "P2", complexity: "low",    gainEstimate: "-60% temps de production" },
    ],
    bySize: {
      tpe:  { capCount: 3, certCount: 1, processCount: 3, oppCount: 2 },
      pme:  { capCount: 4, certCount: 1, processCount: 4, oppCount: 3 },
      eti:  { capCount: 5, certCount: 2, processCount: 5, oppCount: 3 },
      ge:   { capCount: 6, certCount: 2, processCount: 6, oppCount: 4 },
    },
  },
};

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Returns the ordered list of sectors for display in the wizard. */
export const SECTOR_LIST = Object.entries(SECTOR_CONFIG).map(([key, cfg]) => ({
  key: key as Sector,
  label: cfg.label,
  icon: cfg.icon,
  description: cfg.description,
}));

/** Slice capabilities/processes/etc. for a given sector × size. */
export function getSectorItems(sector: Sector, size: CompanySize) {
  const cfg = SECTOR_CONFIG[sector];
  const tuning = cfg.bySize[size];
  return {
    capabilities:    cfg.capabilities.slice(0, tuning.capCount),
    certifications:  cfg.certifications.slice(0, tuning.certCount),
    processes:       cfg.processes.slice(0, tuning.processCount),
    opportunities:   cfg.opportunities
      .filter(o => !o.sizeFilter || o.sizeFilter.includes(size))
      .slice(0, tuning.oppCount),
  };
}

/** Count how many items will be created for the preview panel. */
export function getSectorItemCounts(sector: Sector, size: CompanySize) {
  const items = getSectorItems(sector, size);
  return {
    capabilities:   items.capabilities.length,
    certifications: items.certifications.length,
    processes:      items.processes.length,
    opportunities:  items.opportunities.length,
    total: items.capabilities.length + items.certifications.length +
           items.processes.length    + items.opportunities.length,
  };
}
