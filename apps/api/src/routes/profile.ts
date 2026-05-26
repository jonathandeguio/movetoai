import { Hono } from "hono"
import { zValidator } from "@hono/zod-validator"
import { z } from "zod"
import type { HonoEnv } from "../types/env.js"
import { db } from "../lib/db.js"
import { hashPassword, verifyPassword } from "../lib/password.js"
import { authMiddleware } from "../middleware/auth.js"
import { workspaceMiddleware } from "../middleware/workspace.js"
import { ApiError } from "../lib/errors.js"

export const profileRoutes = new Hono<HonoEnv>()

profileRoutes.use("*", authMiddleware, workspaceMiddleware)

profileRoutes.get("/", async (c) => {
  const userId = c.get("userId")

  const user = await db.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      preferences: true,
      jobTitle: true,
      userFunction: true,
      lastLoginAt: true,
      createdAt: true,
    },
  })
  if (!user) throw new ApiError(404, "NOT_FOUND", "User not found")
  return c.json(user)
})

profileRoutes.patch(
  "/",
  zValidator("json", z.object({
    name: z.string().optional(),
    preferences: z.record(z.unknown()).optional(),
    avatar: z.string().optional(),
    jobTitle: z.string().optional(),
  })),
  async (c) => {
    const userId = c.get("userId")
    const body = c.req.valid("json")

    const data: Record<string, unknown> = {}
    if (body.name) data.name = body.name
    if (body.preferences) data.preferences = body.preferences
    if (body.avatar) data.image = body.avatar
    if (body.jobTitle) data.jobTitle = body.jobTitle

    const updated = await db.user.update({
      where: { id: userId },
      data,
      select: { id: true, name: true, email: true, image: true, preferences: true, jobTitle: true },
    })
    return c.json(updated)
  }
)

profileRoutes.post(
  "/change-password",
  zValidator("json", z.object({ current_password: z.string(), new_password: z.string().min(8) })),
  async (c) => {
    const userId = c.get("userId")
    const { current_password, new_password } = c.req.valid("json")

    const user = await db.user.findUnique({ where: { id: userId } })
    if (!user) throw new ApiError(404, "NOT_FOUND", "User not found")

    if (!verifyPassword(current_password, user.hashedPassword)) {
      throw new ApiError(400, "INVALID_PASSWORD", "Current password is incorrect")
    }

    const hashedPasswordValue = hashPassword(new_password)
    await db.user.update({ where: { id: userId }, data: { hashedPassword: hashedPasswordValue } })

    return c.json({ message: "Password changed successfully" })
  }
)
