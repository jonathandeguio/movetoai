import type { Route } from "next";
import Link from "next/link";

const PLANS = [
  {
    name: "Free",
    price: "0€",
    period: "",
    description: "Pour découvrir votre potentiel IA.",
    features: [
      "1 utilisateur",
      "3 opportunités / mois",
      "1 use case actif",
      "Diagnostic IA guidé",
      "Support communauté",
    ],
    cta: "Commencer gratuitement",
    href: "/signup?plan=free",
    featured: false,
  },
  {
    name: "Pro",
    price: "49€",
    period: "/mois",
    description: "Pour les équipes qui veulent aller vite.",
    features: [
      "5 utilisateurs inclus",
      "Opportunités illimitées",
      "10 use cases actifs",
      "Intégrations (Slack, Jira, Teams)",
      "Support email sous 24h",
      "Exports avancés",
    ],
    cta: "Choisir Pro",
    href: "/signup?plan=pro",
    featured: true,
    badge: "Le plus populaire",
  },
  {
    name: "Enterprise",
    price: "Sur devis",
    period: "",
    description: "Pour les grands groupes.",
    features: [
      "Utilisateurs illimités",
      "Multi-BU & multi-entités",
      "SSO + SCIM",
      "RGPD avancé",
      "CSM dédié",
      "API & intégrations custom",
    ],
    cta: "Nous contacter",
    href: "/request-demo",
    featured: false,
  },
];

export function Pricing() {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-24 sm:px-6 xl:px-8">
      {/* Header */}
      <div className="mb-14 space-y-4 text-center">
        <p
          className="text-xs font-medium uppercase"
          style={{ color: "#6ee7b7", letterSpacing: "0.16em" }}
        >
          Tarifs
        </p>
        <h2
          className="font-syne font-bold"
          style={{
            fontSize: "clamp(1.6rem, 3.5vw, 2.6rem)",
            lineHeight: 1.1,
            letterSpacing: "-0.02em",
            color: "#fff",
          }}
        >
          Simple, transparent, sans surprise.
        </h2>
        <p className="text-sm" style={{ color: "rgba(232,230,240,0.55)" }}>
          Gratuit pour toujours · Pas de carte bancaire requise
        </p>
      </div>

      {/* Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "1.5rem",
          alignItems: "start",
        }}
      >
        {PLANS.map((plan) => (
          <div
            key={plan.name}
            className="flex flex-col gap-6 rounded-[14px] p-7 transition-all duration-200"
            style={{
              border: plan.featured
                ? "2px solid rgba(110,231,183,0.30)"
                : "1px solid rgba(255,255,255,0.08)",
              background: plan.featured
                ? "rgba(110,231,183,0.04)"
                : "rgba(255,255,255,0.02)",
              position: "relative",
            }}
          >
            {/* Badge */}
            {plan.badge && (
              <div
                className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full px-3 py-1 text-xs font-semibold"
                style={{
                  background: "#6ee7b7",
                  color: "#060810",
                  whiteSpace: "nowrap",
                }}
              >
                {plan.badge}
              </div>
            )}

            {/* Name + price */}
            <div className="space-y-1">
              <p
                className="font-syne font-bold text-sm uppercase"
                style={{ color: "#6ee7b7", letterSpacing: "0.1em" }}
              >
                {plan.name}
              </p>
              <div className="flex items-end gap-1">
                <span
                  className="font-syne font-extrabold"
                  style={{
                    fontSize: "2rem",
                    color: "#fff",
                    lineHeight: 1.1,
                    letterSpacing: "-0.03em",
                  }}
                >
                  {plan.price}
                </span>
                {plan.period && (
                  <span
                    className="mb-1 text-sm"
                    style={{ color: "rgba(232,230,240,0.45)" }}
                  >
                    {plan.period}
                  </span>
                )}
              </div>
              <p
                className="text-xs leading-5"
                style={{ color: "rgba(232,230,240,0.50)" }}
              >
                {plan.description}
              </p>
            </div>

            {/* Features */}
            <ul className="flex flex-col gap-2.5">
              {plan.features.map((f) => (
                <li key={f} className="flex items-start gap-2.5 text-sm">
                  <span style={{ color: "#6ee7b7", marginTop: "2px", flexShrink: 0 }}>✓</span>
                  <span style={{ color: "rgba(232,230,240,0.65)" }}>{f}</span>
                </li>
              ))}
            </ul>

            {/* CTA */}
            <Link
              href={plan.href as Route}
              className="mt-auto block rounded-full px-5 py-2.5 text-center text-sm font-semibold transition-all duration-150 hover:-translate-y-px hover:opacity-90"
              style={
                plan.featured
                  ? { background: "#6ee7b7", color: "#060810" }
                  : {
                      border: "1px solid rgba(255,255,255,0.12)",
                      color: "rgba(232,230,240,0.75)",
                    }
              }
            >
              {plan.cta}
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}
