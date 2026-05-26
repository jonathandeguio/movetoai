import { Hono } from "hono"
import { zValidator } from "@hono/zod-validator"
import { z } from "zod"
import type { HonoEnv } from "../../types/env.js"
import { db } from "../../lib/db.js"
import { authMiddleware } from "../../middleware/auth.js"
import { workspaceMiddleware } from "../../middleware/workspace.js"
import { requireRole } from "../../middleware/require-role.js"
import { ApiError } from "../../lib/errors.js"
import { parsePagination } from "../../lib/paginate.js"

export const webhookRoutes = new Hono<HonoEnv>()

webhookRoutes.use("*", authMiddleware, workspaceMiddleware, requireRole("workspace_admin"))

webhookRoutes.get("/", async (c) => {
  const workspaceId = c.get("workspaceId")
  const webhooks = await db.webhook.findMany({ where: { workspaceId } })
  return c.json(webhooks)
})

webhookRoutes.post(
  "/",
  zValidator("json", z.object({
    url: z.string().url(),
    events: z.array(z.string()),
    secret: z.string(),
    description: z.string().optional(),
  })),
  async (c) => {
    const workspaceId = c.get("workspaceId")
    const body = c.req.valid("json")

    const webhook = await db.webhook.create({ data: { workspaceId, ...body } })
    return c.json(webhook, 201)
  }
)

webhookRoutes.get("/:id", async (c) => {
  const workspaceId = c.get("workspaceId")
  const id = c.req.param("id")

  const webhook = await db.webhook.findFirst({ where: { id, workspaceId } })
  if (!webhook) throw new ApiError(404, "NOT_FOUND", "Webhook not found")
  return c.json(webhook)
})

webhookRoutes.patch(
  "/:id",
  zValidator("json", z.object({
    url: z.string().url().optional(),
    events: z.array(z.string()).optional(),
    active: z.boolean().optional(),
  })),
  async (c) => {
    const workspaceId = c.get("workspaceId")
    const id = c.req.param("id")

    const existing = await db.webhook.findFirst({ where: { id, workspaceId } })
    if (!existing) throw new ApiError(404, "NOT_FOUND", "Webhook not found")

    const updated = await db.webhook.update({ where: { id }, data: c.req.valid("json") })
    return c.json(updated)
  }
)

webhookRoutes.delete("/:id", async (c) => {
  const workspaceId = c.get("workspaceId")
  const id = c.req.param("id")

  const existing = await db.webhook.findFirst({ where: { id, workspaceId } })
  if (!existing) throw new ApiError(404, "NOT_FOUND", "Webhook not found")

  await db.webhook.delete({ where: { id } })
  return c.body(null, 204)
})

webhookRoutes.get("/:id/deliveries", async (c) => {
  const workspaceId = c.get("workspaceId")
  const id = c.req.param("id")
  const { page, limit, sort } = c.req.query()
  const pagination = parsePagination({ page, limit, sort })

  const webhook = await db.webhook.findFirst({ where: { id, workspaceId } })
  if (!webhook) throw new ApiError(404, "NOT_FOUND", "Webhook not found")

  const deliveries = await db.webhookDelivery.findMany({
    where: { webhookId: id },
    orderBy: { createdAt: "desc" },
    skip: pagination.skip,
    take: pagination.take,
  })
  return c.json(deliveries)
})
