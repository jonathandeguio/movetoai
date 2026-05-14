import "server-only";

export type RecommendedProcess = {
  id: string;
  label: string;
  domain: string;
  description: string;
  priority: number;
  estimated_gain: string;
  complexity: "low" | "medium" | "high";
};

export type ClaudeRecommendationResult = {
  recommended_processes: RecommendedProcess[];
  profile_summary: string;
  redirect_slug: string;
};

/**
 * Appelle l'API Anthropic Claude pour générer des recommandations de processus
 * personnalisées lors de l'onboarding Move to AI.
 *
 * Prompt système : l'utilisateur vient de s'inscrire et a fourni sa taille
 * d'entreprise (companySize), son rôle (userFunction) et ses domaines métier
 * prioritaires (selectedDomains). Claude retourne exactement 6 processus à
 * fort potentiel d'automatisation, adaptés au profil, ainsi qu'un résumé de
 * profil et un slug de redirection.
 *
 * La réponse est contrainte à du JSON valide (sans markdown, sans préambule)
 * avec temperature=0 pour des résultats déterministes. En cas d'échec ou de
 * JSON invalide, l'appelant doit appliquer des processus par défaut (fallback).
 *
 * @param input.companySize    "pme" | "eti" | "grand_groupe"
 * @param input.userFunction   "executive" | "ai_lead" | "business_owner" | "data_it" | "consultant" | "other"
 * @param input.selectedDomains Tableau des domaines métier sélectionnés par l'utilisateur
 * @returns ClaudeRecommendationResult contenant 6 recommended_processes
 */
export async function recommendProcessesForOnboarding(input: {
  companySize: string;
  userFunction: string;
  selectedDomains: string[];
}): Promise<ClaudeRecommendationResult> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY_MISSING");
  }

  const systemPrompt = `Tu es un expert en transformation digitale et automatisation de processus métier pour l'application Move to AI.

L'utilisateur vient de s'inscrire et a fourni les informations suivantes :
- Taille de l'entreprise : ${input.companySize}
- Rôle : ${input.userFunction}
- Domaines prioritaires sélectionnés : ${input.selectedDomains.join(", ")}

Ta mission : recommander exactement 6 processus métier à forte valeur ajoutée que cet utilisateur devrait automatiser en priorité, adaptés à sa taille d'entreprise et son rôle.

Réponds UNIQUEMENT en JSON valide, sans markdown, sans preamble :
{
  "recommended_processes": [
    {
      "id": "string_slug",
      "label": "Nom court du processus",
      "domain": "domaine_métier",
      "description": "1 phrase expliquant la valeur pour ce profil",
      "priority": 1,
      "estimated_gain": "ex: -40% de temps de traitement",
      "complexity": "low|medium|high"
    }
  ],
  "profile_summary": "1 phrase résumant le profil détecté",
  "redirect_slug": "slug_de_la_section_la_plus_pertinente"
}`;

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 1000,
      temperature: 0,
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: "Génère les recommandations pour ce profil.",
        },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`CLAUDE_API_ERROR:${response.status}`);
  }

  const data = (await response.json()) as {
    content: Array<{ type: string; text: string }>;
  };

  const textBlock = data.content.find((block) => block.type === "text");
  if (!textBlock) {
    throw new Error("CLAUDE_EMPTY_RESPONSE");
  }

  const parsed = JSON.parse(textBlock.text) as ClaudeRecommendationResult;

  if (
    !Array.isArray(parsed.recommended_processes) ||
    parsed.recommended_processes.length === 0
  ) {
    throw new Error("CLAUDE_INVALID_RESPONSE");
  }

  return parsed;
}
