import { Hono } from "hono"
import { zValidator } from "@hono/zod-validator"
import { z } from "zod"
import type { HonoEnv } from "../../types/env.js"
import { db } from "../../lib/db.js"
import { authMiddleware } from "../../middleware/auth.js"
import { workspaceMiddleware } from "../../middleware/workspace.js"
import { requireRole } from "../../middleware/require-role.js"
import { parsePagination } from "../../lib/paginate.js"
import { integrationRoutes } from "./integrations.js"
import { webhookRoutes } from "./webhooks.js"
import { llmRoutes } from "./llm.js"

export const adminRoutes = new Hono<HonoEnv>()

adminRoutes.use("*", authMiddleware, workspaceMiddleware, requireRole("workspace_admin"))

adminRoutes.get("/settings", async (c) => {
  const workspaceId = c.get("workspaceId")
  const workspace = await db.workspace.findUnique({ where: { id: workspaceId } })
  return c.json(workspace)
})

adminRoutes.patch(
  "/settings",
  zValidator("json", z.record(z.unknown())),
  async (c) => {
    const workspaceId = c.get("workspaceId")
    const body = c.req.valid("json")

    const allowedFields = ["name", "sectorCode", "companySize", "aiMaturity", "priorities", "horizon", "settings"]
    const data: Record<string, unknown> = {}
    for (const key of allowedFields) {
      if (key in body) data[key] = body[key]
    }

    const updated = await db.workspace.update({ where: { id: workspaceId }, data })
    return c.json(updated)
  }
)

adminRoutes.get("/billing", async (c) => {
  const workspaceId = c.get("workspaceId")
  const workspace = await db.workspace.findUnique({
    where: { id: workspaceId },
    select: { planType: true, seatsUsed: true, seatsLimit: true, planExpiresAt: true },
  })
  return c.json(workspace)
})

adminRoutes.post("/billing/portal", async (c) => {
  return c.json({ url: process.env.STRIPE_PORTAL_URL ?? "/admin/billing" })
})

adminRoutes.get("/audit-logs", async (c) => {
  const workspaceId = c.get("workspaceId")
  const { action, user, from, to, page, limit, sort } = c.req.query()
  const pagination = parsePagination({ page, limit, sort })

  const where = {
    workspaceId,
    ...(action ? { action } : {}),
    ...(user ? { actorUserId: user } : {}),
    ...(from || to ? {
      createdAt: {
        ...(from ? { gte: new Date(from) } : {}),
        ...(to ? { lte: new Date(to) } : {}),
      }
    } : {}),
  }

  const [data, total] = await Promise.all([
    db.auditLog.findMany({
      where,
      include: { actorUser: { select: { id: true, name: true } } },
      skip: pagination.skip,
      take: pagination.take,
      orderBy: { createdAt: "desc" },
    }),
    db.auditLog.count({ where }),
  ])

  return c.json({ data, meta: { total, page: parseInt(page ?? "1"), limit: parseInt(limit ?? "20") } })
})

adminRoutes.get("/usage", async (c) => {
  const workspaceId = c.get("workspaceId")

  const quotas = await db.usageQuota.findMany({ where: { workspaceId } })
  return c.json(quotas)
})

adminRoutes.route("/integrations", integrationRoutes)
adminRoutes.route("/webhooks", webhookRoutes)
adminRoutes.route("/llm", llmRoutes)
