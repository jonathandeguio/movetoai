import type { MiddlewareHandler } from "hono"
import type { HonoEnv } from "../types/env.js"
import { verify } from "../lib/jwt.js"

export const authMiddleware: MiddlewareHandler<HonoEnv> = async (c, next) => {
  const authHeader = c.req.header("Authorization")
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return c.json({ error: { code: "UNAUTHORIZED", message: "Missing or invalid authorization header" } }, 401)
  }

  const token = authHeader.slice(7)
  const payload = await verify(token)

  if (!payload || !payload.sub || !payload.wid) {
    return c.json({ error: { code: "UNAUTHORIZED", message: "Invalid or expired token" } }, 401)
  }

  c.set("userId", payload.sub)
  c.set("workspaceId", payload.wid)
  c.set("tenantId", payload.tid ?? "")
  c.set("role", payload.role ?? "")

  await next()
}
