import { Hono } from "hono"
import type { HonoEnv } from "../types/env.js"
import { db } from "../lib/db.js"

export const publicRoutes = new Hono<HonoEnv>()

publicRoutes.get("/workspace/:slug/info", async (c) => {
  const slug = c.req.param("slug")

  const workspace = await db.workspace.findFirst({
    where: { slug, deletedAt: null },
    select: { id: true, name: true, slug: true, sectorCode: true, planType: true },
  })

  if (!workspace) {
    return c.json({ error: { code: "NOT_FOUND", message: "Workspace not found" } }, 404)
  }

  return c.json(workspace)
})

publicRoutes.post("/webhook/:provider", async (c) => {
  const provider = c.req.param("provider")
  const body = await c.req.json().catch(() => ({}))

  if (provider === "stripe") {
    const signature = c.req.header("stripe-signature")
    // In production: verify stripe signature using stripe SDK
    // For now just acknowledge
    if (body.type === "checkout.session.completed") {
      const workspaceId = body.data?.object?.metadata?.workspaceId
      if (workspaceId) {
        await db.workspace.update({
          where: { id: workspaceId },
          data: { planType: "PRO" },
        }).catch(() => null)
      }
    }
    return c.json({ received: true })
  }

  if (provider === "github") {
    const signature = c.req.header("x-hub-signature-256")
    // In production: verify HMAC signature
    return c.json({ received: true })
  }

  // Other providers — log to DB if we can identify the workspace
  return c.json({ received: true })
})
