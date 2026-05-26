import type { MiddlewareHandler } from "hono"
import type { HonoEnv } from "../types/env.js"

export function requireRole(requiredRole: string): MiddlewareHandler<HonoEnv> {
  return async (c, next) => {
    const role = c.get("role")

    if (role === "superadmin" || role === requiredRole) {
      await next()
      return
    }

    return c.json(
      { error: { code: "FORBIDDEN", message: `Role '${requiredRole}' required` } },
      403
    )
  }
}
