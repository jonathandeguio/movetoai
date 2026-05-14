"use client";

import { useState } from "react";

const FAQS = [
  {
    question: "Move to AI remplace-t-il mon cabinet de conseil ?",
    answer:
      "Non, il le complète. Move to AI identifie et structure vos opportunités en 48h là où un cabinet prend 3 mois. Vous arrivez chez votre consultant avec un brief prêt — et vous économisez des semaines de cadrage.",
  },
  {
    question: "Pourquoi c'est vraiment gratuit ?",
    answer:
      "Notre modèle repose sur les abonnements Pro et Enterprise, les commissions sur projets réalisés via la plateforme, et le réseau de consultants certifiés. Votre accès gratuit nous aide à grandir — et vos données ne sont jamais revendues.",
  },
  {
    question: "Mes données sont-elles en sécurité ?",
    answer:
      "Vos données sont hébergées en Europe (OVH Cloud, Paris). Nous sommes conformes RGPD. Aucune revente, aucune utilisation pour entraîner des modèles tiers.",
  },
  {
    question: "Combien de temps pour voir les premiers résultats ?",
    answer:
      "La plupart de nos clients identifient leur première opportunité d'automatisation dans les 48 premières heures. Le diagnostic IA prend environ 10 minutes.",
  },
  {
    question: "Puis-je migrer depuis un autre outil ?",
    answer:
      "Oui. Nous proposons des imports depuis Notion, Excel, et les outils de process mining (Celonis, Signavio). Notre équipe vous accompagne gratuitement lors de la migration.",
  },
];

export function FAQAccordion() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section className="mx-auto w-full max-w-3xl px-4 py-24 sm:px-6">
      {/* Header */}
      <div className="mb-14 space-y-4 text-center">
        <p
          className="text-xs font-medium uppercase"
          style={{ color: "#6ee7b7", letterSpacing: "0.16em" }}
        >
          FAQ
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
          Questions fréquentes.
        </h2>
      </div>

      {/* Items */}
      <div className="flex flex-col">
        {FAQS.map((faq, i) => {
          const isOpen = open === i;
          return (
            <div
              key={i}
              style={{
                borderBottom: "1px solid rgba(255,255,255,0.07)",
              }}
            >
              <button
                onClick={() => setOpen(isOpen ? null : i)}
                className="flex w-full items-center justify-between gap-4 py-5 text-left"
                aria-expanded={isOpen}
              >
                <span
                  className="text-sm font-semibold leading-6"
                  style={{ color: isOpen ? "#6ee7b7" : "rgba(232,230,240,0.85)" }}
                >
                  {faq.question}
                </span>
                <span
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full transition-all duration-200"
                  style={{
                    background: isOpen
                      ? "rgba(110,231,183,0.12)"
                      : "rgba(255,255,255,0.06)",
                    color: isOpen ? "#6ee7b7" : "rgba(232,230,240,0.45)",
                    fontSize: 16,
                    lineHeight: 1,
                    transform: isOpen ? "rotate(45deg)" : "rotate(0deg)",
                  }}
                  aria-hidden="true"
                >
                  +
                </span>
              </button>
              {isOpen && (
                <p
                  className="pb-5 text-sm leading-7"
                  style={{ color: "rgba(232,230,240,0.55)" }}
                >
                  {faq.answer}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
