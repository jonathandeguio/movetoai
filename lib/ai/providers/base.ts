// lib/ai/providers/base.ts
// Interface commune à tous les providers LLM

export type TaskComplexity = "simple" | "complex" | "critical";
export type ProviderName   = "ollama"  | "groq"   | "claude";

export interface LLMRequest {
  /** Identifiant de la tâche (ex: "opportunity_structure") */
  task:          string;
  /** Prompt utilisateur */
  prompt:        string;
  /** System prompt optionnel */
  system?:       string;
  /** Température (défaut 0.3) */
  temperature?:  number;
  /** Tokens max (défaut 1000) */
  max_tokens?:   number;
  /** Forcer la sortie JSON */
  json_mode?:    boolean;
  /** Pour le logging */
  workspace_id?: string;
}

export interface LLMResponse {
  /** Texte brut de la réponse */
  content:       string;
  /** Provider qui a répondu */
  provider:      ProviderName;
  /** Modèle exact utilisé */
  model:         string;
  tokens_used?:  number;
  latency_ms:    number;
  /** true si le provider primaire a échoué et qu'on est passé au suivant */
  fallback_used: boolean;
  /** 0 pour open source, estimé en centimes pour Claude */
  cost_cents?:   number;
}

export interface LLMProvider {
  name:        ProviderName;
  complete:    (req: LLMRequest, complexity: TaskComplexity) => Promise<LLMResponse>;
  isAvailable: () => Promise<boolean>;
}
