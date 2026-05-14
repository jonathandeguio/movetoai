import type { Metadata, Route } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/marketing/site-header";
import { SiteFooter } from "@/components/marketing/site-footer";
import { WhyFreeList } from "@/components/marketing/WhyFreeList";
import { FAQAccordion } from "@/components/marketing/FAQAccordion";

export const metadata: Metadata = {
  title: "Pourquoi Move to AI est gratuit — Transparence totale",
  description:
    "Nous n'avons rien à cacher. Voici les 7 vraies raisons pour lesquelles Move to AI est gratuit — et comment nous gagnons de l'argent.",
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: "Move to AI",
  },
};

export default function WhyFreePage() {
  return (
    <>
      <SiteHeader />

      <main style={{ background: "#060810", minHeight: "100vh" }}>
        {/* Hero */}
        <section className="mx-auto max-w-3xl px-4 py-24 text-center sm:px-6">
          <p
            className="mb-4 text-xs font-medium uppercase"
            style={{ color: "#6ee7b7", letterSpacing: "0.16em" }}
          >
            Transparence
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
            Pourquoi c&apos;est
            <br />
            <span
              style={{
                backgroundImage: "linear-gradient(90deg, #6ee7b7 0%, #38bdf8 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              vraiment gratuit ?
            </span>
          </h1>
          <p
            className="mx-auto mt-6 max-w-xl text-base leading-7"
            style={{ color: "rgba(232,230,240,0.60)" }}
          >
            Pas de dark pattern, pas de piège à 30 jours. Juste un modèle économique
            aligné avec votre réussite. Voici 7 vraies raisons.
          </p>
        </section>

        {/* WhyFreeList */}
        <WhyFreeList />

        {/* Business model explainer */}
        <section className="mx-auto max-w-3xl px-4 pb-24 text-center sm:px-6">
          <div
            className="rounded-2xl p-10"
            style={{
              border: "1px solid rgba(110,231,183,0.20)",
              background: "rgba(110,231,183,0.03)",
            }}
          >
            <p
              className="mb-3 text-xs font-medium uppercase"
              style={{ color: "#6ee7b7", letterSpacing: "0.12em" }}
            >
              Notre modèle économique en clair
            </p>
            <h2
              className="mb-4 font-syne font-bold"
              style={{ fontSize: "1.4rem", color: "#fff", letterSpacing: "-0.02em" }}
            >
              Nous gagnons de l&apos;argent quand vous réussissez.
            </h2>
            <p
              className="mx-auto mb-8 max-w-lg text-sm leading-7"
              style={{ color: "rgba(232,230,240,0.55)" }}
            >
              Abonnements Pro (49 €/mois) · Abonnements Enterprise · Commissions sur les
              projets réalisés · Abonnements consultants Pro. Pas de publicité, pas de
              revente de données.
            </p>
            <Link
              href={"/pricing" as Route}
              className="inline-block rounded-full px-6 py-3 text-sm font-semibold transition-all duration-150 hover:-translate-y-px hover:opacity-90"
              style={{ background: "#6ee7b7", color: "#060810" }}
            >
              Voir les tarifs
            </Link>
          </div>
        </section>

        {/* FAQ */}
        <FAQAccordion />
      </main>

      <SiteFooter />
    </>
  );
}
