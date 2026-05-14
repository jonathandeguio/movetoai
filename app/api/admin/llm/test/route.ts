export const runtime = "nodejs";

import { NextResponse }   from "next/server";
import { auth }           from "@/lib/auth";
import { OllamaProvider } from "@/lib/ai/providers/ollama";
import { GroqProvider }   from "@/lib/ai/providers/groq";
import { ClaudeProvider } from "@/lib/ai/providers/claude";

/**
 * POST /api/admin/llm/test
 * Teste un provider spécifique avec un prompt minimal.
 * Body: { provider: "ollama"|"groq"|"claude", prompt?: string, task?: string }
 */
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: { provider?: string; prompt?: string; task?: string };
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  const { provider = "ollama", prompt = "Réponds juste OK.", task = "test" } = body;

  const providers: Record<string, OllamaProvider | GroqProvider | ClaudeProvider> = {
    ollama: new OllamaProvider(),
    groq:   new GroqProvider(),
    claude: new ClaudeProvider(),
  };

  const p = providers[provider];
  if (!p) return NextResponse.json({ error: "Provider inconnu" }, { status: 400 });

  const start = Date.now();
  try {
    const available = await p.isAvailable();
    if (!available) {
      return NextResponse.json({
        success:  false,
        provider,
        error:    `${provider} n'est pas disponible (clé manquante ou service arrêté)`,
        latency:  0,
      });
    }

    const result  = await p.complete({ task, prompt }, "simple");
    const latency = Date.now() - start;

    return NextResponse.json({
      success:     true,
      provider:    result.provider,
      model:       result.model,
      content:     result.content.slice(0, 500),
      latency_ms:  latency,
      tokens_used: result.tokens_used,
    });
  } catch (err) {
    return NextResponse.json({
      success:  false,
      provider,
      error:    err instanceof Error ? err.message : String(err),
      latency:  Date.now() - start,
    });
  }
}
