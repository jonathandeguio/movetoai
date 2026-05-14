import { CheckCircle2, Clock, TrendingUp } from "lucide-react";

export const dynamic = "force-dynamic";

const ROADMAP_PHASES = [
  {
    phase: "Phase 1 — Exploration",
    period: "M1-M3",
    status: "done" as const,
    items: [
      "Cartographie des processus clés",
      "Identification des opportunités IA prioritaires",
      "Évaluation du niveau de maturité données"
    ]
  },
  {
    phase: "Phase 2 — Quick Wins",
    period: "M3-M6",
    status: "active" as const,
    items: [
      "Déploiement des 3 automatisations à fort ROI",
      "Formation des équipes opérationnelles",
      "Mesure des premiers gains"
    ]
  },
  {
    phase: "Phase 3 — Industrialisation",
    period: "M6-M12",
    status: "upcoming" as const,
    items: [
      "Généralisation des use cases validés",
      "Gouvernance IA & monitoring",
      "Plan de transformation culturelle"
    ]
  }
];

const STATUS_STYLE = {
  done: {
    badge: "bg-[--green-dim] text-[--green]",
    label: "Terminé",
    icon: CheckCircle2,
    border: "border-[--green-border]",
    dot: "bg-[--green]"
  },
  active: {
    badge: "bg-[--purple-dim] text-[--purple]",
    label: "En cours",
    icon: TrendingUp,
    border: "border-[--purple-border]",
    dot: "bg-[--purple]"
  },
  upcoming: {
    badge: "bg-[--bg-hover] text-[--text-muted]",
    label: "À venir",
    icon: Clock,
    border: "border-[--border]",
    dot: "bg-[--border-strong]"
  }
};

export default function ExecutiveStrategyPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-bold text-[--text-primary]">Vision stratégique & roadmap</h1>
        <p className="mt-1 text-sm text-[--text-muted]">
          Vue macro de votre transformation IA — sur 12 mois.
        </p>
      </div>

      {/* Roadmap timeline */}
      <div className="space-y-4">
        {ROADMAP_PHASES.map((phase) => {
          const s = STATUS_STYLE[phase.status];
          const Icon = s.icon;
          return (
            <div
              key={phase.phase}
              className={`rounded-2xl border ${s.border} bg-[--bg-card] p-6 shadow-sm`}
            >
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-full ${phase.status === "done" ? "bg-[--green-dim]" : phase.status === "active" ? "bg-[--purple-dim]" : "bg-[--bg-hover]"}`}>
                    <Icon className={`h-4 w-4 ${phase.status === "done" ? "text-[--green]" : phase.status === "active" ? "text-[--purple]" : "text-[--text-muted]"}`} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[--text-primary]">{phase.phase}</h3>
                    <p className="text-xs text-[--text-muted]">{phase.period}</p>
                  </div>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${s.badge}`}>
                  {s.label}
                </span>
              </div>

              <ul className="space-y-2">
                {phase.items.map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm text-[--text-secondary]">
                    <div className={`h-1.5 w-1.5 shrink-0 rounded-full ${s.dot}`} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      {/* Strategic pillars */}
      <div>
        <h2 className="mb-4 text-base font-semibold text-[--text-secondary]">Piliers stratégiques</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { title: "Efficacité opérationnelle", desc: "Automatiser les tâches répétitives à faible valeur ajoutée pour libérer du temps décisionnel.", pct: 65 },
            { title: "Intelligence commerciale", desc: "Augmenter les équipes commerciales avec des insights IA sur les opportunités et les risques clients.", pct: 40 },
            { title: "Expérience client", desc: "Personnaliser les interactions et anticiper les besoins via l'analyse prédictive.", pct: 25 }
          ].map((pillar) => (
            <div key={pillar.title} className="rounded-2xl border border-[--border] bg-[--bg-card] p-5 shadow-sm">
              <h3 className="mb-1 font-semibold text-[--text-primary]">{pillar.title}</h3>
              <p className="mb-4 text-xs text-[--text-muted] leading-relaxed">{pillar.desc}</p>
              <div className="mb-1 flex justify-between text-xs font-medium">
                <span className="text-[--text-secondary]">Avancement</span>
                <span className="text-[--purple]">{pillar.pct}%</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-[--bg-hover]">
                <div className="h-full rounded-full bg-[--purple]" style={{ width: `${pillar.pct}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
