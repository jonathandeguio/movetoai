"use client";

import { useEffect, useRef } from "react";

const STEPS = [
  {
    num: "01",
    title: "Décrivez votre entreprise en 3 minutes",
    description:
      "Renseignez votre secteur, vos processus clés et vos priorités. L'IA adapte instantanément l'analyse à votre contexte.",
    tag: "Onboarding intelligent",
  },
  {
    num: "02",
    title: "Recevez votre cartographie d'opportunités IA",
    description:
      "Claude analyse vos processus et identifie les leviers d'automatisation les plus pertinents, classés par potentiel de ROI.",
    tag: "Analyse IA · Claude",
  },
  {
    num: "03",
    title: "Structurez vos use cases en quelques clics",
    description:
      "Générez des fiches use case complètes avec KPIs, effort estimé, risques et étapes de déploiement.",
    tag: "Use case généré",
  },
  {
    num: "04",
    title: "Déployez avec les bons experts",
    description:
      "Connectez-vous au réseau de consultants certifiés Move to AI, spécialisés dans votre secteur.",
    tag: "Réseau certifié",
  },
  {
    num: "05",
    title: "Mesurez le ROI réel en continu",
    description:
      "Suivez les KPIs avant/après déploiement et documentez la valeur créée pour chaque use case.",
    tag: "Dashboard ROI",
  },
];

export function HowItWorks() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const items = sectionRef.current?.querySelectorAll<HTMLElement>(".step-item");
    if (!items) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("revealed");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    items.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="mx-auto w-full max-w-7xl px-4 py-24 sm:px-6 xl:px-8">
      {/* Header */}
      <div className="mb-14 space-y-4">
        <p
          className="text-xs font-medium uppercase"
          style={{ color: "#6ee7b7", letterSpacing: "0.16em" }}
        >
          Comment ça marche
        </p>
        <h2
          className="font-syne font-bold text-balance"
          style={{
            fontSize: "clamp(1.6rem, 3.5vw, 2.6rem)",
            lineHeight: 1.1,
            letterSpacing: "-0.02em",
            color: "#fff",
            maxWidth: "520px",
          }}
        >
          De l&apos;idée au déploiement — guidé par l&apos;IA.
        </h2>
      </div>

      {/* Steps */}
      <div>
        {STEPS.map((step, i) => (
          <div
            key={step.num}
            className="step-item reveal reveal-stagger grid gap-6 py-8 md:grid-cols-[80px_1fr_auto] md:items-center"
            style={{
              borderBottom:
                i < STEPS.length - 1
                  ? "1px solid rgba(255,255,255,0.06)"
                  : "none",
            }}
          >
            {/* Number */}
            <span
              className="font-syne font-extrabold"
              style={{
                fontSize: "2.2rem",
                color: "rgba(110,231,183,0.20)",
                letterSpacing: "-0.04em",
                lineHeight: 1,
              }}
            >
              {step.num}
            </span>

            {/* Content */}
            <div className="space-y-1.5">
              <h3
                className="font-syne font-bold"
                style={{ fontSize: "1.05rem", color: "#fff", letterSpacing: "-0.01em" }}
              >
                {step.title}
              </h3>
              <p className="text-sm leading-7" style={{ color: "rgba(232,230,240,0.55)" }}>
                {step.description}
              </p>
            </div>

            {/* Tag */}
            <span
              className="w-fit rounded-full px-3 py-1 text-xs font-medium"
              style={{
                background: "rgba(110,231,183,0.08)",
                border: "1px solid rgba(110,231,183,0.20)",
                color: "#6ee7b7",
                whiteSpace: "nowrap",
              }}
            >
              {step.tag}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
