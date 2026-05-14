"use client";

const PROFILES = [
  {
    name: "Dirigeant PME",
    description: "Votre CFO veut des chiffres. Move to AI calcule le ROI avant même de démarrer.",
    color: "#a78bfa",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#a78bfa" strokeWidth="1.4">
        <polygon points="10,2 12.5,7.5 18.5,8.2 14,12.5 15.4,18.5 10,15.5 4.6,18.5 6,12.5 1.5,8.2 7.5,7.5" />
      </svg>
    ),
  },
  {
    name: "DSI",
    description: "Pas de shadow IT. Nos intégrations s'adaptent à votre stack existant.",
    color: "#38bdf8",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#38bdf8" strokeWidth="1.4">
        <rect x="2" y="3" width="16" height="11" rx="2" />
        <path d="M7 18h6M10 14v4" strokeLinecap="round" />
        <path d="M7 9l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    name: "Resp. RH",
    description: "Automatisez l'onboarding, la formation et le suivi — sans coder.",
    color: "#6ee7b7",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#6ee7b7" strokeWidth="1.4">
        <circle cx="10" cy="6" r="3.5" />
        <path d="M3 18c0-3.9 3.1-7 7-7s7 3.1 7 7" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    name: "Resp. Finance",
    description: "Réduisez les tâches manuelles de 60 %. Gardez le contrôle total.",
    color: "#fbbf24",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#fbbf24" strokeWidth="1.4">
        <rect x="2" y="13" width="4" height="5" rx="1" />
        <rect x="8" y="9" width="4" height="9" rx="1" />
        <rect x="14" y="4" width="4" height="14" rx="1" />
      </svg>
    ),
  },
  {
    name: "Consultant IA",
    description: "Gérez 5× plus de clients. Vos modèles, réutilisables à l'infini.",
    color: "#fb923c",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#fb923c" strokeWidth="1.4">
        <circle cx="8" cy="6" r="3" />
        <path d="M2 18c0-3.3 2.7-6 6-6" strokeLinecap="round" />
        <path d="M15 10l3 3-3 3M18 13h-5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    name: "Chef de projet",
    description: "Chaque use case livré avec un plan d'action, des KPIs et un champion métier.",
    color: "#94a3b8",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#94a3b8" strokeWidth="1.4">
        <rect x="2" y="2" width="7" height="7" rx="1.5" />
        <rect x="11" y="2" width="7" height="7" rx="1.5" />
        <rect x="2" y="11" width="7" height="7" rx="1.5" />
        <rect x="11" y="11" width="7" height="7" rx="1.5" />
      </svg>
    ),
  },
];

export function Profiles() {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-24 sm:px-6 xl:px-8">
      {/* Header */}
      <div className="mb-14 space-y-4 text-center">
        <p
          className="text-xs font-medium uppercase"
          style={{ color: "#6ee7b7", letterSpacing: "0.16em" }}
        >
          Conçu pour toute l&apos;entreprise
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
      </div>

      {/* Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(168px, 1fr))",
          gap: "1px",
          background: "rgba(255,255,255,0.07)",
          border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: "16px",
          overflow: "hidden",
        }}
      >
        {PROFILES.map((p) => (
          <div
            key={p.name}
            className="group flex flex-col gap-4 p-6 transition-colors duration-200"
            style={{ background: "#060810" }}
            onMouseEnter={(e) =>
              ((e.currentTarget as HTMLElement).style.background =
                "rgba(255,255,255,0.03)")
            }
            onMouseLeave={(e) =>
              ((e.currentTarget as HTMLElement).style.background = "#060810")
            }
          >
            {/* Icon */}
            <div
              className="flex h-10 w-10 items-center justify-center rounded-[10px] transition-all duration-200"
              style={{
                border: "1px solid rgba(255,255,255,0.10)",
              }}
            >
              {p.icon}
            </div>

            {/* Text */}
            <div className="space-y-1">
              <p
                className="font-syne font-bold text-sm"
                style={{ color: "#fff" }}
              >
                {p.name}
              </p>
              <p
                className="text-xs leading-5"
                style={{ color: "rgba(232,230,240,0.50)" }}
              >
                {p.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
