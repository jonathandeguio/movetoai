export { frMessages } from "@/lib/i18n/fr-messages";
/*
import type { Messages } from "@/lib/i18n/en";

export const frMessages = {
  meta: {
    title: "Move to AI",
    description:
      "Transformez la visibilité des processus en portefeuille priorisé d'opportunités IA."
  },
  common: {
    ctas: {
      startFree: "Commencer gratuitement",
      upgradePro: "Passer à Pro",
      talkSales: "Parler à un expert",
      requestDemo: "Demander une démo",
      logIn: "Se connecter",
      signUp: "S'inscrire",
      exploreApp: "Voir l'application",
      comparePlans: "Comparer les offres"
    },
    navigation: {
      product: "Produit",
      pricing: "Tarifs",
      requestDemo: "Démo",
      login: "Connexion",
      signup: "Inscription",
      app: "Application"
    },
    languages: {
      label: "Langue",
      en: "Anglais",
      fr: "Français",
      es: "Espagnol"
    },
    labels: {
      recommended: "Recommandé",
      free: "Gratuit",
      pro: "Pro",
      enterprise: "Enterprise",
      multilingual: "Trilingue par défaut",
      feature: "Fonction",
      placeholder: "Espace réservé",
      moduleShell: "Shell MVP",
      comingSoon: "Bientôt disponible",
      featureGate: "Feature gating",
      freePlan: "Plan gratuit",
      proPlan: "Plan Pro",
      enterprisePlan: "Plan Enterprise"
    },
    legal: {
      privacy: "Politique de confidentialité",
      terms: "Conditions d'utilisation",
      cookies: "Gestion des cookies",
      placeholderTitle: "Placeholder légal",
      placeholderBody:
        "Cette page reste volontairement légère pour l'instant. Remplacez-la par votre contenu légal avant le go-to-market."
    },
    featureGating: {
      freeLabel: "Inclus dans Gratuit",
      proLabel: "Débloqué dans Pro",
      enterpriseLabel: "Prêt pour Enterprise",
      upgradeHint:
        "Passez à Pro pour débloquer la gouvernance, la collaboration et la montée en charge."
    },
    validation: {
      required: "Ce champ est obligatoire.",
      email: "Saisissez un email professionnel valide.",
      minName: "Saisissez votre nom complet.",
      minCompany: "Saisissez le nom de votre entreprise.",
      minPassword: "Le mot de passe doit contenir au moins 8 caractères.",
      minMessage:
        "Ajoutez un peu de contexte pour orienter correctement votre demande."
    }
  },
  marketing: {
    hero: {
      eyebrow: "Couche de décision pour les opportunités IA",
      title: "Transformez des idées IA dispersées en portefeuille priorisé",
      subtitle:
        "Move to AI aide les équipes à identifier les meilleures opportunités IA par processus métier, à les scorer rapidement et à passer d'idées brutes à une exécution gouvernée.",
      bullets: [
        "Commencez gratuitement avec une cartographie process-first",
        "Passez à Pro quand vous avez besoin de gouvernance, de collaboration et d'échelle",
        "Avancez plus vite que les plateformes de transformation trop lourdes"
      ]
    },
    value: {
      title: "De la visibilité processus à la priorisation IA",
      items: [
        {
          title: "Voir d'abord les meilleures opportunités",
          description:
            "Organisez les idées par processus, point de friction et impact attendu plutôt qu'avec des fichiers dispersés."
        },
        {
          title: "Scorer et prioriser dans un seul flux",
          description:
            "Réunissez valeur, faisabilité et maturité de décision dans une même vue portefeuille."
        },
        {
          title: "Rester léger, sans lourdeur EA",
          description:
            "Move to AI fournit la couche de décision attendue sans imposer un programme d'architecture d'entreprise."
        }
      ]
    },
    highlights: {
      title: "Pensé pour un go-to-market agressif et une adoption rapide",
      items: [
        "Entrée freemium pour acquérir vite des équipes",
        "Chemin clair vers Pro pour la gouvernance et l'échelle",
        "Posture de confiance Enterprise pour les acheteurs exigeants"
      ]
    },
    proof: {
      title: "Ce dont les équipes ont besoin dès le premier jour",
      stats: [
        { value: "3x", label: "plus rapide pour trier les opportunités" },
        { value: "1", label: "vue portefeuille commune entre ops, produit et transformation" },
        { value: "0", label: "surcouche EA nécessaire" }
      ]
    },
    plans: {
      title: "Commencez gratuitement. Passez à Pro quand la gouvernance et l'échelle deviennent critiques.",
      subtitle:
        "La fondation est conçue pour transformer des utilisateurs gratuits en espaces Pro actifs puis en comptes Enterprise."
    },
    faq: {
      title: "Aperçu FAQ",
      items: [
        {
          question: "Move to AI est-il un outil de process mining ?",
          answer:
            "Non. C'est une couche de décision qui transforme l'insight processus en portefeuille d'opportunités IA exploitable."
        },
        {
          question: "Peut-on commencer sans programme de transformation lourd ?",
          answer:
            "Oui. L'entrée gratuite est pensée pour une mise en place rapide et une valeur immédiate."
        },
        {
          question: "La version Enterprise est-elle prête pour la gouvernance ?",
          answer:
            "Oui. La fondation produit est prête pour des contrôles, une collaboration et un déploiement à grande échelle."
        }
      ]
    },
    repeatCta: {
      title: "Identifiez les meilleures opportunités IA dans vos processus métier",
      subtitle:
        "Commencez avec de la clarté. Montez en gamme quand la pression de gouvernance et de déploiement augmente."
    }
  },
  pricing: {
    title: "Tarification pensée pour la croissance freemium et la confiance Enterprise",
    subtitle:
      "Commencez gratuitement, prouvez la valeur rapidement, puis débloquez le modèle opératoire adapté.",
    plans: [
      {
        key: "free",
        name: "Gratuit",
        price: "0 €",
        period: "/mois",
        description: "Pour les équipes qui testent une approche process-first des opportunités IA.",
        cta: "Commencer gratuitement",
        features: [
          "Un espace de travail",
          "Collecte processus et opportunités",
          "Aperçu de scoring",
          "Fondation multilingue"
        ]
      },
      {
        key: "pro",
        name: "Pro",
        price: "149 €",
        period: "/mois",
        description: "Pour les équipes qui ont besoin de gouvernance, de collaboration et d'un vrai workflow portefeuille.",
        cta: "Passer à Pro",
        features: [
          "Espace portefeuille partagé",
          "Shells de gouvernance et de workflow",
          "Vues de priorisation avancées",
          "Collaboration et rôles"
        ]
      },
      {
        key: "enterprise",
        name: "Enterprise",
        price: "Sur mesure",
        period: "",
        description: "Pour un déploiement à forte confiance, une visibilité exécutive et des contrôles avancés.",
        cta: "Parler à un expert",
        features: [
          "Onboarding Enterprise",
          "Gouvernance à l'échelle",
          "Trajectoire sécurité et intégration",
          "Packaging commercial personnalisé"
        ]
      }
    ],
    comparisonTitle: "Espace réservé pour le tableau comparatif",
    comparisonDescription:
      "L'architecture est prête pour un comparatif détaillé par plan.",
    footerCta: {
      title: "Choisissez la trajectoire adaptée à votre maturité",
      subtitle:
        "Gratuit pour l'acquisition. Pro pour l'élan. Enterprise pour la confiance et l'échelle."
    }
  },
  requestDemo: {
    title: "Demandez une démonstration ciblée",
    subtitle:
      "Partagez votre contexte et nous orienterons la démonstration sur la visibilité processus, le scoring portefeuille et la gouvernance.",
    success:
      "Demande de démo enregistrée. Le flux commercial est prêt à être connecté à un CRM plus tard."
  },
  auth: {
    login: {
      title: "Connexion à Move to AI",
      subtitle:
        "Accédez à votre espace multilingue et à votre portefeuille d'opportunités IA.",
      submit: "Se connecter",
      footer: "Nouveau sur Move to AI ?",
      invalidCredentials: "Email ou mot de passe invalide."
    },
    signup: {
      title: "Créez votre espace gratuit",
      subtitle:
        "Commencez gratuitement et passez à Pro quand la gouvernance et l'adoption équipe accélèrent.",
      submit: "Créer l'espace",
      footer: "Vous avez déjà un compte ?"
    }
  },
  forms: {
    name: "Nom complet",
    email: "Email professionnel",
    company: "Entreprise",
    password: "Mot de passe",
    role: "Rôle",
    message: "Message"
  },
  app: {
    shell: {
      workspaceLabel: "Espace",
      searchPlaceholder: "Rechercher opportunités, processus, gouvernance...",
      planBadge: "Plan gratuit"
    },
    nav: {
      overview: { title: "Vue d'ensemble", description: "Résumé exécutif" },
      opportunities: { title: "Opportunités", description: "Collecte du portefeuille IA" },
      processes: { title: "Processus", description: "Lecture métier" },
      governance: { title: "Gouvernance", description: "Revue et décision" },
      analytics: { title: "Analytics", description: "Signaux et preuves" },
      settings: { title: "Paramètres", description: "Configuration de l'espace" },
      // Knowledge section
      knowledgeApplications: { title: "Applications", description: "Cartographie applicative" },
      knowledgeCapabilities: { title: "Capabilities", description: "Arbre des capacités métier" },
      knowledgeProcesses: { title: "Processus", description: "Processus enrichis IA" },
      knowledgeTechnologies: { title: "Technologies", description: "Stack technologique" },
      // Insights section
      insightsMaturity: { title: "Heatmap maturité", description: "Maturité des capabilities" },
      insightsDependencyGraph: { title: "Graphe dépendances", description: "Relations applications / capabilities" },
      insightsDataQuality: { title: "Qualité des données", description: "Rapport qualité du référentiel" },
      insightsRelationships: { title: "Relations IA", description: "Suggestions de relations manquantes" },
      // Sprint 3
      surveys: { title: "Enquêtes", description: "Sondages et attestations" },
      governanceAttestations: { title: "Attestations", description: "Validation des entités" },
      governanceDecisions: { title: "Décisions (ADR)", description: "Registre des décisions architecture" },
      adminIngestion: { title: "Ingestion", description: "Import de fichiers" },
      // Sprint 4
      copilot: { title: "Copilot IA", description: "Assistant IA conversationnel" },
      insightsBriefing: { title: "Briefing hebdo", description: "Résumé IA de la semaine" },
      scenarios: { title: "Scénarios", description: "Simulation d'investissements IA" },
      roiDashboard: { title: "ROI Dashboard", description: "Retour sur investissement" },
      insightsTechRadar: { title: "Tech Radar", description: "Portefeuille technologique" },
      roadmap: { title: "Roadmap IA", description: "Frise temporelle des initiatives" },
      governanceRisks: { title: "Risk Dashboard", description: "Suivi des risques" },
      adminWebhooks: { title: "Webhooks", description: "Notifications push sortantes" },
      adminAudit: { title: "Journal d'audit", description: "Historique des actions" },
    },
    overview: {
      eyebrow: "Shell multilingue",
      title: "Identifiez les opportunités IA plus vite que votre modèle actuel",
      subtitle:
        "Ce shell MVP est conçu pour être premium, crédible et prêt pour une adoption rapide.",
      cards: [
        { label: "UI prête pour les langues", value: "EN / FR / ES" },
        { label: "Chemin d'upgrade", value: "Free → Pro → Enterprise" },
        { label: "Positionnement produit", value: "Couche de décision" }
      ],
      checklistTitle: "Ce que la fondation supporte déjà",
      checklist: [
        "Navigation et shell de pages trilingues",
        "Story produit process-to-opportunity",
        "Architecture commerciale Free / Pro / Enterprise",
        "Structure prête pour Auth.js et Prisma"
      ],
      metrics: {
        processesMapped: "Processus cartographies",
        portfolioOpportunities: "Opportunites portefeuille",
        approvedOrLive: "Approuvees ou en live",
        realizedValue: "Valeur realisee"
      },
      topProcessesTitle: "Clusters processus les mieux notes",
      topProcessesDescription: "Score moyen sur les clusters d'opportunites les plus solides.",
      spotlightTitle: "Opportunites prioritaires",
      spotlightDescription: "Quick wins, bets approuves et valeur deja visible dans le workspace seed.",
      freePreviewTitle: "Preview de pression Free",
      freePreviewDescription:
        "Le workspace demo embarque aussi un etat de limites Free pour montrer les nudges d'upgrade au bon moment.",
      freePreviewLabels: {
        users: "Utilisateurs",
        opportunities: "Opportunites",
        aiRequests: "Requetes IA"
      },
      emptyTitle: "Vos modules portefeuille démarrent ici",
      emptyDescription:
        "Utilisez ces pages shell pour brancher ensuite scoring, gouvernance, quotas, onboarding et workflows portefeuille."
    },
    opportunitiesModule: {
      title: "Portefeuille d'opportunites IA",
      description:
        "Opportunites seedees avec score, owner, decision de gouvernance et valeur attendue.",
      liveValue: "Valeur live",
      unassigned: "Non assigne",
      noDecision: "Pas de decision",
      headers: {
        opportunity: "Opportunite",
        process: "Processus",
        owner: "Owner",
        status: "Statut",
        score: "Score",
        value: "Valeur attendue",
        decision: "Decision"
      }
    },
    modulePlaceholder:
      "Ce module reste volontairement léger pour l'instant. Le shell de page, les labels, la navigation et la structure de feature gating sont déjà prêts."
  }
} satisfies Messages;
*/
