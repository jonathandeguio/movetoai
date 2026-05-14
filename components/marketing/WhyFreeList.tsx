"use client";

const REASONS = [
  {
    number: "01",
    title: "Accélérer l'adoption IA en France",
    body: "Nous croyons que chaque PME mérite d'accéder à l'intelligence artificielle, sans barrière financière.",
    tag: "Mission",
    tagColor: "#6ee7b7",
  },
  {
    number: "02",
    title: "Un modèle freemium prouvé",
    body: "Comme Notion ou HubSpot, nous offrons une valeur immédiate gratuite. Les grandes équipes passent en Pro.",
    tag: "Business Model",
    tagColor: "#38bdf8",
  },
  {
    number: "03",
    title: "Votre data reste la vôtre",
    body: "Nous ne revendons pas vos données. Notre modèle économique, c'est l'abonnement Pro — pas la publicité.",
    tag: "Éthique",
    tagColor: "#a78bfa",
  },
  {
    number: "04",
    title: "Vos consultants nous recommandent",
    body: "Les consultants certifiés Move to AI génèrent des revenus via la plateforme. Ils ont intérêt à vous faire réussir.",
    tag: "Réseau",
    tagColor: "#fb923c",
  },
  {
    number: "05",
    title: "Nous nous finançons sur la réussite",
    body: "Commissions sur les projets réalisés via la plateforme, pas sur votre accès.",
    tag: "Alignement",
    tagColor: "#fbbf24",
  },
  {
    number: "06",
    title: "Effets réseau",
    body: "Plus d'entreprises = plus de données de benchmark = meilleurs insights pour tous.",
    tag: "Communauté",
    tagColor: "#6ee7b7",
  },
  {
    number: "07",
    title: "Compétitif face aux gros acteurs",
    body: "Face à Salesforce ou SAP, notre meilleure arme est d'être irremplaçable avant qu'ils arrivent.",
    tag: "Stratégie",
    tagColor: "#38bdf8",
  },
];

export function WhyFreeList() {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-24 sm:px-6 xl:px-8">
      {/* Header */}
      <div className="mb-14 space-y-4 text-center">
        <p
          className="text-xs font-medium uppercase"
          style={{ color: "#6ee7b7", letterSpacing: "0.16em" }}
        >
          Transparence
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
          Pourquoi c&apos;est vraiment gratuit ?
        </h2>
        <p className="mx-auto max-w-xl text-sm leading-7" style={{ color: "rgba(232,230,240,0.55)" }}>
          7 vraies raisons — pas de dark patterns, pas de piège. Juste un modèle économique
          aligné avec votre réussite.
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
        {REASONS.map((r) => (
          <div
            key={r.number}
            className="flex flex-col gap-4 rounded-[14px] p-6 transition-all duration-200"
            style={{
              border: "1px solid rgba(255,255,255,0.07)",
              background: "rgba(255,255,255,0.02)",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background =
                "rgba(255,255,255,0.04)";
              (e.currentTarget as HTMLElement).style.borderColor =
                "rgba(255,255,255,0.12)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background =
                "rgba(255,255,255,0.02)";
              (e.currentTarget as HTMLElement).style.borderColor =
                "rgba(255,255,255,0.07)";
            }}
          >
            {/* Number + tag row */}
            <div className="flex items-center justify-between">
              <span
                className="font-syne font-extrabold"
                style={{
                  fontSize: "1.5rem",
                  color: "rgba(255,255,255,0.12)",
                  letterSpacing: "-0.04em",
                }}
              >
                {r.number}
              </span>
              <span
                className="rounded-full px-2.5 py-0.5 text-xs font-medium"
                style={{
                  background: `${r.tagColor}15`,
                  color: r.tagColor,
                  border: `1px solid ${r.tagColor}30`,
                }}
              >
                {r.tag}
              </span>
            </div>

            {/* Title */}
            <p
              className="font-syne font-bold text-sm leading-5"
              style={{ color: "#fff" }}
            >
              {r.title}
            </p>

            {/* Body */}
            <p className="text-xs leading-5" style={{ color: "rgba(232,230,240,0.50)" }}>
              {r.body}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
