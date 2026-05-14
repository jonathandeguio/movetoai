import type { Metadata, Route } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/marketing/site-header";
import { SiteFooter } from "@/components/marketing/site-footer";
import { FAQAccordion } from "@/components/marketing/FAQAccordion";

export const metadata: Metadata = {
  title: "Tarifs — Move to AI · Gratuit pour toujours",
  description:
    "Move to AI est gratuit. Commencez dès maintenant sans carte bancaire. Les grandes équipes passent en Pro à 49 €/mois.",
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: "Move to AI",
  },
};

const PLANS = [
  {
    name: "Free",
    price: "0€",
    period: "",
    badge: null,
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
    badge: "Le plus populaire",
    description: "Pour les équipes qui veulent aller vite.",
    features: [
      "5 utilisateurs inclus",
      "Opportunités illimitées",
      "10 use cases actifs",
      "Intégrations (Slack, Jira, Teams)",
      "Support email sous 24h",
      "Exports avancés (PDF, Excel, BPMN)",
    ],
    cta: "Choisir Pro",
    href: "/signup?plan=pro",
    featured: true,
  },
  {
    name: "Enterprise",
    price: "Sur devis",
    period: "",
    badge: null,
    description: "Pour les grands groupes.",
    features: [
      "Utilisateurs illimités",
      "Multi-BU & multi-entités",
      "SSO + SCIM",
      "RGPD avancé & hébergement dédié",
      "CSM dédié",
      "API & intégrations custom",
    ],
    cta: "Nous contacter",
    href: "/request-demo",
    featured: false,
  },
];

const CONSULTANT_PLANS = [
  {
    name: "Starter Consultant",
    price: "0€",
    period: "",
    features: [
      "Jusqu'à 3 clients actifs",
      "Templates basiques",
      "Profil dans l'annuaire",
      "Commission standard",
    ],
    cta: "Rejoindre gratuitement",
    href: "/signup?type=consultant&plan=starter",
    featured: false,
  },
  {
    name: "Pro Consultant",
    price: "99€",
    period: "/mois",
    features: [
      "Clients illimités",
      "Templates custom",
      "Commission réduite",
      "Badge certifié Move to AI",
      "Support prioritaire",
    ],
    cta: "Passer en Pro Consultant",
    href: "/signup?type=consultant&plan=pro",
    featured: true,
  },
];

export default function PricingPage() {
  return (
    <>
      <SiteHeader />

      <main style={{ background: "#060810", minHeight: "100vh" }}>
        {/* Hero */}
        <section className="mx-auto max-w-4xl px-4 py-24 text-center sm:px-6">
          <p
            className="mb-4 text-xs font-medium uppercase"
            style={{ color: "#6ee7b7", letterSpacing: "0.16em" }}
          >
            Tarifs
          </p>
          <h1
            className="font-syne font-extrabold"
            style={{
              fontSize: "clamp(2rem, 5vw, 3.6rem)",
              lineHeight: 1.08,
              letterSpacing: "-0.03em",
              color: "#fff",
            }}
          >
            Simple, transparent,
            <br />
            <span
              style={{
                backgroundImage: "linear-gradient(90deg, #6ee7b7 0%, #38bdf8 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              sans surprise.
            </span>
          </h1>
          <p
            className="mx-auto mt-6 max-w-lg text-base leading-7"
            style={{ color: "rgba(232,230,240,0.60)" }}
          >
            Commencez gratuitement. Passez en Pro quand votre équipe grandit.
            Pas de carte bancaire requise.
          </p>
        </section>

        {/* Business Plans */}
        <section className="mx-auto w-full max-w-7xl px-4 pb-24 sm:px-6 xl:px-8">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
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
                      style={{ fontSize: "2rem", color: "#fff", lineHeight: 1.1, letterSpacing: "-0.03em" }}
                    >
                      {plan.price}
                    </span>
                    {plan.period && (
                      <span className="mb-1 text-sm" style={{ color: "rgba(232,230,240,0.45)" }}>
                        {plan.period}
                      </span>
                    )}
                  </div>
                  <p className="text-xs leading-5" style={{ color: "rgba(232,230,240,0.50)" }}>
                    {plan.description}
                  </p>
                </div>

                <ul className="flex flex-col gap-2.5">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm">
                      <span style={{ color: "#6ee7b7", marginTop: "2px", flexShrink: 0 }}>✓</span>
                      <span style={{ color: "rgba(232,230,240,0.65)" }}>{f}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href={plan.href as Route}
                  className="mt-auto block rounded-full px-5 py-2.5 text-center text-sm font-semibold transition-all duration-150 hover:-translate-y-px hover:opacity-90"
                  style={
                    plan.featured
                      ? { background: "#6ee7b7", color: "#060810" }
                      : { border: "1px solid rgba(255,255,255,0.12)", color: "rgba(232,230,240,0.75)" }
                  }
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* Consultant Plans */}
        <section className="mx-auto w-full max-w-7xl px-4 pb-24 sm:px-6 xl:px-8">
          <div className="mb-12 space-y-3 text-center">
            <p
              className="text-xs font-medium uppercase"
              style={{ color: "#fb923c", letterSpacing: "0.16em" }}
            >
              Pour les consultants
            </p>
            <h2
              className="font-syne font-bold"
              style={{
                fontSize: "clamp(1.4rem, 3vw, 2.2rem)",
                lineHeight: 1.15,
                letterSpacing: "-0.02em",
                color: "#fff",
              }}
            >
              Développez votre activité de conseil.
            </h2>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: "1.5rem",
              maxWidth: 680,
              margin: "0 auto",
            }}
          >
            {CONSULTANT_PLANS.map((plan) => (
              <div
                key={plan.name}
                className="flex flex-col gap-6 rounded-[14px] p-7"
                style={{
                  border: plan.featured
                    ? "2px solid rgba(251,146,60,0.30)"
                    : "1px solid rgba(255,255,255,0.08)",
                  background: plan.featured
                    ? "rgba(251,146,60,0.04)"
                    : "rgba(255,255,255,0.02)",
                }}
              >
                <div className="space-y-1">
                  <p
                    className="font-syne font-bold text-sm uppercase"
                    style={{ color: "#fb923c", letterSpacing: "0.1em" }}
                  >
                    {plan.name}
                  </p>
                  <div className="flex items-end gap-1">
                    <span
                      className="font-syne font-extrabold"
                      style={{ fontSize: "2rem", color: "#fff", lineHeight: 1.1, letterSpacing: "-0.03em" }}
                    >
                      {plan.price}
                    </span>
                    {plan.period && (
                      <span className="mb-1 text-sm" style={{ color: "rgba(232,230,240,0.45)" }}>
                        {plan.period}
                      </span>
                    )}
                  </div>
                </div>

                <ul className="flex flex-col gap-2.5">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm">
                      <span style={{ color: "#fb923c", marginTop: "2px", flexShrink: 0 }}>✓</span>
                      <span style={{ color: "rgba(232,230,240,0.65)" }}>{f}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href={plan.href as Route}
                  className="mt-auto block rounded-full px-5 py-2.5 text-center text-sm font-semibold transition-all duration-150 hover:-translate-y-px hover:opacity-90"
                  style={
                    plan.featured
                      ? { background: "#fb923c", color: "#060810" }
                      : { border: "1px solid rgba(255,255,255,0.12)", color: "rgba(232,230,240,0.75)" }
                  }
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <FAQAccordion />
      </main>

      <SiteFooter />
    </>
  );
}
