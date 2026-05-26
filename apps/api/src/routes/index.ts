import type { Hono } from "hono"
import type { HonoEnv } from "../types/env.js"
import { authRoutes } from "./auth.js"
import { workspaceRoutes } from "./workspaces.js"
import { processRoutes } from "./processes.js"
import { opportunityRoutes } from "./opportunities.js"
import { certificationRoutes } from "./certifications.js"
import { knowledgeRoutes } from "./knowledge/index.js"
import { governanceRoutes } from "./governance/index.js"
import { roadmapRoutes } from "./roadmap/index.js"
import { analyticsRoutes } from "./analytics.js"
import { insightRoutes } from "./insights/index.js"
import { ariaRoutes } from "./aria.js"
import { notificationRoutes } from "./notifications.js"
import { onboardingRoutes } from "./onboarding.js"
import { adminRoutes } from "./admin/index.js"
import { profileRoutes } from "./profile.js"
import { publicRoutes } from "./public.js"

export function mountRoutes(app: Hono<HonoEnv>): void {
  app.route("/api/v1/auth", authRoutes)
  app.route("/api/v1/workspaces", workspaceRoutes)
  app.route("/api/v1/processes", processRoutes)
  app.route("/api/v1/opportunities", opportunityRoutes)
  app.route("/api/v1/certifications", certificationRoutes)
  app.route("/api/v1/knowledge", knowledgeRoutes)
  app.route("/api/v1/governance", governanceRoutes)
  app.route("/api/v1/roadmap", roadmapRoutes)
  app.route("/api/v1/analytics", analyticsRoutes)
  app.route("/api/v1/insights", insightRoutes)
  app.route("/api/v1/aria", ariaRoutes)
  app.route("/api/v1/notifications", notificationRoutes)
  app.route("/api/v1/onboarding", onboardingRoutes)
  app.route("/api/v1/admin", adminRoutes)
  app.route("/api/v1/profile", profileRoutes)
  app.route("/api/v1/public", publicRoutes)
}
