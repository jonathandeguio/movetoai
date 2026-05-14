"use client";

import type { Route } from "next";
import Link from "next/link";

const PERSONAS = [
  {
    role: "Dirigeant PME",
    message: "Votre CFO veut des chiffres. Move to AI calcule le ROI avant même de démarrer.",
    cta: "Calculer mon ROI",
    href: "/signup",
    color: "#a78bfa",
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="#a78bfa" strokeWidth="1.4">
        <polygon points="11,2 13.5,8 20,8.7 15,13.2 16.6,20 11,16.8 5.4,20 7,13.2 2,8.7 8.5,8" />
      </svg>
    ),
  },
  {
    role: "DSI",
    message: "Pas de shadow IT. Nos intégrations s'adaptent à votre stack existant.",
    cta: "Explorer les intégrations",
    href: "/plateforme",
    color: "#38bdf8",
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="#38bdf8" strokeWidth="1.4">
        <rect x="2" y="4" width="18" height="12" rx="2" />
        <path d="M8 20h6M11 16v4" strokeLinecap="round" />
        <path d="M8 10l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    role: "Resp. RH",
    message: "Automatisez l'onboarding, la formation et le suivi — sans coder.",
    cta: "Voir les use cases RH",
    href: "/cas-usage",
    color: "#6ee7b7",
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="#6ee7b7" strokeWidth="1.4">
        <circle cx="11" cy="7" r="4" />
        <path d="M3 20c0-4.4 3.6-8 8-8s8 3.6 8 8" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    role: "Resp. Finance",
    message: "Réduisez les tâches manuelles de 60 %. Gardez le contrôle total.",
    cta: "Voir les gains Finance",
    href: "/cas-usage",
    color: "#fbbf24",
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="#fbbf24" strokeWidth="1.4">
        <rect x="2" y="15" width="4" height="5" rx="1" />
        <rect x="9" y="10" width="4" height="10" rx="1" />
        <rect x="16" y="4" width="4" height="16" rx="1" />
      </svg>
    ),
  },
  {
    role: "Consultant IA",
    message: "Gérez 5× plus de clients. Vos modèles, réutilisables à l'infini.",
    cta: "Rejoindre le réseau",
    href: "/signup?type=consultant",
    color: "#fb923c",
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="#fb923c" strokeWidth="1.4">
        <circle cx="8" cy="7" r="3.5" />
        <path d="M2 20c0-3.6 2.7-6.5 6-6.5" strokeLinecap="round" />
        <path d="M16 11l3.5 3.5L16 18M19.5 14.5h-6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    role: "Chef de projet",
    message: "Chaque use case livré avec un plan d'action, des KPIs et un champion métier.",
    cta: "Voir un exemple",
    href: "/exemples",
    color: "#94a3b8",
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="#94a3b8" strokeWidth="1.4">
        <rect x="2" y="2" width="8" height="8" rx="1.5" />
        <rect x="12" y="2" width="8" height="8" rx="1.5" />
        <rect x="2" y="12" width="8" height="8" rx="1.5" />
        <rect x="12" y="12" width="8" height="8" rx="1.5" />
      </svg>
    ),
  },
];

export function PersonaCards() {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-24 sm:px-6 xl:px-8">
      {/* Header */}
      <div className="mb-14 space-y-4 text-center">
        <p
          className="text-xs font-medium uppercase"
          style={{ color: "#6ee7b7", letterSpacing: "0.16em" }}
        >
          Pour votre équipe
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
          Move to AI parle votre langue.
        </h2>
        <p className="text-sm" style={{ color: "rgba(232,230,240,0.55)" }}>
          Chaque rôle a ses enjeux. Nous avons une réponse pour chacun.
        </p>
      </div>

      {/* Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: "1.25rem",
        }}
      >
        {PERSONAS.map((p) => (
          <div
            key={p.role}
            className="group flex flex-col gap-5 rounded-[14px] p-6 transition-all duration-200"
            style={{
              border: "1px solid rgba(255,255,255,0.07)",
              background: "rgba(255,255,255,0.02)",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background =
                `${p.color}08`;
              (e.currentTarget as HTMLElement).style.borderColor =
                `${p.color}30`;
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background =
                "rgba(255,255,255,0.02)";
              (e.currentTarget as HTMLElement).style.borderColor =
                "rgba(255,255,255,0.07)";
            }}
          >
            {/* Icon */}
            <div
              className="flex h-11 w-11 items-center justify-center rounded-[10px]"
              style={{
                background: `${p.color}12`,
                border: `1px solid ${p.color}30`,
              }}
            >
              {p.icon}
            </div>

            {/* Role + message */}
            <div className="flex flex-col gap-1.5">
              <p
                className="font-syne font-bold text-sm"
                style={{ color: p.color }}
              >
                {p.role}
              </p>
              <p className="text-xs leading-5" style={{ color: "rgba(232,230,240,0.65)" }}>
                {p.message}
              </p>
            </div>

            {/* CTA */}
            <Link
              href={p.href as Route}
              className="mt-auto inline-flex items-center gap-1.5 text-xs font-medium transition-opacity duration-150 hover:opacity-70"
              style={{ color: p.color }}
            >
              {p.cta}
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}
