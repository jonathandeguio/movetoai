import { Hono } from "hono"
import type { HonoEnv } from "../../types/env.js"
import { decisionRoutes } from "./decisions.js"
import { approvalQueueRoutes } from "./approval-queue.js"
import { attestationRoutes } from "./attestations.js"
import { archDecisionRoutes } from "./arch-decisions.js"

export const governanceRoutes = new Hono<HonoEnv>()

governanceRoutes.route("/decisions", decisionRoutes)
governanceRoutes.route("/approval-queue", approvalQueueRoutes)
governanceRoutes.route("/attestations", attestationRoutes)
governanceRoutes.route("/arch-decisions", archDecisionRoutes)
