// lib/ai/llm-router.ts
// Point d'entrée unique pour tous les appels LLM de Move to AI
// Cascade : Ollama (local) → Groq (cloud gratuit) → Claude (payant)

import { OllamaProvider } from "./providers/ollama";
import { GroqProvider }   from "./providers/groq";
import { ClaudeProvider } from "./providers/claude";
import { llmLogger }      from "./llm-logger";
import { taskRegistry }   from "./task-registry";
import type { LLMProvider, LLMRequest, LLMResponse, TaskComplexity } from "./providers/base";

export type { LLMRequest, LLMResponse, TaskComplexity };
export type { ProviderName } from "./providers/base";

// ── Router ────────────────────────────────────────────────────────────────────

class LLMRouter {
  private readonly ollama = new OllamaProvider();
  private readonly groq   = new GroqProvider();
  private readonly claude = new ClaudeProvider();

  /**
   * Exécute une requête LLM en cascade selon la complexité de la tâche.
   * Essaie les providers dans l'ordre défini et passe au suivant en cas d'échec.
   */
  async complete(req: LLMRequest): Promise<LLMResponse> {
    const start      = Date.now();
    const complexity = taskRegistry.getComplexity(req.task);
    const chain      = this.buildChain(req.task, complexity);

    let lastError: Error | null = null;

    for (let idx = 0; idx < chain.length; idx++) {
      const provider = chain[idx];
      try {
        const result  = await provider.complete(req, complexity);
        const latency = Date.now() - start;

        llmLogger.log({
          task:         req.task,
          provider:     result.provider,
          model:        result.model,
          latencyMs:    latency,
          tokensUsed:   result.tokens_used,
          costCents:    result.cost_cents,
          fallbackUsed: idx > 0,
          workspaceId:  req.workspace_id,
          success:      true,
        });

        return { ...result, latency_ms: latency, fallback_used: idx > 0 };

      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err));

        llmLogger.log({
          task:         req.task,
          provider:     provider.name,
          latencyMs:    Date.now() - start,
          fallbackUsed: idx > 0,
          fallbackTo:   chain[idx + 1]?.name,
          workspaceId:  req.workspace_id,
          success:      false,
          error:        lastError.message.slice(0, 500),
        });

        // Dernier provider → propager l'erreur
        if (idx === chain.length - 1) {
          throw new Error(
            `Tous les providers LLM ont échoué pour la tâche "${req.task}". ` +
            `Dernière erreur : ${lastError.message}`
          );
        }
        // Sinon → fallback silencieux vers le provider suivant
      }
    }

    throw lastError!;
  }

  // ── Construction de la chaîne de providers ────────────────────────────────

  private buildChain(task: string, complexity: TaskComplexity): LLMProvider[] {
    const strategy = process.env.LLM_STRATEGY ?? "auto";

    // Tâches critiques → Claude exclusivement (jamais open source)
    const forcedStr  = process.env.CLAUDE_FORCE_TASKS ?? "bpmn_generate,governance_check,legal_document,rgpd_compliance";
    const forcedList = forcedStr.split(",").map(s => s.trim()).filter(Boolean);
    if (complexity === "critical" || forcedList.includes(task)) {
      return [this.claude];
    }

    // Modes forcés (debug / Vercel config)
    if (strategy === "claude_only")  return [this.claude];
    if (strategy === "groq_only")    return this.filterEnabled([this.groq, this.claude]);
    if (strategy === "ollama_only")  return this.filterEnabled([this.ollama, this.claude]);

    // Mode auto (défaut)
    // Simple  → Ollama → Groq → Claude
    // Complex → Groq → Claude (Ollama 70B local trop lent)
    if (complexity === "simple") {
      return this.filterEnabled([this.ollama, this.groq, this.claude]);
    } else {
      return this.filterEnabled([this.groq, this.claude]);
    }
  }

  private filterEnabled(providers: LLMProvider[]): LLMProvider[] {
    return providers.filter(p => {
      if (p.name === "ollama"  && process.env.OLLAMA_ENABLED  === "false") return false;
      if (p.name === "groq"    && process.env.GROQ_ENABLED    === "false") return false;
      if (p.name === "claude"  && process.env.CLAUDE_ENABLED  === "false") return false;
      return true;
    });
  }

  // ── Lecture config DB (live config) ──────────────────────────────────────

  /**
   * Charge la config LLM depuis la DB (mise à jour sans redémarrage serveur).
   * Appelé par le dashboard admin.
   */
  async loadConfigFromDB(): Promise<void> {
    try {
      const { prisma } = await import("@/lib/prisma");
      const config = await prisma.lLMConfig.findFirst({ orderBy: { updatedAt: "desc" } });
      if (!config) return;

      process.env.LLM_STRATEGY      = config.strategy;
      process.env.OLLAMA_ENABLED     = config.ollamaEnabled  ? "true" : "false";
      process.env.GROQ_ENABLED       = config.groqEnabled    ? "true" : "false";
      process.env.CLAUDE_ENABLED     = config.claudeEnabled  ? "true" : "false";
      process.env.LLM_LOG_ENABLED    = config.logEnabled     ? "true" : "false";

      const forcedTasks = Array.isArray(config.claudeForceTasks)
        ? (config.claudeForceTasks as string[]).join(",")
        : "";
      if (forcedTasks) process.env.CLAUDE_FORCE_TASKS = forcedTasks;
    } catch {
      // Ignorer — la config .env reste active
    }
  }

  // ── Checks de disponibilité ───────────────────────────────────────────────

  async checkAvailability(): Promise<Record<string, boolean>> {
    const [ollama, groq, claude] = await Promise.all([
      this.ollama.isAvailable(),
      this.groq.isAvailable(),
      this.claude.isAvailable(),
    ]);
    return { ollama, groq, claude };
  }
}

// ── Singleton exporté ─────────────────────────────────────────────────────────
export const llmRouter = new LLMRouter();
