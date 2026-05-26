import { Hono } from "hono"
import { cors } from "hono/cors"
import { logger } from "hono/logger"
import { secureHeaders } from "hono/secure-headers"
import type { HonoEnv } from "./types/env.js"
import { mountRoutes } from "./routes/index.js"
import { errorHandler } from "./lib/errors.js"

export function createApp(): Hono<HonoEnv> {
  const app = new Hono<HonoEnv>()

  app.use("*", logger())
  app.use("*", cors({ origin: process.env.CORS_ORIGIN ?? "*", credentials: true }))
  app.use("*", secureHeaders())

  mountRoutes(app)

  app.onError((err, c) => errorHandler(err, c))
  app.notFound((c) => c.json({ error: { code: "NOT_FOUND", message: "Route not found" } }, 404))

  return app
}
