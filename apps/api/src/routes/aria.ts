import { Hono } from "hono"
import { zValidator } from "@hono/zod-validator"
import { z } from "zod"
import type { HonoEnv } from "../types/env.js"
import { db } from "../lib/db.js"
import { redis } from "../lib/redis.js"
import { authMiddleware } from "../middleware/auth.js"
import { workspaceMiddleware } from "../middleware/workspace.js"
import { ApiError } from "../lib/errors.js"

export const ariaRoutes = new Hono<HonoEnv>()

ariaRoutes.use("*", authMiddleware, workspaceMiddleware)

ariaRoutes.post(
  "/chat",
  zValidator("json", z.object({
    message: z.string().min(1),
    page_path: z.string(),
    context: z.record(z.unknown()).optional(),
    session_id: z.string().optional(),
  })),
  async (c) => {
    const workspaceId = c.get("workspaceId")
    const userId = c.get("userId")
    const { message, page_path, session_id } = c.req.valid("json")

    let session
    if (session_id) {
      session = await db.ariaSession.findFirst({ where: { id: session_id, userId, workspaceId } })
    }

    if (!session) {
      session = await db.ariaSession.create({
        data: { userId, workspaceId, pagePath: page_path },
      })
    }

    await db.ariaMessage.create({
      data: { sessionId: session.id, role: "user", content: message, pagePath: page_path },
    })

    const reply = `I understand your question about "${message.slice(0, 50)}...". Let me help you with that in the context of ${page_path}.`

    await db.ariaMessage.create({
      data: { sessionId: session.id, role: "aria", content: reply, pagePath: page_path },
    })

    return c.json({ reply, session_id: session.id })
  }
)

ariaRoutes.get("/recommendations", async (c) => {
  const { page_path, limit } = c.req.query()
  const maxItems = parseInt(limit ?? "3", 10)

  const suggestions = [
    { id: "sug-1", text: "Consider documenting this process with a BPMN diagram", priority: "high" },
    { id: "sug-2", text: "Add KPIs to measure process performance", priority: "medium" },
    { id: "sug-3", text: "Link this process to relevant certifications", priority: "low" },
  ].slice(0, maxItems)

  return c.json({ suggestions, page_path })
})

ariaRoutes.post(
  "/recommendations/:id/dismiss",
  async (c) => {
    const userId = c.get("userId")
    const suggestionId = c.req.param("id")
    const pagePath = c.req.query("page_path") ?? "/"

    await db.ariaDismissal.upsert({
      where: { userId_suggestionId: { userId, suggestionId } },
      create: { userId, suggestionId, pagePath },
      update: {},
    })

    return c.json({ success: true })
  }
)

ariaRoutes.get("/context", async (c) => {
  const workspaceId = c.get("workspaceId")
  const page_path = c.req.query("page_path") ?? "/"

  const workspace = await db.workspace.findUnique({
    where: { id: workspaceId },
    select: { id: true, name: true, sectorCode: true, onboardingCompleted: true, aiMaturity: true },
  })

  const [processCount, oppCount] = await Promise.all([
    db.process.count({ where: { workspaceId, deletedAt: null } }),
    db.opportunity.count({ where: { workspaceId, deletedAt: null } }),
  ])

  return c.json({
    page_id: page_path,
    workspace_snapshot: { ...workspace, processCount, oppCount },
    page_data: {},
  })
})

ariaRoutes.get("/sessions", async (c) => {
  const workspaceId = c.get("workspaceId")
  const userId = c.get("userId")

  const sessions = await db.ariaSession.findMany({
    where: { workspaceId, userId },
    orderBy: { createdAt: "desc" },
    take: 20,
  })

  return c.json(sessions)
})

ariaRoutes.get("/sessions/:id/messages", async (c) => {
  const userId = c.get("userId")
  const id = c.req.param("id")

  const session = await db.ariaSession.findFirst({ where: { id, userId } })
  if (!session) throw new ApiError(404, "NOT_FOUND", "Session not found")

  const messages = await db.ariaMessage.findMany({
    where: { sessionId: id },
    orderBy: { createdAt: "asc" },
  })

  return c.json(messages)
})

ariaRoutes.get("/jobs/:jobId", async (c) => {
  const jobId = c.req.param("jobId")
  try {
    const status = await redis.get(`job:${jobId}`)
    return c.json({ jobId, status: status ?? "not_found" })
  } catch {
    return c.json({ jobId, status: "unknown" })
  }
})

ariaRoutes.delete("/jobs/:jobId", async (c) => {
  const jobId = c.req.param("jobId")
  try {
    await redis.del(`job:${jobId}`)
  } catch {
    // Redis unavailable
  }
  return c.body(null, 204)
})
