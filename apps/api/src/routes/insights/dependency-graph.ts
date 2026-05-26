import { Hono } from "hono"
import type { HonoEnv } from "../../types/env.js"
import { db } from "../../lib/db.js"
import { authMiddleware } from "../../middleware/auth.js"
import { workspaceMiddleware } from "../../middleware/workspace.js"

export const dependencyGraphRoutes = new Hono<HonoEnv>()

dependencyGraphRoutes.use("*", authMiddleware, workspaceMiddleware)

dependencyGraphRoutes.get("/", async (c) => {
  const workspaceId = c.get("workspaceId")

  const [processes, deps, apps] = await Promise.all([
    db.process.findMany({
      where: { workspaceId, deletedAt: null },
      select: { id: true, name: true, domainId: true },
    }),
    db.processDependency.findMany({
      where: { source: { workspaceId } },
    }),
    db.processApplication.findMany({
      where: { process: { workspaceId } },
      include: { application: { select: { id: true, name: true } } },
    }),
  ])

  type ProcessNode = { id: string; label: string; type: string; domainId: string | null }
  type ProcRow = { id: string; name: string; domainId: string | null }
  const processNodes: ProcessNode[] = (processes as ProcRow[]).map((p) => ({ id: p.id, label: p.name, type: "process", domainId: p.domainId }))

  type AppEdge = { processId: string; applicationId: string; application: { id: string; name: string } }
  const appIds = new Set(apps.map((a: AppEdge) => a.applicationId))
  const appNodes = (apps as AppEdge[])
    .filter((a) => appIds.has(a.applicationId))
    .reduce<Array<{ id: string; label: string; type: string }>>((acc, a) => {
      if (!acc.find((n) => n.id === a.applicationId)) {
        acc.push({ id: a.applicationId, label: a.application.name, type: "application" })
      }
      return acc
    }, [])

  type DepEdge = { sourceId: string; targetId: string; dependencyType?: string | null }
  const depEdges = (deps as DepEdge[]).map((d) => ({ source: d.sourceId, target: d.targetId, type: d.dependencyType }))
  const appEdges = (apps as AppEdge[]).map((a) => ({ source: a.processId, target: a.applicationId, type: "uses" }))

  return c.json({ nodes: [...processNodes, ...appNodes], edges: [...depEdges, ...appEdges] })
})
