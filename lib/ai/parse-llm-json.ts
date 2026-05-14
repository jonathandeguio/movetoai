// lib/ai/parse-llm-json.ts
// Parser JSON robuste pour les réponses LLM
// Gère les balises markdown accidentelles, les backticks, etc.

/**
 * Parse une réponse LLM en JSON de façon robuste.
 * Supporte les réponses avec ou sans balises markdown ```json...```
 */
export function parseLLMJson<T = unknown>(content: string): T {
  let clean = content.trim();

  // Supprimer les blocs markdown ```json ... ``` ou ``` ... ```
  clean = clean.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
  // Supprimer les backticks isolés
  clean = clean.replace(/^`+|`+$/g, "");
  // Supprimer les éventuels commentaires avant le JSON
  clean = clean.replace(/^[^{\[]*/, "");

  try {
    return JSON.parse(clean) as T;
  } catch {
    // Tentative de récupération : trouver le premier objet {} ou tableau [] valide
    const objMatch   = clean.match(/\{[\s\S]*\}/);
    const arrayMatch = clean.match(/\[[\s\S]*\]/);

    if (objMatch) {
      try { return JSON.parse(objMatch[0]) as T; } catch { /* continue */ }
    }
    if (arrayMatch) {
      try { return JSON.parse(arrayMatch[0]) as T; } catch { /* continue */ }
    }

    throw new Error(
      `JSON invalide retourné par le LLM : ${content.slice(0, 300)}`
    );
  }
}

/**
 * Version sécurisée — retourne null en cas d'échec plutôt que de throw.
 */
export function parseLLMJsonSafe<T = unknown>(content: string): T | null {
  try {
    return parseLLMJson<T>(content);
  } catch {
    return null;
  }
}
