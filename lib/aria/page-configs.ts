// lib/aria/page-configs.ts
// Configuration du comportement d'Aria sur chaque page de l'application.

export type PageContext = Record<string, unknown>;

export interface AriaSuggestion {
  id:           string;
  icon:         string;
  title:        string;
  description:  string;
  action_label: string;
  action_url?:  string;
  action_type?: "navigate" | "fill_field";
  field_value?: string;
  priority:     "high" | "medium" | "low";
}

export interface ProactiveCheck {
  id:            string;
  condition:     (ctx: PageContext) => boolean;
  message:       (ctx: PageContext) => string;
  severity:      "warning" | "info" | "error";
  action_label?: string;
  action_url?:   string;
}

export interface HelpTopic {
  label: string;
  query: string;
}

export interface AriaPageConfig {
  page_id:          string;
  banner_trigger:   "always" | "empty_state" | "first_visit" | "never";
  banner_message:   (ctx: PageContext) => string | null;
  suggestions:      (ctx: PageContext) => AriaSuggestion[];
  proactive_checks: ProactiveCheck[];
  help_topics:      HelpTopic[];
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const num = (ctx: PageContext, key: string) => Number(ctx[key] ?? 0);

// ── Configs par page ──────────────────────────────────────────────────────────

export const ARIA_PAGE_CONFIGS: Record<string, AriaPageConfig> = {

  // ── Dashboard ───────────────────────────────────────────────────────────────
  "/app": {
    page_id:        "dashboard",
    banner_trigger: "first_visit",
    banner_message: (ctx) => {
      if (!num(ctx, "opportunities_count")) {
        return "👋 Bienvenue sur Move to AI ! Je suis Aria, votre assistante. Commençons par identifier vos premières opportunités d'automatisation.";
      }
      if (num(ctx, "compliance_score") < 50 && num(ctx, "expiring_certs_count") > 0) {
        return `⚠️ ${ctx.expiring_certs_count} certification(s) nécessitent votre attention — votre score de conformité est de ${ctx.compliance_score}%.`;
      }
      if (num(ctx, "pending_validations") > 0) {
        return `✋ ${ctx.pending_validations} élément(s) attendent votre validation aujourd'hui.`;
      }
      return null;
    },
    suggestions: (ctx) => {
      const s: AriaSuggestion[] = [];
      if (!num(ctx, "opportunities_count")) {
        s.push({ id: "first_opportunity", icon: "💡", title: "Créer votre première opportunité", description: "Décrivez un processus répétitif en langage naturel", action_label: "Commencer →", action_url: "/app/opportunities", priority: "high" });
      }
      if (num(ctx, "processes_without_bpmn") > 2) {
        s.push({ id: "model_processes", icon: "📐", title: `${ctx.processes_without_bpmn} processus sans diagramme`, description: "Modélisez-les en BPMN pour améliorer votre score IA", action_label: "Modéliser →", action_url: "/app/knowledge/processes", priority: "medium" });
      }
      return s;
    },
    proactive_checks: [
      {
        id:        "cert_expiry",
        condition: (ctx) => num(ctx, "expiring_certs_count") > 0,
        message:   (ctx) => `${ctx.expiring_certs_count} certification(s) expirent dans moins de 90 jours`,
        severity:  "warning",
        action_url: "/app/compliance",
      },
    ],
    help_topics: [
      { label: "Comment lire mon dashboard ?",        query: "explication dashboard Move to AI" },
      { label: "Comment améliorer mon score IA ?",    query: "améliorer score maturité IA" },
      { label: "Par où commencer ?",                  query: "première étape démarrage Move to AI" },
    ],
  },

  // ── Opportunités ────────────────────────────────────────────────────────────
  "/app/opportunities": {
    page_id:        "opportunities",
    banner_trigger: "empty_state",
    banner_message: (ctx) => {
      if (!num(ctx, "opportunities_count")) {
        return "Il n'y a pas encore d'opportunités. Décrivez un problème récurrent de votre entreprise — je l'analyse et génère automatiquement une fiche structurée.";
      }
      if (num(ctx, "draft_count") > 3) {
        return `Vous avez ${ctx.draft_count} opportunités en brouillon. Je peux vous aider à les qualifier et à prioriser les plus rentables.`;
      }
      return null;
    },
    suggestions: (ctx) => {
      const s: AriaSuggestion[] = [];
      if (!num(ctx, "opportunities_count")) {
        s.push({ id: "describe_problem", icon: "✍️", title: "Décrivez un problème en langage naturel", description: 'Ex : "Je passe 3h par semaine à relancer les factures impayées"', action_label: "+ Nouvelle opportunité", action_url: "/app/opportunities", priority: "high" });
      }
      if (num(ctx, "high_potential_unvalidated") > 0) {
        s.push({ id: "validate_high_potential", icon: "🎯", title: `${ctx.high_potential_unvalidated} opportunité(s) prioritaires à valider`, description: "Ces opportunités ont un fort potentiel ROI", action_label: "Voir →", action_url: "/app/opportunities", priority: "high" });
      }
      return s;
    },
    proactive_checks: [],
    help_topics: [
      { label: "Comment bien décrire une opportunité ?",  query: "décrire opportunité langage naturel" },
      { label: "Quelle est la différence P0/P1/P2 ?",     query: "explication priorités opportunités" },
      { label: "Quand convertir en use case ?",           query: "convertir opportunité use case" },
    ],
  },

  // ── Use Cases ───────────────────────────────────────────────────────────────
  "/app/use-cases": {
    page_id:        "use_cases",
    banner_trigger: "empty_state",
    banner_message: (ctx) => {
      if (!num(ctx, "use_cases_count")) {
        return "Aucun use case pour l'instant. Convertissez une opportunité validée en use case pour structurer votre projet IA avec KPIs, ROI et diagramme BPMN.";
      }
      if (num(ctx, "stalled_use_cases") > 0) {
        return `${ctx.stalled_use_cases} use case(s) sans activité depuis plus de 2 semaines. Voulez-vous que je vous aide à les débloquer ?`;
      }
      return null;
    },
    suggestions: (ctx) => {
      const s: AriaSuggestion[] = [];
      if (num(ctx, "validated_opportunities_not_converted") > 0) {
        s.push({ id: "convert_validated", icon: "🔄", title: `${ctx.validated_opportunities_not_converted} opportunité(s) validée(s) à convertir`, description: "Ces opportunités sont prêtes à devenir des use cases", action_label: "Convertir →", action_url: "/app/opportunities", priority: "high" });
      }
      return s;
    },
    proactive_checks: [],
    help_topics: [
      { label: "Comment définir de bons KPIs ?",  query: "définir KPIs use case" },
      { label: "Comment calculer le ROI ?",        query: "calcul ROI use case" },
      { label: "Comment utiliser l'éditeur BPMN ?", query: "éditeur BPMN modélisation processus" },
    ],
  },

  // ── Knowledge — Processus ───────────────────────────────────────────────────
  "/app/knowledge/processes": {
    page_id:        "processes",
    banner_trigger: "empty_state",
    banner_message: (ctx) => {
      if (!num(ctx, "processes_count")) {
        return "Les processus métier sont le cœur de Move to AI. Décrivez vos processus clés pour que je calcule leur potentiel d'automatisation IA.";
      }
      if (num(ctx, "high_potential_unmodeled") > 0) {
        return `${ctx.high_potential_unmodeled} processus à fort potentiel IA ne sont pas encore modélisés en BPMN. Je peux générer les diagrammes automatiquement.`;
      }
      return null;
    },
    suggestions: (ctx) => {
      const s: AriaSuggestion[] = [];
      if (!num(ctx, "processes_count")) {
        s.push({ id: "create_process", icon: "⚙️", title: "Décrire votre premier processus", description: "Commencez par le processus qui vous prend le plus de temps", action_label: "+ Nouveau processus", action_url: "/app/knowledge/processes", priority: "high" });
      }
      if (num(ctx, "high_pain_processes") > 0) {
        s.push({ id: "high_pain", icon: "🔥", title: `${ctx.high_pain_processes} processus à fort pain score`, description: "Ces processus sont prioritaires pour l'automatisation IA", action_label: "Analyser →", action_url: "/app/knowledge/processes", priority: "high" });
      }
      return s;
    },
    proactive_checks: [],
    help_topics: [
      { label: "Comment décrire les étapes d'un processus ?", query: "décrire étapes processus" },
      { label: "Que signifie le score AI Readiness ?",         query: "score AI readiness processus" },
      { label: "Comment générer un BPMN ?",                   query: "générer BPMN depuis processus" },
    ],
  },

  // ── Knowledge — Applications ────────────────────────────────────────────────
  "/app/knowledge/applications": {
    page_id:        "applications",
    banner_trigger: "empty_state",
    banner_message: (ctx) => {
      if (!num(ctx, "applications_count")) {
        return "Commencez par ajouter vos applications clés. Chaque application liée à un processus améliore votre score de maturité IA et permet de calculer la dette technique de votre SI.";
      }
      return null;
    },
    suggestions: (ctx) => {
      const s: AriaSuggestion[] = [];
      if (!num(ctx, "applications_count")) {
        s.push({ id: "add_app", icon: "🖥️", title: "Ajouter votre première application", description: "ERP, CRM, outils métier... tout ce que votre équipe utilise", action_label: "+ Ajouter →", action_url: "/app/knowledge/applications", priority: "high" });
      }
      return s;
    },
    proactive_checks: [],
    help_topics: [
      { label: "Qu'est-ce qu'une fact-sheet application ?", query: "fact sheet application" },
      { label: "Comment lire la matrice portfolio ?",        query: "matrice portfolio assessment" },
    ],
  },

  // ── Conformité ──────────────────────────────────────────────────────────────
  "/app/compliance": {
    page_id:        "compliance",
    banner_trigger: "always",
    banner_message: (ctx) => {
      if (num(ctx, "missing_mandatory_certs") > 0) {
        return `⚠️ ${ctx.missing_mandatory_certs} certification(s) OBLIGATOIRE(S) non obtenues pour votre secteur. Voici les étapes pour y remédier.`;
      }
      if (num(ctx, "expiring_soon") > 0) {
        return `🔔 ${ctx.expiring_soon} certification(s) expirent dans moins de 90 jours. Planifiez vos audits de renouvellement maintenant.`;
      }
      if (num(ctx, "global_score") >= 80) {
        return `✅ Excellent ! Votre score de conformité est de ${ctx.global_score}%. Voici comment maintenir ce niveau.`;
      }
      return null;
    },
    suggestions: (ctx) => num(ctx, "missing_mandatory_certs") > 0 ? [{
      id:           "get_mandatory_cert",
      icon:         "🛡️",
      title:        "Obtenir les certifications obligatoires",
      description:  "Ces certifications sont requises pour votre secteur d'activité",
      action_label: "Voir le plan →",
      action_url:   "/app/compliance",
      priority:     "high" as const,
    }] : [],
    proactive_checks: [],
    help_topics: [
      { label: "Comment lire le score de conformité ?",           query: "score conformité explication" },
      { label: "Quelle certification obtenir en premier ?",        query: "priorisation certifications" },
      { label: "Comment lier une certification à mes processus ?", query: "lier certification processus" },
    ],
  },

  // ── Roadmap ─────────────────────────────────────────────────────────────────
  "/app/roadmap": {
    page_id:        "roadmap",
    banner_trigger: "empty_state",
    banner_message: (ctx) => {
      if (!num(ctx, "initiatives_count")) {
        return "La roadmap IA se construit à partir de vos use cases approuvés. Convertissez vos meilleures opportunités en initiatives pour les planifier ici.";
      }
      return null;
    },
    suggestions: () => [],
    proactive_checks: [],
    help_topics: [
      { label: "Comment construire ma roadmap IA ?",  query: "construire roadmap IA" },
      { label: "Comment prioriser les initiatives ?", query: "prioriser initiatives IA" },
    ],
  },

  // ── Scénarios ───────────────────────────────────────────────────────────────
  "/app/scenarios": {
    page_id:        "scenarios",
    banner_trigger: "first_visit",
    banner_message: () =>
      "Les scénarios vous permettent de simuler l'impact de vos décisions IA avant de les prendre. Créez un scénario pour comparer deux trajectoires de transformation.",
    suggestions: () => [],
    proactive_checks: [],
    help_topics: [
      { label: "Comment créer un scénario ?",         query: "créer scénario simulation IA" },
      { label: "Comment comparer deux scénarios ?",   query: "comparer scénarios Move to AI" },
    ],
  },

  // ── Copilot ─────────────────────────────────────────────────────────────────
  "/app/copilot": {
    page_id:        "copilot",
    banner_trigger: "first_visit",
    banner_message: () =>
      "Le Copilot IA répond à vos questions sur votre transformation en langage naturel. Essayez : \"Quels sont mes processus les plus automatisables ?\"",
    suggestions: () => [],
    proactive_checks: [],
    help_topics: [
      { label: "Que peut faire le Copilot ?",            query: "capacités copilot IA" },
      { label: "Comment poser une bonne question ?",      query: "formulation requête copilot" },
    ],
  },

  // ── Gouvernance ─────────────────────────────────────────────────────────────
  "/app/governance": {
    page_id:        "governance",
    banner_trigger: "first_visit",
    banner_message: () =>
      "La gouvernance IA vous aide à cadrer vos décisions, gérer les risques et assurer la conformité RGPD de vos projets IA.",
    suggestions: () => [],
    proactive_checks: [],
    help_topics: [
      { label: "Comment créer une décision ?",       query: "créer décision gouvernance" },
      { label: "Comment évaluer un risque IA ?",     query: "évaluer risque projet IA" },
    ],
  },
};
