import { Hono } from "hono"
import type { HonoEnv } from "../types/env.js"
import { db } from "../lib/db.js"
import { authMiddleware } from "../middleware/auth.js"
import { workspaceMiddleware } from "../middleware/workspace.js"
import { ApiError } from "../lib/errors.js"

export const notificationRoutes = new Hono<HonoEnv>()

notificationRoutes.use("*", authMiddleware, workspaceMiddleware)

notificationRoutes.get("/", async (c) => {
  const workspaceId = c.get("workspaceId")
  const userId = c.get("userId")
  const { unread, limit } = c.req.query()

  const notifications = await db.notification.findMany({
    where: {
      workspaceId,
      userId,
      ...(unread === "true" ? { read: false } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: parseInt(limit ?? "20", 10),
  })

  return c.json(notifications)
})

notificationRoutes.patch("/:id/read", async (c) => {
  const workspaceId = c.get("workspaceId")
  const userId = c.get("userId")
  const id = c.req.param("id")

  const existing = await db.notification.findFirst({ where: { id, workspaceId, userId } })
  if (!existing) throw new ApiError(404, "NOT_FOUND", "Notification not found")

  const updated = await db.notification.update({ where: { id }, data: { read: true } })
  return c.json(updated)
})

notificationRoutes.post("/read-all", async (c) => {
  const workspaceId = c.get("workspaceId")
  const userId = c.get("userId")

  const result = await db.notification.updateMany({
    where: { workspaceId, userId, read: false },
    data: { read: true },
  })

  return c.json({ updated: result.count })
})

notificationRoutes.delete("/:id", async (c) => {
  const workspaceId = c.get("workspaceId")
  const userId = c.get("userId")
  const id = c.req.param("id")

  const existing = await db.notification.findFirst({ where: { id, workspaceId, userId } })
  if (!existing) throw new ApiError(404, "NOT_FOUND", "Notification not found")

  await db.notification.delete({ where: { id } })
  return c.body(null, 204)
})
