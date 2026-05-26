import { Hono } from "hono"
import { zValidator } from "@hono/zod-validator"
import { z } from "zod"
import type { HonoEnv } from "../../types/env.js"
import { db } from "../../lib/db.js"
import { authMiddleware } from "../../middleware/auth.js"
import { workspaceMiddleware } from "../../middleware/workspace.js"
import { ApiError } from "../../lib/errors.js"
import { parsePagination } from "../../lib/paginate.js"

export const archDecisionRoutes = new Hono<HonoEnv>()

archDecisionRoutes.use("*", authMiddleware, workspaceMiddleware)

archDecisionRoutes.get("/", async (c) => {
  const workspaceId = c.get("workspaceId")
  const { status, q, page, limit, sort } = c.req.query()
  const pagination = parsePagination({ page, limit, sort })

  const where = {
    workspaceId,
    deletedAt: null as null,
    ...(status ? { status } : {}),
    ...(q ? { title: { contains: q } } : {}),
  }

  const [data, total] = await Promise.all([
    db.architectureDecision.findMany({ where, skip: pagination.skip, take: pagination.take, orderBy: pagination.orderBy }),
    db.architectureDecision.count({ where }),
  ])

  return c.json({ data, meta: { total, page: parseInt(page ?? "1"), limit: parseInt(limit ?? "20") } })
})

archDecisionRoutes.post(
  "/",
  zValidator("json", z.object({
    title: z.string().min(1),
    status: z.string().optional(),
    context: z.string(),
    decision: z.string(),
    rationale: z.string(),
    decisionDate: z.string(),
    consequences: z.string().optional(),
  })),
  async (c) => {
    const workspaceId = c.get("workspaceId")
    const userId = c.get("userId")
    const body = c.req.valid("json")

    const adr = await db.architectureDecision.create({
      data: {
        workspaceId,
        authorId: userId,
        ...body,
        decisionDate: new Date(body.decisionDate),
      },
    })
    return c.json(adr, 201)
  }
)

archDecisionRoutes.get("/:id", async (c) => {
  const workspaceId = c.get("workspaceId")
  const id = c.req.param("id")

  const adr = await db.architectureDecision.findFirst({ where: { id, workspaceId, deletedAt: null } })
  if (!adr) throw new ApiError(404, "NOT_FOUND", "Architecture decision not found")
  return c.json(adr)
})

archDecisionRoutes.patch(
  "/:id",
  zValidator("json", z.object({
    title: z.string().optional(),
    status: z.string().optional(),
    context: z.string().optional(),
    decision: z.string().optional(),
    rationale: z.string().optional(),
  })),
  async (c) => {
    const workspaceId = c.get("workspaceId")
    const id = c.req.param("id")

    const existing = await db.architectureDecision.findFirst({ where: { id, workspaceId, deletedAt: null } })
    if (!existing) throw new ApiError(404, "NOT_FOUND", "Architecture decision not found")

    const updated = await db.architectureDecision.update({ where: { id }, data: c.req.valid("json") })
    return c.json(updated)
  }
)

archDecisionRoutes.delete("/:id", async (c) => {
  const workspaceId = c.get("workspaceId")
  const id = c.req.param("id")

  const existing = await db.architectureDecision.findFirst({ where: { id, workspaceId, deletedAt: null } })
  if (!existing) throw new ApiError(404, "NOT_FOUND", "Architecture decision not found")

  await db.architectureDecision.update({ where: { id }, data: { deletedAt: new Date() } })
  return c.body(null, 204)
})
