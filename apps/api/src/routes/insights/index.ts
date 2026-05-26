import { Hono } from "hono"
import type { HonoEnv } from "../../types/env.js"
import { techRadarRoutes } from "./tech-radar.js"
import { maturityAssessmentRoutes } from "./maturity-assessment.js"
import { dependencyGraphRoutes } from "./dependency-graph.js"

export const insightRoutes = new Hono<HonoEnv>()

insightRoutes.route("/tech-radar", techRadarRoutes)
insightRoutes.route("/maturity-assessment", maturityAssessmentRoutes)
insightRoutes.route("/dependency-graph", dependencyGraphRoutes)
