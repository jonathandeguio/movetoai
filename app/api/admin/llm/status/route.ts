export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { auth }         from "@/lib/auth";
import { prisma }       from "@/lib/prisma";
import { llmRouter }    from "@/lib/ai/llm-router";
import { llmLogger }    from "@/lib/ai/llm-logger";

/**
 * GET /api/admin/llm/status
 * Statut temps réel des providers + métriques 7 jours.
 * Accessible uniquement aux super_admin et admin workspace.
 */
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [availability, stats, successRates, recentLogs, totalCostCents] = await Promise.all([
    llmRouter.checkAvailability(),
    llmLogger.getStats(7),
    llmLogger.getSuccessRates(7),
    prisma.lLMCallLog.findMany({
      orderBy: { createdAt: "desc" },
      take:    50,
      select: {
        id: true, task: true, provider: true, model: true,
        latencyMs: true, tokensUsed: true, costCents: true,
        fallbackUsed: true, success: true, error: true, createdAt: true,
      },
    }),
    prisma.lLMCallLog.aggregate({
      where:  { provider: "claude", createdAt: { gte: new Date(Date.now() - 30 * 86_400_000) } },
      _sum:   { costCents: true },
      _count: { id: true },
    }),
  ]);

  // Coût Claude ce mois
  const claudeCostCentsMonth = totalCostCents._sum.costCents ?? 0;
  const claudeCallsMonth     = totalCostCents._count.id;

  // Total appels
  const totalCalls = stats.reduce((sum, s) => sum + s._count.id, 0);

  // Taux de fallback vers Claude
  const claudeStats = stats.find(s => s.provider === "claude");
  const claudeCalls = claudeStats?._count.id ?? 0;
  const claudeRate  = totalCalls > 0 ? Math.round((claudeCalls / totalCalls) * 100) : 0;

  // Config actuelle
  const config = await prisma.lLMConfig.findFirst({ orderBy: { updatedAt: "desc" } }).catch(() => null);

  return NextResponse.json({
    providers: {
      ollama: {
        available:    availability.ollama,
        enabled:      process.env.OLLAMA_ENABLED !== "false",
        model_simple: process.env.OLLAMA_MODEL_SIMPLE  ?? "llama3.1:8b",
        model_complex:process.env.OLLAMA_MODEL_COMPLEX ?? "llama3.1:70b",
      },
      groq: {
        available:    availability.groq,
        enabled:      process.env.GROQ_ENABLED !== "false",
        has_key:      !!process.env.GROQ_API_KEY,
        model_simple: process.env.GROQ_MODEL_SIMPLE  ?? "llama-3.1-8b-instant",
        model_complex:process.env.GROQ_MODEL_COMPLEX ?? "llama-3.1-70b-versatile",
      },
      claude: {
        available:    availability.claude,
        enabled:      process.env.CLAUDE_ENABLED !== "false",
        has_key:      !!process.env.ANTHROPIC_API_KEY,
        model:        process.env.CLAUDE_MODEL ?? "claude-sonnet-4-20250514",
        cost_euros_month: (claudeCostCentsMonth / 100).toFixed(2),
        calls_month:  claudeCallsMonth,
      },
    },
    metrics: {
      total_calls_7d:    totalCalls,
      claude_rate_pct:   claudeRate,
      high_claude_alert: claudeRate > 30,
      by_provider:       stats.map(s => ({
        provider:     s.provider,
        calls:        s._count.id,
        avg_latency:  Math.round(s._avg.latencyMs ?? 0),
        total_cost:   ((s._sum.costCents ?? 0) / 100).toFixed(2),
      })),
      success_rates:     successRates,
    },
    recent_logs: recentLogs,
    config: {
      strategy:      config?.strategy      ?? process.env.LLM_STRATEGY ?? "auto",
      log_enabled:   config?.logEnabled    ?? process.env.LLM_LOG_ENABLED === "true",
      force_tasks:   config?.claudeForceTasks ?? [],
      ollama_enabled: config?.ollamaEnabled ?? true,
      groq_enabled:   config?.groqEnabled   ?? true,
      claude_enabled: config?.claudeEnabled ?? true,
    },
  });
}
