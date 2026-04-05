export { esMessages } from "@/lib/i18n/es-messages";
/*
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
      logIn: "Iniciar sesión",
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
      app: "Aplicación"
    },
    languages: {
      label: "Idioma",
      en: "Inglés",
      fr: "Francés",
      es: "Español"
    },
    labels: {
      recommended: "Recomendado",
      free: "Gratis",
      pro: "Pro",
      enterprise: "Enterprise",
      multilingual: "Trilingüe por defecto",
      feature: "Función",
      placeholder: "Placeholder",
      moduleShell: "Shell MVP",
      comingSoon: "Próximamente",
      featureGate: "Feature gating",
      freePlan: "Plan gratis",
      proPlan: "Plan Pro",
      enterprisePlan: "Plan Enterprise"
    },
    legal: {
      privacy: "Privacidad",
      terms: "Términos del servicio",
      cookies: "Política de cookies",
      placeholderTitle: "Placeholder legal",
      placeholderBody:
        "Esta página sigue siendo ligera por ahora. Sustitúyela por tu contenido legal antes del go-to-market."
    },
    featureGating: {
      freeLabel: "Incluido en Gratis",
      proLabel: "Se desbloquea en Pro",
      enterpriseLabel: "Listo para Enterprise",
      upgradeHint:
        "Pasa a Pro para desbloquear gobernanza, colaboración y escalado."
    },
    validation: {
      required: "Este campo es obligatorio.",
      email: "Introduce un correo profesional válido.",
      minName: "Introduce tu nombre completo.",
      minCompany: "Introduce el nombre de tu empresa.",
      minPassword: "La contraseña debe tener al menos 8 caracteres.",
      minMessage:
        "Añade un poco más de contexto para dirigir correctamente tu solicitud."
    }
  },
  marketing: {
    hero: {
      eyebrow: "Capa de decisión para oportunidades de IA",
      title: "Convierte ideas de IA dispersas en una cartera priorizada",
      subtitle:
        "BluePilot AI ayuda a los equipos a identificar las mejores oportunidades de IA por proceso de negocio, puntuarlas rápido y pasar de ideas sueltas a una ejecución gobernada.",
      bullets: [
        "Empieza gratis con mapeo de oportunidades orientado al proceso",
        "Pasa a Pro cuando necesites gobernanza, colaboración y escala",
        "Muévete más rápido que con plataformas de transformación pesadas"
      ]
    },
    value: {
      title: "De la visibilidad de procesos a la priorización de IA",
      items: [
        {
          title: "Ver primero las mejores oportunidades",
          description:
            "Organiza ideas por proceso, dolor operativo e impacto esperado en lugar de hojas dispersas."
        },
        {
          title: "Puntuar y priorizar en un solo flujo",
          description:
            "Une valor, viabilidad y preparación para decidir en una sola vista de cartera."
        },
        {
          title: "Ligero, no pesado como un repositorio EA",
          description:
            "BluePilot AI ofrece la capa de decisión que necesitan los líderes sin desplegar un repositorio de arquitectura empresarial."
        }
      ]
    },
    highlights: {
      title: "Diseñado para un go-to-market agresivo y adopción rápida",
      items: [
        "Entrada freemium para captar equipos con rapidez",
        "Ruta clara a Pro para gobernanza y escala",
        "Postura Enterprise de alta confianza para compradores ejecutivos"
      ]
    },
    proof: {
      title: "Lo que los equipos necesitan desde el día uno",
      stats: [
        { value: "3x", label: "más rápido para priorizar oportunidades" },
        { value: "1", label: "vista compartida entre producto, operaciones y transformación" },
        { value: "0", label: "sobrecarga de arquitectura empresarial" }
      ]
    },
    plans: {
      title: "Empieza gratis. Pasa a Pro cuando necesites gobernanza y escala.",
      subtitle:
        "La base está diseñada para convertir usuarios gratuitos en workspaces Pro activos y cuentas Enterprise de confianza."
    },
    faq: {
      title: "Vista previa de FAQ",
      items: [
        {
          question: "¿BluePilot AI es una plataforma de process mining?",
          answer:
            "No. Es una capa de decisión que transforma la visibilidad del proceso en una cartera accionable de oportunidades de IA."
        },
        {
          question: "¿Se puede empezar sin un programa de transformación pesado?",
          answer:
            "Sí. La entrada gratuita está pensada para una activación rápida y valor inmediato."
        },
        {
          question: "¿Enterprise está listo para gobernanza?",
          answer:
            "Sí. La base del producto está preparada para más controles, colaboración y despliegue con confianza."
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
      "Empieza gratis, demuestra valor rápido y desbloquea después el modelo operativo que necesitas.",
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
          "Base multilingüe"
        ]
      },
      {
        key: "pro",
        name: "Pro",
        price: "$149",
        period: "/mes",
        description: "Para equipos que necesitan gobernanza, colaboración y un verdadero flujo de cartera.",
        cta: "Pasar a Pro",
        features: [
          "Workspace de cartera compartido",
          "Shells de gobernanza y workflow",
          "Vistas avanzadas de priorización",
          "Colaboración y configuración de roles"
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
          "Ruta de seguridad e integración",
          "Paquete comercial personalizado"
        ]
      }
    ],
    comparisonTitle: "Arquitectura placeholder para tabla comparativa",
    comparisonDescription:
      "La arquitectura ya está lista para una comparación detallada por plan.",
    footerCta: {
      title: "Elige el camino que mejor encaja con tu madurez",
      subtitle:
        "Gratis para adquisición. Pro para impulso. Enterprise para confianza y escala."
    }
  },
  requestDemo: {
    title: "Solicita una demo adaptada",
    subtitle:
      "Cuéntanos tu contexto y centraremos la demo en visibilidad de procesos, scoring de cartera y gobernanza.",
    success:
      "Solicitud de demo capturada. El flujo comercial queda listo para conectarse después con CRM."
  },
  auth: {
    login: {
      title: "Accede a BluePilot AI",
      subtitle:
        "Entra en tu workspace multilingüe y en tu cartera de oportunidades de IA.",
      submit: "Iniciar sesión",
      footer: "¿Nuevo en BluePilot AI?",
      invalidCredentials: "Correo o contraseña inválidos."
    },
    signup: {
      title: "Crea tu workspace gratis",
      subtitle:
        "Empieza gratis y sube a Pro cuando la gobernanza y la adopción del equipo aceleren.",
      submit: "Crear workspace",
      footer: "¿Ya tienes cuenta?"
    }
  },
  forms: {
    name: "Nombre completo",
    email: "Correo profesional",
    company: "Empresa",
    password: "Contraseña",
    role: "Rol",
    message: "Mensaje"
  },
  app: {
    shell: {
      workspaceLabel: "Workspace",
      searchPlaceholder: "Buscar oportunidades, procesos, gobernanza...",
      planBadge: "Plan gratis"
    },
    nav: {
      overview: { title: "Resumen", description: "Vista ejecutiva" },
      opportunities: { title: "Oportunidades", description: "Captura de cartera IA" },
      processes: { title: "Procesos", description: "Lente de negocio" },
      governance: { title: "Gobernanza", description: "Revisión y decisión" },
      analytics: { title: "Analítica", description: "Señales y pruebas" },
      settings: { title: "Configuración", description: "Ajustes del workspace" }
    },
    overview: {
      eyebrow: "Shell multilingüe",
      title: "Identifica oportunidades de IA más rápido que tu modelo actual",
      subtitle:
        "Este shell MVP está diseñado para sentirse premium, creíble y listo para adopción rápida.",
      cards: [
        { label: "UI preparada para idiomas", value: "EN / FR / ES" },
        { label: "Ruta de upgrade", value: "Free → Pro → Enterprise" },
        { label: "Posicionamiento", value: "Capa de decisión" }
      ],
      checklistTitle: "Lo que la base ya soporta",
      checklist: [
        "Navegación y shell de páginas trilingües",
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
      emptyTitle: "Tus módulos de cartera empiezan aquí",
      emptyDescription:
        "Usa estas páginas shell para conectar después scoring, gobernanza, cuotas, onboarding y workflows de cartera."
    },
    opportunitiesModule: {
      title: "Cartera de oportunidades IA",
      description:
        "Oportunidades seedeadas con score, owner, decision de gobernanza y valor esperado.",
      liveValue: "Valor live",
      unassigned: "Sin asignar",
      noDecision: "Sin decision",
      headers: {
        opportunity: "Oportunidad",
        process: "Proceso",
        owner: "Owner",
        status: "Estado",
        score: "Score",
        value: "Valor esperado",
        decision: "Decision"
      }
    },
    modulePlaceholder:
      "Este módulo sigue siendo ligero por ahora. La estructura de página, etiquetas, navegación y feature gating ya está lista."
  }
} satisfies Messages;
*/
