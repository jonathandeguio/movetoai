import { Hono } from "hono"
import { zValidator } from "@hono/zod-validator"
import { z } from "zod"
import { randomUUID } from "node:crypto"
import type { HonoEnv } from "../types/env.js"
import { db } from "../lib/db.js"
import { hashPassword, verifyPassword } from "../lib/password.js"
import { sign, signRefresh } from "../lib/jwt.js"
import { authMiddleware } from "../middleware/auth.js"
import { ApiError } from "../lib/errors.js"

export const authRoutes = new Hono<HonoEnv>()

authRoutes.post(
  "/login",
  zValidator("json", z.object({ email: z.string().email(), password: z.string().min(1) })),
  async (c) => {
    const { email, password } = c.req.valid("json")

    const user = await db.user.findUnique({
      where: { email },
      include: {
        memberships: {
          where: { status: "ACTIVE", deletedAt: null },
          include: { workspace: true, role: true },
          take: 1,
        },
      },
    })

    if (!user || !verifyPassword(password, user.hashedPassword)) {
      throw new ApiError(401, "INVALID_CREDENTIALS", "Invalid email or password")
    }

    const membership = user.memberships[0]
    if (!membership) {
      throw new ApiError(403, "NO_WORKSPACE", "No active workspace found")
    }

    const workspaceId = membership.workspaceId
    const tenantId = membership.workspace.tenantId
    const roleName = membership.role.code

    const tokenPayload = { sub: user.id, wid: workspaceId, tid: tenantId, role: roleName }
    const accessToken = await sign(tokenPayload)
    const refreshToken = await signRefresh(tokenPayload)

    const sessionToken = randomUUID()
    const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)

    await db.session.create({
      data: { sessionToken, userId: user.id, expires },
    })

    await db.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    })

    return c.json({
      access_token: accessToken,
      refresh_token: sessionToken,
      expires_in: 3600,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        workspaceId,
        role: roleName,
      },
    })
  }
)

authRoutes.post(
  "/register",
  zValidator(
    "json",
    z.object({
      name: z.string().min(1),
      email: z.string().email(),
      password: z.string().min(8),
      workspaceName: z.string().min(1),
    })
  ),
  async (c) => {
    const { name, email, password, workspaceName } = c.req.valid("json")

    const existing = await db.user.findUnique({ where: { email } })
    if (existing) {
      throw new ApiError(409, "EMAIL_TAKEN", "Email already in use")
    }

    const hashedPasswordValue = hashPassword(password)
    const slug = workspaceName.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 50)

    const freePlan = await db.subscriptionPlan.findFirst({ where: { planType: "FREE" } })
    if (!freePlan) {
      throw new ApiError(500, "PLAN_NOT_FOUND", "No FREE plan configured")
    }

    const tenant = await db.tenant.create({
      data: {
        name: workspaceName,
        slug: `${slug}-${Date.now()}`,
        subscriptionPlanId: freePlan.id,
      },
    })

    const workspace = await db.workspace.create({
      data: {
        tenantId: tenant.id,
        name: workspaceName,
        slug: `${slug}-${Date.now()}`,
      },
    })

    let adminRole = await db.role.findFirst({ where: { workspaceId: workspace.id, code: "workspace_admin" } })
    if (!adminRole) {
      adminRole = await db.role.create({
        data: {
          workspaceId: workspace.id,
          code: "workspace_admin",
          name: "Workspace Admin",
          isSystem: true,
        },
      })
    }

    const user = await db.user.create({
      data: { name, email, hashedPassword: hashedPasswordValue },
    })

    await db.membership.create({
      data: {
        userId: user.id,
        workspaceId: workspace.id,
        roleId: adminRole.id,
        status: "ACTIVE",
        acceptedAt: new Date(),
      },
    })

    const tokenPayload = { sub: user.id, wid: workspace.id, tid: tenant.id, role: "workspace_admin" }
    const accessToken = await sign(tokenPayload)
    const sessionToken = randomUUID()
    const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)

    await db.session.create({ data: { sessionToken, userId: user.id, expires } })
    await db.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } })

    return c.json({
      access_token: accessToken,
      refresh_token: sessionToken,
      expires_in: 3600,
      user: { id: user.id, name: user.name, email: user.email, workspaceId: workspace.id, role: "workspace_admin" },
    }, 201)
  }
)

authRoutes.post(
  "/refresh",
  zValidator("json", z.object({ refresh_token: z.string() })),
  async (c) => {
    const { refresh_token } = c.req.valid("json")

    const session = await db.session.findUnique({ where: { sessionToken: refresh_token }, include: { user: true } })

    if (!session || session.expires < new Date()) {
      throw new ApiError(401, "INVALID_REFRESH_TOKEN", "Refresh token is invalid or expired")
    }

    const membership = await db.membership.findFirst({
      where: { userId: session.userId, status: "ACTIVE", deletedAt: null },
      include: { workspace: true, role: true },
    })

    if (!membership) {
      throw new ApiError(403, "NO_WORKSPACE", "No active workspace found")
    }

    const accessToken = await sign({
      sub: session.userId,
      wid: membership.workspaceId,
      tid: membership.workspace.tenantId,
      role: membership.role.code,
    })

    return c.json({ access_token: accessToken, expires_in: 3600 })
  }
)

authRoutes.post("/logout", authMiddleware, zValidator("json", z.object({ refresh_token: z.string() })), async (c) => {
  const { refresh_token } = c.req.valid("json")
  await db.session.deleteMany({ where: { sessionToken: refresh_token } })
  return c.body(null, 204)
})

authRoutes.get("/me", authMiddleware, async (c) => {
  const userId = c.get("userId")
  const workspaceId = c.get("workspaceId")

  const user = await db.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      preferences: true,
      memberships: {
        where: { workspaceId, status: "ACTIVE", deletedAt: null },
        include: { workspace: true, role: true },
        take: 1,
      },
    },
  })

  if (!user) throw new ApiError(404, "NOT_FOUND", "User not found")

  const membership = user.memberships[0]
  return c.json({
    id: user.id,
    name: user.name,
    email: user.email,
    avatar: user.image,
    preferences: user.preferences,
    workspace: membership
      ? {
          id: membership.workspace.id,
          name: membership.workspace.name,
          sectorCode: membership.workspace.sectorCode,
          companySize: membership.workspace.companySize,
          planType: membership.workspace.planType,
        }
      : null,
    role: membership?.role.code ?? null,
  })
})

authRoutes.post(
  "/forgot-password",
  zValidator("json", z.object({ email: z.string().email() })),
  async (c) => {
    const { email } = c.req.valid("json")
    const user = await db.user.findUnique({ where: { email } })

    const token = randomUUID()
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000)

    if (user) {
      await db.emailVerification.create({
        data: { email, code: token, expires_at: expiresAt },
      })
    }

    const response: Record<string, string> = {
      message: "If this email exists, you'll receive a reset link",
    }

    if (process.env.NODE_ENV !== "production" && user) {
      response.debug_token = token
    }

    return c.json(response)
  }
)

authRoutes.post(
  "/reset-password",
  zValidator("json", z.object({ token: z.string(), new_password: z.string().min(8) })),
  async (c) => {
    const { token, new_password } = c.req.valid("json")

    const verification = await db.emailVerification.findFirst({
      where: { code: token, verified: false, expires_at: { gt: new Date() } },
    })

    if (!verification) {
      throw new ApiError(400, "INVALID_TOKEN", "Token is invalid or expired")
    }

    const user = await db.user.findUnique({ where: { email: verification.email } })
    if (!user) throw new ApiError(404, "NOT_FOUND", "User not found")

    const hashedPasswordValue = hashPassword(new_password)
    await db.user.update({ where: { id: user.id }, data: { hashedPassword: hashedPasswordValue } })
    await db.emailVerification.delete({ where: { id: verification.id } })

    return c.json({ message: "Password updated successfully" })
  }
)
