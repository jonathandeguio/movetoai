/**
 * Global certification catalog — seeded once into CertificationCatalog.
 * Used by the onboarding wizard (step 3) and the compliance dashboard.
 *
 * Fields:
 *   sectors   — sector codes where this certification is relevant
 *   sizeMin   — minimum company sizes concerned: tpe | pme | eti | ge
 */

export interface CatalogEntry {
  code: string;
  name: string;
  shortName: string;
  family: "qualite" | "securite" | "sectorielle" | "reglementaire" | "france" | "donnees";
  description: string;
  scope: string;
  keyRequirements: string[];
  typicalProcesses: string[];
  typicalDomains: string[];
  certifyingBody?: string;
  validityYears?: number;
  auditFrequency?: string;
  isMandatory: boolean;
  mandatoryFor?: string[];
  riskIfMissing?: string;
  officialUrl?: string;
  costEstimate?: string;
  sectors?: string[];
  sizeMin?: string[];
}

// Sector codes used in sector-config.ts for cross-referencing
// finance | insurance | retail | healthcare | manufacturing | logistics |
// energy | telecom | public_sector | real_estate | education | media |
// agri_food | pharma | consulting | tech | automotive | luxury | tourism | legal | other

export const CERTIFICATION_CATALOG: CatalogEntry[] = [

  // ════════════════════════════════════════════════════════════
  // FAMILLE 1 — QUALITÉ & MANAGEMENT
  // ════════════════════════════════════════════════════════════

  {
    code: "ISO-9001",
    name: "ISO 9001:2015",
    shortName: "ISO 9001",
    family: "qualite",
    description:
      "Norme internationale pour le Système de Management de la Qualité (SMQ). " +
      "Applicable à tout type d'organisation, fournit un cadre pour améliorer " +
      "la qualité des processus, produits et services via l'amélioration continue.",
    scope:
      "Toute organisation, tout secteur. Couvre satisfaction client, " +
      "maîtrise des processus, leadership et planification stratégique.",
    keyRequirements: [
      "Contexte et parties intéressées",
      "Leadership et engagement direction",
      "Planification et gestion des risques",
      "Maîtrise des processus opérationnels",
      "Évaluation des performances et audit interne",
      "Amélioration continue",
    ],
    typicalProcesses: ["Production", "Gestion de la qualité", "Relation client", "Achats", "RH"],
    typicalDomains: ["Production", "Commercial", "RH", "Achats", "Direction"],
    certifyingBody: "AFNOR Certification · Bureau Veritas · SGS · DNV",
    validityYears: 3,
    auditFrequency: "Annuel (surveillance) + renouvellement 3 ans",
    isMandatory: false,
    sectors: ["manufacturing", "automotive", "agri_food", "pharma", "consulting", "tech", "other"],
    sizeMin: ["tpe", "pme", "eti", "ge"],
    riskIfMissing: "Exclusion de certains appels d'offres publics et privés.",
    officialUrl: "https://www.iso.org/fr/standard/62085.html",
    costEstimate: "10 000 – 25 000 €",
  },

  {
    code: "ISO-14001",
    name: "ISO 14001:2015",
    shortName: "ISO 14001",
    family: "qualite",
    description:
      "Système de Management Environnemental (SME). Aide les organisations " +
      "à améliorer leurs performances environnementales et réduire leurs impacts.",
    scope: "Organisations souhaitant maîtriser leurs impacts environnementaux.",
    keyRequirements: [
      "Identification des aspects/impacts environnementaux",
      "Conformité aux obligations légales",
      "Objectifs et programmes environnementaux",
      "Maîtrise opérationnelle",
      "Gestion des situations d'urgence",
    ],
    typicalProcesses: ["Production", "Logistique", "Achats", "Gestion des déchets", "Maintenance"],
    typicalDomains: ["Production", "Logistique", "Achats", "HSE"],
    certifyingBody: "AFNOR · Bureau Veritas · SGS · Intertek",
    validityYears: 3,
    auditFrequency: "Annuel",
    isMandatory: false,
    sectors: ["manufacturing", "automotive", "energy", "agri_food"],
    sizeMin: ["pme", "eti", "ge"],
    riskIfMissing: "Difficultés à répondre aux exigences RSE des donneurs d'ordre (CSRD).",
    officialUrl: "https://www.iso.org/fr/standard/60857.html",
    costEstimate: "8 000 – 20 000 €",
  },

  {
    code: "ISO-45001",
    name: "ISO 45001:2018",
    shortName: "ISO 45001",
    family: "qualite",
    description:
      "Système de Management de la Santé et Sécurité au Travail (SST). " +
      "Remplace OHSAS 18001. Prévient les accidents et maladies professionnelles.",
    scope: "Toute organisation souhaitant améliorer la sécurité de ses collaborateurs.",
    keyRequirements: [
      "Identification des dangers et évaluation des risques SST",
      "Consultation et participation des travailleurs",
      "Objectifs SST",
      "Gestion des incidents et non-conformités",
      "Audit interne SST",
    ],
    typicalProcesses: ["RH", "HSE", "Maintenance", "Production", "Chantiers", "Logistique"],
    typicalDomains: ["RH", "HSE", "Production"],
    certifyingBody: "AFNOR · Bureau Veritas · DEKRA · SGS",
    validityYears: 3,
    auditFrequency: "Annuel",
    isMandatory: false,
    sectors: ["manufacturing", "automotive", "energy", "logistics"],
    sizeMin: ["pme", "eti", "ge"],
    riskIfMissing:
      "Accidents graves, contentieux prud'homal, pénalités CARSAT, exclusion marchés BTP et industrie.",
    officialUrl: "https://www.iso.org/fr/standard/63787.html",
    costEstimate: "8 000 – 18 000 €",
  },

  {
    code: "ISO-50001",
    name: "ISO 50001:2018",
    shortName: "ISO 50001",
    family: "qualite",
    description:
      "Système de Management de l'Énergie (SMÉ). Améliore l'efficacité " +
      "énergétique, réduit les coûts et l'empreinte carbone.",
    scope:
      "Tout organisme consommant de l'énergie. Particulièrement pertinent " +
      "pour les industries énergivores (>250 salariés ou >50 M€ CA).",
    keyRequirements: [
      "Revue énergétique et usages significatifs",
      "Indicateurs IPÉ",
      "Objectifs et cibles d'amélioration",
      "Plan d'actions énergétiques",
      "Surveillance des consommations",
    ],
    typicalProcesses: ["Production", "Bâtiments", "Maintenance", "Achats équipements"],
    typicalDomains: ["Production", "IT", "Logistique"],
    certifyingBody: "AFNOR · Bureau Veritas · Apave",
    validityYears: 3,
    auditFrequency: "Annuel",
    isMandatory: false,
    mandatoryFor: ["Entreprises >250 salariés ou >50 M€ CA (audit énergétique obligatoire)"],
    sectors: ["manufacturing", "energy"],
    sizeMin: ["eti", "ge"],
    riskIfMissing: "Non-conformité directive EED 2023/1791.",
    costEstimate: "8 000 – 20 000 €",
  },

  {
    code: "ISO-22301",
    name: "ISO 22301:2019",
    shortName: "ISO 22301",
    family: "qualite",
    description:
      "Système de Management de la Continuité d'Activité (SMCA). " +
      "Prépare l'organisation à maintenir ses activités en cas d'incident.",
    scope: "Toute organisation souhaitant assurer la résilience de ses opérations critiques.",
    keyRequirements: [
      "Analyse d'impact (BIA)",
      "Plans de continuité (PCA/PRA)",
      "Tests et exercices réguliers",
      "Gestion de crise",
    ],
    typicalProcesses: ["Direction", "DSI", "Gestion des risques", "Opérations critiques"],
    typicalDomains: ["IT", "Direction", "Opérations"],
    certifyingBody: "BSI · Bureau Veritas · SGS",
    validityYears: 3,
    auditFrequency: "Annuel",
    isMandatory: false,
    sectors: ["finance", "insurance", "public_sector", "energy", "healthcare"],
    sizeMin: ["pme", "eti", "ge"],
    riskIfMissing: "Incapacité à reprendre l'activité après un sinistre.",
    costEstimate: "10 000 – 30 000 €",
  },

  // ════════════════════════════════════════════════════════════
  // FAMILLE 2 — SÉCURITÉ & CYBER
  // ════════════════════════════════════════════════════════════

  {
    code: "ISO-27001",
    name: "ISO 27001:2022",
    shortName: "ISO 27001",
    family: "securite",
    description:
      "Système de Management de la Sécurité de l'Information (SMSI). " +
      "Référentiel international pour la protection des données sensibles. " +
      "Version 2022 avec 93 contrôles. Couvre aspects organisationnels, humains, physiques et techniques.",
    scope:
      "Toute organisation traitant des données sensibles. Obligatoire de facto " +
      "pour les ESN, éditeurs SaaS et prestataires travaillant avec des grands comptes.",
    keyRequirements: [
      "Analyse de risques (ISO 27005)",
      "Déclaration d'Applicabilité (93 contrôles)",
      "Politique de sécurité",
      "Gestion des accès et identités",
      "Gestion des incidents",
      "Continuité et reprise",
      "Audit interne SMSI",
    ],
    typicalProcesses: ["DSI", "Gestion des accès", "Développement", "Incidents", "Achats", "RH"],
    typicalDomains: ["IT", "Sécurité", "Développement"],
    certifyingBody: "LSTI · Bureau Veritas · BSI · SGS · AFNOR",
    validityYears: 3,
    auditFrequency: "Annuel",
    isMandatory: false,
    sectors: ["consulting", "tech", "finance", "insurance", "healthcare", "public_sector", "automotive", "pharma"],
    sizeMin: ["pme", "eti", "ge"],
    riskIfMissing: "Exclusion AO grands comptes et secteur public. Difficultés RGPD.",
    officialUrl: "https://www.iso.org/fr/standard/27001",
    costEstimate: "15 000 – 50 000 €",
  },

  {
    code: "ISO-27701",
    name: "ISO 27701:2019",
    shortName: "ISO 27701",
    family: "securite",
    description:
      "Extension ISO 27001 pour la protection de la vie privée (PIMS). " +
      "Complément RGPD pour responsables de traitement et sous-traitants.",
    scope: "Organisations traitant des données personnelles. Prérequis : ISO 27001.",
    keyRequirements: [
      "Cartographie traitements données personnelles",
      "Gestion droits des personnes",
      "DPIA",
      "Contrats DPA",
      "Transferts internationaux",
    ],
    typicalProcesses: ["DPO", "Marketing", "RH", "DSI", "Juridique"],
    typicalDomains: ["IT", "Marketing", "RH", "Juridique"],
    certifyingBody: "LSTI · Bureau Veritas · BSI",
    validityYears: 3,
    auditFrequency: "Annuel",
    isMandatory: false,
    sectors: ["consulting", "tech", "finance", "insurance", "healthcare", "retail"],
    sizeMin: ["pme", "eti", "ge"],
    riskIfMissing: "Non-démonstration conformité RGPD. Risque CNIL (4 % du CA).",
    costEstimate: "10 000 – 30 000 €",
  },

  {
    code: "HDS",
    name: "Hébergement Données de Santé v2",
    shortName: "HDS",
    family: "securite",
    description:
      "Certification française OBLIGATOIRE pour tout hébergeur de données de santé. " +
      "HDS v2 en vigueur depuis novembre 2024, intégrant souveraineté des données et ISO 27001:2022.",
    scope: "Obligatoire pour tout prestataire hébergeant des données de santé personnelles.",
    keyRequirements: [
      "ISO 27001:2022 base obligatoire",
      "Hébergement physique EEA",
      "Contrôle accès distants hors UE",
      "Contrats RGPD conformes",
      "Plan continuité santé",
      "Notification incidents",
    ],
    typicalProcesses: ["Hébergement données santé", "DSI", "Sécurité SI", "Juridique"],
    typicalDomains: ["Santé", "IT", "Sécurité"],
    certifyingBody: "LSTI · BSI · Bureau Veritas (accrédités COFRAC)",
    validityYears: 3,
    auditFrequency: "Annuel",
    isMandatory: true,
    mandatoryFor: ["Hébergeurs données de santé", "Éditeurs logiciels santé", "ESN santé"],
    sectors: ["healthcare", "pharma", "consulting", "tech"],
    sizeMin: ["tpe", "pme", "eti", "ge"],
    riskIfMissing: "Interdiction légale + sanctions pénales + résiliation contrats.",
    officialUrl: "https://esante.gouv.fr/produits-services/hds",
    costEstimate: "20 000 – 80 000 €",
  },

  {
    code: "SECNUMCLOUD",
    name: "SecNumCloud 3.2 (ANSSI)",
    shortName: "SecNumCloud",
    family: "securite",
    description:
      "Qualification ANSSI = plus haut niveau sécurité cloud en France. " +
      "360+ critères. Immunité contre CLOUD Act et FISA. Obligatoire " +
      "pour administrations françaises (doctrine Cloud au Centre 2023).",
    scope: "Prestataires cloud souhaitant adresser le marché public français souverain.",
    keyRequirements: [
      "Souveraineté capitalistique et juridique",
      "Immunité contre CLOUD Act",
      "360+ contrôles de sécurité",
      "Hébergement physique en France",
      "Audit ANSSI complet",
    ],
    typicalProcesses: ["Hébergement cloud", "DSI", "Sécurité SI", "Gouvernance IT"],
    typicalDomains: ["IT", "Sécurité", "Direction"],
    certifyingBody: "ANSSI (unique)",
    validityYears: 3,
    auditFrequency: "Annuel",
    isMandatory: true,
    mandatoryFor: ["Administrations publiques françaises données sensibles", "OIV", "OSE"],
    sectors: ["consulting", "tech", "public_sector", "energy"],
    sizeMin: ["eti", "ge"],
    riskIfMissing: "Exclusion marchés cloud souverain.",
    officialUrl: "https://cyber.gouv.fr/secnumcloud",
    costEstimate: "Sur devis (2–4 ans)",
  },

  {
    code: "SOC2",
    name: "SOC 2 Type II (AICPA)",
    shortName: "SOC 2 Type II",
    family: "securite",
    description:
      "Standard américain évaluant les contrôles sur 5 critères Trust Services. " +
      "Type II = audit sur 6–12 mois. Requis par les clients anglo-saxons.",
    scope: "SaaS, cloud et services gérés souhaitant adresser les marchés US et internationaux.",
    keyRequirements: [
      "5 Trust Services Criteria",
      "Contrôles organisationnels et techniques",
      "Tests sur 6–12 mois",
      "Rapport CPA accrédité",
    ],
    typicalProcesses: ["DSI", "Développement", "Ops", "Sécurité", "Support"],
    typicalDomains: ["IT", "Sécurité", "SaaS"],
    certifyingBody: "Cabinets CPA accrédités AICPA",
    validityYears: 1,
    auditFrequency: "Annuel",
    isMandatory: false,
    sectors: ["consulting", "tech", "finance", "insurance"],
    sizeMin: ["eti", "ge"],
    riskIfMissing: "Perte de clients américains et internationaux.",
    costEstimate: "20 000 – 60 000 €",
  },

  {
    code: "PCI-DSS",
    name: "PCI-DSS v4.0",
    shortName: "PCI-DSS",
    family: "securite",
    description:
      "Standard OBLIGATOIRE pour tout acteur traitant, stockant ou " +
      "transmettant des données de cartes bancaires.",
    scope: "Commerçants, PSP, acquéreurs, émetteurs et processeurs de cartes.",
    keyRequirements: [
      "Protection réseau et systèmes",
      "Protection données de cartes",
      "Gestion des vulnérabilités",
      "Contrôle des accès",
      "Surveillance et tests",
      "Politique sécurité",
    ],
    typicalProcesses: ["Paiement en ligne", "DSI", "Sécurité", "E-commerce", "Finance"],
    typicalDomains: ["Finance", "E-commerce", "IT", "Sécurité"],
    certifyingBody: "QSA accrédités PCI SSC",
    validityYears: 1,
    auditFrequency: "Annuel",
    isMandatory: true,
    mandatoryFor: ["Commerçants cartes bancaires", "PSP", "Plateformes e-commerce"],
    sectors: ["retail", "finance", "insurance"],
    sizeMin: ["tpe", "pme", "eti", "ge"],
    riskIfMissing: "Sanctions Visa/Mastercard. Interdiction d'accepter les cartes.",
    costEstimate: "15 000 – 100 000 €",
  },

  {
    code: "TISAX",
    name: "TISAX (ENX Association)",
    shortName: "TISAX",
    family: "securite",
    description:
      "Standard sécurité information industrie automobile. Remplace " +
      "les audits individuels de chaque constructeur (BMW, VW, Stellantis…).",
    scope: "Fournisseurs automobile traitant des informations sensibles des constructeurs.",
    keyRequirements: [
      "Questionnaire VDA ISA",
      "Audit prestataire accrédité ENX",
      "Partage résultats via plateforme ENX",
    ],
    typicalProcesses: ["DSI", "R&D", "Production", "Supply chain automobile"],
    typicalDomains: ["IT", "R&D", "Production"],
    certifyingBody: "Prestataires accrédités ENX (DEKRA, TÜV, Bureau Veritas)",
    validityYears: 3,
    auditFrequency: "Triennal",
    isMandatory: false,
    mandatoryFor: ["Fournisseurs Tier 1 et Tier 2 automobile"],
    sectors: ["automotive"],
    sizeMin: ["pme", "eti", "ge"],
    riskIfMissing: "Exclusion des contrats avec les constructeurs automobiles.",
    costEstimate: "5 000 – 20 000 €",
  },

  // ════════════════════════════════════════════════════════════
  // FAMILLE 3 — SECTORIELLE
  // ════════════════════════════════════════════════════════════

  {
    code: "IATF-16949",
    name: "IATF 16949:2016",
    shortName: "IATF 16949",
    family: "sectorielle",
    description:
      "Standard qualité OBLIGATOIRE industrie automobile mondiale. " +
      "Basé sur ISO 9001 + exigences sectorielles automobiles strictes.",
    scope: "Fabricants de pièces automobiles et leurs fournisseurs.",
    keyRequirements: [
      "Control Plan",
      "AMDEC Process et Produit",
      "PPAP",
      "MSA",
      "Maîtrise des processus spéciaux",
    ],
    typicalProcesses: ["Production", "Qualité", "Supply chain", "R&D", "Logistique"],
    typicalDomains: ["Production", "Qualité", "Achats"],
    certifyingBody: "IATF Oversight Offices",
    validityYears: 3,
    auditFrequency: "Annuel",
    isMandatory: false,
    mandatoryFor: ["Fournisseurs Tier 1 automobile"],
    sectors: ["automotive"],
    sizeMin: ["pme", "eti", "ge"],
    riskIfMissing: "Perte de contrats avec les constructeurs automobiles.",
    costEstimate: "15 000 – 35 000 €",
  },

  {
    code: "EN-9100",
    name: "EN 9100:2018 (AS 9100D)",
    shortName: "EN 9100",
    family: "sectorielle",
    description:
      "Standard qualité aéronautique, spatial et défense. Complète " +
      "ISO 9001 avec exigences spécifiques à ces secteurs très réglementés.",
    scope:
      "Organisations fournissant produits ou services dans l'aéronautique, " +
      "le spatial et la défense.",
    keyRequirements: [
      "Configuration management et traçabilité",
      "FOD prevention",
      "First Article Inspection (FAI)",
      "Key Characteristics",
      "Archivage durée de vie",
    ],
    typicalProcesses: ["Production", "Maintenance", "R&D", "Supply chain", "Qualité"],
    typicalDomains: ["Production", "R&D", "Maintenance"],
    certifyingBody: "OASIS/IAQG accrédités (AFNOR, Bureau Veritas, LRQA)",
    validityYears: 3,
    auditFrequency: "Annuel",
    isMandatory: false,
    mandatoryFor: ["Fournisseurs Airbus, Safran, Thales, MBDA"],
    sectors: ["manufacturing"],
    sizeMin: ["pme", "eti", "ge"],
    riskIfMissing: "Exclusion contrats aéronautique, spatial et défense.",
    costEstimate: "15 000 – 40 000 €",
  },

  {
    code: "ISO-13485",
    name: "ISO 13485:2016",
    shortName: "ISO 13485",
    family: "sectorielle",
    description:
      "Système de management qualité pour dispositifs médicaux. " +
      "Obligatoire pour le marquage CE MDR/IVDR.",
    scope: "Fabricants de dispositifs médicaux, distributeurs, sous-traitants.",
    keyRequirements: [
      "Gestion des risques (ISO 14971)",
      "Traçabilité DM",
      "Maîtrise des processus stériles",
      "Vigilance",
      "Validation logiciels (IEC 62304)",
    ],
    typicalProcesses: ["Production DM", "R&D", "Affaires réglementaires", "SAV"],
    typicalDomains: ["Production", "R&D", "Qualité", "Réglementaire"],
    certifyingBody: "LRQA · BSI · Bureau Veritas · TÜV",
    validityYears: 3,
    auditFrequency: "Annuel",
    isMandatory: false,
    mandatoryFor: ["Fabricants dispositifs médicaux (marquage CE MDR/IVDR)"],
    sectors: ["pharma", "healthcare"],
    sizeMin: ["tpe", "pme", "eti", "ge"],
    riskIfMissing: "Impossibilité d'obtenir le marquage CE pour les dispositifs médicaux.",
    costEstimate: "15 000 – 45 000 €",
  },

  {
    code: "ISO-22000",
    name: "ISO 22000:2018",
    shortName: "ISO 22000",
    family: "sectorielle",
    description:
      "Sécurité des denrées alimentaires « de la fourche à la fourchette ». " +
      "Intègre les principes HACCP et les Bonnes Pratiques d'Hygiène.",
    scope: "Toute organisation dans la chaîne alimentaire.",
    keyRequirements: [
      "Analyse des dangers HACCP",
      "Programme PRPo",
      "Traçabilité alimentaire",
      "Communication tout au long de la chaîne",
    ],
    typicalProcesses: ["Production agroalimentaire", "Logistique", "Achats", "R&D"],
    typicalDomains: ["Production", "Logistique", "Achats"],
    certifyingBody: "Bureau Veritas · SGS · Intertek · AFNOR",
    validityYears: 3,
    auditFrequency: "Annuel",
    isMandatory: false,
    mandatoryFor: [
      "Exportateurs agro vers marchés exigeants",
      "Fournisseurs grande distribution",
    ],
    sectors: ["agri_food"],
    sizeMin: ["tpe", "pme", "eti", "ge"],
    riskIfMissing: "Perte référencements grande distribution. Difficultés export.",
    costEstimate: "10 000 – 25 000 €",
  },

  {
    code: "GMP-EU",
    name: "Bonnes Pratiques de Fabrication (BPF/GMP) — UE",
    shortName: "GMP/BPF",
    family: "sectorielle",
    description:
      "Exigences réglementaires pour la fabrication des médicaments à usage humain et vétérinaire. " +
      "Obligatoire pour toute fabrication pharmaceutique dans l'UE.",
    scope: "Fabricants et sous-traitants de médicaments, API et dispositifs médicaux combinés.",
    keyRequirements: [
      "Système qualité pharmaceutique (ICH Q10)",
      "Gestion du personnel et formation",
      "Locaux et équipements qualifiés",
      "Documentation et traçabilité",
      "Gestion des réclamations et retraits",
    ],
    typicalProcesses: ["Fabrication", "Contrôle qualité", "Affaires réglementaires", "Logistique pharma"],
    typicalDomains: ["Production", "Qualité", "Réglementaire"],
    certifyingBody: "ANSM (France) · EMA · autorités nationales UE",
    isMandatory: true,
    mandatoryFor: ["Fabricants médicaments UE", "Sous-traitants pharma"],
    sectors: ["pharma", "healthcare"],
    sizeMin: ["tpe", "pme", "eti", "ge"],
    riskIfMissing: "Interdiction de mise sur le marché. Fermeture site.",
    costEstimate: "Variable selon site",
  },

  {
    code: "IFS-FOOD",
    name: "IFS Food 8",
    shortName: "IFS Food",
    family: "sectorielle",
    description:
      "Standard de sécurité alimentaire pour fournisseurs de la grande distribution européenne.",
    scope: "Fabricants de produits alimentaires sous MDD ou à marque propre pour la GMS.",
    keyRequirements: [
      "HACCP et analyse des dangers",
      "Système de management qualité",
      "Gestion des corps étrangers",
      "Bonnes pratiques de fabrication",
    ],
    typicalProcesses: ["Production", "Contrôle qualité", "Logistique", "Achats matières"],
    typicalDomains: ["Production", "Qualité", "Commercial"],
    certifyingBody: "AFNOR · Bureau Veritas · Intertek · SGS",
    validityYears: 1,
    auditFrequency: "Annuel",
    isMandatory: false,
    mandatoryFor: ["Fournisseurs Carrefour, Leclerc, Aldi, Lidl, etc."],
    sectors: ["agri_food"],
    sizeMin: ["tpe", "pme", "eti", "ge"],
    riskIfMissing: "Déréférencement grande distribution.",
    costEstimate: "5 000 – 15 000 €",
  },

  {
    code: "BRC-FOOD",
    name: "BRCGS Global Standard for Food Safety Issue 9",
    shortName: "BRC Food",
    family: "sectorielle",
    description:
      "Standard international de sécurité alimentaire, requis notamment par les distributeurs britanniques.",
    scope: "Fabricants alimentaires souhaitant accéder aux marchés UK et internationaux.",
    keyRequirements: [
      "Engagement de la direction",
      "Plan HACCP",
      "Système de management qualité",
      "Contrôle des sites et locaux",
    ],
    typicalProcesses: ["Production", "Contrôle qualité", "Hygiène", "Logistique"],
    typicalDomains: ["Production", "Qualité"],
    certifyingBody: "Organismes BRCGS accrédités (Bureau Veritas, SGS, Intertek)",
    validityYears: 1,
    auditFrequency: "Annuel ou semestriel (selon grade)",
    isMandatory: false,
    sectors: ["agri_food"],
    sizeMin: ["pme", "eti", "ge"],
    riskIfMissing: "Exclusion des marchés UK et de certains distributeurs internationaux.",
    costEstimate: "5 000 – 15 000 €",
  },

  // ════════════════════════════════════════════════════════════
  // FAMILLE 4 — RÉGLEMENTAIRE FRANCE/UE
  // ════════════════════════════════════════════════════════════

  {
    code: "RGPD",
    name: "Conformité RGPD (UE 2016/679)",
    shortName: "RGPD",
    family: "reglementaire",
    description:
      "Règlement européen OBLIGATOIRE encadrant le traitement des données personnelles. " +
      "Conformité permanente avec obligations documentées.",
    scope: "Toute organisation traitant des données personnelles de résidents UE.",
    keyRequirements: [
      "Registre des activités de traitement (RAT)",
      "DPO si requis",
      "DPIA pour traitements à risque",
      "Droits des personnes (accès, rectification, effacement)",
      "Notification CNIL sous 72h",
      "Contrats DPA",
    ],
    typicalProcesses: ["Marketing", "RH", "Relation client", "DSI", "Juridique", "Développement"],
    typicalDomains: ["Marketing", "RH", "IT", "Juridique", "Commercial"],
    certifyingBody: "CNIL (contrôle)",
    auditFrequency: "Continu (obligation permanente)",
    isMandatory: true,
    mandatoryFor: ["TOUTES les organisations traitant données personnelles de résidents UE"],
    sectors: [
      "manufacturing", "automotive", "agri_food", "pharma",
      "energy", "logistics", "retail", "finance", "insurance",
      "real_estate", "consulting", "tech", "education", "media",
      "healthcare", "public_sector", "tourism", "legal", "other",
    ],
    sizeMin: ["tpe", "pme", "eti", "ge"],
    riskIfMissing: "Amende jusqu'à 4 % du CA mondial ou 20 M€. Mise en demeure CNIL.",
    officialUrl: "https://www.cnil.fr/fr/rgpd-de-quoi-parle-t-on",
    costEstimate: "5 000 – 50 000 € (mise en conformité)",
  },

  {
    code: "NIS2",
    name: "Directive NIS2 (UE 2022/2555)",
    shortName: "NIS2",
    family: "reglementaire",
    description:
      "Cybersécurité des entités essentielles et importantes. " +
      "Transposée en France en 2025. Obligations de gestion des risques cyber.",
    scope:
      "Entités essentielles (énergie, transports, santé, eau, infrastructures numériques) " +
      "et importantes. PME exclues sauf exceptions.",
    keyRequirements: [
      "Gestion des risques cybersécurité",
      "Approbation organe direction",
      "Formation direction",
      "Notification incidents (24h → 72h → 1 mois)",
      "Sécurité supply chain",
      "Responsabilité personnelle dirigeants",
    ],
    typicalProcesses: ["DSI", "Sécurité SI", "Gestion des risques", "Direction", "Achats"],
    typicalDomains: ["IT", "Sécurité", "Direction", "Juridique"],
    certifyingBody: "ANSSI (supervision France)",
    auditFrequency: "Continu",
    isMandatory: true,
    mandatoryFor: ["Entités essentielles et importantes NIS2", "OIV", "OSE"],
    sectors: ["energy", "finance", "insurance", "healthcare", "public_sector", "logistics", "consulting", "tech", "manufacturing"],
    sizeMin: ["eti", "ge"],
    riskIfMissing: "Amendes jusqu'à 10 M€ ou 2 % CA. Responsabilité personnelle dirigeants.",
    officialUrl: "https://cyber.gouv.fr/la-directive-nis-2",
    costEstimate: "20 000 – 100 000 €",
  },

  {
    code: "DORA",
    name: "DORA (UE 2022/2554)",
    shortName: "DORA",
    family: "reglementaire",
    description:
      "Résilience opérationnelle numérique pour le secteur financier. " +
      "Applicable depuis janvier 2025.",
    scope: "Banques, assurances, gestionnaires d'actifs, PSP, plateformes financement.",
    keyRequirements: [
      "Gouvernance résilience numérique",
      "Gestion risques TIC",
      "Classification et notification incidents TIC",
      "Tests TLPT",
      "Gestion risques tiers TIC",
      "Registre prestataires TIC",
    ],
    typicalProcesses: ["DSI", "Gestion des risques", "Continuité d'activité", "Achats TIC"],
    typicalDomains: ["Finance", "IT", "Sécurité", "Direction"],
    certifyingBody: "ACPR · AMF (supervision France)",
    auditFrequency: "Continu",
    isMandatory: true,
    mandatoryFor: ["Banques", "Assurances", "Gestionnaires d'actifs", "PSP", "Plateformes financement"],
    sectors: ["finance", "insurance"],
    sizeMin: ["tpe", "pme", "eti", "ge"],
    riskIfMissing: "Sanctions ACPR/AMF. Non-conformité réglementaire bancaire.",
    costEstimate: "50 000 – 300 000 €",
  },

  {
    code: "AI-ACT",
    name: "AI Act (UE 2024/1689)",
    shortName: "AI Act",
    family: "reglementaire",
    description:
      "Premier règlement mondial sur l'IA. Applicable progressivement depuis août 2024. " +
      "Classifie les systèmes IA par niveau de risque.",
    scope: "Tout fournisseur, déployeur et importateur de systèmes IA sur le marché UE.",
    keyRequirements: [
      "Classification système IA par niveau de risque",
      "Évaluation conformité avant mise sur marché (haut risque)",
      "Documentation technique",
      "Journaux et traçabilité",
      "Supervision humaine effective",
      "Enregistrement base UE",
    ],
    typicalProcesses: ["R&D IA", "DSI", "DPO", "Juridique", "RH", "Développement logiciel"],
    typicalDomains: ["IT", "R&D", "RH", "Finance", "Juridique"],
    certifyingBody: "Organismes notifiés UE (en cours de désignation)",
    auditFrequency: "Continu",
    isMandatory: true,
    mandatoryFor: ["Fournisseurs systèmes IA dans l'UE", "Déployeurs IA haut risque"],
    sectors: [
      "consulting", "tech", "finance", "insurance", "healthcare",
      "public_sector", "pharma", "manufacturing",
    ],
    sizeMin: ["tpe", "pme", "eti", "ge"],
    riskIfMissing: "Amendes jusqu'à 35 M€ ou 7 % CA. 15 M€ ou 3 % pour haut risque.",
    costEstimate: "10 000 – 100 000 €",
  },

  {
    code: "SOLVENCY2",
    name: "Solvabilité II (Directive 2009/138/CE)",
    shortName: "Solvabilité II",
    family: "reglementaire",
    description:
      "Régime prudentiel OBLIGATOIRE pour les compagnies d'assurance européennes. " +
      "Trois piliers : exigences quantitatives, gouvernance, communication.",
    scope: "Compagnies d'assurance et réassurance dans l'UE.",
    keyRequirements: [
      "Calcul SCR et MCR",
      "ORSA (Own Risk and Solvency Assessment)",
      "Gouvernance et système de contrôle interne",
      "Rapport SFCR public annuel",
    ],
    typicalProcesses: ["Actuariat", "Gestion des risques", "Finance", "Gouvernance", "Reporting réglementaire"],
    typicalDomains: ["Finance", "Actuariat", "Risque", "Direction"],
    certifyingBody: "ACPR (supervision France)",
    auditFrequency: "Annuel (rapport SFCR)",
    isMandatory: true,
    mandatoryFor: ["Compagnies d'assurance UE (>5 M€ primes)"],
    sectors: ["insurance"],
    sizeMin: ["pme", "eti", "ge"],
    riskIfMissing: "Non-conformité réglementaire ACPR. Sanctions et interdiction d'exercice.",
    costEstimate: "Variable",
  },

  {
    code: "BALE3",
    name: "Bâle III / CRD5-CRR2",
    shortName: "Bâle III",
    family: "reglementaire",
    description:
      "Réforme réglementaire bancaire internationale. Exigences de fonds propres, " +
      "liquidité et levier pour les établissements de crédit.",
    scope: "Banques et établissements de crédit.",
    keyRequirements: [
      "Ratios de solvabilité (CET1, Tier 1, Tier 2)",
      "LCR et NSFR (liquidité)",
      "Ratio de levier",
      "ICAAP et ILAAP",
    ],
    typicalProcesses: ["Finance", "Gestion des risques", "Reporting réglementaire", "Direction"],
    typicalDomains: ["Finance", "Risque", "IT", "Direction"],
    certifyingBody: "ACPR · BCE",
    auditFrequency: "Continu (reporting périodique)",
    isMandatory: true,
    mandatoryFor: ["Banques et établissements de crédit de l'UE"],
    sectors: ["finance"],
    sizeMin: ["pme", "eti", "ge"],
    riskIfMissing: "Non-conformité réglementaire bancaire. Sanctions BCE/ACPR.",
    costEstimate: "Variable",
  },

  // ════════════════════════════════════════════════════════════
  // FAMILLE 5 — QUALITÉ SPÉCIFIQUE FRANCE
  // ════════════════════════════════════════════════════════════

  {
    code: "QUALIOPI",
    name: "Certification Qualiopi",
    shortName: "Qualiopi",
    family: "france",
    description:
      "Certification française OBLIGATOIRE pour les prestataires de formation, " +
      "CFA et organismes de VAE. Permet les financements publics.",
    scope: "Organismes de formation professionnelle continue, CFA, organismes VAE.",
    keyRequirements: [
      "Référentiel National Qualité (7 indicateurs)",
      "Conditions accueil",
      "Adaptation formations",
      "Ressources pédagogiques",
      "Qualification formateurs",
      "Recueil satisfaction",
    ],
    typicalProcesses: ["Formation professionnelle", "Ingénierie pédagogique", "Accueil apprenants", "Suivi qualité"],
    typicalDomains: ["RH", "Formation", "Direction"],
    certifyingBody: "Organismes accrédités COFRAC",
    validityYears: 3,
    auditFrequency: "Intermédiaire 18 mois + renouvellement 3 ans",
    isMandatory: true,
    mandatoryFor: ["Organismes formation souhaitant fonds publics", "CFA", "Prestataires VAE"],
    sectors: ["education"],
    sizeMin: ["tpe", "pme", "eti", "ge"],
    riskIfMissing: "Impossibilité de percevoir financements OPCO/CPF/FNE.",
    costEstimate: "3 000 – 8 000 €",
  },

  {
    code: "MASE",
    name: "MASE (Manuel Amélioration Sécurité Entreprises)",
    shortName: "MASE",
    family: "france",
    description:
      "Certification HSE française pour entreprises intervenantes sur sites industriels. " +
      "5 axes : Politique SSE, Compétences, Organisation, Réalisation, Bilan.",
    scope: "Entreprises sous-traitantes sur sites industriels, pétrochimiques, nucléaires.",
    keyRequirements: [
      "5 axes HSE",
      "Implication de toute la hiérarchie",
      "Retour d'expérience",
      "Taux de fréquence accidents < seuil",
    ],
    typicalProcesses: ["HSE", "RH", "Formation sécurité", "Chantiers", "Sous-traitance"],
    typicalDomains: ["HSE", "Production", "RH"],
    certifyingBody: "MASE National (réseau régional)",
    validityYears: 3,
    auditFrequency: "Annuel",
    isMandatory: false,
    mandatoryFor: ["Sous-traitants pétrochimie (Total, INEOS)", "Nucléaire (EDF)"],
    sectors: ["manufacturing", "energy"],
    sizeMin: ["pme", "eti", "ge"],
    riskIfMissing: "Exclusion marchés industriels exigeant MASE ou CEFRI.",
    costEstimate: "5 000 – 12 000 €",
  },

  {
    code: "BCORP",
    name: "Certification B Corp (B Lab)",
    shortName: "B Corp",
    family: "france",
    description:
      "Certification internationale pour entreprises à haute performance " +
      "sociale et environnementale. Score B Impact Assessment >= 80/200.",
    scope: "Toute entreprise à but lucratif souhaitant démontrer son engagement RSE.",
    keyRequirements: [
      "Score BIA >= 80/200",
      "Modification des statuts (raison d'être)",
      "Transparence rapport B Impact",
      "Recertification tous les 3 ans",
    ],
    typicalProcesses: ["Gouvernance", "RH", "Achats responsables", "Impact environnemental"],
    typicalDomains: ["Direction", "RH", "Achats", "RSE", "Marketing"],
    certifyingBody: "B Lab",
    validityYears: 3,
    auditFrequency: "Triennal",
    isMandatory: false,
    sectors: ["consulting", "tech", "retail", "other"],
    sizeMin: ["pme", "eti", "ge"],
    riskIfMissing: "Perte crédibilité RSE. Difficultés attirer talents et investisseurs ESG.",
    costEstimate: "1 000 – 50 000 €",
  },

  {
    code: "ESRS",
    name: "CSRD / ESRS (Directive 2022/2464)",
    shortName: "CSRD/ESRS",
    family: "france",
    description:
      "Reporting de durabilité obligatoire pour les grandes entreprises et cotées. " +
      "Remplace NFRD. Basé sur les European Sustainability Reporting Standards.",
    scope:
      "Grandes entreprises européennes (>500 salariés ou >40 M€ CA ou >20 M€ bilan). " +
      "Extension progressive aux PME cotées.",
    keyRequirements: [
      "Double matérialité",
      "Rapport développement durable audité",
      "KPIs ESRS (environnement, social, gouvernance)",
      "Intégration au rapport annuel",
    ],
    typicalProcesses: ["Reporting RSE", "Gouvernance", "Finance", "RH", "Achats"],
    typicalDomains: ["Direction", "Finance", "RSE"],
    certifyingBody: "Commissaires aux comptes accrédités",
    auditFrequency: "Annuel",
    isMandatory: true,
    mandatoryFor: [">500 salariés (dès 2025)", "PME cotées (dès 2026)"],
    sectors: ["manufacturing", "automotive", "retail", "finance", "insurance", "energy", "logistics", "pharma"],
    sizeMin: ["eti", "ge"],
    riskIfMissing: "Non-conformité réglementaire. Sanctions AMF/autorités nationales.",
    costEstimate: "50 000 – 500 000 € (mise en conformité)",
  },

  // ════════════════════════════════════════════════════════════
  // FAMILLE 6 — DONNÉES & CONFIDENTIALITÉ
  // ════════════════════════════════════════════════════════════

  {
    code: "ISO-27017",
    name: "ISO/IEC 27017:2015",
    shortName: "ISO 27017",
    family: "donnees",
    description:
      "Contrôles de sécurité supplémentaires pour services cloud. " +
      "Complément ISO 27001 pour fournisseurs et clients cloud.",
    scope: "Fournisseurs cloud et leurs clients.",
    keyRequirements: [
      "Responsabilités partagées fournisseur/client",
      "Isolation environnements virtuels",
      "Sécurité opérations cloud",
    ],
    typicalProcesses: ["Hébergement cloud", "DSI", "Développement", "Ops"],
    typicalDomains: ["IT", "Sécurité", "Cloud"],
    certifyingBody: "BSI · Bureau Veritas · DNV",
    validityYears: 3,
    auditFrequency: "Annuel",
    isMandatory: false,
    sectors: ["consulting", "tech", "finance", "insurance", "healthcare"],
    sizeMin: ["eti", "ge"],
    riskIfMissing: "Manque de garanties sécurité cloud pour les clients exigeants.",
    costEstimate: "10 000 – 25 000 €",
  },

  {
    code: "ISO-27018",
    name: "ISO/IEC 27018:2019",
    shortName: "ISO 27018",
    family: "donnees",
    description:
      "Protection des données personnelles dans le cloud public. " +
      "Complément ISO 27001/27017 pour traitement de PII.",
    scope: "Fournisseurs cloud public traitant des données personnelles pour leurs clients.",
    keyRequirements: [
      "Consentement et transparence",
      "Non-utilisation à fins commerciales",
      "Droits des personnes",
      "Notification incidents données personnelles",
    ],
    typicalProcesses: ["Hébergement cloud", "DPO", "DSI", "Juridique"],
    typicalDomains: ["IT", "Données", "Juridique"],
    certifyingBody: "BSI · Bureau Veritas",
    validityYears: 3,
    auditFrequency: "Annuel",
    isMandatory: false,
    sectors: ["consulting", "tech", "finance", "insurance"],
    sizeMin: ["eti", "ge"],
    riskIfMissing: "Manque de garanties sur la protection des données personnelles.",
    costEstimate: "8 000 – 20 000 €",
  },

  {
    code: "ISO-37001",
    name: "ISO 37001:2016 — Anti-corruption",
    shortName: "ISO 37001",
    family: "donnees",
    description:
      "Système de Management Anti-Corruption. " +
      "Prévient, détecte et traite la corruption et les pots-de-vin.",
    scope: "Organisations souhaitant démontrer leur engagement anti-corruption.",
    keyRequirements: [
      "Analyse de risques corruption",
      "Procédures dues diligences",
      "Formation anti-corruption",
      "Contrôles financiers",
      "Mécanismes dénonciation",
    ],
    typicalProcesses: ["Direction", "Juridique", "Achats", "Commerciaux", "Audit interne"],
    typicalDomains: ["Direction", "Juridique", "Achats"],
    certifyingBody: "Bureau Veritas · BSI · SGS",
    validityYears: 3,
    auditFrequency: "Annuel",
    isMandatory: false,
    sectors: ["consulting", "tech", "public_sector", "finance", "insurance"],
    sizeMin: ["eti", "ge"],
    costEstimate: "5 000 – 20 000 €",
  },

  {
    code: "ISO-42001",
    name: "ISO/IEC 42001:2023 — IA Management",
    shortName: "ISO 42001",
    family: "donnees",
    description:
      "Premier standard international pour le Système de Management de l'IA (AIMS). " +
      "Fournit un cadre de gouvernance IA éthique et responsable. " +
      "Complément pratique à l'AI Act.",
    scope: "Toute organisation développant, déployant ou utilisant des systèmes IA.",
    keyRequirements: [
      "Gouvernance IA et politique",
      "Évaluation d'impact IA",
      "Gestion des biais et équité",
      "Traçabilité et explicabilité",
      "Surveillance continue des systèmes IA",
    ],
    typicalProcesses: ["R&D IA", "DSI", "Gestion des risques", "DPO", "Développement logiciel"],
    typicalDomains: ["IT", "R&D", "Direction", "Juridique"],
    certifyingBody: "BSI · Bureau Veritas · LSTI (en cours)",
    validityYears: 3,
    auditFrequency: "Annuel",
    isMandatory: false,
    sectors: ["consulting", "tech", "finance", "insurance", "healthcare", "public_sector"],
    sizeMin: ["pme", "eti", "ge"],
    riskIfMissing: "Gouvernance IA insuffisante. Exposition aux risques AI Act.",
    costEstimate: "10 000 – 40 000 €",
  },
];

/**
 * Returns certifications filtered by sector and minimum company size.
 * Always includes RGPD (universal mandatory).
 */
export function getCertificationsForContext(
  sector: string,
  companySize: "tpe" | "pme" | "eti" | "ge"
): CatalogEntry[] {
  const sizeOrder = ["tpe", "pme", "eti", "ge"];
  const sizeIdx = sizeOrder.indexOf(companySize);

  return CERTIFICATION_CATALOG.filter((c) => {
    // Always show RGPD
    if (c.code === "RGPD") return true;

    // Must match sector
    if (c.sectors && !c.sectors.includes(sector)) return false;

    // Must meet minimum size requirement
    if (c.sizeMin) {
      const minIdx = Math.min(...c.sizeMin.map((s) => sizeOrder.indexOf(s)));
      if (sizeIdx < minIdx) return false;
    }

    return true;
  });
}

/**
 * Groups a flat list of catalog entries by family.
 */
export function groupByFamily(
  entries: CatalogEntry[]
): Record<string, CatalogEntry[]> {
  const groups: Record<string, CatalogEntry[]> = {};
  for (const entry of entries) {
    groups[entry.family] ??= [];
    groups[entry.family].push(entry);
  }
  return groups;
}

export const FAMILY_LABELS: Record<string, string> = {
  qualite:       "Qualité & Management",
  securite:      "Sécurité & Cyber",
  sectorielle:   "Sectorielle",
  reglementaire: "Réglementaire UE/France",
  france:        "France spécifique",
  donnees:       "Données & IA",
};

export const FAMILY_COLORS: Record<string, string> = {
  qualite:       "var(--blue)",
  securite:      "var(--red)",
  sectorielle:   "var(--purple)",
  reglementaire: "var(--amber)",
  france:        "var(--green)",
  donnees:       "var(--text-secondary)",
};
