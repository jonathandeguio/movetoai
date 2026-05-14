// lib/ai/providers/claude.ts
// Provider Claude (Anthropic) — fallback payant de haute qualité

import Anthropic from "@anthropic-ai/sdk";
import type { LLMProvider, LLMRequest, LLMResponse, TaskComplexity } from "./base";

// Singleton client — instancié une seule fois
let _client: Anthropic | null = null;
function getClient(): Anthropic {
  if (!_client) _client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  return _client;
}

export class ClaudeProvider implements LLMProvider {
  readonly name = "claude" as const;

  async isAvailable(): Promise<boolean> {
    return !!process.env.ANTHROPIC_API_KEY;
  }

  async complete(req: LLMRequest, _complexity: TaskComplexity): Promise<LLMResponse> {
    if (!process.env.ANTHROPIC_API_KEY) throw new Error("ANTHROPIC_API_KEY manquante");

    const model = process.env.CLAUDE_MODEL ?? "claude-sonnet-4-20250514";

    const response = await getClient().messages.create({
      model,
      max_tokens: req.max_tokens ?? 1000,
      system:     req.system,
      messages:   [{
        role:    "user",
        content: req.json_mode
          ? `${req.prompt}\n\nRéponds UNIQUEMENT avec du JSON valide. Aucun markdown.`
          : req.prompt,
      }],
    });

    const content = response.content[0].type === "text"
      ? response.content[0].text
      : "";

    if (!content.trim()) throw new Error("Claude a retourné une réponse vide");

    // Estimation coût : ~$0.003/1k tokens input + $0.015/1k output
    const inputTokens  = response.usage.input_tokens;
    const outputTokens = response.usage.output_tokens;
    const costCents    = Math.round(
      (inputTokens  / 1000 * 0.3) +
      (outputTokens / 1000 * 1.5)
    );

    return {
      content,
      provider:      "claude",
      model,
      tokens_used:   inputTokens + outputTokens,
      latency_ms:    0,
      fallback_used: false,
      cost_cents:    costCents,
    };
  }
}
