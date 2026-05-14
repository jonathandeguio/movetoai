"use client";

import { useState } from "react";

const TESTIMONIALS = [
  {
    quote:
      "En 2 jours, j'avais 8 opportunités d'automatisation documentées. Mon cabinet m'aurait facturé ça 15 000 €.",
    name: "Isabelle D.",
    role: "DAF · PME 80 personnes",
    initials: "ID",
    color: "#6ee7b7",
  },
  {
    quote:
      "L'intégration avec notre ERP SAP a pris 3h. Avant, on évitait ce genre de projet.",
    name: "Marc L.",
    role: "DSI · ETI industrie",
    initials: "ML",
    color: "#38bdf8",
  },
  {
    quote:
      "J'ai multiplié par 4 ma capacité client. Move to AI fait le travail d'un junior IA à ma place.",
    name: "Laurent F.",
    role: "Consultant IA indépendant",
    initials: "LF",
    color: "#fb923c",
  },
];

export function TestimonialSlider() {
  const [active, setActive] = useState(0);
  const t = TESTIMONIALS[active];

  return (
    <section className="mx-auto w-full max-w-4xl px-4 py-24 sm:px-6">
      {/* Header */}
      <div className="mb-14 space-y-4 text-center">
        <p
          className="text-xs font-medium uppercase"
          style={{ color: "#6ee7b7", letterSpacing: "0.16em" }}
        >
          Témoignages
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
          Ce qu&apos;ils en disent.
        </h2>
      </div>

      {/* Card */}
      <div
        className="rounded-2xl p-8 text-center transition-all duration-300"
        style={{
          border: "1px solid rgba(255,255,255,0.08)",
          background: "rgba(255,255,255,0.02)",
          minHeight: 220,
        }}
      >
        {/* Quote marks */}
        <p
          className="mb-4 font-syne font-bold leading-none"
          style={{ fontSize: "3rem", color: t.color, opacity: 0.4, lineHeight: 1 }}
          aria-hidden="true"
        >
          "
        </p>

        <blockquote
          className="mx-auto mb-8 max-w-2xl text-base leading-8"
          style={{ color: "rgba(232,230,240,0.75)", fontStyle: "italic" }}
        >
          {t.quote}
        </blockquote>

        {/* Author */}
        <div className="flex flex-col items-center gap-2">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-full font-syne font-bold text-sm"
            style={{
              background: `${t.color}18`,
              border: `1px solid ${t.color}40`,
              color: t.color,
            }}
          >
            {t.initials}
          </div>
          <div>
            <p className="text-sm font-semibold" style={{ color: "#fff" }}>
              {t.name}
            </p>
            <p className="text-xs" style={{ color: "rgba(232,230,240,0.40)" }}>
              {t.role}
            </p>
          </div>
        </div>
      </div>

      {/* Dots */}
      <div className="mt-8 flex items-center justify-center gap-3">
        {TESTIMONIALS.map((_, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            aria-label={`Témoignage ${i + 1}`}
            className="h-2 rounded-full transition-all duration-200"
            style={{
              width: i === active ? 24 : 8,
              background:
                i === active ? "#6ee7b7" : "rgba(255,255,255,0.18)",
            }}
          />
        ))}
      </div>
    </section>
  );
}
