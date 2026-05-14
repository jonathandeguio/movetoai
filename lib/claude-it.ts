import "server-only";

export type ITPhase = {
  phase: number;
  title: string;
  duration: string;
  prerequisites: string[];
  risks: string[];
  rgpd_notes: string[];
  systems_involved: string[];
};

export type ITRoadmapResult = {
  phases: ITPhase[];
  summary: string;
  priority_recommendation: string;
};

const FALLBACK_ROADMAP: ITRoadmapResult = {
  summary:
    "Roadmap d'intégration IA en 3 phases adaptée à votre stack et contraintes.",
  priority_recommendation:
    "Commencer par un audit des flux de données critiques et un POC IA sur le système le plus mature.",
  phases: [
    {
      phase: 1,
      title: "Audit & fondations",
      duration: "1-2 mois",
      prerequisites: [
        "Inventaire exhaustif des systèmes et flux de données",
        "Cartographie des dépendances inter-systèmes",
        "Analyse de conformité RGPD initiale",
      ],
      risks: [
        "Découverte de silos de données non documentés",
        "Dépendances legacy non identifiées",
        "Données personnelles non cataloguées",
      ],
      rgpd_notes: [
        "Identifier les données personnelles dans chaque système",
        "Nommer un référent RGPD dédié à la transformation IA",
        "Initier le registre des traitements IA",
      ],
      systems_involved: [],
    },
    {
      phase: 2,
      title: "Intégration pilote",
      duration: "2-4 mois",
      prerequisites: [
        "APIs documentées et accessibles en test",
        "Environnement isolé de la production",
        "DPA signés avec les fournisseurs IA",
        "Équipe de test IT + métier",
      ],
      risks: [
        "Latence des intégrations en conditions réelles",
        "Coûts de transformation des données",
        "Résistance au changement des équipes métier",
        "Dépendance à des APIs tierces non contrôlées",
      ],
      rgpd_notes: [
        "Mettre en place les mécanismes de consentement",
        "Pseudonymiser les données dans les environnements de test",
        "Valider le transfert des données avec le DPO",
      ],
      systems_involved: [],
    },
    {
      phase: 3,
      title: "Déploiement & gouvernance",
      duration: "3-6 mois",
      prerequisites: [
        "Validation complète du pilote par les métiers",
        "Formation des équipes IT et utilisateurs",
        "Procédures de rollback documentées",
        "Monitoring et alertes opérationnels",
      ],
      risks: [
        "Dérive des modèles IA (model drift)",
        "Dépendance fournisseur et lock-in",
        "Évolution réglementaire (AI Act, RGPD)",
        "Incidents de sécurité sur les endpoints IA",
      ],
      rgpd_notes: [
        "Audit de conformité complet avant mise en production",
        "Registre des traitements IA finalisé",
        "Plan de réponse aux incidents RGPD documenté",
        "Revues de conformité trimestrielles",
      ],
      systems_involved: [],
    },
  ],
};

/**
 * Appelle l'API Anthropic Claude pour générer une roadmap d'intégration IA
 * personnalisée pour un DSI / IT Manager.
 *
 * Retourne toujours un résultat (fallback si l'API est indisponible).
 */
export async function recommendITRoadmap(input: {
  systems: string[];
  constraint: string;
}): Promise<ITRoadmapResult> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return FALLBACK_ROADMAP;

  const systemPrompt = `Tu es un architecte IT spécialisé en intégration IA en entreprise.
Tu dois recommander une roadmap d'intégration précise, actionnable et adaptée à la stack et contrainte spécifiée.
Réponds UNIQUEMENT en JSON valide, sans markdown, sans préambule.
Format attendu :
{
  "phases": [
    {
      "phase": 1,
      "title": "string",
      "duration": "string (ex: 1-2 mois)",
      "prerequisites": ["string"],
      "risks": ["string"],
      "rgpd_notes": ["string"],
      "systems_involved": ["string"]
    }
  ],
  "summary": "string (1-2 phrases résumant la stratégie globale)",
  "priority_recommendation": "string (action concrète prioritaire à démarrer immédiatement)"
}`;

  const userMessage = `Stack technique actuelle : ${input.systems.join(", ")}.
Contrainte principale : ${input.constraint}.
Recommande une roadmap d'intégration IA en exactement 3 phases avec pour chaque phase : titre, durée estimée, prérequis techniques, risques identifiés, points de vigilance RGPD et systèmes impliqués.`;

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 2048,
        temperature: 0,
        system: systemPrompt,
        messages: [{ role: "user", content: userMessage }],
      }),
    });

    if (!response.ok) return FALLBACK_ROADMAP;

    const data = (await response.json()) as {
      content: Array<{ type: string; text: string }>;
    };

    const textBlock = data.content.find((b) => b.type === "text");
    if (!textBlock) return FALLBACK_ROADMAP;

    const parsed = JSON.parse(textBlock.text) as ITRoadmapResult;
    if (!Array.isArray(parsed.phases) || parsed.phases.length === 0) {
      return FALLBACK_ROADMAP;
    }

    return parsed;
  } catch {
    return FALLBACK_ROADMAP;
  }
}
