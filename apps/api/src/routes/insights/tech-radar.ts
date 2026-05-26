import { Hono } from "hono"
import { zValidator } from "@hono/zod-validator"
import { z } from "zod"
import type { HonoEnv } from "../../types/env.js"
import { db } from "../../lib/db.js"
import { authMiddleware } from "../../middleware/auth.js"
import { workspaceMiddleware } from "../../middleware/workspace.js"
import { ApiError } from "../../lib/errors.js"

export const techRadarRoutes = new Hono<HonoEnv>()

techRadarRoutes.use("*", authMiddleware, workspaceMiddleware)

techRadarRoutes.get("/", async (c) => {
  const workspaceId = c.get("workspaceId")

  const technologies = await db.technology.findMany({
    where: { workspaceId, deletedAt: null },
    orderBy: { lifecycleState: "asc" },
  })

  const grouped: Record<string, typeof technologies> = {}
  for (const tech of technologies) {
    const state = tech.lifecycleState ?? "unknown"
    if (!grouped[state]) grouped[state] = []
    grouped[state].push(tech)
  }

  return c.json({ grouped, items: technologies })
})

techRadarRoutes.post(
  "/",
  zValidator("json", z.object({
    name: z.string().min(1),
    category: z.string(),
    vendor: z.string().optional(),
    lifecycleState: z.string().optional(),
    versionCurrent: z.string().optional(),
    annualCost: z.number().optional(),
  })),
  async (c) => {
    const workspaceId = c.get("workspaceId")
    const body = c.req.valid("json")

    const tech = await db.technology.create({ data: { workspaceId, ...body } })
    return c.json(tech, 201)
  }
)

techRadarRoutes.get("/:id", async (c) => {
  const workspaceId = c.get("workspaceId")
  const id = c.req.param("id")

  const tech = await db.technology.findFirst({ where: { id, workspaceId, deletedAt: null } })
  if (!tech) throw new ApiError(404, "NOT_FOUND", "Technology not found")
  return c.json(tech)
})

techRadarRoutes.patch(
  "/:id",
  zValidator("json", z.object({
    name: z.string().optional(),
    category: z.string().optional(),
    lifecycleState: z.string().optional(),
    annualCost: z.number().optional(),
    riskLevel: z.string().optional(),
  })),
  async (c) => {
    const workspaceId = c.get("workspaceId")
    const id = c.req.param("id")

    const existing = await db.technology.findFirst({ where: { id, workspaceId, deletedAt: null } })
    if (!existing) throw new ApiError(404, "NOT_FOUND", "Technology not found")

    const updated = await db.technology.update({ where: { id }, data: c.req.valid("json") })
    return c.json(updated)
  }
)

techRadarRoutes.delete("/:id", async (c) => {
  const workspaceId = c.get("workspaceId")
  const id = c.req.param("id")

  const existing = await db.technology.findFirst({ where: { id, workspaceId, deletedAt: null } })
  if (!existing) throw new ApiError(404, "NOT_FOUND", "Technology not found")

  await db.technology.update({ where: { id }, data: { deletedAt: new Date() } })
  return c.body(null, 204)
})
