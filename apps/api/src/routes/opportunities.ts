import { Hono } from "hono"
import { zValidator } from "@hono/zod-validator"
import { z } from "zod"
import type { HonoEnv } from "../types/env.js"
import { db } from "../lib/db.js"
import { authMiddleware } from "../middleware/auth.js"
import { workspaceMiddleware } from "../middleware/workspace.js"
import { ApiError } from "../lib/errors.js"
import { parsePagination } from "../lib/paginate.js"

export const opportunityRoutes = new Hono<HonoEnv>()

opportunityRoutes.use("*", authMiddleware, workspaceMiddleware)

opportunityRoutes.post(
  "/generate",
  zValidator("json", z.object({ process_id: z.string(), count: z.number().default(3) })),
  async (c) => {
    const workspaceId = c.get("workspaceId")
    const { process_id, count } = c.req.valid("json")

    const process = await db.process.findFirst({ where: { id: process_id, workspaceId, deletedAt: null } })
    if (!process) throw new ApiError(404, "NOT_FOUND", "Process not found")

    const suggestions = Array.from({ length: Math.min(count, 5) }, (_, i) => ({
      title: `AI Opportunity ${i + 1} for ${process.name}`,
      description: `Suggested AI use case based on process analysis: ${process.description ?? process.name}`,
      processId: process_id,
      priorityLevel: process.painLevel && process.painLevel >= 4 ? "P1" : "P2",
      gainEstimate: process.aiPotential === "high" ? "-30% processing time" : "-15% processing time",
    }))

    return c.json({ suggestions })
  }
)

opportunityRoutes.get("/", async (c) => {
  const workspaceId = c.get("workspaceId")
  const { status, priority, process: processId, q, page, limit, sort } = c.req.query()
  const pagination = parsePagination({ page, limit, sort })

  const where = {
    workspaceId,
    deletedAt: null as null,
    ...(status ? { status: { in: status.split(",") } } : {}),
    ...(priority ? { priorityLevel: priority } : {}),
    ...(processId ? { processId } : {}),
    ...(q ? { title: { contains: q } } : {}),
  }

  const [data, total] = await Promise.all([
    db.opportunity.findMany({
      where,
      include: {
        domain: { select: { id: true, name: true } },
        process: { select: { id: true, name: true } },
        owner: { select: { id: true, name: true } },
      },
      skip: pagination.skip,
      take: pagination.take,
      orderBy: pagination.orderBy,
    }),
    db.opportunity.count({ where }),
  ])

  return c.json({ data, meta: { total, page: parseInt(page ?? "1"), limit: parseInt(limit ?? "20") } })
})

opportunityRoutes.post(
  "/",
  zValidator("json", z.object({
    title: z.string().min(1),
    description: z.string().optional(),
    processId: z.string(),
    domainId: z.string(),
    capabilityId: z.string(),
    opportunityTypeId: z.string(),
    priorityLevel: z.string().optional(),
    gainEstimate: z.string().optional(),
    complexity: z.string().optional(),
  })),
  async (c) => {
    const workspaceId = c.get("workspaceId")
    const userId = c.get("userId")
    const body = c.req.valid("json")

    const opp = await db.opportunity.create({
      data: { workspaceId, createdById: userId, ...body },
    })
    return c.json(opp, 201)
  }
)

opportunityRoutes.get("/:id", async (c) => {
  const workspaceId = c.get("workspaceId")
  const id = c.req.param("id")

  const opp = await db.opportunity.findFirst({
    where: { id, workspaceId, deletedAt: null },
    include: {
      domain: true,
      process: { select: { id: true, name: true } },
      owner: { select: { id: true, name: true } },
      comments: { include: { author: { select: { id: true, name: true } } } },
      assessments: { where: { isCurrent: true }, take: 1 },
    },
  })
  if (!opp) throw new ApiError(404, "NOT_FOUND", "Opportunity not found")
  return c.json(opp)
})

opportunityRoutes.patch(
  "/:id",
  zValidator("json", z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    status: z.string().optional(),
    priorityLevel: z.string().optional(),
    gainEstimate: z.string().optional(),
    complexity: z.string().optional(),
  })),
  async (c) => {
    const workspaceId = c.get("workspaceId")
    const id = c.req.param("id")

    const existing = await db.opportunity.findFirst({ where: { id, workspaceId, deletedAt: null } })
    if (!existing) throw new ApiError(404, "NOT_FOUND", "Opportunity not found")

    const updated = await db.opportunity.update({ where: { id }, data: c.req.valid("json") })
    return c.json(updated)
  }
)

opportunityRoutes.delete("/:id", async (c) => {
  const workspaceId = c.get("workspaceId")
  const id = c.req.param("id")

  const existing = await db.opportunity.findFirst({ where: { id, workspaceId, deletedAt: null } })
  if (!existing) throw new ApiError(404, "NOT_FOUND", "Opportunity not found")

  await db.opportunity.update({ where: { id }, data: { deletedAt: new Date() } })
  return c.body(null, 204)
})

opportunityRoutes.post("/:id/submit", async (c) => {
  const workspaceId = c.get("workspaceId")
  const id = c.req.param("id")

  const existing = await db.opportunity.findFirst({ where: { id, workspaceId, deletedAt: null } })
  if (!existing) throw new ApiError(404, "NOT_FOUND", "Opportunity not found")

  const updated = await db.opportunity.update({ where: { id }, data: { status: "VALIDATED" } })
  return c.json(updated)
})

opportunityRoutes.post("/:id/approve", async (c) => {
  const workspaceId = c.get("workspaceId")
  const id = c.req.param("id")

  const existing = await db.opportunity.findFirst({ where: { id, workspaceId, deletedAt: null } })
  if (!existing) throw new ApiError(404, "NOT_FOUND", "Opportunity not found")

  const updated = await db.opportunity.update({ where: { id }, data: { status: "APPROVED" } })
  return c.json(updated)
})

opportunityRoutes.post(
  "/:id/reject",
  zValidator("json", z.object({ reason: z.string() })),
  async (c) => {
    const workspaceId = c.get("workspaceId")
    const userId = c.get("userId")
    const id = c.req.param("id")
    const { reason } = c.req.valid("json")

    const existing = await db.opportunity.findFirst({ where: { id, workspaceId, deletedAt: null } })
    if (!existing) throw new ApiError(404, "NOT_FOUND", "Opportunity not found")

    const updated = await db.opportunity.update({
      where: { id },
      data: { status: "REJECTED", rejectionReason: reason },
    })

    await db.opportunityComment.create({
      data: { opportunityId: id, authorId: userId, body: `Rejected: ${reason}` },
    })

    return c.json(updated)
  }
)

opportunityRoutes.post("/:id/promote", async (c) => {
  const workspaceId = c.get("workspaceId")
  const userId = c.get("userId")
  const id = c.req.param("id")

  const opp = await db.opportunity.findFirst({ where: { id, workspaceId, deletedAt: null } })
  if (!opp) throw new ApiError(404, "NOT_FOUND", "Opportunity not found")

  const slug = `initiative-${id.slice(-8)}-${Date.now()}`
  const initiative = await db.initiative.create({
    data: {
      workspaceId,
      name: opp.title,
      slug,
      opportunityId: id,
      ownerId: userId,
      status: "PLANNED",
    },
  })

  return c.json(initiative, 201)
})

opportunityRoutes.get("/:id/score", async (c) => {
  const workspaceId = c.get("workspaceId")
  const id = c.req.param("id")

  const opp = await db.opportunity.findFirst({ where: { id, workspaceId, deletedAt: null } })
  if (!opp) throw new ApiError(404, "NOT_FOUND", "Opportunity not found")

  const assessment = await db.opportunityAssessment.findFirst({ where: { opportunityId: id, isCurrent: true } })
  return c.json(assessment ?? { opportunityId: id, overallScore: null, isCurrent: true })
})

opportunityRoutes.post("/:id/score/refresh", async (c) => {
  const workspaceId = c.get("workspaceId")
  const id = c.req.param("id")

  const opp = await db.opportunity.findFirst({ where: { id, workspaceId, deletedAt: null } })
  if (!opp) throw new ApiError(404, "NOT_FOUND", "Opportunity not found")

  const gainMap: Record<string, number> = { high: 90, medium: 50, low: 20 }
  const complexityMap: Record<string, number> = { low: 100, medium: 60, high: 20 }
  const painLevel = opp.painLevel ?? 3

  const gainNorm = gainMap[opp.gainEstimate?.toLowerCase() ?? "medium"] ?? 50
  const complexInverse = complexityMap[opp.complexity] ?? 60
  const score = Math.round(gainNorm * 0.4 + complexInverse * 0.3 + painLevel * 10 * 0.3)

  await db.opportunity.update({ where: { id }, data: { overallScore: score } })
  return c.json({ score })
})

opportunityRoutes.get("/:id/comments", async (c) => {
  const workspaceId = c.get("workspaceId")
  const id = c.req.param("id")

  const opp = await db.opportunity.findFirst({ where: { id, workspaceId, deletedAt: null } })
  if (!opp) throw new ApiError(404, "NOT_FOUND", "Opportunity not found")

  const comments = await db.opportunityComment.findMany({
    where: { opportunityId: id, deletedAt: null },
    include: { author: { select: { id: true, name: true } } },
    orderBy: { createdAt: "asc" },
  })
  return c.json(comments)
})

opportunityRoutes.post(
  "/:id/comments",
  zValidator("json", z.object({ content: z.string().min(1) })),
  async (c) => {
    const workspaceId = c.get("workspaceId")
    const userId = c.get("userId")
    const id = c.req.param("id")
    const { content } = c.req.valid("json")

    const opp = await db.opportunity.findFirst({ where: { id, workspaceId, deletedAt: null } })
    if (!opp) throw new ApiError(404, "NOT_FOUND", "Opportunity not found")

    const comment = await db.opportunityComment.create({
      data: { opportunityId: id, authorId: userId, body: content },
      include: { author: { select: { id: true, name: true } } },
    })
    return c.json(comment, 201)
  }
)

opportunityRoutes.delete("/:id/comments/:cId", async (c) => {
  const workspaceId = c.get("workspaceId")
  const userId = c.get("userId")
  const role = c.get("role")
  const id = c.req.param("id")
  const cId = c.req.param("cId")

  const opp = await db.opportunity.findFirst({ where: { id, workspaceId, deletedAt: null } })
  if (!opp) throw new ApiError(404, "NOT_FOUND", "Opportunity not found")

  const comment = await db.opportunityComment.findUnique({ where: { id: cId } })
  if (!comment) throw new ApiError(404, "NOT_FOUND", "Comment not found")

  if (comment.authorId !== userId && role !== "workspace_admin" && role !== "superadmin") {
    throw new ApiError(403, "FORBIDDEN", "Cannot delete this comment")
  }

  await db.opportunityComment.update({ where: { id: cId }, data: { deletedAt: new Date() } })
  return c.body(null, 204)
})
