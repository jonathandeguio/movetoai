import { Hono } from "hono"
import { zValidator } from "@hono/zod-validator"
import { z } from "zod"
import type { HonoEnv } from "../../types/env.js"
import { db } from "../../lib/db.js"
import { authMiddleware } from "../../middleware/auth.js"
import { workspaceMiddleware } from "../../middleware/workspace.js"
import { ApiError } from "../../lib/errors.js"
import { parsePagination } from "../../lib/paginate.js"

export const capabilityRoutes = new Hono<HonoEnv>()

capabilityRoutes.use("*", authMiddleware, workspaceMiddleware)

capabilityRoutes.get("/", async (c) => {
  const workspaceId = c.get("workspaceId")
  const { domain, q, page, limit, sort } = c.req.query()
  const pagination = parsePagination({ page, limit, sort })

  const where = {
    workspaceId,
    deletedAt: null as null,
    ...(domain ? { domainId: domain } : {}),
    ...(q ? { name: { contains: q } } : {}),
  }

  const [data, total] = await Promise.all([
    db.capability.findMany({ where, skip: pagination.skip, take: pagination.take, orderBy: pagination.orderBy }),
    db.capability.count({ where }),
  ])

  return c.json({ data, meta: { total, page: parseInt(page ?? "1"), limit: parseInt(limit ?? "20") } })
})

capabilityRoutes.post(
  "/",
  zValidator("json", z.object({
    name: z.string().min(1),
    description: z.string().optional(),
    domainId: z.string(),
    aiPotential: z.string().optional(),
  })),
  async (c) => {
    const workspaceId = c.get("workspaceId")
    const body = c.req.valid("json")
    const slug = `${body.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now()}`

    const cap = await db.capability.create({ data: { workspaceId, ...body, slug } })
    return c.json(cap, 201)
  }
)

capabilityRoutes.get("/:id", async (c) => {
  const workspaceId = c.get("workspaceId")
  const id = c.req.param("id")

  const cap = await db.capability.findFirst({ where: { id, workspaceId, deletedAt: null } })
  if (!cap) throw new ApiError(404, "NOT_FOUND", "Capability not found")
  return c.json(cap)
})

capabilityRoutes.patch(
  "/:id",
  zValidator("json", z.object({
    name: z.string().optional(),
    description: z.string().optional(),
    domainId: z.string().optional(),
    aiPotential: z.string().optional(),
  })),
  async (c) => {
    const workspaceId = c.get("workspaceId")
    const id = c.req.param("id")

    const existing = await db.capability.findFirst({ where: { id, workspaceId, deletedAt: null } })
    if (!existing) throw new ApiError(404, "NOT_FOUND", "Capability not found")

    const updated = await db.capability.update({ where: { id }, data: c.req.valid("json") })
    return c.json(updated)
  }
)

capabilityRoutes.delete("/:id", async (c) => {
  const workspaceId = c.get("workspaceId")
  const id = c.req.param("id")

  const existing = await db.capability.findFirst({ where: { id, workspaceId, deletedAt: null } })
  if (!existing) throw new ApiError(404, "NOT_FOUND", "Capability not found")

  await db.capability.update({ where: { id }, data: { deletedAt: new Date() } })
  return c.body(null, 204)
})

capabilityRoutes.get("/:id/processes", async (c) => {
  const workspaceId = c.get("workspaceId")
  const id = c.req.param("id")

  const cap = await db.capability.findFirst({ where: { id, workspaceId, deletedAt: null } })
  if (!cap) throw new ApiError(404, "NOT_FOUND", "Capability not found")

  const processes = await db.process.findMany({ where: { capabilityId: id, workspaceId, deletedAt: null } })
  return c.json(processes)
})
