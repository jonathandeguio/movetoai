import { Hono } from "hono"
import { zValidator } from "@hono/zod-validator"
import { z } from "zod"
import type { HonoEnv } from "../../types/env.js"
import { db } from "../../lib/db.js"
import { authMiddleware } from "../../middleware/auth.js"
import { workspaceMiddleware } from "../../middleware/workspace.js"
import { requireRole } from "../../middleware/require-role.js"
import { ApiError } from "../../lib/errors.js"

export const integrationRoutes = new Hono<HonoEnv>()

integrationRoutes.use("*", authMiddleware, workspaceMiddleware, requireRole("workspace_admin"))

integrationRoutes.get("/", async (c) => {
  const workspaceId = c.get("workspaceId")
  const webhooks = await db.webhook.findMany({ where: { workspaceId } })
  return c.json(webhooks)
})

integrationRoutes.post(
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

integrationRoutes.patch(
  "/:id",
  zValidator("json", z.object({
    url: z.string().url().optional(),
    events: z.array(z.string()).optional(),
    active: z.boolean().optional(),
    description: z.string().optional(),
  })),
  async (c) => {
    const workspaceId = c.get("workspaceId")
    const id = c.req.param("id")

    const existing = await db.webhook.findFirst({ where: { id, workspaceId } })
    if (!existing) throw new ApiError(404, "NOT_FOUND", "Integration not found")

    const updated = await db.webhook.update({ where: { id }, data: c.req.valid("json") })
    return c.json(updated)
  }
)

integrationRoutes.delete("/:id", async (c) => {
  const workspaceId = c.get("workspaceId")
  const id = c.req.param("id")

  const existing = await db.webhook.findFirst({ where: { id, workspaceId } })
  if (!existing) throw new ApiError(404, "NOT_FOUND", "Integration not found")

  await db.webhook.delete({ where: { id } })
  return c.body(null, 204)
})

integrationRoutes.post("/:id/test", async (c) => {
  const workspaceId = c.get("workspaceId")
  const id = c.req.param("id")

  const webhook = await db.webhook.findFirst({ where: { id, workspaceId } })
  if (!webhook) throw new ApiError(404, "NOT_FOUND", "Integration not found")

  const start = Date.now()
  try {
    const res = await fetch(webhook.url, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Test": "true" },
      body: JSON.stringify({ event: "test", workspaceId }),
    })
    const ms = Date.now() - start
    return c.json({ success: res.ok, status: res.status, ms })
  } catch (err) {
    const ms = Date.now() - start
    return c.json({ success: false, status: 0, ms, error: String(err) })
  }
})
