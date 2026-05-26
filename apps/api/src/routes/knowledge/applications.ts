import { Hono } from "hono"
import { zValidator } from "@hono/zod-validator"
import { z } from "zod"
import type { HonoEnv } from "../../types/env.js"
import { db } from "../../lib/db.js"
import { authMiddleware } from "../../middleware/auth.js"
import { workspaceMiddleware } from "../../middleware/workspace.js"
import { ApiError } from "../../lib/errors.js"
import { parsePagination } from "../../lib/paginate.js"

export const applicationRoutes = new Hono<HonoEnv>()

applicationRoutes.use("*", authMiddleware, workspaceMiddleware)

applicationRoutes.get("/", async (c) => {
  const workspaceId = c.get("workspaceId")
  const { lifecycle, q, page, limit, sort } = c.req.query()
  const pagination = parsePagination({ page, limit, sort })

  const where = {
    workspaceId,
    deletedAt: null as null,
    ...(lifecycle ? { lifecycleState: lifecycle } : {}),
    ...(q ? { name: { contains: q } } : {}),
  }

  const [data, total] = await Promise.all([
    db.application.findMany({ where, skip: pagination.skip, take: pagination.take, orderBy: pagination.orderBy }),
    db.application.count({ where }),
  ])

  return c.json({ data, meta: { total, page: parseInt(page ?? "1"), limit: parseInt(limit ?? "20") } })
})

applicationRoutes.post(
  "/",
  zValidator("json", z.object({
    name: z.string().min(1),
    vendor: z.string().optional(),
    description: z.string().optional(),
    lifecycleState: z.string().optional(),
    criticality: z.string().optional(),
    url: z.string().optional(),
  })),
  async (c) => {
    const workspaceId = c.get("workspaceId")
    const body = c.req.valid("json")
    const slug = `${body.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now()}`

    const app = await db.application.create({ data: { workspaceId, ...body, slug } })
    return c.json(app, 201)
  }
)

applicationRoutes.get("/:id", async (c) => {
  const workspaceId = c.get("workspaceId")
  const id = c.req.param("id")

  const app = await db.application.findFirst({ where: { id, workspaceId, deletedAt: null } })
  if (!app) throw new ApiError(404, "NOT_FOUND", "Application not found")
  return c.json(app)
})

applicationRoutes.patch(
  "/:id",
  zValidator("json", z.object({
    name: z.string().optional(),
    vendor: z.string().optional(),
    description: z.string().optional(),
    lifecycleState: z.string().optional(),
    criticality: z.string().optional(),
    annualCost: z.number().optional(),
  })),
  async (c) => {
    const workspaceId = c.get("workspaceId")
    const id = c.req.param("id")

    const existing = await db.application.findFirst({ where: { id, workspaceId, deletedAt: null } })
    if (!existing) throw new ApiError(404, "NOT_FOUND", "Application not found")

    const updated = await db.application.update({ where: { id }, data: c.req.valid("json") })
    return c.json(updated)
  }
)

applicationRoutes.delete("/:id", async (c) => {
  const workspaceId = c.get("workspaceId")
  const id = c.req.param("id")

  const existing = await db.application.findFirst({ where: { id, workspaceId, deletedAt: null } })
  if (!existing) throw new ApiError(404, "NOT_FOUND", "Application not found")

  await db.application.update({ where: { id }, data: { deletedAt: new Date() } })
  return c.body(null, 204)
})

applicationRoutes.get("/:id/processes", async (c) => {
  const workspaceId = c.get("workspaceId")
  const id = c.req.param("id")

  const app = await db.application.findFirst({ where: { id, workspaceId, deletedAt: null } })
  if (!app) throw new ApiError(404, "NOT_FOUND", "Application not found")

  const appProcesses = await db.processApplication.findMany({
    where: { applicationId: id },
    include: { process: { select: { id: true, name: true, processStatus: true } } },
  })
  type AppProcess = { process: { id: string; name: string; processStatus: string | null } }
  return c.json((appProcesses as AppProcess[]).map((ap) => ap.process))
})

applicationRoutes.get("/:id/dependencies", async (c) => {
  const workspaceId = c.get("workspaceId")
  const id = c.req.param("id")

  const app = await db.application.findFirst({ where: { id, workspaceId, deletedAt: null } })
  if (!app) throw new ApiError(404, "NOT_FOUND", "Application not found")

  const capabilities = await db.appCapabilityMap.findMany({
    where: { applicationId: id },
    include: { capability: { select: { id: true, name: true } } },
  })
  const technologies = await db.appTechnologyMap.findMany({
    where: { applicationId: id },
    include: { technology: { select: { id: true, name: true, lifecycleState: true } } },
  })

  return c.json({ capabilities, technologies })
})
