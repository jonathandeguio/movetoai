import { Hono } from "hono"
import { zValidator } from "@hono/zod-validator"
import { z } from "zod"
import type { HonoEnv } from "../../types/env.js"
import { db } from "../../lib/db.js"
import { authMiddleware } from "../../middleware/auth.js"
import { workspaceMiddleware } from "../../middleware/workspace.js"
import { ApiError } from "../../lib/errors.js"
import { parsePagination } from "../../lib/paginate.js"

export const decisionRoutes = new Hono<HonoEnv>()

decisionRoutes.use("*", authMiddleware, workspaceMiddleware)

decisionRoutes.get("/", async (c) => {
  const workspaceId = c.get("workspaceId")
  const { status, owner, q, page, limit, sort } = c.req.query()
  const pagination = parsePagination({ page, limit, sort })

  const where = {
    workspaceId,
    deletedAt: null as null,
    ...(status ? { status } : {}),
    ...(owner ? { decidedById: owner } : {}),
    ...(q ? { summary: { contains: q } } : {}),
  }

  const [data, total] = await Promise.all([
    db.decision.findMany({
      where,
      include: { decidedBy: { select: { id: true, name: true } } },
      skip: pagination.skip,
      take: pagination.take,
      orderBy: pagination.orderBy,
    }),
    db.decision.count({ where }),
  ])

  return c.json({ data, meta: { total, page: parseInt(page ?? "1"), limit: parseInt(limit ?? "20") } })
})

decisionRoutes.post(
  "/",
  zValidator("json", z.object({
    opportunityId: z.string(),
    summary: z.string().optional(),
    rationale: z.string().optional(),
    status: z.string().optional(),
    decidedById: z.string().optional(),
  })),
  async (c) => {
    const workspaceId = c.get("workspaceId")
    const body = c.req.valid("json")

    const decision = await db.decision.create({ data: { workspaceId, ...body } })
    return c.json(decision, 201)
  }
)

decisionRoutes.get("/:id", async (c) => {
  const workspaceId = c.get("workspaceId")
  const id = c.req.param("id")

  const decision = await db.decision.findFirst({
    where: { id, workspaceId, deletedAt: null },
    include: {
      decidedBy: { select: { id: true, name: true } },
      approvalSteps: true,
      opportunity: { select: { id: true, title: true, status: true } },
    },
  })
  if (!decision) throw new ApiError(404, "NOT_FOUND", "Decision not found")
  return c.json(decision)
})

decisionRoutes.patch(
  "/:id",
  zValidator("json", z.object({
    status: z.string().optional(),
    summary: z.string().optional(),
    rationale: z.string().optional(),
    decidedById: z.string().optional(),
    decidedAt: z.string().optional(),
  })),
  async (c) => {
    const workspaceId = c.get("workspaceId")
    const id = c.req.param("id")

    const existing = await db.decision.findFirst({ where: { id, workspaceId, deletedAt: null } })
    if (!existing) throw new ApiError(404, "NOT_FOUND", "Decision not found")

    const body = c.req.valid("json")
    const updated = await db.decision.update({
      where: { id },
      data: { ...body, decidedAt: body.decidedAt ? new Date(body.decidedAt) : undefined },
    })
    return c.json(updated)
  }
)

decisionRoutes.delete("/:id", async (c) => {
  const workspaceId = c.get("workspaceId")
  const id = c.req.param("id")

  const existing = await db.decision.findFirst({ where: { id, workspaceId, deletedAt: null } })
  if (!existing) throw new ApiError(404, "NOT_FOUND", "Decision not found")

  await db.decision.update({ where: { id }, data: { deletedAt: new Date() } })
  return c.body(null, 204)
})
