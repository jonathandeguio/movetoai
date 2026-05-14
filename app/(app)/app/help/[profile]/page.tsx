import type { Route } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ChevronLeft } from "lucide-react"

const PROFILE_LABELS: Record<string, string> = {
  admin: "Administrateur",
  executive: "Directeur / Exécutif",
  "business-owner": "Responsable Métier",
  "it-manager": "Responsable IT",
  consultant: "Consultant",
  member: "Collaborateur",
}

const FEATURE_META: Record<string, { title: string; description: string }> = {
  "getting-started": {
    title: "Prise en main",
    description: "Guide de démarrage pas à pas pour bien débuter sur la plateforme.",
  },
  opportunities: {
    title: "Opportunités IA",
    description: "Créer et gérer le pipeline d'opportunités de transformation IA.",
  },
  "use-cases": {
    title: "Cas d'usage",
    description: "Valider et suivre les cas d'usage spécifiés.",
  },
  dashboard: {
    title: "Tableau de bord",
    description: "Comprendre les KPIs et métriques de maturité IA.",
  },
  "ai-features": {
    title: "Fonctionnalités IA",
    description: "Copilot, briefings hebdomadaires et scénarios d'investissement.",
  },
  settings: {
    title: "Paramètres",
    description: "Configuration de l'espace de travail, membres et intégrations.",
  },
}

const PROFILE_FEATURES: Record<string, string[]> = {
  admin: ["getting-started", "opportunities", "use-cases", "settings", "ai-features"],
  executive: ["getting-started", "dashboard", "ai-features"],
  "business-owner": ["getting-started", "opportunities", "use-cases"],
  "it-manager": ["getting-started", "use-cases", "settings"],
  consultant: ["getting-started", "opportunities", "dashboard", "ai-features"],
  member: ["getting-started", "dashboard", "ai-features"],
}

export default async function ProfileGuidePage({
  params,
}: {
  params: Promise<{ profile: string }>
}) {
  const { profile } = await params

  const label = PROFILE_LABELS[profile]
  if (!label) notFound()

  const features = PROFILE_FEATURES[profile] ?? []

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Back link */}
      <Link
        href={"/app/help" as Route}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "0.375rem",
          fontSize: "0.875rem",
          color: "var(--text-secondary)",
          textDecoration: "none",
        }}
        className="hover:opacity-70"
      >
        <ChevronLeft size={16} />
        Retour à l&apos;aide
      </Link>

      {/* Header */}
      <div
        style={{
          borderRadius: "1.5rem",
          border: "1px solid var(--border)",
          background: "var(--bg-card)",
          padding: "2rem",
          boxShadow: "0 1px 4px 0 rgb(0 0 0 / .04)",
        }}
      >
        <span
          style={{
            display: "inline-flex",
            borderRadius: "9999px",
            border: "1px solid var(--green)",
            background: "var(--green)18",
            padding: "2px 12px",
            fontSize: "0.75rem",
            fontWeight: 600,
            color: "var(--green)",
            marginBottom: "0.75rem",
          }}
        >
          Guide utilisateur
        </span>
        <h1
          style={{
            fontSize: "1.75rem",
            fontWeight: 700,
            color: "var(--text-primary)",
            letterSpacing: "-0.02em",
          }}
        >
          {label}
        </h1>
        <p
          style={{
            marginTop: "0.5rem",
            fontSize: "0.9375rem",
            color: "var(--text-secondary)",
            lineHeight: "1.75",
          }}
        >
          Documentation personnalisée pour votre rôle sur la plateforme Move to AI.
        </p>
      </div>

      {/* Feature list */}
      <div className="space-y-3">
        {features.map((feature) => {
          const meta = FEATURE_META[feature]
          if (!meta) return null
          return (
            <Link
              key={feature}
              href={`/app/help/${profile}/${feature}` as Route}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "1.25rem 1.5rem",
                borderRadius: "1rem",
                border: "1px solid var(--border)",
                background: "var(--bg-card)",
                textDecoration: "none",
                transition: "opacity 0.15s",
              }}
              className="hover:opacity-80"
            >
              <div>
                <p
                  style={{
                    fontSize: "0.9375rem",
                    fontWeight: 600,
                    color: "var(--text-primary)",
                    marginBottom: "0.25rem",
                  }}
                >
                  {meta.title}
                </p>
                <p
                  style={{
                    fontSize: "0.8125rem",
                    color: "var(--text-secondary)",
                    lineHeight: "1.5",
                  }}
                >
                  {meta.description}
                </p>
              </div>
              <span
                style={{
                  fontSize: "1.125rem",
                  color: "var(--green)",
                  fontWeight: 600,
                  flexShrink: 0,
                  marginLeft: "1rem",
                }}
              >
                →
              </span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
