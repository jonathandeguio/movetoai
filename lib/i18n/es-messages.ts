import type { Messages } from "@/lib/i18n/en";

export const esMessages = {
  meta: {
    title: "BluePilot AI",
    description:
      "Convierte la visibilidad de procesos en una cartera priorizada de oportunidades de IA."
  },
  common: {
    ctas: {
      startFree: "Empezar gratis",
      upgradePro: "Pasar a Pro",
      talkSales: "Hablar con ventas",
      requestDemo: "Solicitar demo",
      logIn: "Iniciar sesion",
      signUp: "Registrarse",
      exploreApp: "Explorar app",
      comparePlans: "Comparar planes"
    },
    navigation: {
      product: "Producto",
      pricing: "Precios",
      requestDemo: "Demo",
      login: "Acceso",
      signup: "Registro",
      app: "Aplicacion"
    },
    languages: {
      label: "Idioma",
      en: "Ingles",
      fr: "Frances",
      es: "Espanol"
    },
    labels: {
      recommended: "Recomendado",
      free: "Gratis",
      pro: "Pro",
      enterprise: "Enterprise",
      multilingual: "Trilingue por defecto",
      feature: "Funcion",
      placeholder: "Placeholder",
      moduleShell: "Shell MVP",
      comingSoon: "Proximamente",
      featureGate: "Feature gating",
      freePlan: "Plan gratis",
      proPlan: "Plan Pro",
      enterprisePlan: "Plan Enterprise",
      businessUnit: "Unidad de negocio",
      domain: "Dominio",
      capability: "Capacidad",
      capabilities: "Capacidades",
      process: "Proceso",
      processes: "Procesos",
      owner: "Owner",
      supportingApplications: "Aplicaciones",
      dataSources: "Fuentes de datos",
      painPoints: "Pain points",
      linkedOpportunities: "Oportunidades IA",
      nextBestActions: "Siguientes mejores acciones",
      noBusinessUnit: "Sin unidad de negocio",
      applyFilters: "Aplicar filtros",
      clearFilters: "Limpiar filtros",
      allBusinessUnits: "Todas las unidades de negocio"
    },
    legal: {
      privacy: "Privacidad",
      terms: "Terminos del servicio",
      cookies: "Politica de cookies",
      placeholderTitle: "Placeholder legal",
      placeholderBody:
        "Esta pagina sigue siendo ligera por ahora. Sustituyela por tu contenido legal antes del go-to-market."
    },
    featureGating: {
      freeLabel: "Incluido en Gratis",
      proLabel: "Se desbloquea en Pro",
      enterpriseLabel: "Listo para Enterprise",
      upgradeHint:
        "Pasa a Pro para desbloquear gobernanza, colaboracion y escalado."
    },
    validation: {
      required: "Este campo es obligatorio.",
      email: "Introduce un correo profesional valido.",
      minName: "Introduce tu nombre completo.",
      minCompany: "Introduce el nombre de tu empresa.",
      minPassword: "La contrasena debe tener al menos 8 caracteres.",
      minWorkspace: "Introduce un nombre de workspace.",
      minWorkspaceSlug: "Introduce un slug de workspace valido.",
      minMessage:
        "Anade un poco mas de contexto para dirigir correctamente tu solicitud."
    }
  },
  marketing: {
    hero: {
      eyebrow: "Capa de decision para oportunidades de IA",
      title: "Convierte ideas de IA dispersas en una cartera priorizada",
      subtitle:
        "BluePilot AI ayuda a los equipos a identificar las mejores oportunidades de IA por proceso de negocio, puntuarlas rapido y pasar de ideas sueltas a una ejecucion gobernada.",
      bullets: [
        "Empieza gratis con mapeo de oportunidades orientado al proceso",
        "Pasa a Pro cuando necesites gobernanza, colaboracion y escala",
        "Muevete mas rapido que con plataformas de transformacion pesadas"
      ]
    },
    value: {
      title: "De la visibilidad de procesos a la priorizacion de IA",
      items: [
        {
          title: "Ver primero las mejores oportunidades",
          description:
            "Organiza ideas por proceso, dolor operativo e impacto esperado en lugar de hojas dispersas."
        },
        {
          title: "Puntuar y priorizar en un solo flujo",
          description:
            "Une valor, viabilidad y preparacion para decidir en una sola vista de cartera."
        },
        {
          title: "Ligero, no pesado como un repositorio EA",
          description:
            "BluePilot AI ofrece la capa de decision que necesitan los lideres sin desplegar un repositorio de arquitectura empresarial."
        }
      ]
    },
    highlights: {
      title: "Disenado para un go-to-market agresivo y adopcion rapida",
      items: [
        "Entrada freemium para captar equipos con rapidez",
        "Ruta clara a Pro para gobernanza y escala",
        "Postura Enterprise de alta confianza para compradores ejecutivos"
      ]
    },
    proof: {
      title: "Lo que los equipos necesitan desde el dia uno",
      stats: [
        { value: "3x", label: "mas rapido para priorizar oportunidades" },
        { value: "1", label: "vista compartida entre producto, operaciones y transformacion" },
        { value: "0", label: "sobrecarga de arquitectura empresarial" }
      ]
    },
    plans: {
      title: "Empieza gratis. Pasa a Pro cuando necesites gobernanza y escala.",
      subtitle:
        "La base esta disenada para convertir usuarios gratuitos en workspaces Pro activos y cuentas Enterprise de confianza."
    },
    faq: {
      title: "Vista previa de FAQ",
      items: [
        {
          question: "BluePilot AI es una plataforma de process mining?",
          answer:
            "No. Es una capa de decision que transforma la visibilidad del proceso en una cartera accionable de oportunidades de IA."
        },
        {
          question: "Se puede empezar sin un programa de transformacion pesado?",
          answer:
            "Si. La entrada gratuita esta pensada para una activacion rapida y valor inmediato."
        },
        {
          question: "Enterprise esta listo para gobernanza?",
          answer:
            "Si. La base del producto esta preparada para mas controles, colaboracion y despliegue con confianza."
        }
      ]
    },
    repeatCta: {
      title: "Identifica las mejores oportunidades de IA en tus procesos de negocio",
      subtitle:
        "Empieza con claridad. Escala cuando aumenten la necesidad de gobernanza y despliegue."
    }
  },
  pricing: {
    title: "Precios pensados para crecimiento freemium y confianza enterprise",
    subtitle:
      "Empieza gratis, demuestra valor rapido y desbloquea despues el modelo operativo que necesitas.",
    plans: [
      {
        key: "free",
        name: "Gratis",
        price: "$0",
        period: "/mes",
        description: "Para equipos que prueban el descubrimiento de oportunidades de IA orientado al proceso.",
        cta: "Empezar gratis",
        features: [
          "Un workspace",
          "Captura de procesos y oportunidades",
          "Vista previa de scoring",
          "Base multilingue"
        ]
      },
      {
        key: "pro",
        name: "Pro",
        price: "$149",
        period: "/mes",
        description: "Para equipos que necesitan gobernanza, colaboracion y un verdadero flujo de cartera.",
        cta: "Pasar a Pro",
        features: [
          "Workspace de cartera compartido",
          "Shells de gobernanza y workflow",
          "Vistas avanzadas de priorizacion",
          "Colaboracion y configuracion de roles"
        ]
      },
      {
        key: "enterprise",
        name: "Enterprise",
        price: "Personalizado",
        period: "",
        description: "Para despliegue de alta confianza, visibilidad ejecutiva y controles avanzados.",
        cta: "Hablar con ventas",
        features: [
          "Onboarding Enterprise",
          "Gobernanza a escala",
          "Ruta de seguridad e integracion",
          "Paquete comercial personalizado"
        ]
      }
    ],
    comparisonTitle: "Arquitectura placeholder para tabla comparativa",
    comparisonDescription:
      "La arquitectura ya esta lista para una comparacion detallada por plan.",
    footerCta: {
      title: "Elige el camino que mejor encaja con tu madurez",
      subtitle:
        "Gratis para adquisicion. Pro para impulso. Enterprise para confianza y escala."
    }
  },
  requestDemo: {
    title: "Solicita una demo adaptada",
    subtitle:
      "Cuentanos tu contexto y centraremos la demo en visibilidad de procesos, scoring de cartera y gobernanza.",
    success:
      "Solicitud de demo capturada. El flujo comercial queda listo para conectarse despues con CRM."
  },
  auth: {
    login: {
      title: "Accede a BluePilot AI",
      subtitle:
        "Entra en tu workspace multilingue y en tu cartera de oportunidades de IA.",
      submit: "Iniciar sesion",
      footer: "Nuevo en BluePilot AI?",
      invalidCredentials: "Correo o contrasena invalidos."
    },
    signup: {
      title: "Crea tu cuenta gratis",
      subtitle:
        "Empieza gratis ahora y crea o unete a un workspace durante el onboarding.",
      submit: "Crear cuenta",
      footer: "Ya tienes cuenta?",
      onboardingNote:
        "Elegiras tu idioma, crearas o te uniras a un workspace y entraras en la app en el siguiente paso.",
      emailTaken: "Ya existe una cuenta con este correo.",
      unexpectedError: "No hemos podido crear tu cuenta ahora mismo."
    }
  },
  forms: {
    name: "Nombre completo",
    email: "Correo profesional",
    company: "Empresa",
    workspaceName: "Nombre del workspace",
    workspaceSlug: "Slug del workspace",
    password: "Contrasena",
    preferredLanguage: "Idioma preferido",
    role: "Rol",
    message: "Mensaje"
  },
  onboarding: {
    badge: "Onboarding",
    title: "Pasa del primer login a la primera oportunidad de IA en minutos",
    subtitle:
      "BluePilot AI convierte la visibilidad de procesos en una cartera gobernada de oportunidades de IA. Empieza con un workspace gratis, anade tus primeros procesos y sube de plan solo cuando gobernanza y escala importen.",
    formIntro:
      "Crea tu primer workspace para entrar en la app y empezar a mapear oportunidades de IA por proceso.",
    whatYouGetTitle: "Lo primero que te aporta BluePilot AI",
    whatYouGetBody:
      "Mapea algunos procesos, captura pain points, identifica oportunidades de IA y haz visible la priorizacion antes de invertir en herramientas de transformacion mas pesadas.",
    stepsTitle: "Como obtener valor rapido",
    steps: [
      "Anade tus primeros procesos y los pain points que frenan a los equipos.",
      "Captura las primeras oportunidades de IA ligadas a esos procesos.",
      "Usa scoring y gobernanza para ver que debe avanzar primero."
    ],
    planCards: [
      {
        title: "Gratis",
        description: "Una entrada self-serve real para mapear procesos y capturar oportunidades.",
        highlight: "1 workspace, 5 usuarios, 15 procesos y 30 oportunidades.",
        recommended: false
      },
      {
        title: "Pro",
        description: "Anade scoring personalizado, workflows de gobernanza, colaboracion de cartera y mas capacidad de IA.",
        highlight: "La mejor opcion cuando el equipo necesita priorizacion compartida y gobernanza.",
        recommended: true
      },
      {
        title: "Enterprise",
        description: "Anade despliegue multi-BU, auditoria, SSO, SCIM, admin centralizada y acceso API.",
        highlight: "Pensado para despliegues de alta confianza y ritmo ejecutivo.",
        recommended: false
      }
    ],
    modes: {
      create: {
        title: "Crear workspace",
        description: "Empieza un nuevo workspace Free y consigue valor rapido."
      },
      join: {
        title: "Unirte a un workspace",
        description: "Usa un slug existente y entra primero como viewer del portfolio."
      }
    },
    createHint:
      "Usa el nombre de tu equipo o programa. Se convertira en el workspace principal visible en la app.",
    joinHint:
      "Pide el slug a un workspace admin. Tu rol se puede ampliar mas adelante.",
    submitCreate: "Crear workspace gratis",
    submitJoin: "Unirme al workspace",
    errors: {
      workspaceNotFound: "No hemos encontrado un workspace con ese slug.",
      alreadyOnboarded: "Tu cuenta ya tiene un workspace activo.",
      unexpected: "No hemos podido completar el onboarding ahora mismo."
    },
    processFocus: {
      title: "Elige 5 procesos para mejorar con IA",
      subtitle:
        "Selecciona los cinco procesos de negocio que mas importan ahora. Estas elecciones personalizaran tu primera experiencia de oportunidades de IA.",
      whyTitle: "Por que importan estos 5",
      whyBody:
        "BluePilot AI usara esta seleccion para anclar el primer flujo de descubrimiento de oportunidades de IA en prioridades operativas reales.",
      bullets: [
        "Empieza desde procesos de negocio reales ya presentes en tu workspace.",
        "Da al producto un punto de partida concreto para descubrir oportunidades de IA.",
        "Mantiene el onboarding rapido, enfocado y util desde la primera sesion."
      ],
      searchPlaceholder: "Buscar procesos por nombre",
      selectedCountLabel: "seleccionados",
      helperText: "Elige exactamente 5 procesos para continuar.",
      continue: "Continuar",
      emptyTitle: "Todavia no hay procesos disponibles en este workspace",
      emptyDescription:
        "Ve primero al modulo Processes y vuelve despues para completar este paso con procesos reales.",
      openProcesses: "Ir a Processes",
      noSearchResults: "Ningun proceso coincide con tu busqueda.",
      noOwner: "No hay owner asignado",
      errors: {
        invalidSelection: "Elige exactamente 5 procesos validos antes de continuar.",
        unexpected: "No hemos podido guardar tu seleccion de procesos ahora mismo."
      }
    }
  },
  unauthorized: {
    eyebrow: "Control de acceso",
    title: "No tienes acceso a esta zona",
    description:
      "Tu rol actual no incluye el permiso necesario para este modulo. Amplia el plan o ajusta los roles del workspace cuando necesites una gobernanza mas amplia."
  },
  app: {
    resourceStates: {
      errorTitle: "Algo interrumpio esta vista",
      errorDescription:
        "Recarga este modulo o vuelve al shell principal del workspace.",
      retry: "Intentar de nuevo",
      notFoundTitle: "No se ha encontrado este elemento",
      notFoundDescription:
        "Puede que se haya eliminado o que no pertenezca a tu workspace actual."
    },
    shell: {
      workspaceLabel: "Workspace",
      searchPlaceholder: "Buscar oportunidades, procesos, gobernanza...",
      planBadge: "Plan gratis",
      noWorkspace: "Configuracion del workspace",
      noWorkspaceTitle: "Has iniciado sesion",
      noWorkspaceDescription:
        "Tu cuenta esta activa, pero todavia no tiene un workspace asociado.",
      noWorkspaceHint:
        "Este paso minimo de auth solo cubre registro, login, sesion y proteccion de rutas. Mas adelante podras crear o unirte a un workspace."
    },
    nav: {
      overview: { title: "Resumen", description: "Vista ejecutiva" },
      portfolio: { title: "Cartera", description: "Vista priorizada de oportunidades" },
      value: { title: "Valor", description: "Valor esperado y realizado" },
      domains: { title: "Dominios", description: "Cobertura de negocio" },
      opportunities: { title: "Oportunidades", description: "Captura de cartera IA" },
      processes: { title: "Procesos", description: "Lente de negocio" },
      dataProducts: { title: "Data products", description: "Capa de datos para AI readiness" },
      governance: { title: "Gobernanza", description: "Revision y decision" },
      analytics: { title: "Analitica", description: "Senales y pruebas" },
      settings: { title: "Configuracion", description: "Ajustes del workspace" }
    },
    overview: {
      eyebrow: "Shell multilingue",
      title: "Identifica oportunidades de IA mas rapido que tu modelo actual",
      subtitle:
        "Este shell MVP esta disenado para sentirse premium, creible y listo para adopcion rapida.",
      cards: [
        { label: "UI preparada para idiomas", value: "EN / FR / ES" },
        { label: "Ruta de upgrade", value: "Free -> Pro -> Enterprise" },
        { label: "Posicionamiento", value: "Capa de decision" }
      ],
      checklistTitle: "Lo que la base ya soporta",
      checklist: [
        "Navegacion y shell de paginas trilingues",
        "Historia de producto process-to-opportunity",
        "Arquitectura comercial Free / Pro / Enterprise",
        "Estructura lista para Auth.js y Prisma"
      ],
      metrics: {
        processesMapped: "Procesos mapeados",
        portfolioOpportunities: "Oportunidades de cartera",
        approvedOrLive: "Aprobadas o en live",
        realizedValue: "Valor realizado"
      },
      topProcessesTitle: "Clusters de procesos mejor puntuados",
      topProcessesDescription: "Score medio sobre los clusters de oportunidades mas fuertes.",
      spotlightTitle: "Oportunidades prioritarias",
      spotlightDescription: "Quick wins, apuestas aprobadas y valor ya visible en el workspace seed.",
      freePreviewTitle: "Preview de presion Free",
      freePreviewDescription:
        "El workspace demo tambien lleva un estado de limites Free para mostrar nudges de upgrade en el momento adecuado.",
      freePreviewLabels: {
        users: "Usuarios",
        opportunities: "Oportunidades",
        aiRequests: "Solicitudes IA"
      },
      emptyTitle: "Tus modulos de cartera empiezan aqui",
      emptyDescription:
        "Usa estas paginas shell para conectar despues scoring, gobernanza, cuotas, onboarding y workflows de cartera."
    },
    governanceModule: {
      title: "Estado de gobernanza",
      description:
        "Revisa las senales actuales de decision y las aprobaciones pendientes sin convertir el modulo en un workflow pesado.",
      labels: {
        noDecision: "Sin decision",
        noOwner: "Sin owner",
        noApprover: "Sin asignar",
        noDueDate: "Sin fecha"
      },
      decisions: {
        title: "Lista de decisiones",
        description:
          "Usa esta vista para ver que oportunidades ya tienen una decision de gobernanza y cuales siguen pendientes.",
        headers: {
          opportunity: "Oportunidad",
          currentStatus: "Estado actual",
          decision: "Decision",
          owner: "Owner",
          updatedAt: "Actualizado"
        },
        emptyTitle: "Todavia no hay decisiones de gobernanza",
        emptyDescription:
          "Las decisiones apareceran aqui cuando las oportunidades empiecen a pasar por revision y aprobacion."
      },
      approvalQueue: {
        title: "Cola de aprobacion",
        description:
          "Pasos de aprobacion pendientes que todavia necesitan atencion antes de mover las oportunidades.",
        headers: {
          opportunity: "Oportunidad",
          decision: "Decision",
          approval: "Aprobacion",
          approver: "Aprobador",
          dueDate: "Fecha limite"
        },
        emptyTitle: "La cola de aprobacion esta limpia",
        emptyDescription: "No hay pasos de aprobacion pendientes ahora mismo."
      },
      upgrade: {
        previewLabel: "Preview de upgrade",
        title: "La gobernanza avanzada se desbloquea en Enterprise",
        description:
          "Pase de una visibilidad basica de decisiones a policy cues mas fuertes, aprobaciones mas profundas y un ritmo de gobernanza listo para direccion.",
        bullets: [
          "Controles de gobernanza mas profundos",
          "Policy cues y aprobaciones mas fuertes",
          "Ritmo operativo Enterprise entre business units"
        ]
      }
    },
    valueModule: {
      title: "Seguimiento de valor",
      description:
        "Mantenga visible el valor esperado, el valor realizado y la adopcion sin convertir la pagina en un espacio pesado de analitica.",
      summary: {
        totalExpectedValue: "Valor esperado total",
        totalRealizedValue: "Valor realizado total",
        adoptionOverview: "Vision general de adopcion"
      },
      table: {
        title: "Tabla de valor de iniciativas",
        description:
          "Revise las iniciativas ya vinculadas a oportunidades y vea si el valor empieza a materializarse."
      },
      headers: {
        initiative: "Iniciativa u oportunidad",
        expectedRoi: "ROI esperado",
        realizedRoi: "ROI realizado",
        adoption: "Adopcion",
        status: "Estado"
      },
      labels: {
        noOpportunity: "Sin oportunidad vinculada",
        noRoi: "Sin ROI todavia",
        noAdoption: "Sin datos de adopcion"
      },
      emptyTitle: "Todavia no hay datos de valor de iniciativas",
      emptyDescription:
        "Vincule iniciativas a oportunidades y anada metricas de beneficio o adopcion para hacer visible el valor aqui."
    },
    aiAssistant: {
      badge: "Asistente IA mock",
      title: "Sugerencias del asistente IA",
      description:
        "Use sugerencias deterministas basadas en el contexto actual del proceso para afinar la siguiente oportunidad.",
      painPointSummary: "Resumen de pain points",
      suggestedUseCaseType: "Tipo de caso de uso IA sugerido",
      suggestedOpportunities: "Oportunidades IA sugeridas",
      confidence: "Confianza",
      mockNote: "Salida de demo",
      emptySuggestions: "Todavia no hay sugerencias del asistente."
    },
    portfolioModule: {
      title: "Cartera priorizada",
      description:
        "Ve que oportunidades deben avanzar primero, agrupadas por la senal de scoring que mas importa.",
      summary: {
        total: "Oportunidades priorizadas",
        quickWins: "Quick Wins",
        strategicBets: "Apuestas estrategicas",
        highRisk: "Alto riesgo"
      },
      groups: {
        QUICK_WIN: "Quick Wins",
        STRATEGIC_BET: "Apuestas estrategicas",
        HIGH_RISK: "Alto riesgo"
      },
      table: {
        title: "Oportunidades priorizadas",
        description:
          "Usa esta vista para entender que mover ahora, que seguir madurando y que requiere mas cautela."
      },
      headers: {
        name: "Oportunidad",
        process: "Proceso",
        score: "Score",
        badge: "Prioridad",
        status: "Estado"
      },
      emptyTitle: "Todavia no hay oportunidades priorizadas",
      emptyDescription:
        "Empieza con intake de oportunidades y scoring para que la cartera sea mas facil de priorizar."
    },
    dataProductsModule: {
      eyebrow: "Data Products para AI Readiness",
      title: "Data products",
      description:
        "Revisa los data products que soportan tus procesos y oportunidades de IA con una vista simple de madurez y readiness.",
      table: {
        title: "Lista de data products",
        description:
          "Usa esta vista para entender que data products ya soportan tu paisaje de procesos y tu cartera de oportunidades."
      },
      filters: {
        searchLabel: "Busqueda",
        searchPlaceholder: "Buscar data products por nombre",
        medallionStage: "Etapa medallion",
        readiness: "Readiness",
        allMedallionStages: "Todas las etapas",
        allReadinessStates: "Todos los niveles de readiness",
        stageOptions: {
          bronze: "Bronze",
          silver: "Silver",
          gold: "Gold"
        },
        readinessOptions: {
          draft: "Borrador",
          inProgress: "En progreso",
          ready: "Listo"
        }
      },
      headers: {
        name: "Data product",
        medallionStage: "Etapa medallion",
        readiness: "Readiness",
        processCount: "Procesos",
        opportunityCount: "Oportunidades",
        reportingAssetCount: "Assets de reporting"
      },
      openDataProduct: "Abrir data product",
      detail: {
        backToList: "Volver a data products",
        summaryTitle: "Resumen",
        summaryDescription:
          "Revisa el contexto esencial que hace util este data product para soporte de procesos y AI readiness.",
        noDescription: "Todavia no hay descripcion del data product.",
        noOwner: "No hay owner asignado",
        freshness: "Freshness",
        noFreshness: "No hay freshness definida",
        classification: "Classification",
        noClassification: "No hay classification definida",
        sourceSystem: "Sistema fuente",
        noSourceSystem: "No hay sistema fuente vinculado",
        duckdbDatasetRef: "Referencia de dataset DuckDB",
        noDuckdbDatasetRef: "Sin referencia de dataset DuckDB",
        reportingDatasetRef: "Referencia de dataset de reporting",
        noReportingDatasetRef: "Sin referencia de dataset de reporting",
        linkedProcessesTitle: "Procesos vinculados",
        linkedProcessesDescription:
          "Estos procesos de negocio dependen actualmente de este data product.",
        noLinkedProcesses: "Todavia no hay procesos vinculados.",
        openProcess: "Abrir proceso",
        linkedOpportunitiesTitle: "Oportunidades IA vinculadas",
        linkedOpportunitiesDescription:
          "Estas oportunidades de IA dependen actualmente de este data product.",
        noLinkedOpportunities: "Todavia no hay oportunidades IA vinculadas.",
        openOpportunity: "Abrir oportunidad",
        linkedReportingAssetsTitle: "Assets de reporting vinculados",
        linkedReportingAssetsDescription:
          "Usa los assets de reporting para mostrar donde este data product ya se reutiliza en dashboards y reporting operativo.",
        noLinkedReportingAssets: "Todavia no hay assets de reporting vinculados.",
        noLinkedProcess: "Sin proceso vinculado",
        externalUrl: "URL externa",
        noExternalUrl: "Sin URL externa",
        supersetDashboardUrl: "URL de dashboard Superset",
        noSupersetDashboardUrl: "Sin URL de dashboard Superset",
        openReportingAsset: "Abrir asset de reporting",
        openSupersetDashboard: "Abrir dashboard Superset",
        qualitySignalsTitle: "Senales de calidad",
        qualitySignalsDescription:
          "Las senales de calidad ayudan a los equipos a juzgar si el data product es confiable y utilizable.",
        qualitySignals: "Senales de calidad",
        noQualitySignals: "Todavia no hay senales de calidad registradas.",
        value: "Valor",
        noValue: "Sin valor",
        measuredAt: "Medido",
        notMeasured: "No medido"
      },
      emptyTitle: "Todavia no hay data products",
      emptyFilteredTitle: "Ningun data product coincide con estos filtros",
      emptyDescription:
        "Empieza por definir los data products que soportan tus procesos prioritarios y tus oportunidades de IA."
      ,
      emptyFilteredDescription:
        "Prueba una busqueda mas amplia o limpia uno de los filtros activos para ver mas data products."
    },
    domainsModule: {
      title: "Dominios",
      description:
        "Ve donde se concentran capacidades, procesos y oportunidades de IA en el negocio.",
      detailSubtitle:
        "Usa la vista dominio para pasar de la estructura de negocio al descubrimiento de oportunidades.",
      metrics: {
        domains: "Dominios",
        capabilities: "Capacidades",
        processes: "Procesos",
        opportunities: "Oportunidades IA"
      },
      filters: {
        searchPlaceholder: "Buscar dominios o descripciones",
        scopeAll: "Todos los dominios",
        scopeWithOpportunities: "Con oportunidades IA",
        scopeWithoutOpportunities: "Espacio de oportunidad"
      },
      table: {
        domain: "Dominio",
        businessUnit: "Unidad de negocio",
        capabilities: "Capacidades",
        processes: "Procesos",
        opportunities: "Oportunidades IA"
      },
      capabilitiesTitle: "Capacidades relacionadas",
      capabilitiesDescription:
        "Las capacidades muestran donde este dominio puede convertirse rapido en oportunidades de IA a nivel proceso.",
      processesTitle: "Procesos relacionados",
      processesDescription:
        "Estos son los procesos donde el dominio se vuelve operativo y listo para generar oportunidades.",
      opportunitiesTitle: "Oportunidades IA relacionadas",
      opportunitiesDescription:
        "Previsualiza las oportunidades ya conectadas a este dominio y detecta rapido el espacio libre.",
      emptyTitle: "Ningun dominio coincide con estos filtros",
      emptyDescription:
        "Amplia los filtros o empieza mapeando una primera area de negocio y sus procesos clave.",
      noDescription: "Todavia no hay descripcion del dominio.",
      noCapabilities: "Todavia no hay capacidades relacionadas.",
      noProcesses: "Todavia no hay procesos relacionados.",
      noOpportunities: "Todavia no hay oportunidades de IA relacionadas.",
      businessUnitHint:
        "La visibilidad por unidad de negocio mantiene el modulo simple y accionable."
    },
    processesModule: {
      title: "Procesos",
      description:
        "Mapea la realidad operativa y pasa de forma natural a la creacion de oportunidades de IA.",
      detailSubtitle:
        "Mantiene el contexto del proceso ligero, claro y muy cerca de la creacion de oportunidades.",
      metrics: {
        processes: "Procesos",
        painPoints: "Pain points",
        opportunities: "Oportunidades IA",
        applications: "Aplicaciones conectadas"
      },
      filters: {
        searchPlaceholder: "Buscar procesos, owners o descripciones",
        focusAll: "Todos los procesos",
        focusLinkedOpportunities: "Con oportunidades IA",
        focusWithPainPoints: "Con pain points",
        focusOpportunityWhitespace: "Espacio de oportunidad"
      },
      table: {
        process: "Proceso",
        domain: "Dominio",
        owner: "Owner",
        businessUnit: "Unidad de negocio",
        applications: "Aplicaciones",
        dataSources: "Fuentes de datos",
        painPoints: "Pain points",
        opportunities: "Oportunidades IA"
      },
      contextTitle: "Contexto del proceso",
      contextDescription:
        "Ancla el proceso en la estructura de negocio antes de convertirlo en oportunidades de IA.",
      supportingSystemsTitle: "Aplicaciones y datos",
      supportingSystemsDescription:
        "Estos sistemas muestran si el proceso esta listo para oportunidades o si sigue siendo foundation-first.",
      painPointsTitle: "Pain points",
      painPointsDescription:
        "Los pain points son la mejor materia prima para crear oportunidades de IA con credibilidad.",
      opportunitiesTitle: "Oportunidades IA vinculadas",
      opportunitiesDescription:
        "Usa las oportunidades vinculadas como prueba o detecta espacio libre cuando no haya ninguna.",
      dataProductsTitle: "Data products vinculados",
      dataProductsDescription:
        "Estos data products muestran que ya soporta este proceso y que tan preparada esta la base de datos para IA.",
      nextBestActionsDescription:
        "Estos prompts ayudan al equipo a pasar de la claridad del proceso a la creacion de oportunidades.",
      subProcessesTitle: "Subprocesos",
      kpisTitle: "KPIs",
      emptyTitle: "Ningun proceso coincide con estos filtros",
      emptyDescription:
        "Ajusta los filtros o empieza por el primer proceso que merezca revision de IA.",
      noDescription: "Todavia no hay descripcion del proceso.",
      noOwner: "Sin owner asignado",
      noCapability: "Sin capacidad vinculada",
      noApplications: "Todavia no hay aplicaciones vinculadas.",
      noDataSources: "Todavia no hay fuentes de datos vinculadas.",
      noPainPoints: "Todavia no se han capturado pain points.",
      noPainPointDescription: "Todavia no hay detalle adicional.",
      noOpportunities: "Todavia no hay oportunidades de IA vinculadas.",
      noDataProducts: "Todavia no hay data products vinculados.",
      noDataProductsDescription:
        "Vincula los data products que soportan este proceso para hacer mas visible la readiness de IA.",
      noVendor: "Vendor no especificado",
      noDataClassification: "Todavia no hay clasificacion de datos.",
      scoreLabel: "Score",
      valueLabel: "Valor esperado",
      openDataProduct: "Abrir data product",
      actions: {
        identifyOpportunityTitle: "Identificar la primera oportunidad de IA",
        identifyOpportunityBody:
          "Convierte la friccion conocida de este proceso en una hipotesis de oportunidad con ownership y valor esperado.",
        capturePainPointTitle: "Capturar el pain point principal",
        capturePainPointBody:
          "Empieza por el paso repetitivo o de mayor friccion que mas pesa sobre el equipo.",
        linkSystemsTitle: "Vincular los sistemas de soporte",
        linkSystemsBody:
          "Conecta las principales aplicaciones y fuentes de datos para evaluar mejor la readiness.",
        reviewPortfolioTitle: "Revisar oportunidades vinculadas",
        reviewPortfolioBody:
          "Usa las oportunidades existentes para decidir si este proceso necesita un quick win o una iniciativa mas gobernada.",
        openOpportunities: "Abrir oportunidades",
        reviewProcessContext: "Revisar contexto del proceso",
        reviewDomainContext: "Revisar contexto del dominio"
      }
    },
    opportunitiesModule: {
      title: "Cartera de oportunidades IA",
      description:
        "Pase de la comprension del proceso a la accion de cartera con scoring, vistas workflow y detalle listo para gobernanza.",
      noSummary: "No hay resumen capturado todavia.",
      noDecision: "Sin decision",
      noDecisionTitle: "Todavia no hay decision de gobernanza",
      noDecisionDescription:
        "Free cubre intake y revision. Pase a Pro o Enterprise cuando la gobernanza necesite mas estructura.",
      noPainPoint: "Todavia no hay pain point vinculado.",
      noPainPointDescription: "Agregue la friccion principal para mantener la oportunidad unida al problema de negocio.",
      noProblemStatement: "Todavia no hay problem statement explicito.",
      noAiHypothesis: "Todavia no hay hipotesis IA documentada.",
      noApplications: "Todavia no hay aplicaciones impactadas vinculadas.",
      noDataSources: "Todavia no hay fuentes de datos vinculadas.",
      noScoring: "Todavia no hay scoring detallado.",
      noRisks: "Todavia no hay riesgos registrados.",
      noCompliance: "Todavia no hay chequeos de compliance.",
      noDependencies: "Todavia no hay dependencias registradas.",
      noComments: "Todavia no hay comentarios.",
      noInitiative: "Todavia no hay iniciativa de delivery vinculada.",
      noExpectedValueMetrics: "Todavia no hay metricas de valor esperado.",
      noRealizedValueMetrics: "Todavia no hay metricas de valor realizado.",
      noStakeholders: "Todavia no hay stakeholders asignados.",
      emptyTitle: "Ninguna oportunidad coincide con estos filtros",
      emptyDescription:
        "Amplie los filtros o vuelva a la vista tabla para revisar toda la cartera de oportunidades IA.",
      disabledTitle: "Oportunidades desactivadas temporalmente",
      disabledDescription:
        "El modulo Opportunities esta oculto por ahora. Puede seguir trabajando en dominios, procesos, gobernanza y analytics mientras mantenemos estable el resto de la aplicacion.",
      disabledAction: "Volver al resumen",
      metrics: {
        total: "Oportunidades",
        quickWins: "Quick wins",
        portfolioReady: "Listas para accion de cartera",
        realizedValue: "Valor realizado"
      },
      filters: {
        searchPlaceholder: "Buscar titulos, resumenes, pain points o hipotesis IA",
        allDomains: "Todos los dominios",
        allProcesses: "Todos los procesos",
        allTypes: "Todos los tipos IA",
        allOwners: "Todos los owners",
        allStatuses: "Todas las etapas workflow",
        allBadges: "Todos los badges",
        allRisks: "Todos los niveles de riesgo",
        badge: "Badge",
        views: {
          table: "Tabla",
          kanban: "Kanban",
          matrix: "Matriz"
        },
        statusOptions: [
          { label: "Borrador", value: "DRAFT" },
          { label: "Evaluada", value: "ASSESSING" },
          { label: "En revision", value: "PRIORITIZED" },
          { label: "Aprobada", value: "APPROVED" },
          { label: "En delivery", value: "IN_PROGRESS" },
          { label: "En vivo", value: "LIVE" },
          { label: "Archivada", value: "ARCHIVED" }
        ],
        badgeOptions: [
          { label: "Quick win", value: "QUICK_WIN" },
          { label: "Estrategica", value: "STRATEGIC" },
          { label: "Transformacional", value: "TRANSFORMATIONAL" },
          { label: "Alta confianza", value: "HIGH_CONFIDENCE" },
          { label: "En riesgo", value: "AT_RISK" }
        ],
        riskOptions: [
          { label: "Riesgo bajo", value: "LOW" },
          { label: "Riesgo medio", value: "MEDIUM" },
          { label: "Riesgo alto", value: "HIGH" },
          { label: "Riesgo critico", value: "CRITICAL" }
        ],
        scoreOptions: [
          { label: "Todos los scores", value: "all" },
          { label: "80+", value: "80-plus" },
          { label: "60-79", value: "60-79" },
          { label: "Menos de 60", value: "under-60" }
        ]
      },
      views: {
        tableTitle: "Vista tabla",
        tableDescription:
          "Revise toda la cartera con score, workflow y contexto de decision.",
        kanbanTitle: "Vista kanban",
        kanbanDescription:
          "Pase del intake a la delivery con una vista de cartera orientada al workflow.",
        matrixTitle: "Vista matriz",
        matrixDescription:
          "Vea que oportunidades combinan mejor score y valor esperado en la cartera.",
        cards: "tarjetas"
      },
      table: {
        opportunity: "Oportunidad",
        domain: "Dominio",
        process: "Proceso",
        type: "Tipo IA",
        owner: "Owner",
        workflow: "Workflow",
        risk: "Riesgo",
        score: "Score",
        value: "Valor esperado",
        decision: "Decision"
      },
      matrix: {
        xAxisTitle: "Banda de score",
        yAxisTitle: "Banda de valor esperado",
        scoreBands: ["Menos de 60", "60-79", "80+"],
        valueBands: ["Menos de $250k", "$250k-$749k", "$750k+"]
      },
      sections: {
        summary: "Resumen",
        businessContext: "Contexto de negocio",
        painPoint: "Pain point",
        aiProposal: "Propuesta IA",
        impactedApplications: "Aplicaciones impactadas",
        availableData: "Datos disponibles",
        detailedScoring: "Scoring detallado",
        risks: "Riesgos",
        compliance: "Compliance",
        dependencies: "Dependencias",
        stakeholders: "Stakeholders",
        governanceDecision: "Decision de gobernanza",
        comments: "Comentarios",
        linkedInitiative: "Iniciativa vinculada",
        expectedValue: "Valor esperado",
        realizedValue: "Valor realizado"
      },
      detail: {
        workflow: "Workflow",
        status: "Estado actual",
        score: "Score global",
        expectedValue: "Valor esperado",
        realizedValue: "Valor realizado",
        dataReadiness: "Madurez de datos",
        createdAt: "Creado",
        updatedAt: "Actualizado",
        summaryDescription:
          "Mantenga la oportunidad concisa, defendible y conectada al impacto de negocio.",
        businessContextDescription:
          "Ancle la oportunidad en el dominio, capability, proceso y BU que la hacen relevante.",
        painPointDescription:
          "El pain point mantiene la propuesta IA conectada a un problema operativo concreto.",
        aiProposalDescription:
          "Describa el problema de negocio y el movimiento IA que podria cambiarlo.",
        impactedApplicationsDescription:
          "Estos sistemas muestran donde la oportunidad aterriza operativamente.",
        availableDataDescription:
          "Estas fuentes de datos moldean la readiness, la confianza y la factibilidad.",
        detailedScoringDescription:
          "El scoring convierte ideas prometedoras en una cartera con tradeoffs defendibles.",
        risksDescription:
          "Las oportunidades de alto valor aun necesitan riesgos explicitos y mitigacion.",
        complianceDescription:
          "La credibilidad de gobernanza sube cuando los controles son visibles temprano.",
        dependenciesDescription:
          "Las dependencias muestran que debe moverse primero antes de capturar valor.",
        stakeholdersDescription:
          "La ownership clara ayuda a que la oportunidad avance y no quede estancada.",
        governanceDescription:
          "Use la decision actual y el camino de aprobacion para ver que esta bloqueado o listo.",
        commentsDescription:
          "Los comentarios hacen la cartera mas colaborativa sin volverse una herramienta pesada.",
        linkedInitiativeDescription:
          "Use la iniciativa de delivery para conectar la oportunidad con la ejecucion.",
        expectedValueDescription:
          "El valor esperado mantiene la oportunidad anclada a metricas de negocio.",
        realizedValueDescription:
          "El valor realizado prueba si la oportunidad realmente esta entregando.",
        aiType: "Tipo IA",
        sponsor: "Sponsor",
        createdBy: "Creada por",
        processOwner: "Owner del proceso",
        subProcess: "Subproceso",
        problemStatement: "Problem statement",
        aiHypothesis: "Hipotesis IA",
        valueScore: "Score de valor",
        feasibilityScore: "Score de factibilidad",
        confidenceScore: "Score de confianza",
        riskScore: "Score de riesgo",
        weightLabel: "Peso",
        rawValueLabel: "Bruto",
        weightedValueLabel: "Ponderado",
        baselineValue: "Baseline",
        targetValue: "Objetivo",
        currentValue: "Actual",
        approvedBudget: "Presupuesto aprobado",
        decisionBoard: "Board de decision",
        reviewMeeting: "Review meeting",
        decidedBy: "Decidido por",
        approvalSteps: "Pasos de aprobacion",
        followUpActions: "Acciones de seguimiento",
        governanceDecisionCardTitle: "Resumen de decision",
        governanceDecisionCardDescription:
          "Decision, rationale, aprobaciones y acciones de seguimiento en una sola vista.",
        applicationsHint:
          "Vincule las aplicaciones principales para mantener visible el alcance de la solucion.",
        dataHint:
          "Vincule las fuentes de datos clave para juzgar readiness y el primer slice de delivery.",
        scoringHint:
          "La visibilidad basica de score funciona en Free. Pro agrega scoring mas rico y colaboracion.",
        riskHint:
          "Incluso los quick wins ganan con un riesgo explicito antes de pasar a delivery.",
        complianceHint:
          "Agregue checks de policy y regulatorios cuando la oportunidad toca datos sensibles.",
        dependenciesHint:
          "Capture dependencias para distinguir quick wins de apuestas foundation-first.",
        stakeholdersHint:
          "Asigne owner, sponsor y socios de delivery para que la oportunidad avance.",
        commentsHint:
          "Use comentarios para capturar notas, objeciones y proximas decisiones.",
        initiativeHint:
          "Vincule una iniciativa cuando la oportunidad pase de priorizacion a delivery.",
        valueHint:
          "Adjunte una o dos metricas de negocio para volver concreta la promesa de valor.",
        realizedHint:
          "Siga metricas realizadas y de adopcion una vez que la oportunidad este en delivery o live.",
        dependsOn: "Depende de",
        blockedBy: "Bloqueada por"
      },
      actions: {
        backToPortfolio: "Volver a la cartera",
        reviewProcessTitle: "Revisar el contexto del proceso",
        reviewProcessDescription:
          "Mantengase anclado en el proceso, sistemas y pain points detras de esta oportunidad.",
        reviewProcessLabel: "Abrir contexto del proceso",
        prepareInitiativeTitle: "Preparar la ruta de delivery",
        prepareInitiativeDescription:
          "Use la cartera para decidir si esto sigue como quick win o pasa a iniciativa gobernada.",
        reviewInitiativeTitle: "Revisar la iniciativa vinculada",
        reviewInitiativeDescription:
          "Esta oportunidad ya tiene movimiento de delivery. Revise alcance y timing.",
        openPortfolioLabel: "Abrir cartera",
        governanceTitle: "Mover a gobernanza",
        governanceDescription:
          "Pro agrega workflow actions, colaboracion mas rica y un mejor ritmo de decision.",
        openGovernanceLabel: "Abrir gobernanza",
        enterpriseTitle: "Abrir controles Enterprise",
        enterpriseDescription:
          "Enterprise agrega policy cues, visibilidad multi-BU y una postura de auditoria mas fuerte.",
        openEnterpriseLabel: "Abrir controles Enterprise"
      },
      upgrade: {
        previewLabel: "Preview de upgrade",
        advancedFiltersTitle: "Los filtros avanzados se desbloquean en Pro",
        advancedFiltersDescription:
          "Filtre por tipo IA, owner, score, badge y riesgo cuando la priorizacion exija mas precision.",
        multiBusinessUnitTitle: "La visibilidad multi-BU se desbloquea en Enterprise",
        multiBusinessUnitDescription:
          "Enterprise agrega lectura de cartera por business unit para despliegues mas amplios.",
        kanbanTitle: "El workflow kanban se desbloquea en Pro",
        kanbanDescription:
          "Use lanes workflow, mejor colaboracion y mas acciones de cartera cuando las oportunidades empiecen a moverse.",
        kanbanBullets: [
          "Lanes de cartera orientadas a workflow",
          "Mejor colaboracion durante la revision",
          "Camino mas claro del intake a la delivery"
        ],
        matrixTitle: "La matriz ejecutiva se desbloquea en Enterprise",
        matrixDescription:
          "Enterprise aporta una matriz de cartera mas profunda con contexto multi-BU y de gobernanza.",
        matrixBullets: [
          "Matriz ejecutiva lista para direccion",
          "Visibilidad multi-BU",
          "Governance y policy cues mas profundos"
        ],
        customScoringTitle: "El scoring custom se desbloquea en Pro",
        customScoringDescription:
          "Mantenga el score por defecto en Free y adapte dimensiones y colaboracion cuando la priorizacion se vuelva seria.",
        customScoringBullets: [
          "Templates de score custom",
          "Colaboracion de assessment mas rica",
          "Rationale de priorizacion mas fuerte"
        ],
        advancedGovernanceTitle: "La gobernanza avanzada se desbloquea en Enterprise",
        advancedGovernanceDescription:
          "Enterprise agrega controles de revision, policy cues, postura de auditoria y ritmo cross-BU.",
        advancedGovernanceBullets: [
          "Aprobaciones y policy cues mas profundos",
          "Senales de gobernanza audit-ready",
          "Control de cartera cross-BU"
        ]
      },
      planStrip: {
        freeTitle: "Free prueba valor rapido",
        freeDescription:
          "Empiece con intake ligado a procesos, score visible y una cartera que ya se siente util.",
        freeFootnote:
          "Use Free para capturar las primeras oportunidades y actualice solo cuando gobernanza y escala importen.",
        proTitle: "Pro convierte la cartera en workflow",
        proDescription:
          "Desbloquee filtros avanzados, scoring custom, vistas workflow y colaboracion mas fuerte.",
        enterpriseTitle: "Enterprise agrega confianza y control operativo",
        enterpriseDescription:
          "Agregue visibilidad multi-BU, gobernanza mas fuerte y un ritmo listo para ejecutivos.",
        enterpriseFootnote:
          "Este workspace demo ya corre sobre Enterprise para mostrar la experiencia completa."
      }
    },
    modulePlaceholder:
      "Este modulo sigue siendo ligero por ahora. La estructura de pagina, etiquetas, navegacion y feature gating ya esta lista."
  }
} satisfies Messages;
