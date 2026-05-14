// lib/ai/llm-logger.ts
// Logging non-bloquant de chaque appel LLM en base de données

import { prisma } from "@/lib/prisma";

export interface LLMLogEntry {
  task:          string;
  provider:      string;
  model?:        string;
  latencyMs?:    number;
  tokensUsed?:   number;
  costCents?:    number;
  fallbackUsed?: boolean;
  fallbackTo?:   string;
  workspaceId?:  string;
  success:       boolean;
  error?:        string;
}

export const llmLogger = {
  /**
   * Loggue un appel LLM de façon non-bloquante.
   * Les erreurs de logging sont ignorées (on ne veut pas ralentir les réponses).
   */
  log(data: LLMLogEntry): void {
    if (process.env.LLM_LOG_ENABLED !== "true") return;

    // Fire-and-forget
    prisma.lLMCallLog.create({
      data: {
        task:         data.task,
        provider:     data.provider,
        model:        data.model     ?? "unknown",
        latencyMs:    data.latencyMs ?? 0,
        tokensUsed:   data.tokensUsed,
        costCents:    data.costCents  ?? 0,
        fallbackUsed: data.fallbackUsed ?? false,
        fallbackTo:   data.fallbackTo,
        workspaceId:  data.workspaceId,
        success:      data.success,
        error:        data.error,
      },
    }).catch((err: unknown) => {
      if (process.env.NODE_ENV === "development") {
        console.warn("[llmLogger] Failed to write log:", err);
      }
    });
  },

  /**
   * Statistiques agrégées des 7 derniers jours par provider.
   */
  async getStats(days = 7) {
    const since = new Date(Date.now() - days * 86_400_000);
    return prisma.lLMCallLog.groupBy({
      by:    ["provider"],
      where: { createdAt: { gte: since } },
      _count: { id: true },
      _sum:   { costCents: true, tokensUsed: true },
      _avg:   { latencyMs: true },
    });
  },

  /**
   * Taux de succès par provider.
   */
  async getSuccessRates(days = 7) {
    const since = new Date(Date.now() - days * 86_400_000);
    const [total, successes] = await Promise.all([
      prisma.lLMCallLog.groupBy({
        by:    ["provider"],
        where: { createdAt: { gte: since } },
        _count: { id: true },
      }),
      prisma.lLMCallLog.groupBy({
        by:    ["provider"],
        where: { createdAt: { gte: since }, success: true },
        _count: { id: true },
      }),
    ]);

    return total.map(t => {
      const s = successes.find(s => s.provider === t.provider);
      return {
        provider:    t.provider,
        total:       t._count.id,
        successes:   s?._count.id ?? 0,
        successRate: t._count.id > 0 ? Math.round(((s?._count.id ?? 0) / t._count.id) * 100) : 0,
      };
    });
  },
};
