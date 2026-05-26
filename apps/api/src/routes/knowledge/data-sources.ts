import { Hono } from "hono"
import { zValidator } from "@hono/zod-validator"
import { z } from "zod"
import type { HonoEnv } from "../../types/env.js"
import { db } from "../../lib/db.js"
import { authMiddleware } from "../../middleware/auth.js"
import { workspaceMiddleware } from "../../middleware/workspace.js"
import { ApiError } from "../../lib/errors.js"
import { parsePagination } from "../../lib/paginate.js"

export const dataSourceRoutes = new Hono<HonoEnv>()

dataSourceRoutes.use("*", authMiddleware, workspaceMiddleware)

dataSourceRoutes.get("/", async (c) => {
  const workspaceId = c.get("workspaceId")
  const { q, page, limit, sort } = c.req.query()
  const pagination = parsePagination({ page, limit, sort })

  const where = {
    workspaceId,
    deletedAt: null as null,
    ...(q ? { name: { contains: q } } : {}),
  }

  const [data, total] = await Promise.all([
    db.dataSource.findMany({ where, skip: pagination.skip, take: pagination.take, orderBy: pagination.orderBy }),
    db.dataSource.count({ where }),
  ])

  return c.json({ data, meta: { total, page: parseInt(page ?? "1"), limit: parseInt(limit ?? "20") } })
})

dataSourceRoutes.post(
  "/",
  zValidator("json", z.object({
    name: z.string().min(1),
    systemName: z.string().optional(),
    classification: z.string().optional(),
    description: z.string().optional(),
  })),
  async (c) => {
    const workspaceId = c.get("workspaceId")
    const body = c.req.valid("json")
    const slug = `${body.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now()}`

    const ds = await db.dataSource.create({ data: { workspaceId, ...body, slug } })
    return c.json(ds, 201)
  }
)

dataSourceRoutes.get("/:id", async (c) => {
  const workspaceId = c.get("workspaceId")
  const id = c.req.param("id")

  const ds = await db.dataSource.findFirst({ where: { id, workspaceId, deletedAt: null } })
  if (!ds) throw new ApiError(404, "NOT_FOUND", "Data source not found")
  return c.json(ds)
})

dataSourceRoutes.patch(
  "/:id",
  zValidator("json", z.object({
    name: z.string().optional(),
    systemName: z.string().optional(),
    classification: z.string().optional(),
    description: z.string().optional(),
  })),
  async (c) => {
    const workspaceId = c.get("workspaceId")
    const id = c.req.param("id")

    const existing = await db.dataSource.findFirst({ where: { id, workspaceId, deletedAt: null } })
    if (!existing) throw new ApiError(404, "NOT_FOUND", "Data source not found")

    const updated = await db.dataSource.update({ where: { id }, data: c.req.valid("json") })
    return c.json(updated)
  }
)

dataSourceRoutes.delete("/:id", async (c) => {
  const workspaceId = c.get("workspaceId")
  const id = c.req.param("id")

  const existing = await db.dataSource.findFirst({ where: { id, workspaceId, deletedAt: null } })
  if (!existing) throw new ApiError(404, "NOT_FOUND", "Data source not found")

  await db.dataSource.update({ where: { id }, data: { deletedAt: new Date() } })
  return c.body(null, 204)
})
