import type { MiddlewareHandler } from "hono"
import type { HonoEnv } from "../types/env.js"
import { db } from "../lib/db.js"

export const workspaceMiddleware: MiddlewareHandler<HonoEnv> = async (c, next) => {
  const userId = c.get("userId")
  const workspaceId = c.get("workspaceId")

  if (!userId || !workspaceId) {
    return c.json({ error: { code: "UNAUTHORIZED", message: "Authentication required" } }, 401)
  }

  const membership = await db.membership.findFirst({
    where: {
      userId,
      workspaceId,
      status: "ACTIVE",
      deletedAt: null,
    },
    include: {
      workspace: { select: { tenantId: true } },
      role: { select: { code: true } },
    },
  })

  if (!membership) {
    return c.json({ error: { code: "FORBIDDEN", message: "No active membership for this workspace" } }, 403)
  }

  c.set("tenantId", membership.workspace.tenantId)
  c.set("role", membership.role.code)

  await next()
}
