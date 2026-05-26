import { Hono } from "hono"
import { zValidator } from "@hono/zod-validator"
import { z } from "zod"
import type { HonoEnv } from "../types/env.js"
import { db } from "../lib/db.js"
import { authMiddleware } from "../middleware/auth.js"
import { workspaceMiddleware } from "../middleware/workspace.js"
import { requireRole } from "../middleware/require-role.js"
import { ApiError } from "../lib/errors.js"

export const workspaceRoutes = new Hono<HonoEnv>()

workspaceRoutes.use("*", authMiddleware, workspaceMiddleware)

workspaceRoutes.get("/", async (c) => {
  const tenantId = c.get("tenantId")
  const workspaces = await db.workspace.findMany({
    where: { tenantId, deletedAt: null },
  })
  return c.json(workspaces)
})

workspaceRoutes.post(
  "/",
  requireRole("workspace_admin"),
  zValidator("json", z.object({
    name: z.string().min(1),
    slug: z.string().optional(),
    sectorCode: z.string().optional(),
    companySize: z.string().optional(),
  })),
  async (c) => {
    const tenantId = c.get("tenantId")
    const userId = c.get("userId")
    const body = c.req.valid("json")
    const slug = body.slug ?? body.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 50)

    const workspace = await db.workspace.create({
      data: { tenantId, name: body.name, slug, sectorCode: body.sectorCode, companySize: body.companySize },
    })

    let adminRole = await db.role.findFirst({ where: { workspaceId: workspace.id, code: "workspace_admin" } })
    if (!adminRole) {
      adminRole = await db.role.create({
        data: { workspaceId: workspace.id, code: "workspace_admin", name: "Workspace Admin", isSystem: true },
      })
    }

    await db.membership.create({
      data: { userId, workspaceId: workspace.id, roleId: adminRole.id, status: "ACTIVE", acceptedAt: new Date() },
    })

    return c.json(workspace, 201)
  }
)

workspaceRoutes.get("/:id", async (c) => {
  const workspaceId = c.get("workspaceId")
  const id = c.req.param("id")
  if (id !== workspaceId) throw new ApiError(403, "FORBIDDEN", "Access denied")

  const workspace = await db.workspace.findFirst({ where: { id, deletedAt: null } })
  if (!workspace) throw new ApiError(404, "NOT_FOUND", "Workspace not found")
  return c.json(workspace)
})

workspaceRoutes.patch(
  "/:id",
  zValidator("json", z.object({
    name: z.string().optional(),
    sectorCode: z.string().optional(),
    companySize: z.string().optional(),
    aiMaturity: z.string().optional(),
    priorities: z.array(z.string()).optional(),
    horizon: z.string().optional(),
    onboardingCompleted: z.boolean().optional(),
  })),
  async (c) => {
    const workspaceId = c.get("workspaceId")
    const id = c.req.param("id")
    if (id !== workspaceId) throw new ApiError(403, "FORBIDDEN", "Access denied")

    const body = c.req.valid("json")
    const updated = await db.workspace.update({ where: { id }, data: body })
    return c.json(updated)
  }
)

workspaceRoutes.delete("/:id", requireRole("workspace_admin"), async (c) => {
  const workspaceId = c.get("workspaceId")
  const id = c.req.param("id")
  if (id !== workspaceId) throw new ApiError(403, "FORBIDDEN", "Access denied")

  await db.workspace.update({ where: { id }, data: { deletedAt: new Date() } })
  return c.body(null, 204)
})

workspaceRoutes.get("/:id/members", async (c) => {
  const workspaceId = c.get("workspaceId")
  const id = c.req.param("id")
  if (id !== workspaceId) throw new ApiError(403, "FORBIDDEN", "Access denied")

  const members = await db.membership.findMany({
    where: { workspaceId: id },
    include: {
      user: { select: { id: true, name: true, email: true, image: true, lastLoginAt: true } },
      role: true,
    },
  })
  return c.json(members)
})

workspaceRoutes.post(
  "/:id/members",
  requireRole("workspace_admin"),
  zValidator("json", z.object({ email: z.string().email(), roleId: z.string() })),
  async (c) => {
    const workspaceId = c.get("workspaceId")
    const id = c.req.param("id")
    if (id !== workspaceId) throw new ApiError(403, "FORBIDDEN", "Access denied")

    const { email, roleId } = c.req.valid("json")
    const user = await db.user.findUnique({ where: { email } })
    if (!user) throw new ApiError(404, "NOT_FOUND", "User not found")

    const membership = await db.membership.create({
      data: { userId: user.id, workspaceId: id, roleId, status: "INVITED" },
      include: { user: { select: { id: true, name: true, email: true } }, role: true },
    })
    return c.json(membership, 201)
  }
)

workspaceRoutes.patch(
  "/:id/members/:userId",
  requireRole("workspace_admin"),
  zValidator("json", z.object({ roleId: z.string() })),
  async (c) => {
    const workspaceId = c.get("workspaceId")
    const id = c.req.param("id")
    if (id !== workspaceId) throw new ApiError(403, "FORBIDDEN", "Access denied")

    const memberId = c.req.param("userId")
    const { roleId } = c.req.valid("json")
    const updated = await db.membership.updateMany({
      where: { userId: memberId, workspaceId: id },
      data: { roleId },
    })
    return c.json({ updated: updated.count })
  }
)

workspaceRoutes.delete("/:id/members/:userId", requireRole("workspace_admin"), async (c) => {
  const workspaceId = c.get("workspaceId")
  const id = c.req.param("id")
  if (id !== workspaceId) throw new ApiError(403, "FORBIDDEN", "Access denied")

  const memberId = c.req.param("userId")
  await db.membership.updateMany({
    where: { userId: memberId, workspaceId: id },
    data: { status: "REMOVED", deletedAt: new Date() },
  })
  return c.body(null, 204)
})

workspaceRoutes.get("/:id/stats", async (c) => {
  const workspaceId = c.get("workspaceId")
  const id = c.req.param("id")
  if (id !== workspaceId) throw new ApiError(403, "FORBIDDEN", "Access denied")

  const [processes, opportunities, capabilities, members, certifications] = await Promise.all([
    db.process.count({ where: { workspaceId: id, deletedAt: null } }),
    db.opportunity.count({ where: { workspaceId: id, deletedAt: null } }),
    db.capability.count({ where: { workspaceId: id, deletedAt: null } }),
    db.membership.count({ where: { workspaceId: id, status: "ACTIVE" } }),
    db.workspaceCertification.count({ where: { workspaceId: id } }),
  ])

  return c.json({ processes, opportunities, capabilities, members, certifications })
})

workspaceRoutes.get("/:id/compliance", async (c) => {
  const workspaceId = c.get("workspaceId")
  const id = c.req.param("id")
  if (id !== workspaceId) throw new ApiError(403, "FORBIDDEN", "Access denied")

  const certs = await db.workspaceCertification.findMany({
    where: { workspaceId: id },
    include: { catalog: { select: { code: true, name: true, family: true } } },
  })

  const total = certs.length
  const obtained = certs.filter((wc: { status: string }) => wc.status === "obtained").length
  const score = total > 0 ? Math.round((obtained / total) * 100) : 0

  return c.json({ score, total, obtained, certifications: certs })
})

workspaceRoutes.post("/:id/onboarding/complete", async (c) => {
  const workspaceId = c.get("workspaceId")
  const id = c.req.param("id")
  if (id !== workspaceId) throw new ApiError(403, "FORBIDDEN", "Access denied")

  await db.workspace.update({ where: { id }, data: { onboardingCompleted: true } })
  return c.json({ success: true })
})
