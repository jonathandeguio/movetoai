// lib/seed/process-catalogue.ts
// Catalogue SAP/LeanIX traduit en français — structure L1 → L2 → L3

export interface CatalogueItem {
  code:           string;
  level:          1 | 2 | 3;
  parent:         string | null;
  name_fr:        string;
  name_en:        string;
  icon?:          string;
  description_fr: string;
  ai_potential:   "high" | "medium" | "low";
  children?:      CatalogueItem[];
}

export const PROCESS_CATALOGUE: CatalogueItem[] = [
  {
    code: "FINANCE", level: 1, parent: null,
    name_fr: "Finance", name_en: "Finance", icon: "💰",
    description_fr: "Comptabilité, reporting, planification financière, trésorerie et fiscalité.",
    ai_potential: "high",
    children: [
      {
        code: "FIN-ACCOUNTING", level: 2, parent: "FINANCE",
        name_fr: "Comptabilité et clôture financière", name_en: "Accounting and Financial Close",
        description_fr: "Enregistrement comptable, clôtures mensuelles/annuelles et reporting.",
        ai_potential: "high",
        children: [
          { code: "FIN-ACC-01", level: 3, parent: "FIN-ACCOUNTING", name_fr: "Comptabilité générale", name_en: "General Ledger Accounting", description_fr: "Enregistrement des écritures dans le grand livre. Gestion multi-GAAP et imputations analytiques.", ai_potential: "high" },
          { code: "FIN-ACC-02", level: 3, parent: "FIN-ACCOUNTING", name_fr: "Clôture financière locale", name_en: "Local Financial Closing", description_fr: "Processus de clôture mensuelle et annuelle par entité juridique.", ai_potential: "high" },
          { code: "FIN-ACC-03", level: 3, parent: "FIN-ACCOUNTING", name_fr: "Clôture financière groupe", name_en: "Group Financial Closing", description_fr: "Consolidation et clôture des comptes du groupe. Réconciliation inter-sociétés.", ai_potential: "high" },
          { code: "FIN-ACC-04", level: 3, parent: "FIN-ACCOUNTING", name_fr: "Préparation de l'audit financier", name_en: "Financial Audit Preparation", description_fr: "Constitution des dossiers d'audit, documentation des contrôles internes.", ai_potential: "high" },
          { code: "FIN-ACC-05", level: 3, parent: "FIN-ACCOUNTING", name_fr: "Reconnaissance des revenus", name_en: "Revenue and Cost Recognition", description_fr: "Application des règles IFRS 15/ASC 606 sur les contrats clients.", ai_potential: "medium" },
        ]
      },
      {
        code: "FIN-FPA", level: 2, parent: "FINANCE",
        name_fr: "Planification et analyse financière", name_en: "Financial Planning and Analysis",
        description_fr: "Budget, prévisions, simulations et analyse des écarts.",
        ai_potential: "high",
        children: [
          { code: "FIN-FPA-01", level: 3, parent: "FIN-FPA", name_fr: "Planification financière", name_en: "Financial Planning", description_fr: "Budget annuel et prévisions glissantes par centre de coût.", ai_potential: "high" },
          { code: "FIN-FPA-02", level: 3, parent: "FIN-FPA", name_fr: "Simulation financière", name_en: "Financial Simulation", description_fr: "Modélisation de scénarios pour les arbitrages.", ai_potential: "high" },
          { code: "FIN-FPA-03", level: 3, parent: "FIN-FPA", name_fr: "Analyse des marges", name_en: "Margin Analysis", description_fr: "Rentabilité par produit, client, canal et région.", ai_potential: "high" },
        ]
      },
      {
        code: "FIN-PAYABLES", level: 2, parent: "FINANCE",
        name_fr: "Gestion des créances et dettes", name_en: "Payables and Receivables Management",
        description_fr: "Cycle procure-to-pay et order-to-cash. Optimisation du BFR.",
        ai_potential: "high",
        children: [
          { code: "FIN-PAY-01", level: 3, parent: "FIN-PAYABLES", name_fr: "Gestion des paiements fournisseurs", name_en: "Payment Processing", description_fr: "Traitement et exécution des paiements fournisseurs.", ai_potential: "high" },
          { code: "FIN-PAY-02", level: 3, parent: "FIN-PAYABLES", name_fr: "Relance et recouvrement clients", name_en: "Collections Management", description_fr: "Suivi et relance des créances impayées.", ai_potential: "high" },
          { code: "FIN-PAY-03", level: 3, parent: "FIN-PAYABLES", name_fr: "Gestion du crédit client", name_en: "Credit Management", description_fr: "Évaluation et gestion des limites de crédit accordées aux clients.", ai_potential: "high" },
        ]
      },
    ]
  },
  {
    code: "HR", level: 1, parent: null,
    name_fr: "Ressources humaines", name_en: "Human Resources", icon: "👥",
    description_fr: "Recrutement, développement, rémunération, administration RH et expérience collaborateur.",
    ai_potential: "high",
    children: [
      {
        code: "HR-ADMIN", level: 2, parent: "HR",
        name_fr: "Administration RH", name_en: "HR Administration",
        description_fr: "Gestion administrative des collaborateurs tout au long de leur parcours.",
        ai_potential: "high",
        children: [
          { code: "HR-ADM-01", level: 3, parent: "HR-ADMIN", name_fr: "Administration des employés", name_en: "Employee Administration", description_fr: "Dossier employé : données personnelles, contrats, avenants, mobilité.", ai_potential: "high" },
          { code: "HR-ADM-02", level: 3, parent: "HR-ADMIN", name_fr: "Intégration des nouveaux collaborateurs", name_en: "Workforce Onboarding", description_fr: "Création des accès, formation orientation, remise matériel et suivi J+30/J+90.", ai_potential: "high" },
          { code: "HR-ADM-03", level: 3, parent: "HR-ADMIN", name_fr: "Gestion des départs (Offboarding)", name_en: "Offboarding Management", description_fr: "Solde de tout compte, révocation des accès, entretien de départ, archivage.", ai_potential: "medium" },
        ]
      },
      {
        code: "HR-TALENT", level: 2, parent: "HR",
        name_fr: "Gestion des talents", name_en: "Talent Management",
        description_fr: "Attraction, développement et rétention des talents clés.",
        ai_potential: "high",
        children: [
          { code: "HR-TAL-01", level: 3, parent: "HR-TALENT", name_fr: "Acquisition des talents", name_en: "Talent Acquisition", description_fr: "Sourcing, sélection, entretiens, offre et intégration.", ai_potential: "high" },
          { code: "HR-TAL-02", level: 3, parent: "HR-TALENT", name_fr: "Gestion de la performance", name_en: "Employee Performance Management", description_fr: "Objectifs, évaluation annuelle et continue, feedback 360°.", ai_potential: "high" },
          { code: "HR-TAL-03", level: 3, parent: "HR-TALENT", name_fr: "Développement des compétences", name_en: "Skills and Competencies Management", description_fr: "Cartographie des compétences, écarts et plans de développement.", ai_potential: "high" },
        ]
      },
      {
        code: "HR-PAYROLL", level: 2, parent: "HR",
        name_fr: "Paie et remboursements", name_en: "Payroll and Reimbursement",
        description_fr: "Calcul et versement des salaires, charges sociales et remboursements.",
        ai_potential: "medium",
        children: [
          { code: "HR-PAY-01", level: 3, parent: "HR-PAYROLL", name_fr: "Gestion de la paie", name_en: "Payroll Management", description_fr: "Calcul des bulletins, déclarations sociales et virements mensuels.", ai_potential: "medium" },
          { code: "HR-PAY-02", level: 3, parent: "HR-PAYROLL", name_fr: "Gestion des notes de frais", name_en: "Reimbursement Management", description_fr: "Traitement des notes de frais et avantages en nature.", ai_potential: "high" },
        ]
      },
    ]
  },
  {
    code: "PROC", level: 1, parent: null,
    name_fr: "Achats et approvisionnements", name_en: "Sourcing and Procurement", icon: "🛒",
    description_fr: "Sourcing stratégique, sélection fournisseurs, achats opérationnels et gestion des contrats.",
    ai_potential: "high",
    children: [
      {
        code: "PROC-OPS", level: 2, parent: "PROC",
        name_fr: "Achats opérationnels", name_en: "Operational Procurement",
        description_fr: "Réquisitions, commandes, réception et traitement des factures.",
        ai_potential: "high",
        children: [
          { code: "PROC-OPS-01", level: 3, parent: "PROC-OPS", name_fr: "Traitement des réquisitions d'achat", name_en: "Purchase Requirements Processing", description_fr: "Réception et validation des demandes d'achat. Contrôle budgétaire.", ai_potential: "high" },
          { code: "PROC-OPS-02", level: 3, parent: "PROC-OPS", name_fr: "Traitement des bons de commande", name_en: "Purchase Order Processing", description_fr: "Création, approbation et envoi des bons de commande.", ai_potential: "high" },
          { code: "PROC-OPS-03", level: 3, parent: "PROC-OPS", name_fr: "Traitement des factures fournisseurs", name_en: "Supplier Invoice Processing", description_fr: "Réception, vérification à 3 voies et validation des factures.", ai_potential: "high" },
        ]
      },
      {
        code: "PROC-SUP", level: 2, parent: "PROC",
        name_fr: "Gestion des fournisseurs", name_en: "Supplier Management",
        description_fr: "Onboarding, évaluation et gestion des risques fournisseurs.",
        ai_potential: "high",
        children: [
          { code: "PROC-SUP-01", level: 3, parent: "PROC-SUP", name_fr: "Intégration des nouveaux fournisseurs", name_en: "Supplier Onboarding", description_fr: "Qualification, homologation et intégration des fournisseurs dans les systèmes.", ai_potential: "high" },
          { code: "PROC-SUP-02", level: 3, parent: "PROC-SUP", name_fr: "Évaluation des performances fournisseurs", name_en: "Supplier Performance Management", description_fr: "Scorecard : qualité, délais, prix, conformité et relation.", ai_potential: "high" },
        ]
      },
    ]
  },
  {
    code: "MFG", level: 1, parent: null,
    name_fr: "Production industrielle", name_en: "Manufacturing", icon: "🏭",
    description_fr: "Planification et exécution de la production, qualité, performance industrielle.",
    ai_potential: "high",
    children: [
      {
        code: "MFG-OPS", level: 2, parent: "MFG",
        name_fr: "Opérations de production", name_en: "Manufacturing Operations Management",
        description_fr: "Exécution quotidienne de la production et pilotage de l'atelier.",
        ai_potential: "high",
        children: [
          { code: "MFG-OPS-01", level: 3, parent: "MFG-OPS", name_fr: "Exécution de la production (MES)", name_en: "Manufacturing Execution", description_fr: "Pilotage temps réel via MES. Traçabilité des lots et gestion des opérateurs.", ai_potential: "high" },
          { code: "MFG-OPS-02", level: 3, parent: "MFG-OPS", name_fr: "Gestion des ordres de fabrication", name_en: "Production Order Management", description_fr: "Création, lancement et suivi des ordres de fabrication.", ai_potential: "medium" },
        ]
      },
      {
        code: "MFG-QUALITY", level: 2, parent: "MFG",
        name_fr: "Gestion de la qualité", name_en: "Quality Management",
        description_fr: "Planification, contrôle et amélioration continue de la qualité.",
        ai_potential: "high",
        children: [
          { code: "MFG-QUA-01", level: 3, parent: "MFG-QUALITY", name_fr: "Inspection et contrôle qualité", name_en: "Quality Inspection", description_fr: "Contrôles en entrée, en cours et en fin de production.", ai_potential: "high" },
          { code: "MFG-QUA-02", level: 3, parent: "MFG-QUALITY", name_fr: "Amélioration continue (CAPA)", name_en: "Quality Improvement", description_fr: "CAPA, analyses causes racines et réduction des non-conformités.", ai_potential: "high" },
        ]
      },
    ]
  },
  {
    code: "SALES", level: 1, parent: null,
    name_fr: "Ventes", name_en: "Sales", icon: "📈",
    description_fr: "Planification commerciale, gestion des opportunités, commandes clients et partenaires.",
    ai_potential: "high",
    children: [
      {
        code: "SALES-EXEC", level: 2, parent: "SALES",
        name_fr: "Exécution commerciale", name_en: "Sales Execution",
        description_fr: "Opportunités, devis, négociations et relation client.",
        ai_potential: "high",
        children: [
          { code: "SALES-EXE-01", level: 3, parent: "SALES-EXEC", name_fr: "Gestion des opportunités commerciales", name_en: "Opportunity Management", description_fr: "Suivi du pipeline, qualification, probabilité et actions de vente.", ai_potential: "high" },
          { code: "SALES-EXE-02", level: 3, parent: "SALES-EXEC", name_fr: "Gestion des devis clients (CPQ)", name_en: "Customer Quotation Management", description_fr: "Création, configuration et suivi des devis.", ai_potential: "high" },
          { code: "SALES-EXE-04", level: 3, parent: "SALES-EXEC", name_fr: "Identification des ventes additionnelles", name_en: "Cross-Sell/Up-Sell Opportunity Identification", description_fr: "Détection automatique des opportunités upsell et cross-sell.", ai_potential: "high" },
        ]
      },
      {
        code: "SALES-ORDER", level: 2, parent: "SALES",
        name_fr: "Gestion des commandes et contrats", name_en: "Customer Order and Contract Management",
        description_fr: "Traitement des commandes de la réception à la livraison et facturation.",
        ai_potential: "high",
        children: [
          { code: "SALES-ORD-01", level: 3, parent: "SALES-ORDER", name_fr: "Gestion des commandes clients", name_en: "Sales Order Management", description_fr: "Saisie, confirmation et suivi des commandes jusqu'à la livraison.", ai_potential: "high" },
          { code: "SALES-ORD-03", level: 3, parent: "SALES-ORDER", name_fr: "Facturation clients", name_en: "Customer Invoice Processing", description_fr: "Émission, envoi et suivi des factures. Gestion des avoirs et litiges.", ai_potential: "high" },
        ]
      },
    ]
  },
  {
    code: "GRC", level: 1, parent: null,
    name_fr: "Gouvernance, risques et conformité", name_en: "Governance, Risk and Compliance", icon: "🛡️",
    description_fr: "Gouvernance d'entreprise, risques, conformité réglementaire et contrôles internes.",
    ai_potential: "high",
    children: [
      {
        code: "GRC-RISK", level: 2, parent: "GRC",
        name_fr: "Risques et conformité d'entreprise", name_en: "Enterprise Risk and Compliance",
        description_fr: "Cadre global d'identification, évaluation et traitement des risques.",
        ai_potential: "high",
        children: [
          { code: "GRC-RISK-01", level: 3, parent: "GRC-RISK", name_fr: "Gestion des risques", name_en: "Risk Management", description_fr: "Identification, évaluation et traitement des risques opérationnels, financiers et réglementaires.", ai_potential: "high" },
          { code: "GRC-RISK-02", level: 3, parent: "GRC-RISK", name_fr: "Gestion des contrôles internes", name_en: "Controls Management", description_fr: "Conception, mise en œuvre et test des contrôles internes.", ai_potential: "high" },
          { code: "GRC-RISK-04", level: 3, parent: "GRC-RISK", name_fr: "Conformité réglementaire", name_en: "Regulatory Compliance Management", description_fr: "Veille réglementaire, mise en conformité et reporting aux autorités.", ai_potential: "high" },
        ]
      },
    ]
  },
  {
    code: "CUST-SVC", level: 1, parent: null,
    name_fr: "Service client", name_en: "Customer Service", icon: "🎧",
    description_fr: "Gestion de toutes les interactions clients après-vente : demandes, réclamations, garanties, retours.",
    ai_potential: "high",
    children: [
      {
        code: "CUST-SUPPORT", level: 2, parent: "CUST-SVC",
        name_fr: "Support et assistance client", name_en: "Customer Service and Support",
        description_fr: "Traitement des demandes, incidents et questions clients sur tous les canaux.",
        ai_potential: "high",
        children: [
          { code: "CUST-SUP-01", level: 3, parent: "CUST-SUPPORT", name_fr: "Gestion des réclamations", name_en: "Complaints Management", description_fr: "Réception, analyse et résolution des réclamations avec suivi de satisfaction.", ai_potential: "high" },
          { code: "CUST-SUP-05", level: 3, parent: "CUST-SUPPORT", name_fr: "Gestion des demandes d'information", name_en: "Inquiry Management", description_fr: "Réponse aux questions produit, prix et disponibilité via routage intelligent.", ai_potential: "high" },
          { code: "CUST-SUP-06", level: 3, parent: "CUST-SUPPORT", name_fr: "Engagement client omnicanal", name_en: "Omnichannel Customer Engagement", description_fr: "Coordination des interactions sur tous les canaux pour une expérience fluide.", ai_potential: "high" },
          { code: "CUST-SUP-07", level: 3, parent: "CUST-SUPPORT", name_fr: "Libre-service client", name_en: "Self-Service Engagement", description_fr: "Portails permettant aux clients de gérer leurs demandes sans intervention humaine.", ai_potential: "high" },
        ]
      },
    ]
  },
];
