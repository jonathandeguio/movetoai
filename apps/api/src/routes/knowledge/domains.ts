import { Hono } from "hono"
import { zValidator } from "@hono/zod-validator"
import { z } from "zod"
import type { HonoEnv } from "../../types/env.js"
import { db } from "../../lib/db.js"
import { authMiddleware } from "../../middleware/auth.js"
import { workspaceMiddleware } from "../../middleware/workspace.js"
import { ApiError } from "../../lib/errors.js"

export const domainRoutes = new Hono<HonoEnv>()

domainRoutes.use("*", authMiddleware, workspaceMiddleware)

domainRoutes.get("/", async (c) => {
  const workspaceId = c.get("workspaceId")
  const domains = await db.domain.findMany({ where: { workspaceId, deletedAt: null } })
  return c.json(domains)
})

domainRoutes.post(
  "/",
  zValidator("json", z.object({
    name: z.string().min(1),
    description: z.string().optional(),
    businessUnitId: z.string().optional(),
  })),
  async (c) => {
    const workspaceId = c.get("workspaceId")
    const body = c.req.valid("json")
    const slug = `${body.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now()}`

    const domain = await db.domain.create({ data: { workspaceId, ...body, slug } })
    return c.json(domain, 201)
  }
)

domainRoutes.get("/:id", async (c) => {
  const workspaceId = c.get("workspaceId")
  const id = c.req.param("id")

  const domain = await db.domain.findFirst({ where: { id, workspaceId, deletedAt: null } })
  if (!domain) throw new ApiError(404, "NOT_FOUND", "Domain not found")
  return c.json(domain)
})

domainRoutes.patch(
  "/:id",
  zValidator("json", z.object({
    name: z.string().optional(),
    description: z.string().optional(),
  })),
  async (c) => {
    const workspaceId = c.get("workspaceId")
    const id = c.req.param("id")

    const existing = await db.domain.findFirst({ where: { id, workspaceId, deletedAt: null } })
    if (!existing) throw new ApiError(404, "NOT_FOUND", "Domain not found")

    const updated = await db.domain.update({ where: { id }, data: c.req.valid("json") })
    return c.json(updated)
  }
)

domainRoutes.delete("/:id", async (c) => {
  const workspaceId = c.get("workspaceId")
  const id = c.req.param("id")

  const existing = await db.domain.findFirst({ where: { id, workspaceId, deletedAt: null } })
  if (!existing) throw new ApiError(404, "NOT_FOUND", "Domain not found")

  await db.domain.update({ where: { id }, data: { deletedAt: new Date() } })
  return c.body(null, 204)
})
