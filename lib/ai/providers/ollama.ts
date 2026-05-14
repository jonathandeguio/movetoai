// lib/ai/providers/ollama.ts
// Provider Ollama — modèles locaux via API compatible OpenAI

import type { LLMProvider, LLMRequest, LLMResponse, TaskComplexity } from "./base";

export class OllamaProvider implements LLMProvider {
  readonly name = "ollama" as const;

  private get baseUrl() {
    return process.env.OLLAMA_BASE_URL ?? "http://localhost:11434";
  }

  private getModel(complexity: TaskComplexity): string {
    if (complexity === "simple") {
      return process.env.OLLAMA_MODEL_SIMPLE ?? "llama3.1:8b";
    }
    return process.env.OLLAMA_MODEL_COMPLEX ?? "llama3.1:70b";
  }

  async isAvailable(): Promise<boolean> {
    try {
      const res = await fetch(`${this.baseUrl}/api/tags`, {
        signal: AbortSignal.timeout(2000),
      });
      return res.ok;
    } catch {
      return false;
    }
  }

  async complete(req: LLMRequest, complexity: TaskComplexity): Promise<LLMResponse> {
    const model   = this.getModel(complexity);
    const timeout = parseInt(process.env.OLLAMA_TIMEOUT_MS ?? "30000");

    const messages = [
      ...(req.system ? [{ role: "system", content: req.system }] : []),
      {
        role:    "user",
        content: req.json_mode
          ? `${req.prompt}\n\nIMPORTANT: Réponds UNIQUEMENT avec du JSON valide. Aucun texte ni markdown avant ou après.`
          : req.prompt,
      },
    ];

    const res = await fetch(`${this.baseUrl}/v1/chat/completions`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      signal:  AbortSignal.timeout(timeout),
      body:    JSON.stringify({
        model,
        messages,
        temperature: req.temperature ?? 0.3,
        max_tokens:  req.max_tokens  ?? 1000,
        stream:      false,
        ...(req.json_mode ? { format: "json" } : {}),
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Ollama error ${res.status}: ${text.slice(0, 200)}`);
    }

    const data    = await res.json() as { choices?: Array<{ message?: { content?: string } }>; usage?: { total_tokens?: number } };
    const content = data.choices?.[0]?.message?.content ?? "";

    if (!content.trim()) throw new Error("Ollama a retourné une réponse vide");

    return {
      content,
      provider:      "ollama",
      model,
      tokens_used:   data.usage?.total_tokens,
      latency_ms:    0,
      fallback_used: false,
      cost_cents:    0,
    };
  }
}
