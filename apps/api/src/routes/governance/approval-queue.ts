import { Hono } from "hono"
import { zValidator } from "@hono/zod-validator"
import { z } from "zod"
import type { HonoEnv } from "../../types/env.js"
import { db } from "../../lib/db.js"
import { authMiddleware } from "../../middleware/auth.js"
import { workspaceMiddleware } from "../../middleware/workspace.js"
import { ApiError } from "../../lib/errors.js"

export const approvalQueueRoutes = new Hono<HonoEnv>()

approvalQueueRoutes.use("*", authMiddleware, workspaceMiddleware)

approvalQueueRoutes.get("/", async (c) => {
  const workspaceId = c.get("workspaceId")

  const items = await db.opportunity.findMany({
    where: { workspaceId, status: "VALIDATED", deletedAt: null },
    include: {
      process: { select: { id: true, name: true } },
      owner: { select: { id: true, name: true } },
    },
  })

  return c.json(items)
})

approvalQueueRoutes.post(
  "/:itemId/approve",
  async (c) => {
    const workspaceId = c.get("workspaceId")
    const userId = c.get("userId")
    const itemId = c.req.param("itemId")

    const opp = await db.opportunity.findFirst({ where: { id: itemId, workspaceId, deletedAt: null } })
    if (!opp) throw new ApiError(404, "NOT_FOUND", "Item not found")

    const updated = await db.opportunity.update({ where: { id: itemId }, data: { status: "APPROVED" } })

    return c.json({ success: true, opportunity: updated })
  }
)

approvalQueueRoutes.post(
  "/:itemId/reject",
  zValidator("json", z.object({ reason: z.string().min(1) })),
  async (c) => {
    const workspaceId = c.get("workspaceId")
    const userId = c.get("userId")
    const itemId = c.req.param("itemId")
    const { reason } = c.req.valid("json")

    const opp = await db.opportunity.findFirst({ where: { id: itemId, workspaceId, deletedAt: null } })
    if (!opp) throw new ApiError(404, "NOT_FOUND", "Item not found")

    const updated = await db.opportunity.update({
      where: { id: itemId },
      data: { status: "REJECTED", rejectionReason: reason },
    })

    await db.opportunityComment.create({
      data: { opportunityId: itemId, authorId: userId, body: `Rejected: ${reason}` },
    })

    return c.json({ success: true, opportunity: updated })
  }
)
