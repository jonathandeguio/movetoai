import type { Messages } from "@/lib/i18n/en";

export const frMessages = {
  meta: {
    title: "Move to AI",
    description:
      "Transformez la visibilite des processus en portefeuille priorise d'opportunites IA."
  },
  common: {
    ctas: {
      startFree: "Commencer gratuitement",
      upgradePro: "Passer a Pro",
      talkSales: "Parler a un expert",
      requestDemo: "Demander une demo",
      logIn: "Se connecter",
      signUp: "S'inscrire",
      exploreApp: "Voir l'application",
      comparePlans: "Comparer les offres"
    },
    navigation: {
      product: "Produit",
      pricing: "Tarifs",
      requestDemo: "Demo",
      login: "Connexion",
      signup: "Inscription",
      app: "Application"
    },
    languages: {
      label: "Langue",
      en: "Anglais",
      fr: "Francais",
      es: "Espagnol"
    },
    labels: {
      recommended: "Recommande",
      free: "Gratuit",
      pro: "Pro",
      enterprise: "Enterprise",
      multilingual: "Trilingue par defaut",
      feature: "Fonction",
      placeholder: "Espace reserve",
      moduleShell: "Shell MVP",
      comingSoon: "Bientot disponible",
      featureGate: "Feature gating",
      freePlan: "Plan gratuit",
      proPlan: "Plan Pro",
      enterprisePlan: "Plan Enterprise",
      businessUnit: "Unite metier",
      domain: "Domaine",
      capability: "Capacite",
      capabilities: "Capacites",
      process: "Processus",
      processes: "Processus",
      owner: "Owner",
      supportingApplications: "Applications",
      dataSources: "Sources de donnees",
      painPoints: "Pain points",
      linkedOpportunities: "Opportunites IA",
      nextBestActions: "Prochaines meilleures actions",
      noBusinessUnit: "Aucune unite metier",
      applyFilters: "Appliquer les filtres",
      clearFilters: "Effacer les filtres",
      allBusinessUnits: "Toutes les unites metier"
    },
    legal: {
      privacy: "Politique de confidentialite",
      terms: "Conditions d'utilisation",
      cookies: "Gestion des cookies",
      placeholderTitle: "Placeholder legal",
      placeholderBody:
        "Cette page reste volontairement legere pour l'instant. Remplacez-la par votre contenu legal avant le go-to-market."
    },
    featureGating: {
      freeLabel: "Inclus dans Gratuit",
      proLabel: "Debloque dans Pro",
      enterpriseLabel: "Pret pour Enterprise",
      upgradeHint:
        "Passez a Pro pour debloquer la gouvernance, la collaboration et la montee en charge."
    },
    validation: {
      required: "Ce champ est obligatoire.",
      email: "Saisissez un email professionnel valide.",
      minName: "Saisissez votre nom complet.",
      minCompany: "Saisissez le nom de votre entreprise.",
      minPassword: "Le mot de passe doit contenir au moins 8 caracteres.",
      minWorkspace: "Saisissez un nom d'espace.",
      minWorkspaceSlug: "Saisissez un slug d'espace valide.",
      minMessage:
        "Ajoutez un peu de contexte pour orienter correctement votre demande."
    }
  },
  marketing: {
    hero: {
      eyebrow: "Couche de decision pour les opportunites IA",
      title: "Transformez des idees IA dispersees en portefeuille priorise",
      subtitle:
        "Move to AI aide les equipes a identifier les meilleures opportunites IA par processus metier, a les scorer rapidement et a passer d'idees brutes a une execution gouvernee.",
      bullets: [
        "Commencez gratuitement avec une cartographie process-first",
        "Passez a Pro quand vous avez besoin de gouvernance, de collaboration et d'echelle",
        "Avancez plus vite que les plateformes de transformation trop lourdes"
      ]
    },
    value: {
      title: "De la visibilite processus a la priorisation IA",
      items: [
        {
          title: "Voir d'abord les meilleures opportunites",
          description:
            "Organisez les idees par processus, point de friction et impact attendu plutot qu'avec des fichiers disperses."
        },
        {
          title: "Scorer et prioriser dans un seul flux",
          description:
            "Reunissez valeur, faisabilite et maturite de decision dans une meme vue portefeuille."
        },
        {
          title: "Rester leger, sans lourdeur EA",
          description:
            "Move to AI fournit la couche de decision attendue sans imposer un programme d'architecture d'entreprise."
        }
      ]
    },
    highlights: {
      title: "Pense pour un go-to-market agressif et une adoption rapide",
      items: [
        "Entree freemium pour acquerir vite des equipes",
        "Chemin clair vers Pro pour la gouvernance et l'echelle",
        "Posture de confiance Enterprise pour les acheteurs exigeants"
      ]
    },
    proof: {
      title: "Ce dont les equipes ont besoin des le premier jour",
      stats: [
        { value: "3x", label: "plus rapide pour trier les opportunites" },
        { value: "1", label: "vue portefeuille commune entre ops, produit et transformation" },
        { value: "0", label: "surcouche EA necessaire" }
      ]
    },
    plans: {
      title: "Commencez gratuitement. Passez a Pro quand la gouvernance et l'echelle deviennent critiques.",
      subtitle:
        "La fondation est concue pour transformer des utilisateurs gratuits en espaces Pro actifs puis en comptes Enterprise."
    },
    faq: {
      title: "Apercu FAQ",
      items: [
        {
          question: "Move to AI est-il un outil de process mining ?",
          answer:
            "Non. C'est une couche de decision qui transforme l'insight processus en portefeuille d'opportunites IA exploitable."
        },
        {
          question: "Peut-on commencer sans programme de transformation lourd ?",
          answer:
            "Oui. L'entree gratuite est pensee pour une mise en place rapide et une valeur immediate."
        },
        {
          question: "La version Enterprise est-elle prete pour la gouvernance ?",
          answer:
            "Oui. La fondation produit est prete pour des controles, une collaboration et un deploiement a grande echelle."
        }
      ]
    },
    repeatCta: {
      title: "Identifiez les meilleures opportunites IA dans vos processus metier",
      subtitle:
        "Commencez avec de la clarte. Montez en gamme quand la pression de gouvernance et de deploiement augmente."
    }
  },
  pricing: {
    title: "Tarification pensee pour la croissance freemium et la confiance Enterprise",
    subtitle:
      "Commencez gratuitement, prouvez la valeur rapidement, puis debloquez le modele operatoire adapte.",
    plans: [
      {
        key: "free",
        name: "Gratuit",
        price: "0 EUR",
        period: "/mois",
        description: "Pour les equipes qui testent une approche process-first des opportunites IA.",
        cta: "Commencer gratuitement",
        features: [
          "Un espace de travail",
          "Collecte processus et opportunites",
          "Apercu de scoring",
          "Fondation multilingue"
        ]
      },
      {
        key: "pro",
        name: "Pro",
        price: "149 EUR",
        period: "/mois",
        description: "Pour les equipes qui ont besoin de gouvernance, de collaboration et d'un vrai workflow portefeuille.",
        cta: "Passer a Pro",
        features: [
          "Espace portefeuille partage",
          "Shells de gouvernance et de workflow",
          "Vues de priorisation avancees",
          "Collaboration et roles"
        ]
      },
      {
        key: "enterprise",
        name: "Enterprise",
        price: "Sur mesure",
        period: "",
        description: "Pour un deploiement a forte confiance, une visibilite executive et des controles avances.",
        cta: "Parler a un expert",
        features: [
          "Onboarding Enterprise",
          "Gouvernance a l'echelle",
          "Trajectoire securite et integration",
          "Packaging commercial personnalise"
        ]
      }
    ],
    comparisonTitle: "Espace reserve pour le tableau comparatif",
    comparisonDescription:
      "L'architecture est prete pour un comparatif detaille par plan.",
    footerCta: {
      title: "Choisissez la trajectoire adaptee a votre maturite",
      subtitle:
        "Gratuit pour l'acquisition. Pro pour l'elan. Enterprise pour la confiance et l'echelle."
    }
  },
  requestDemo: {
    title: "Demandez une demonstration ciblee",
    subtitle:
      "Partagez votre contexte et nous orienterons la demonstration sur la visibilite processus, le scoring portefeuille et la gouvernance.",
    success:
      "Demande de demo enregistree. Le flux commercial est pret a etre connecte a un CRM plus tard."
  },
  auth: {
    login: {
      title: "Connexion a Move to AI",
      subtitle:
        "Accedez a votre espace multilingue et a votre portefeuille d'opportunites IA.",
      submit: "Se connecter",
      footer: "Nouveau sur Move to AI ?",
      invalidCredentials: "Email ou mot de passe invalide."
    },
    signup: {
      title: "Creez votre compte gratuit",
      subtitle:
        "Commencez gratuitement maintenant, puis creez ou rejoignez un espace pendant l'onboarding.",
      submit: "Creer le compte",
      footer: "Vous avez deja un compte ?",
      onboardingNote:
        "Vous choisirez votre langue, creerez ou rejoindrez un espace, puis accederez a l'application a l'etape suivante.",
      emailTaken: "Un compte existe deja avec cet email.",
      unexpectedError: "Nous ne pouvons pas creer votre compte pour le moment."
    }
  },
  forms: {
    name: "Nom complet",
    email: "Email professionnel",
    company: "Entreprise",
    workspaceName: "Nom de l'espace",
    workspaceSlug: "Slug de l'espace",
    password: "Mot de passe",
    preferredLanguage: "Langue preferee",
    companySizeLabel: "Taille de l'entreprise",
    companySizePlaceholder: "Selectionnez la taille",
    companySizeOptions: {
      pme: "PME (moins de 500 employes)",
      eti: "ETI (500 a 5 000 employes)",
      grand_groupe: "Grand groupe (plus de 5 000 employes)"
    },
    role: "Role",
    message: "Message"
  },
  onboarding: {
    badge: "Onboarding",
    title: "Passez du premier login a la premiere opportunite IA en quelques minutes",
    subtitle:
      "Move to AI transforme la visibilite processus en portefeuille gouverne d'opportunites IA. Commencez avec un espace gratuit, ajoutez vos premiers processus, puis montez en gamme quand la gouvernance et l'echelle comptent.",
    formIntro:
      "Creez votre premier espace pour entrer dans l'application et commencer a mapper vos opportunites IA par processus.",
    whatYouGetTitle: "Ce que Move to AI vous apporte d'abord",
    whatYouGetBody:
      "Cartographiez quelques processus, capturez les pain points, identifiez des opportunites IA et rendez la priorisation visible avant d'investir dans un outil de transformation plus lourd.",
    stepsTitle: "Comment obtenir de la valeur vite",
    steps: [
      "Ajoutez vos premiers processus et les pain points qui ralentissent les equipes.",
      "Capturez les premieres opportunites IA liees a ces processus.",
      "Utilisez le scoring et la gouvernance pour voir quoi faire avancer en premier."
    ],
    planCards: [
      {
        title: "Gratuit",
        description: "Une vraie entree self-serve pour cartographier les processus et capter les opportunites.",
        highlight: "1 espace, 5 utilisateurs, 15 processus, 30 opportunites.",
        recommended: false
      },
      {
        title: "Pro",
        description: "Ajoute scoring personnalise, workflows de gouvernance, collaboration portefeuille et plus de capacite IA.",
        highlight: "Le meilleur choix quand une equipe a besoin de priorisation partagee et de gouvernance.",
        recommended: true
      },
      {
        title: "Enterprise",
        description: "Ajoute deploiement multi-BU, audit, SSO, SCIM, admin centralise et acces API.",
        highlight: "Pense pour un deploiement a forte confiance et un pilotage executif.",
        recommended: false
      }
    ],
    modes: {
      create: {
        title: "Creer un espace",
        description: "Demarrez un nouvel espace Free et obtenez de la valeur rapidement."
      },
      join: {
        title: "Rejoindre un espace",
        description: "Utilisez un slug existant et rejoignez d'abord le portefeuille en lecture."
      }
    },
    createHint:
      "Utilisez le nom de votre equipe ou de votre programme. Il deviendra l'espace principal visible dans l'application.",
    joinHint:
      "Demandez le slug au workspace admin. Votre role pourra etre etendu plus tard.",
    submitCreate: "Creer l'espace gratuit",
    submitJoin: "Rejoindre l'espace",
    errors: {
      workspaceNotFound: "Aucun espace trouve avec ce slug.",
      alreadyOnboarded: "Votre compte a deja un espace actif.",
      unexpected: "Nous ne pouvons pas terminer l'onboarding pour le moment."
    },
    processFocus: {
      title: "Choisissez 5 processus a ameliorer avec l'IA",
      subtitle:
        "Selectionnez les cinq processus metier qui comptent le plus maintenant. Ces choix personnaliseront votre premiere experience d'opportunites IA.",
      whyTitle: "Pourquoi ces 5 comptent",
      whyBody:
        "Move to AI utilisera cette selection pour ancrer la premiere phase de decouverte d'opportunites IA dans de vraies priorites operationnelles.",
      bullets: [
        "Partez de vrais processus metier deja presents dans votre workspace.",
        "Donnez au produit un point de depart concret pour la decouverte d'opportunites IA.",
        "Gardez l'onboarding rapide, cible et utile des la premiere session."
      ],
      searchPlaceholder: "Rechercher des processus par nom",
      selectedCountLabel: "selectionnes",
      helperText: "Choisissez exactement 5 processus pour continuer.",
      continue: "Continuer",
      emptyTitle: "Aucun processus n'est encore disponible dans ce workspace",
      emptyDescription:
        "Allez d'abord dans le module Processes, puis revenez terminer cette etape d'onboarding avec de vrais choix de processus.",
      openProcesses: "Aller a Processes",
      noSearchResults: "Aucun processus ne correspond a votre recherche.",
      noOwner: "Aucun owner assigne",
      errors: {
        invalidSelection: "Choisissez exactement 5 processus valides avant de continuer.",
        unexpected: "Nous ne pouvons pas enregistrer votre selection de processus pour le moment."
      },
      aiFlow: {
        domainsTitle: "Quels sont vos domaines metier prioritaires ?",
        domainsSubtitle:
          "Selectionnez jusqu'a 3 domaines. Claude recommandera les 6 meilleurs processus a automatiser selon votre profil.",
        domainsConfirm: "Obtenir les recommandations IA",
        domainsMin: "Selectionnez au moins un domaine pour continuer.",
        loadingTitle: "Analyse de votre profil...",
        loadingSubtitle:
          "Claude genere des recommandations de processus personnalisees pour vous.",
        recommendationsTitle: "Vos processus recommandes",
        recommendationsSubtitle:
          "En fonction de votre role et de la taille de votre entreprise, Claude recommande ces 6 processus. Tous sont preselectionnes — ajustez si besoin.",
        profileLabel: "Votre profil",
        gainLabel: "Gain estime",
        complexityLabel: "Complexite",
        complexity: {
          low: "Simple",
          medium: "Modere",
          high: "Complexe"
        },
        confirmButton: "Confirmer et entrer dans l'application",
        selectAll: "Tout selectionner",
        domains: [
          "Finance & Comptabilite",
          "Ressources Humaines",
          "Commercial & Ventes",
          "Marketing & Communication",
          "Support Client & SAV",
          "Operations & Logistique",
          "Juridique & Conformite",
          "Achats & Approvisionnement",
          "Informatique & Digital"
        ],
        errors: {
          apiError:
            "Service de recommandation temporairement indisponible. Des processus par defaut ont ete appliques.",
          saveError: "Nous ne pouvons pas enregistrer votre selection pour le moment."
        }
      }
    }
  },
  unauthorized: {
    eyebrow: "Controle d'acces",
    title: "Vous n'avez pas acces a cette zone",
    description:
      "Votre role actuel n'inclut pas la permission necessaire pour ce module. Faites evoluer le plan ou ajustez les roles workspace quand vous avez besoin d'un perimetre de gouvernance plus large."
  },
  app: {
    resourceStates: {
      errorTitle: "Quelque chose a interrompu cette vue",
      errorDescription:
        "Rechargez ce module ou revenez au shell principal du workspace.",
      retry: "Reessayer",
      notFoundTitle: "Cet element est introuvable",
      notFoundDescription:
        "Il a peut-etre ete supprime ou n'appartient pas a votre workspace actuel."
    },
    shell: {
      workspaceLabel: "Espace",
      searchPlaceholder: "Rechercher opportunites, processus, gouvernance...",
      planBadge: "Plan gratuit",
      noWorkspace: "Configuration de l'espace",
      noWorkspaceTitle: "Vous etes connecte",
      noWorkspaceDescription:
        "Votre compte est actif, mais aucun workspace n'est encore rattache.",
      noWorkspaceHint:
        "Cette etape auth minimale couvre seulement l'inscription, la connexion, la session et la protection des routes. Vous ajouterez ou rejoindrez un workspace plus tard."
    },
    nav: {
      overview: { title: "Vue d'ensemble", description: "Resume executif" },
      portfolio: { title: "Portefeuille", description: "Vue priorisee des opportunites" },
      value: { title: "Valeur", description: "Valeur attendue et realisee" },
      domains: { title: "Domaines", description: "Couverture metier" },
      opportunities: { title: "Opportunites", description: "Collecte du portefeuille IA" },
      useCases: { title: "Cas d'usage", description: "Specs et livraison des cas IA" },
      processes: { title: "Processus", description: "Lecture metier" },

      governance: { title: "Gouvernance", description: "Revue et decision" },
      analytics: { title: "Analytics", description: "Signaux et preuves" },
      settings: { title: "Parametres", description: "Configuration de l'espace" },
      adminTeam: { title: "Equipe", description: "Gerer les membres et les roles" },
      adminQuickStart: { title: "Demarrage rapide", description: "Checklist de configuration et score IA" },
      adminProcesses: { title: "Processus", description: "Catalogue et gestion des processus" },
      adminAnalytics: { title: "Analytics", description: "ROI et metriques du workspace" },
      adminSettings: { title: "Parametres", description: "Configuration du workspace" },
      adminBilling: { title: "Facturation", description: "Abonnement et factures" },
      adminIntegrations: { title: "Integrations", description: "Connexions aux outils tiers" },
      techDashboard: { title: "Dashboard IT", description: "Integrations, securite et gouvernance" },
      consultingDashboard: { title: "Consulting", description: "Mes clients et programme partenaire" },
      memberDashboard: { title: "Mon espace", description: "Taches, processus et assistant IA" },
      executiveDashboard: { title: "Vue dirigeant", description: "Score maturite, ROI et quick wins" },
      workspaceAdminDashboard: { title: "Dashboard admin", description: "Vue d'ensemble et gestion du workspace" },
      enterpriseArchitectDashboard: { title: "Dashboard architecte", description: "Processus, applications et architecture" },
      transformationManagerDashboard: { title: "Dashboard transformation", description: "Portefeuille, initiatives et ROI" },
      // Knowledge section
      knowledgeApplications: { title: "Applications", description: "Cartographie applicative" },
      knowledgeCapabilities: { title: "Capabilities", description: "Arbre des capacites metier" },
      knowledgeProcesses: { title: "Processus IA", description: "Processus enrichis IA" },
      knowledgeTechnologies: { title: "Technologies", description: "Stack technologique" },
      // Insights section
      insightsMaturity: { title: "Heatmap maturite", description: "Maturite des capabilities" },
      insightsDependencyGraph: { title: "Graphe dependances", description: "Relations applications / capabilities" },
      insightsDataQuality: { title: "Qualite des donnees", description: "Rapport qualite du referentiel" },
      insightsRelationships: { title: "Relations IA", description: "Suggestions de relations manquantes" },
      // Sprint 3
      surveys: { title: "Enquetes", description: "Sondages et attestations" },
      governanceAttestations: { title: "Attestations", description: "Validation des entites" },
      governanceDecisions: { title: "Decisions (ADR)", description: "Registre des decisions architecture" },
      adminIngestion: { title: "Ingestion", description: "Import de fichiers" },
      // Sprint 4
      copilot: { title: "Copilot IA", description: "Assistant IA conversationnel" },
      insightsBriefing: { title: "Briefing hebdo", description: "Resume IA de la semaine" },
      scenarios: { title: "Scenarios", description: "Simulation d'investissements IA" },
      roiDashboard: { title: "ROI Dashboard", description: "Retour sur investissement" },
      insightsTechRadar: { title: "Tech Radar", description: "Portefeuille technologique" },
      roadmap: { title: "Roadmap IA", description: "Frise temporelle des initiatives" },
      governanceRisks: { title: "Risk Dashboard", description: "Suivi des risques" },
      adminWebhooks: { title: "Webhooks", description: "Notifications push sortantes" },
      adminAudit: { title: "Journal d'audit", description: "Historique des actions" },
      compliance: { title: "Conformite", description: "Certifications et suivi reglementaire" },
      help: { title: "Centre d'aide", description: "Documentation et guides utilisateur" },
    },
    overview: {
      eyebrow: "Shell multilingue",
      title: "Identifiez les opportunites IA plus vite que votre modele actuel",
      subtitle:
        "Ce shell MVP est concu pour etre premium, credible et pret pour une adoption rapide.",
      cards: [
        { label: "UI prete pour les langues", value: "EN / FR / ES" },
        { label: "Chemin d'upgrade", value: "Free -> Pro -> Enterprise" },
        { label: "Positionnement produit", value: "Couche de decision" }
      ],
      checklistTitle: "Ce que la fondation supporte deja",
      checklist: [
        "Navigation et shell de pages trilingues",
        "Story produit process-to-opportunity",
        "Architecture commerciale Free / Pro / Enterprise",
        "Structure prete pour Auth.js et Prisma"
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
      spotlightDescription: "Quick wins, paris approuves et valeur deja visible dans le workspace seed.",
      freePreviewTitle: "Preview de pression Free",
      freePreviewDescription:
        "Le workspace demo embarque aussi un etat de limites Free pour montrer les nudges d'upgrade au bon moment.",
      freePreviewLabels: {
        users: "Utilisateurs",
        opportunities: "Opportunites",
        aiRequests: "Requetes IA"
      },
      emptyTitle: "Vos modules portefeuille demarrent ici",
      emptyDescription:
        "Utilisez ces pages shell pour brancher ensuite scoring, gouvernance, quotas, onboarding et workflows portefeuille."
    },
    governanceModule: {
      title: "Statut de gouvernance",
      description:
        "Revoyez les signaux de decision et les approbations en attente sans transformer le module en workflow lourd.",
      labels: {
        noDecision: "Pas de decision",
        noOwner: "Aucun owner",
        noApprover: "Non assigne",
        noDueDate: "Aucune date"
      },
      decisions: {
        title: "Liste des decisions",
        description:
          "Utilisez cette vue pour voir quelles opportunites ont deja une decision de gouvernance et lesquelles attendent encore.",
        headers: {
          opportunity: "Opportunite",
          currentStatus: "Statut actuel",
          decision: "Decision",
          owner: "Owner",
          updatedAt: "Mise a jour"
        },
        emptyTitle: "Aucune decision de gouvernance pour le moment",
        emptyDescription:
          "Les decisions apparaitront ici quand les opportunites commenceront a passer en revue et en approbation."
      },
      approvalQueue: {
        title: "File d'approbation",
        description:
          "Les etapes d'approbation en attente qui demandent encore une action avant de faire avancer les opportunites.",
        headers: {
          opportunity: "Opportunite",
          decision: "Decision",
          approval: "Approbation",
          approver: "Approbateur",
          dueDate: "Echeance"
        },
        emptyTitle: "La file d'approbation est vide",
        emptyDescription: "Aucune etape d'approbation n'est en attente pour le moment."
      },
      upgrade: {
        previewLabel: "Preview upgrade",
        title: "La gouvernance avancee se debloque en Enterprise",
        description:
          "Passez d'une simple visibilite des decisions a des policy cues plus forts, des approbations plus profondes et un rythme de gouvernance pret pour l'executif.",
        bullets: [
          "Controles de gouvernance plus profonds",
          "Policy cues et approbations plus solides",
          "Rythme operatoire Enterprise a travers les business units"
        ]
      }
    },
    valueModule: {
      title: "Suivi de la valeur",
      description:
        "Gardez la valeur attendue, la valeur realisee et l'adoption visibles sans transformer la page en espace analytics lourd.",
      summary: {
        totalExpectedValue: "Valeur attendue totale",
        totalRealizedValue: "Valeur realisee totale",
        adoptionOverview: "Vue d'ensemble adoption"
      },
      table: {
        title: "Table de valeur des initiatives",
        description:
          "Revoyez les initiatives deja liees aux opportunites et voyez si la valeur commence a se materialiser."
      },
      headers: {
        initiative: "Initiative ou opportunite",
        expectedRoi: "ROI attendu",
        realizedRoi: "ROI realise",
        adoption: "Adoption",
        status: "Statut"
      },
      labels: {
        noOpportunity: "Aucune opportunite liee",
        noRoi: "Pas encore de ROI",
        noAdoption: "Pas de donnees d'adoption"
      },
      emptyTitle: "Aucune donnee de valeur initiative pour le moment",
      emptyDescription:
        "Liez des initiatives aux opportunites et ajoutez des metriques de benefice ou d'adoption pour rendre la valeur visible ici."
    },
    aiAssistant: {
      badge: "Assistant IA mock",
      title: "Suggestions de l'assistant IA",
      description:
        "Utilisez des suggestions deterministes basees sur le contexte processus actuel pour mieux cadrer la prochaine opportunite.",
      painPointSummary: "Resume des pain points",
      suggestedUseCaseType: "Type de cas d'usage IA suggere",
      suggestedOpportunities: "Opportunites IA suggerees",
      confidence: "Confiance",
      mockNote: "Sortie de demo",
      emptySuggestions: "Aucune suggestion assistant disponible pour le moment."
    },
    portfolioModule: {
      title: "Portefeuille priorise",
      description:
        "Voyez quelles opportunites doivent avancer en premier, groupees par le signal de scoring le plus utile.",
      summary: {
        total: "Opportunites priorisees",
        quickWins: "Quick Wins",
        strategicBets: "Paris strategiques",
        highRisk: "Risque eleve"
      },
      groups: {
        QUICK_WIN: "Quick Wins",
        STRATEGIC_BET: "Paris strategiques",
        HIGH_RISK: "Risque eleve"
      },
      table: {
        title: "Opportunites priorisees",
        description:
          "Utilisez cette vue pour comprendre quoi lancer maintenant, quoi faire murir et quoi traiter avec plus de prudence."
      },
      headers: {
        name: "Opportunite",
        process: "Processus",
        score: "Score",
        badge: "Priorite",
        status: "Statut"
      },
      emptyTitle: "Aucune opportunite priorisee pour le moment",
      emptyDescription:
        "Commencez par la collecte d'opportunites et le scoring pour rendre le portefeuille plus simple a prioriser."
    },

    domainsModule: {
      title: "Domaines",
      description:
        "Voyez ou les capacites, processus et opportunites IA se regroupent dans le metier.",
      detailSubtitle:
        "Utilisez la vue domaine pour passer de la structure metier a la detection d'opportunites.",
      metrics: {
        domains: "Domaines",
        capabilities: "Capacites",
        processes: "Processus",
        opportunities: "Opportunites IA"
      },
      filters: {
        searchPlaceholder: "Rechercher des domaines ou des descriptions",
        scopeAll: "Tous les domaines",
        scopeWithOpportunities: "Avec opportunites IA",
        scopeWithoutOpportunities: "White space opportunite"
      },
      table: {
        domain: "Domaine",
        businessUnit: "Unite metier",
        capabilities: "Capacites",
        processes: "Processus",
        opportunities: "Opportunites IA"
      },
      capabilitiesTitle: "Capacites associees",
      capabilitiesDescription:
        "Les capacites montrent ou ce domaine peut rapidement se traduire en opportunites IA au niveau processus.",
      processesTitle: "Processus associes",
      processesDescription:
        "Ce sont les processus ou le domaine devient operationnel et pertinent pour l'IA.",
      opportunitiesTitle: "Opportunites IA associees",
      opportunitiesDescription:
        "Previsualisez les opportunites deja liees a ce domaine et reperez vite le white space.",
      emptyTitle: "Aucun domaine ne correspond a ces filtres",
      emptyDescription:
        "Elargissez les filtres ou commencez par cartographier une premiere zone metier et ses processus cles.",
      noDescription: "Pas encore de description du domaine.",
      noCapabilities: "Aucune capacite liee pour le moment.",
      noProcesses: "Aucun processus lie pour le moment.",
      noOpportunities: "Aucune opportunite IA liee pour le moment.",
      businessUnitHint:
        "La visibilite unite metier garde le module simple et actionnable."
    },
    processesModule: {
      title: "Processus",
      description:
        "Cartographiez la realite operationnelle, puis basculez naturellement vers la creation d'opportunites IA.",
      detailSubtitle:
        "Gardez le contexte processus leger, lisible et proche de la creation d'opportunites.",
      metrics: {
        processes: "Processus",
        painPoints: "Pain points",
        opportunities: "Opportunites IA",
        applications: "Applications connectees"
      },
      filters: {
        searchPlaceholder: "Rechercher des processus, owners ou descriptions",
        focusAll: "Tous les processus",
        focusLinkedOpportunities: "Avec opportunites IA",
        focusWithPainPoints: "Avec pain points",
        focusOpportunityWhitespace: "White space opportunite"
      },
      table: {
        process: "Processus",
        domain: "Domaine",
        owner: "Owner",
        businessUnit: "Unite metier",
        applications: "Applications",
        dataSources: "Sources de donnees",
        painPoints: "Pain points",
        opportunities: "Opportunites IA"
      },
      contextTitle: "Contexte processus",
      contextDescription:
        "Ancrez le processus dans la structure metier avant de le transformer en opportunites IA.",
      supportingSystemsTitle: "Applications et donnees",
      supportingSystemsDescription:
        "Ces systemes montrent si le processus est pret pour des opportunites ou encore foundation-first.",
      painPointsTitle: "Pain points",
      painPointsDescription:
        "Les pain points sont la meilleure matiere premiere pour creer des opportunites IA credibles.",
      opportunitiesTitle: "Opportunites IA liees",
      opportunitiesDescription:
        "Utilisez les opportunites deja liees comme preuve ou reperez le white space quand il n'y en a pas.",
      nextBestActionsDescription:
        "Ces prompts aident l'equipe a passer de la clarte processus a la creation d'opportunites.",
      subProcessesTitle: "Sous-processus",
      kpisTitle: "KPIs",
      emptyTitle: "Aucun processus ne correspond a ces filtres",
      emptyDescription:
        "Ajustez les filtres ou commencez par le premier processus qui merite une revue IA.",
      noDescription: "Pas encore de description du processus.",
      noOwner: "Aucun owner assigne",
      noCapability: "Aucune capacite liee",
      noApplications: "Aucune application liee pour le moment.",
      noDataSources: "Aucune source de donnees liee pour le moment.",
      noPainPoints: "Aucun pain point capture pour le moment.",
      noPainPointDescription: "Aucun detail supplementaire capture.",
      noOpportunities: "Aucune opportunite IA liee pour le moment.",
      noVendor: "Vendor non renseigne",
      noDataClassification: "Aucune classification renseignee.",
      scoreLabel: "Score",
      valueLabel: "Valeur attendue",
      actions: {
        identifyOpportunityTitle: "Identifier la premiere opportunite IA",
        identifyOpportunityBody:
          "Transformez la friction connue de ce processus en une hypothese d'opportunite avec ownership et valeur attendue.",
        capturePainPointTitle: "Capturer le pain point principal",
        capturePainPointBody:
          "Commencez par l'etape repetitive ou la plus penible pour les equipes.",
        linkSystemsTitle: "Lier les systemes support",
        linkSystemsBody:
          "Connectez les applications et sources de donnees principales pour juger la readiness plus vite.",
        reviewPortfolioTitle: "Revoir les opportunites liees",
        reviewPortfolioBody:
          "Utilisez les opportunites existantes pour decider si ce processus appelle un quick win ou une initiative plus gouvernee.",
        openOpportunities: "Ouvrir les opportunites",
        reviewProcessContext: "Revoir le contexte processus",
        reviewDomainContext: "Revoir le contexte domaine"
      }
    },
    opportunitiesModule: {
      title: "Portefeuille d'opportunites IA",
      description:
        "Passez de la comprehension des processus a une action portefeuille avec scoring, vues workflow et detail gouvernable.",
      noSummary: "Aucun resume capture pour le moment.",
      noDecision: "Pas de decision",
      noDecisionTitle: "Aucune decision de gouvernance pour le moment",
      noDecisionDescription:
        "Le plan Free couvre l'intake et la revue. Passez a Pro ou Enterprise quand la gouvernance doit monter en puissance.",
      noPainPoint: "Aucun pain point lie pour le moment.",
      noPainPointDescription: "Ajoutez la friction principale pour garder l'opportunite reliee a un probleme metier.",
      noProblemStatement: "Aucun problem statement explicite pour le moment.",
      noAiHypothesis: "Aucune hypothese IA documentee pour le moment.",
      noApplications: "Aucune application impactee liee pour le moment.",
      noDataSources: "Aucune source de donnees liee pour le moment.",
      noScoring: "Aucun scoring detaille capture pour le moment.",
      noRisks: "Aucun risque capture pour le moment.",
      noCompliance: "Aucun controle de conformite capture pour le moment.",
      noDependencies: "Aucune dependance capturee pour le moment.",
      noComments: "Aucun commentaire pour le moment.",
      noInitiative: "Aucune initiative de delivery liee pour le moment.",
      noExpectedValueMetrics: "Aucune metrique de valeur attendue pour le moment.",
      noRealizedValueMetrics: "Aucune metrique de valeur realisee pour le moment.",
      noStakeholders: "Aucun stakeholder assigne pour le moment.",
      emptyTitle: "Aucune opportunite ne correspond a ces filtres",
      emptyDescription:
        "Elargissez les filtres ou revenez a la vue table pour revoir tout le portefeuille d'opportunites IA.",
      disabledTitle: "Opportunites temporairement desactivees",
      disabledDescription:
        "Le module Opportunities est masque pour le moment. Vous pouvez continuer a travailler sur les domaines, les processus, la gouvernance et l'analytics pendant que le reste de l'application reste stable.",
      disabledAction: "Retour a la vue d'ensemble",
      metrics: {
        total: "Opportunites",
        quickWins: "Quick wins",
        portfolioReady: "Pretes pour action portefeuille",
        realizedValue: "Valeur realisee"
      },
      filters: {
        searchPlaceholder: "Rechercher titres, resumes, pain points ou hypotheses IA",
        allDomains: "Tous les domaines",
        allProcesses: "Tous les processus",
        allTypes: "Tous les types IA",
        allOwners: "Tous les owners",
        allStatuses: "Toutes les etapes workflow",
        allBadges: "Tous les badges",
        allRisks: "Tous les niveaux de risque",
        badge: "Badge",
        views: {
          table: "Table",
          kanban: "Kanban",
          matrix: "Matrice"
        },
        statusOptions: [
          { label: "Brouillon", value: "DRAFT" },
          { label: "Evaluee", value: "ASSESSING" },
          { label: "En revue", value: "PRIORITIZED" },
          { label: "Approuvee", value: "APPROVED" },
          { label: "En delivery", value: "IN_PROGRESS" },
          { label: "En live", value: "LIVE" },
          { label: "Archivee", value: "ARCHIVED" }
        ],
        badgeOptions: [
          { label: "Quick win", value: "QUICK_WIN" },
          { label: "Strategique", value: "STRATEGIC" },
          { label: "Transformation", value: "TRANSFORMATIONAL" },
          { label: "Haute confiance", value: "HIGH_CONFIDENCE" },
          { label: "A risque", value: "AT_RISK" }
        ],
        riskOptions: [
          { label: "Risque faible", value: "LOW" },
          { label: "Risque moyen", value: "MEDIUM" },
          { label: "Risque eleve", value: "HIGH" },
          { label: "Risque critique", value: "CRITICAL" }
        ],
        scoreOptions: [
          { label: "Tous les scores", value: "all" },
          { label: "80+", value: "80-plus" },
          { label: "60-79", value: "60-79" },
          { label: "Sous 60", value: "under-60" }
        ]
      },
      views: {
        tableTitle: "Vue table",
        tableDescription:
          "Revoyez tout le portefeuille avec score, workflow et contexte de decision.",
        kanbanTitle: "Vue kanban",
        kanbanDescription:
          "Passez de l'intake a la delivery avec une vue portefeuille orientee workflow.",
        matrixTitle: "Vue matrice",
        matrixDescription:
          "Voyez quelles opportunites combinent le meilleur score et la meilleure valeur attendue.",
        cards: "cartes"
      },
      table: {
        opportunity: "Opportunite",
        domain: "Domaine",
        process: "Processus",
        type: "Type IA",
        owner: "Owner",
        workflow: "Workflow",
        risk: "Risque",
        score: "Score",
        value: "Valeur attendue",
        decision: "Decision"
      },
      matrix: {
        xAxisTitle: "Bande de score",
        yAxisTitle: "Bande de valeur attendue",
        scoreBands: ["Sous 60", "60-79", "80+"],
        valueBands: ["Sous 250k$", "250k$-749k$", "750k$+"]
      },
      sections: {
        summary: "Resume",
        businessContext: "Contexte metier",
        painPoint: "Pain point",
        aiProposal: "Proposition IA",
        impactedApplications: "Applications impactees",
        availableData: "Donnees disponibles",
        detailedScoring: "Scoring detaille",
        risks: "Risques",
        compliance: "Conformite",
        dependencies: "Dependances",
        stakeholders: "Stakeholders",
        governanceDecision: "Decision de gouvernance",
        comments: "Commentaires",
        linkedInitiative: "Initiative liee",
        expectedValue: "Valeur attendue",
        realizedValue: "Valeur realisee"
      },
      detail: {
        workflow: "Workflow",
        status: "Statut actuel",
        score: "Score global",
        expectedValue: "Valeur attendue",
        realizedValue: "Valeur realisee",
        dataReadiness: "Maturite data",
        createdAt: "Creation",
        updatedAt: "Mise a jour",
        summaryDescription:
          "Gardez l'opportunite concise, defendable et reliee a son impact metier.",
        businessContextDescription:
          "Ancrez l'opportunite dans le domaine, la capability, le processus et la BU qui la rendent utile.",
        painPointDescription:
          "Le pain point garde la proposition IA reliee a un probleme operationnel concret.",
        aiProposalDescription:
          "Decrivez le probleme metier et le move IA qui pourrait le changer.",
        impactedApplicationsDescription:
          "Ces systemes montrent ou l'opportunite touchera l'operationnel.",
        availableDataDescription:
          "Ces sources de donnees faconnent la readiness, la confiance et la faisabilite.",
        detailedScoringDescription:
          "Le scoring transforme des idees prometteuses en portefeuille defendable.",
        risksDescription:
          "Les opportunites a forte valeur ont encore besoin de risques explicites et d'un plan de mitigation.",
        complianceDescription:
          "La credibilite governance monte quand les controles sont visibles tres tot.",
        dependenciesDescription:
          "Les dependances montrent ce qui doit bouger avant de capter la valeur.",
        stakeholdersDescription:
          "Une ownership claire aide l'opportunite a avancer au lieu de rester en revue.",
        governanceDescription:
          "Utilisez la decision actuelle et le chemin d'approbation pour voir ce qui est bloque ou pret.",
        commentsDescription:
          "Les commentaires rendent le portefeuille collaboratif sans devenir un outil workflow lourd.",
        linkedInitiativeDescription:
          "Utilisez l'initiative de delivery pour connecter l'opportunite a l'execution.",
        expectedValueDescription:
          "La valeur attendue garde l'opportunite ancree dans des metriques metier.",
        realizedValueDescription:
          "La valeur realisee prouve si l'opportunite delivre vraiment.",
        aiType: "Type IA",
        sponsor: "Sponsor",
        createdBy: "Creee par",
        processOwner: "Owner du processus",
        subProcess: "Sous-processus",
        problemStatement: "Problem statement",
        aiHypothesis: "Hypothese IA",
        valueScore: "Score valeur",
        feasibilityScore: "Score faisabilite",
        confidenceScore: "Score confiance",
        riskScore: "Score risque",
        weightLabel: "Poids",
        rawValueLabel: "Brut",
        weightedValueLabel: "Pondere",
        baselineValue: "Baseline",
        targetValue: "Cible",
        currentValue: "Actuel",
        approvedBudget: "Budget approuve",
        decisionBoard: "Board de decision",
        reviewMeeting: "Review meeting",
        decidedBy: "Decision prise par",
        approvalSteps: "Etapes d'approbation",
        followUpActions: "Actions de suivi",
        governanceDecisionCardTitle: "Resume de decision",
        governanceDecisionCardDescription:
          "Decision, rationale, approbations et actions de suivi dans une seule vue.",
        applicationsHint:
          "Liez les applications principales pour garder le scope solution visible.",
        dataHint:
          "Liez les sources de donnees coeur pour juger la readiness et le premier lot de delivery.",
        scoringHint:
          "La visibilite de score existe en Free. Pro ajoute une structure de scoring plus riche.",
        riskHint:
          "Meme les quick wins gagnent a avoir un risque explicite avant la delivery.",
        complianceHint:
          "Ajoutez les checks policy et regulatory quand l'opportunite touche des donnees sensibles.",
        dependenciesHint:
          "Capturez les dependances pour differencier quick wins et fondations prealables.",
        stakeholdersHint:
          "Assignez owner, sponsor et partenaires delivery pour faire avancer l'opportunite.",
        commentsHint:
          "Utilisez les commentaires pour capturer notes, objections et prochaines decisions.",
        initiativeHint:
          "Liez une initiative quand l'opportunite passe de priorisation a delivery.",
        valueHint:
          "Attachez une ou deux metriques metier pour rendre la valeur concrete.",
        realizedHint:
          "Suivez les metriques realisees et d'adoption une fois l'opportunite en delivery ou live.",
        dependsOn: "Depend de",
        blockedBy: "Bloquee par"
      },
      actions: {
        backToPortfolio: "Retour au portefeuille",
        reviewProcessTitle: "Revoir le contexte processus",
        reviewProcessDescription:
          "Restez ancre dans le processus, les systemes et les pain points derriere cette opportunite.",
        reviewProcessLabel: "Ouvrir le contexte processus",
        prepareInitiativeTitle: "Preparer le chemin delivery",
        prepareInitiativeDescription:
          "Utilisez le portefeuille pour decider si cela reste un quick win ou devient une initiative gouvernee.",
        reviewInitiativeTitle: "Revoir l'initiative liee",
        reviewInitiativeDescription:
          "Cette opportunite a deja une dynamique delivery. Revoyez le scope et le timing.",
        openPortfolioLabel: "Ouvrir le portefeuille",
        governanceTitle: "Passer en gouvernance",
        governanceDescription:
          "Pro ajoute des workflow actions, plus de collaboration et un meilleur rythme de decision.",
        openGovernanceLabel: "Ouvrir la gouvernance",
        enterpriseTitle: "Ouvrir les controles Enterprise",
        enterpriseDescription:
          "Enterprise ajoute policy cues, visibilite multi-BU et une posture audit plus forte.",
        openEnterpriseLabel: "Ouvrir les controles Enterprise"
      },
      upgrade: {
        previewLabel: "Preview upgrade",
        advancedFiltersTitle: "Les filtres avances se debloquent en Pro",
        advancedFiltersDescription:
          "Filtrez par type IA, owner, score, badge et risque quand la priorisation devient plus exigeante.",
        multiBusinessUnitTitle: "La visibilite multi-BU se debloque en Enterprise",
        multiBusinessUnitDescription:
          "Enterprise ajoute une lecture portefeuille par business unit pour les rollouts plus larges.",
        kanbanTitle: "Le workflow kanban se debloque en Pro",
        kanbanDescription:
          "Utilisez les lanes workflow, une meilleure collaboration et plus d'actions portefeuille.",
        kanbanBullets: [
          "Lanes portefeuille orientees workflow",
          "Meilleure collaboration pendant la revue",
          "Chemin plus clair de l'intake a la delivery"
        ],
        matrixTitle: "La matrice executive se debloque en Enterprise",
        matrixDescription:
          "Enterprise apporte une matrice portefeuille plus profonde avec contexte multi-BU et gouvernance.",
        matrixBullets: [
          "Matrice executive prete pour comex",
          "Visibilite multi-BU",
          "Governance et policy cues plus profondes"
        ],
        customScoringTitle: "Le scoring custom se debloque en Pro",
        customScoringDescription:
          "Gardez le score par defaut en Free puis adaptez dimensions et collaboration quand la priorisation devient serieuse.",
        customScoringBullets: [
          "Templates de score custom",
          "Collaboration d'assessment plus riche",
          "Rationale de priorisation plus forte"
        ],
        advancedGovernanceTitle: "La gouvernance avancee se debloque en Enterprise",
        advancedGovernanceDescription:
          "Enterprise ajoute controles de revue, policy cues, posture audit et rythme cross-BU.",
        advancedGovernanceBullets: [
          "Approvals et policy cues plus profonds",
          "Signaux de gouvernance audit-ready",
          "Controle portefeuille cross-BU"
        ]
      },
      planStrip: {
        freeTitle: "Free prouve la valeur vite",
        freeDescription:
          "Commencez avec intake relie aux processus, score visible et portefeuille deja utile.",
        freeFootnote:
          "Le plan Free sert a capturer les premieres opportunites puis vous passez a niveau quand la gouvernance compte.",
        proTitle: "Pro transforme le portefeuille en workflow",
        proDescription:
          "Debloquez filtres avances, scoring custom, vues workflow et collaboration plus forte.",
        enterpriseTitle: "Enterprise ajoute confiance et controle operatoire",
        enterpriseDescription:
          "Ajoutez visibilite multi-BU, gouvernance plus forte et rythme pret pour les dirigeants.",
        enterpriseFootnote:
          "Ce workspace de demo tourne deja sur Enterprise pour montrer l'experience complete."
      }
    },
    modulePlaceholder:
      "Ce module reste volontairement leger pour l'instant. Le shell de page, les labels, la navigation et la structure de feature gating sont deja prets."
  }
} satisfies Messages;
