import { Hono } from "hono"
import { zValidator } from "@hono/zod-validator"
import { z } from "zod"
import type { HonoEnv } from "../../types/env.js"
import { db } from "../../lib/db.js"
import { authMiddleware } from "../../middleware/auth.js"
import { workspaceMiddleware } from "../../middleware/workspace.js"
import { requireRole } from "../../middleware/require-role.js"
import { parsePagination } from "../../lib/paginate.js"

export const llmRoutes = new Hono<HonoEnv>()

llmRoutes.use("*", authMiddleware, workspaceMiddleware, requireRole("workspace_admin"))

llmRoutes.get("/config", async (c) => {
  const config = await db.lLMConfig.findFirst()
  return c.json(config ?? { strategy: "auto", ollamaEnabled: true, groqEnabled: true, claudeEnabled: true })
})

llmRoutes.patch(
  "/config",
  zValidator("json", z.object({
    strategy: z.string().optional(),
    ollamaEnabled: z.boolean().optional(),
    groqEnabled: z.boolean().optional(),
    claudeEnabled: z.boolean().optional(),
    logEnabled: z.boolean().optional(),
  })),
  async (c) => {
    const userId = c.get("userId")
    const body = c.req.valid("json")

    const existing = await db.lLMConfig.findFirst()
    let config
    if (existing) {
      config = await db.lLMConfig.update({ where: { id: existing.id }, data: { ...body, updatedBy: userId } })
    } else {
      config = await db.lLMConfig.create({ data: { ...body, updatedBy: userId } })
    }

    return c.json(config)
  }
)

llmRoutes.get("/usage", async (c) => {
  const workspaceId = c.get("workspaceId")
  const { page, limit, sort } = c.req.query()
  const pagination = parsePagination({ page, limit, sort })

  const [data, total] = await Promise.all([
    db.lLMCallLog.findMany({
      where: { workspaceId },
      skip: pagination.skip,
      take: pagination.take,
      orderBy: { createdAt: "desc" },
    }),
    db.lLMCallLog.count({ where: { workspaceId } }),
  ])

  const tokenStats = await db.lLMCallLog.aggregate({
    where: { workspaceId },
    _sum: { tokensUsed: true, costCents: true },
    _avg: { latencyMs: true },
  })

  return c.json({
    data,
    meta: { total, page: parseInt(page ?? "1"), limit: parseInt(limit ?? "20") },
    stats: {
      totalTokens: tokenStats._sum.tokensUsed ?? 0,
      totalCostCents: tokenStats._sum.costCents ?? 0,
      avgLatencyMs: Math.round(tokenStats._avg.latencyMs ?? 0),
    },
  })
})
