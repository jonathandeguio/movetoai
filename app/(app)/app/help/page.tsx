import type { Route } from "next"
import { Rocket, Lightbulb, Target, BarChart3, Sparkles, Settings } from "lucide-react"
import Link from "next/link"
import { HelpSearch } from "@/components/guide/HelpSearch"
import { FeatureCard } from "@/components/guide/FeatureCard"

const FEATURE_CARDS = [
  {
    icon: Rocket,
    title: "Prise en main",
    description: "Guide de démarrage pas à pas pour bien débuter sur la plateforme.",
    href: "/app/help/member/getting-started",
    color: "var(--green)",
  },
  {
    icon: Lightbulb,
    title: "Opportunités IA",
    description: "Créer et gérer le pipeline d'opportunités de transformation IA.",
    href: "/app/help/admin/opportunities",
    color: "var(--purple, #a855f7)",
  },
  {
    icon: Target,
    title: "Cas d'usage",
    description: "Valider et suivre les cas d'usage de l'intelligence artificielle.",
    href: "/app/help/admin/use-cases",
    color: "var(--blue, #3b82f6)",
  },
  {
    icon: BarChart3,
    title: "Tableau de bord",
    description: "Comprendre les KPIs, métriques et indicateurs de maturité IA.",
    href: "/app/help/member/dashboard",
    color: "var(--green)",
  },
  {
    icon: Sparkles,
    title: "Fonctionnalités IA",
    description: "Copilot, briefings hebdomadaires et scénarios d'investissement.",
    href: "/app/help/member/ai-features",
    color: "var(--purple, #a855f7)",
  },
  {
    icon: Settings,
    title: "Paramètres",
    description: "Configuration de l'espace de travail, membres et intégrations.",
    href: "/app/help/admin/settings",
    color: "var(--blue, #3b82f6)",
  },
]

const PROFILES = [
  { key: "admin", label: "Administrateur" },
  { key: "executive", label: "Directeur / Exécutif" },
  { key: "business-owner", label: "Responsable Métier" },
  { key: "it-manager", label: "Responsable IT" },
  { key: "consultant", label: "Consultant" },
  { key: "member", label: "Collaborateur" },
]

export default function HelpPage() {
  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div
        style={{
          borderRadius: "1.5rem",
          border: "1px solid var(--border)",
          background: "var(--bg-card)",
          padding: "2.5rem 2rem",
          boxShadow: "0 1px 4px 0 rgb(0 0 0 / .04)",
          textAlign: "center",
        }}
      >
        <span
          style={{
            display: "inline-flex",
            borderRadius: "9999px",
            border: "1px solid var(--green)",
            background: "var(--green)18",
            padding: "2px 14px",
            fontSize: "0.75rem",
            fontWeight: 600,
            color: "var(--green)",
            marginBottom: "1rem",
          }}
        >
          Documentation
        </span>
        <h1
          style={{
            fontSize: "2rem",
            fontWeight: 700,
            color: "var(--text-primary)",
            letterSpacing: "-0.02em",
            marginBottom: "0.5rem",
          }}
        >
          Centre d&apos;aide Move to AI
        </h1>
        <p
          style={{
            fontSize: "0.9375rem",
            color: "var(--text-secondary)",
            lineHeight: "1.75",
            maxWidth: "520px",
            margin: "0 auto 1.5rem",
          }}
        >
          Guides, tutoriels et références pour maîtriser votre plateforme de pilotage de la transformation IA.
        </p>
        <HelpSearch />
      </div>

      {/* Feature grid */}
      <section>
        <h2
          style={{
            fontSize: "1rem",
            fontWeight: 600,
            color: "var(--text-secondary)",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            marginBottom: "1rem",
          }}
        >
          Sujets principaux
        </h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: "1rem",
          }}
        >
          {FEATURE_CARDS.map((card) => (
            <FeatureCard key={card.href} {...card} />
          ))}
        </div>
      </section>

      {/* Profiles section */}
      <section>
        <h2
          style={{
            fontSize: "1rem",
            fontWeight: 600,
            color: "var(--text-secondary)",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            marginBottom: "1rem",
          }}
        >
          Guides par profil utilisateur
        </h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
            gap: "0.75rem",
          }}
        >
          {PROFILES.map((profile) => (
            <Link
              key={profile.key}
              href={`/app/help/${profile.key}` as Route}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "0.875rem 1rem",
                borderRadius: "0.875rem",
                border: "1px solid var(--border)",
                background: "var(--bg-card)",
                color: "var(--text-primary)",
                fontSize: "0.875rem",
                fontWeight: 500,
                textDecoration: "none",
                transition: "opacity 0.15s",
              }}
              className="hover:opacity-80"
            >
              <span>{profile.label}</span>
              <span style={{ color: "var(--green)", fontWeight: 600 }}>→</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
