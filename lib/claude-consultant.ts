import "server-only";

export type ConsultantUseCase = {
  id: string;
  title: string;
  client_value: string;
  sector: string;
  tools_used: string[];
  mission_days: string;
  price_range: string;
  complexity: "low" | "medium" | "high";
};

export type ConsultantRecommendationResult = {
  use_cases: ConsultantUseCase[];
  positioning_summary: string;
  partner_tier_suggestion: "Explorer" | "Certified" | "Expert";
};

const FALLBACK: ConsultantRecommendationResult = {
  positioning_summary:
    "Consultant IA avec une expertise opérationnelle, capable de proposer des missions à forte valeur ajoutée.",
  partner_tier_suggestion: "Explorer",
  use_cases: [
    {
      id: "audit_ia_readiness",
      title: "Audit IA Readiness",
      client_value: "Évaluer la maturité IA de l'entreprise et prioriser les quick wins",
      sector: "Tous secteurs",
      tools_used: ["Move to AI"],
      mission_days: "2-3 jours",
      price_range: "1 500 - 2 500 €",
      complexity: "low",
    },
    {
      id: "cartographie_processus",
      title: "Cartographie des processus automatisables",
      client_value: "Identifier les processus à fort potentiel IA et estimer les gains",
      sector: "Industrie, Services",
      tools_used: ["Move to AI"],
      mission_days: "3-5 jours",
      price_range: "2 000 - 4 000 €",
      complexity: "medium",
    },
    {
      id: "poc_ia_generative",
      title: "POC IA Générative sur un cas métier",
      client_value: "Démontrer la valeur concrète de l'IA sur un processus cible en 4 semaines",
      sector: "Finance, Commerce",
      tools_used: ["Anthropic Claude", "Move to AI"],
      mission_days: "10-15 jours",
      price_range: "7 000 - 12 000 €",
      complexity: "medium",
    },
    {
      id: "formation_equipes",
      title: "Formation équipes IA & Change Management",
      client_value: "Accélérer l'adoption de l'IA par les équipes métier",
      sector: "Tous secteurs",
      tools_used: ["Move to AI"],
      mission_days: "3-5 jours",
      price_range: "2 500 - 4 500 €",
      complexity: "low",
    },
    {
      id: "integration_outils",
      title: "Intégration no-code / low-code",
      client_value: "Connecter les outils métier avec les LLMs sans développement lourd",
      sector: "PME, Services",
      tools_used: ["Make / Zapier", "Move to AI"],
      mission_days: "5-10 jours",
      price_range: "3 500 - 8 000 €",
      complexity: "medium",
    },
  ],
};

/**
 * Appelle l'API Anthropic Claude pour générer 5 cas d'usage personnalisés
 * pour un consultant IA, avec arguments de valeur et estimations de mission.
 * Retourne toujours un résultat (fallback si API indisponible).
 */
export async function recommendConsultantUseCases(input: {
  specialization: string;
  yearsExperience: string;
  sectors: string[];
  tools: string[];
}): Promise<ConsultantRecommendationResult> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return FALLBACK;

  const systemPrompt = `Tu es un expert en développement de pratique IA pour consultants et cabinets de conseil.
Tu dois suggérer des cas d'usage concrets, immédiatement proposables à des clients, adaptés au profil du consultant.
Réponds UNIQUEMENT en JSON valide, sans markdown, sans préambule.
Format attendu :
{
  "use_cases": [
    {
      "id": "slug_unique",
      "title": "Titre court du cas d'usage",
      "client_value": "Argument de valeur client en 1 phrase percutante",
      "sector": "Secteur(s) cible(s)",
      "tools_used": ["outil1", "outil2"],
      "mission_days": "X-Y jours",
      "price_range": "X 000 - Y 000 €",
      "complexity": "low|medium|high"
    }
  ],
  "positioning_summary": "1 phrase résumant le positionnement différenciant de ce consultant",
  "partner_tier_suggestion": "Explorer|Certified|Expert"
}`;

  const userMessage = `Ce consultant est spécialisé en ${input.specialization}, avec ${input.yearsExperience} d'expérience IA.
Il intervient dans ces secteurs : ${input.sectors.join(", ")}.
Il maîtrise ces outils : ${input.tools.join(", ")}.
Suggère-lui exactement 5 cas d'usage Move to AI qu'il peut proposer immédiatement à ses clients, avec argument de valeur percutant et estimation de mission réaliste (jours + fourchette tarifaire indicative en euros HT).`;

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

    if (!response.ok) return FALLBACK;

    const data = (await response.json()) as {
      content: Array<{ type: string; text: string }>;
    };

    const textBlock = data.content.find((b) => b.type === "text");
    if (!textBlock) return FALLBACK;

    const parsed = JSON.parse(textBlock.text) as ConsultantRecommendationResult;
    if (!Array.isArray(parsed.use_cases) || parsed.use_cases.length === 0) {
      return FALLBACK;
    }

    return parsed;
  } catch {
    return FALLBACK;
  }
}
