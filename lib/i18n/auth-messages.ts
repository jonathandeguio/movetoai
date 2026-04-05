import { defaultLocale, normalizeLocale, type Locale } from "@/lib/i18n/config";

const authDictionaries = {
  en: {
    common: {
      ctas: {
        startFree: "Start free",
        logIn: "Log in"
      },
      languages: {
        label: "Language",
        en: "English",
        fr: "French",
        es: "Spanish"
      },
      validation: {
        required: "This field is required.",
        email: "Enter a valid work email.",
        minName: "Enter your full name.",
        minPassword: "Password must contain at least 8 characters."
      }
    },
    forms: {
      name: "Full name",
      email: "Work email",
      password: "Password",
      preferredLanguage: "Preferred language"
    },
    auth: {
      login: {
        badge: "Login",
        title: "Log in to BluePilot AI",
        subtitle: "Access your secure workspace and AI opportunity portfolio.",
        submit: "Log in",
        footer: "New to BluePilot AI?",
        invalidCredentials: "Invalid email or password."
      },
      signup: {
        badge: "Sign up",
        title: "Create your account",
        subtitle:
          "Create your account in one step. Add a workspace later when you are ready to structure your AI opportunity portfolio.",
        submit: "Create account",
        footer: "Already have an account?",
        workspaceNote:
          "Signup stays lightweight for now. You can authenticate first and connect a workspace later.",
        emailTaken: "An account already exists with this email.",
        unexpectedError: "We could not create your account right now."
      }
    }
  },
  fr: {
    common: {
      ctas: {
        startFree: "Commencer gratuitement",
        logIn: "Se connecter"
      },
      languages: {
        label: "Langue",
        en: "Anglais",
        fr: "Francais",
        es: "Espagnol"
      },
      validation: {
        required: "Ce champ est obligatoire.",
        email: "Saisissez un email professionnel valide.",
        minName: "Saisissez votre nom complet.",
        minPassword: "Le mot de passe doit contenir au moins 8 caracteres."
      }
    },
    forms: {
      name: "Nom complet",
      email: "Email professionnel",
      password: "Mot de passe",
      preferredLanguage: "Langue preferee"
    },
    auth: {
      login: {
        badge: "Connexion",
        title: "Connexion a BluePilot AI",
        subtitle: "Accedez a votre espace securise et a votre portefeuille d'opportunites IA.",
        submit: "Se connecter",
        footer: "Nouveau sur BluePilot AI ?",
        invalidCredentials: "Email ou mot de passe invalide."
      },
      signup: {
        badge: "Inscription",
        title: "Creez votre compte",
        subtitle:
          "Creez votre compte en une etape. Vous ajouterez ensuite un workspace quand vous serez pret a structurer votre portefeuille d'opportunites IA.",
        submit: "Creer le compte",
        footer: "Vous avez deja un compte ?",
        workspaceNote:
          "L'inscription reste legere pour l'instant. Vous pouvez d'abord vous authentifier, puis connecter un workspace plus tard.",
        emailTaken: "Un compte existe deja avec cet email.",
        unexpectedError: "Nous ne pouvons pas creer votre compte pour le moment."
      }
    }
  },
  es: {
    common: {
      ctas: {
        startFree: "Empezar gratis",
        logIn: "Iniciar sesion"
      },
      languages: {
        label: "Idioma",
        en: "Ingles",
        fr: "Frances",
        es: "Espanol"
      },
      validation: {
        required: "Este campo es obligatorio.",
        email: "Introduce un correo profesional valido.",
        minName: "Introduce tu nombre completo.",
        minPassword: "La contrasena debe tener al menos 8 caracteres."
      }
    },
    forms: {
      name: "Nombre completo",
      email: "Correo profesional",
      password: "Contrasena",
      preferredLanguage: "Idioma preferido"
    },
    auth: {
      login: {
        badge: "Acceso",
        title: "Accede a BluePilot AI",
        subtitle: "Entra en tu workspace seguro y en tu cartera de oportunidades de IA.",
        submit: "Iniciar sesion",
        footer: "Nuevo en BluePilot AI?",
        invalidCredentials: "Correo o contrasena invalidos."
      },
      signup: {
        badge: "Registro",
        title: "Crea tu cuenta",
        subtitle:
          "Crea tu cuenta en un solo paso. Anade un workspace despues cuando quieras estructurar tu cartera de oportunidades de IA.",
        submit: "Crear cuenta",
        footer: "Ya tienes cuenta?",
        workspaceNote:
          "El registro se mantiene ligero por ahora. Primero autentificate y conecta un workspace mas adelante.",
        emailTaken: "Ya existe una cuenta con este correo.",
        unexpectedError: "No hemos podido crear tu cuenta ahora mismo."
      }
    }
  }
} as const;

export type AuthMessages = (typeof authDictionaries)[typeof defaultLocale];

export function getAuthMessages(locale: Locale | string | null | undefined): AuthMessages {
  const normalizedLocale = normalizeLocale(locale);
  return authDictionaries[normalizedLocale] ?? authDictionaries[defaultLocale];
}
