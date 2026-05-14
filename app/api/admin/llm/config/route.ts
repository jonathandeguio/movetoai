export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { auth }         from "@/lib/auth";
import { prisma }       from "@/lib/prisma";
import { llmRouter }    from "@/lib/ai/llm-router";

/**
 * GET /api/admin/llm/config — Config actuelle
 * PATCH /api/admin/llm/config — Mise à jour live (sans redémarrage serveur)
 */

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const config = await prisma.lLMConfig.findFirst({ orderBy: { updatedAt: "desc" } }).catch(() => null);

  return NextResponse.json({
    strategy:       config?.strategy        ?? process.env.LLM_STRATEGY ?? "auto",
    ollama_enabled: config?.ollamaEnabled   ?? (process.env.OLLAMA_ENABLED !== "false"),
    groq_enabled:   config?.groqEnabled     ?? (process.env.GROQ_ENABLED   !== "false"),
    claude_enabled: config?.claudeEnabled   ?? (process.env.CLAUDE_ENABLED !== "false"),
    log_enabled:    config?.logEnabled      ?? (process.env.LLM_LOG_ENABLED === "true"),
    force_tasks:    config?.claudeForceTasks ?? [],
  });
}

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: {
    strategy?:       string;
    ollama_enabled?: boolean;
    groq_enabled?:   boolean;
    claude_enabled?: boolean;
    log_enabled?:    boolean;
    force_tasks?:    string[];
  };
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  // Valider strategy
  const validStrategies = ["auto", "ollama_only", "groq_only", "claude_only"];
  if (body.strategy && !validStrategies.includes(body.strategy)) {
    return NextResponse.json({ error: "strategy invalide" }, { status: 400 });
  }

  // Lire la config existante ou créer
  const existing = await prisma.lLMConfig.findFirst({ orderBy: { updatedAt: "desc" } }).catch(() => null);

  const data = {
    strategy:        body.strategy        ?? existing?.strategy        ?? "auto",
    ollamaEnabled:   body.ollama_enabled  ?? existing?.ollamaEnabled   ?? true,
    groqEnabled:     body.groq_enabled    ?? existing?.groqEnabled     ?? true,
    claudeEnabled:   body.claude_enabled  ?? existing?.claudeEnabled   ?? true,
    logEnabled:      body.log_enabled     ?? existing?.logEnabled      ?? true,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    claudeForceTasks: body.force_tasks    ?? (existing?.claudeForceTasks as any) ?? [],
    updatedBy:       session.user.id,
  };

  const config = existing
    ? await prisma.lLMConfig.update({ where: { id: existing.id }, data })
    : await prisma.lLMConfig.create({ data });

  // Appliquer immédiatement à l'environnement sans redémarrage
  await llmRouter.loadConfigFromDB();

  return NextResponse.json({ success: true, config });
}
