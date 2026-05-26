import { Hono } from "hono"
import type { HonoEnv } from "../../types/env.js"
import { capabilityRoutes } from "./capabilities.js"
import { applicationRoutes } from "./applications.js"
import { dataSourceRoutes } from "./data-sources.js"
import { domainRoutes } from "./domains.js"

export const knowledgeRoutes = new Hono<HonoEnv>()

knowledgeRoutes.route("/capabilities", capabilityRoutes)
knowledgeRoutes.route("/applications", applicationRoutes)
knowledgeRoutes.route("/data-sources", dataSourceRoutes)
knowledgeRoutes.route("/domains", domainRoutes)
