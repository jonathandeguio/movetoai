// lib/ai/providers/groq.ts
// Provider Groq — API cloud gratuite, compatible OpenAI, ultra-rapide

import type { LLMProvider, LLMRequest, LLMResponse, TaskComplexity } from "./base";

export class GroqProvider implements LLMProvider {
  readonly name = "groq" as const;

  private readonly baseUrl = "https://api.groq.com/openai/v1";

  private get apiKey() {
    return process.env.GROQ_API_KEY ?? "";
  }

  private getModel(complexity: TaskComplexity): string {
    if (complexity === "simple") {
      return process.env.GROQ_MODEL_SIMPLE ?? "llama-3.1-8b-instant";
    }
    return process.env.GROQ_MODEL_COMPLEX ?? "llama-3.1-70b-versatile";
  }

  async isAvailable(): Promise<boolean> {
    return !!this.apiKey;
  }

  async complete(req: LLMRequest, complexity: TaskComplexity): Promise<LLMResponse> {
    if (!this.apiKey) throw new Error("GROQ_API_KEY manquante");

    const model   = this.getModel(complexity);
    const timeout = parseInt(process.env.GROQ_TIMEOUT_MS ?? "15000");

    const messages = [
      ...(req.system ? [{ role: "system", content: req.system }] : []),
      {
        role:    "user",
        content: req.json_mode
          ? `${req.prompt}\n\nRéponds UNIQUEMENT avec du JSON valide. Pas de markdown, pas de texte autour.`
          : req.prompt,
      },
    ];

    const res = await fetch(`${this.baseUrl}/chat/completions`, {
      method:  "POST",
      headers: {
        "Content-Type":  "application/json",
        "Authorization": `Bearer ${this.apiKey}`,
      },
      signal: AbortSignal.timeout(timeout),
      body:   JSON.stringify({
        model,
        messages,
        temperature: req.temperature ?? 0.3,
        max_tokens:  req.max_tokens  ?? 1000,
        stream:      false,
        ...(req.json_mode ? { response_format: { type: "json_object" } } : {}),
      }),
    });

    if (res.status === 429) {
      throw new Error("Groq rate limit atteint — fallback vers le provider suivant");
    }

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Groq error ${res.status}: ${text.slice(0, 200)}`);
    }

    const data    = await res.json() as { choices?: Array<{ message?: { content?: string } }>; usage?: { total_tokens?: number } };
    const content = data.choices?.[0]?.message?.content ?? "";

    if (!content.trim()) throw new Error("Groq a retourné une réponse vide");

    return {
      content,
      provider:      "groq",
      model,
      tokens_used:   data.usage?.total_tokens,
      latency_ms:    0,
      fallback_used: false,
      cost_cents:    0,
    };
  }
}
