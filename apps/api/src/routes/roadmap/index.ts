import { Hono } from "hono"
import type { HonoEnv } from "../../types/env.js"
import { initiativeRoutes } from "./initiatives.js"

export const roadmapRoutes = new Hono<HonoEnv>()

roadmapRoutes.route("/initiatives", initiativeRoutes)
