import { Hono } from "hono"
import { zValidator } from "@hono/zod-validator"
import { z } from "zod"
import type { HonoEnv } from "../../types/env.js"
import { db } from "../../lib/db.js"
import { authMiddleware } from "../../middleware/auth.js"
import { workspaceMiddleware } from "../../middleware/workspace.js"
import { ApiError } from "../../lib/errors.js"
import { parsePagination } from "../../lib/paginate.js"

export const initiativeRoutes = new Hono<HonoEnv>()

initiativeRoutes.use("*", authMiddleware, workspaceMiddleware)

initiativeRoutes.get("/timeline", async (c) => {
  const workspaceId = c.get("workspaceId")

  const initiatives = await db.initiative.findMany({
    where: { workspaceId, deletedAt: null },
    include: { milestones: { where: { deletedAt: null } } },
  })

  type InitRow = { id: string; name: string; status: string; startDate: Date | null; targetDate: Date | null; milestones: unknown[] }
  return c.json(
    (initiatives as InitRow[]).map((init) => ({
      id: init.id,
      name: init.name,
      status: init.status,
      startDate: init.startDate,
      endDate: init.targetDate,
      milestones: init.milestones,
    }))
  )
})

initiativeRoutes.get("/", async (c) => {
  const workspaceId = c.get("workspaceId")
  const { status, owner, horizon, page, limit, sort } = c.req.query()
  const pagination = parsePagination({ page, limit, sort })

  const where = {
    workspaceId,
    deletedAt: null as null,
    ...(status ? { status } : {}),
    ...(owner ? { ownerId: owner } : {}),
  }

  const [data, total] = await Promise.all([
    db.initiative.findMany({
      where,
      include: {
        owner: { select: { id: true, name: true } },
        milestones: { where: { deletedAt: null } },
      },
      skip: pagination.skip,
      take: pagination.take,
      orderBy: pagination.orderBy,
    }),
    db.initiative.count({ where }),
  ])

  return c.json({ data, meta: { total, page: parseInt(page ?? "1"), limit: parseInt(limit ?? "20") } })
})

initiativeRoutes.post(
  "/",
  zValidator("json", z.object({
    name: z.string().min(1),
    description: z.string().optional(),
    status: z.string().optional(),
    ownerId: z.string().optional(),
    startDate: z.string().optional(),
    targetDate: z.string().optional(),
    budgetAmount: z.number().optional(),
  })),
  async (c) => {
    const workspaceId = c.get("workspaceId")
    const body = c.req.valid("json")
    const slug = `${body.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now()}`

    const initiative = await db.initiative.create({
      data: {
        workspaceId,
        ...body,
        slug,
        startDate: body.startDate ? new Date(body.startDate) : null,
        targetDate: body.targetDate ? new Date(body.targetDate) : null,
      },
    })
    return c.json(initiative, 201)
  }
)

initiativeRoutes.get("/:id", async (c) => {
  const workspaceId = c.get("workspaceId")
  const id = c.req.param("id")

  const initiative = await db.initiative.findFirst({
    where: { id, workspaceId, deletedAt: null },
    include: {
      owner: { select: { id: true, name: true } },
      milestones: { where: { deletedAt: null } },
      opportunity: { select: { id: true, title: true, status: true } },
    },
  })
  if (!initiative) throw new ApiError(404, "NOT_FOUND", "Initiative not found")
  return c.json(initiative)
})

initiativeRoutes.patch(
  "/:id",
  zValidator("json", z.object({
    name: z.string().optional(),
    description: z.string().optional(),
    status: z.string().optional(),
    ownerId: z.string().optional(),
    startDate: z.string().optional(),
    targetDate: z.string().optional(),
  })),
  async (c) => {
    const workspaceId = c.get("workspaceId")
    const id = c.req.param("id")

    const existing = await db.initiative.findFirst({ where: { id, workspaceId, deletedAt: null } })
    if (!existing) throw new ApiError(404, "NOT_FOUND", "Initiative not found")

    const body = c.req.valid("json")
    const updated = await db.initiative.update({
      where: { id },
      data: {
        ...body,
        startDate: body.startDate ? new Date(body.startDate) : undefined,
        targetDate: body.targetDate ? new Date(body.targetDate) : undefined,
      },
    })
    return c.json(updated)
  }
)

initiativeRoutes.delete("/:id", async (c) => {
  const workspaceId = c.get("workspaceId")
  const id = c.req.param("id")

  const existing = await db.initiative.findFirst({ where: { id, workspaceId, deletedAt: null } })
  if (!existing) throw new ApiError(404, "NOT_FOUND", "Initiative not found")

  await db.initiative.update({ where: { id }, data: { deletedAt: new Date() } })
  return c.body(null, 204)
})

initiativeRoutes.get("/:id/opportunities", async (c) => {
  const workspaceId = c.get("workspaceId")
  const id = c.req.param("id")

  const existing = await db.initiative.findFirst({ where: { id, workspaceId, deletedAt: null } })
  if (!existing) throw new ApiError(404, "NOT_FOUND", "Initiative not found")

  const opps = await db.opportunity.findMany({
    where: { initiativeId: id, workspaceId, deletedAt: null },
    select: { id: true, title: true, status: true, priorityLevel: true },
  })
  return c.json(opps)
})

initiativeRoutes.post("/:id/opportunities/:oppId/attach", async (c) => {
  const workspaceId = c.get("workspaceId")
  const id = c.req.param("id")
  const oppId = c.req.param("oppId")

  const existing = await db.initiative.findFirst({ where: { id, workspaceId, deletedAt: null } })
  if (!existing) throw new ApiError(404, "NOT_FOUND", "Initiative not found")

  const updated = await db.opportunity.update({
    where: { id: oppId },
    data: { initiativeId: id },
  })
  return c.json({ success: true, opportunity: updated })
})

initiativeRoutes.get("/:id/timeline", async (c) => {
  const workspaceId = c.get("workspaceId")
  const id = c.req.param("id")

  const init = await db.initiative.findFirst({
    where: { id, workspaceId, deletedAt: null },
    include: { milestones: { where: { deletedAt: null } } },
  })
  if (!init) throw new ApiError(404, "NOT_FOUND", "Initiative not found")

  return c.json({
    id: init.id,
    name: init.name,
    startDate: init.startDate,
    endDate: init.targetDate,
    milestones: init.milestones,
  })
})
