import { Hono } from "hono"
import type { HonoEnv } from "../types/env.js"
import { db } from "../lib/db.js"
import { authMiddleware } from "../middleware/auth.js"
import { workspaceMiddleware } from "../middleware/workspace.js"

export const analyticsRoutes = new Hono<HonoEnv>()

analyticsRoutes.use("*", authMiddleware, workspaceMiddleware)

analyticsRoutes.get("/overview", async (c) => {
  const workspaceId = c.get("workspaceId")

  const [
    processCount,
    processWithBpmn,
    processWithOwner,
    oppCount,
    oppApproved,
    oppLive,
    certCount,
    certObtained,
    memberCount,
    avgMaturity,
  ] = await Promise.all([
    db.process.count({ where: { workspaceId, deletedAt: null } }),
    db.process.count({ where: { workspaceId, deletedAt: null, diagram: { isNot: null } } }),
    db.process.count({ where: { workspaceId, deletedAt: null, ownerId: { not: null } } }),
    db.opportunity.count({ where: { workspaceId, deletedAt: null } }),
    db.opportunity.count({ where: { workspaceId, status: "APPROVED", deletedAt: null } }),
    db.opportunity.count({ where: { workspaceId, status: "LIVE", deletedAt: null } }),
    db.workspaceCertification.count({ where: { workspaceId } }),
    db.workspaceCertification.count({ where: { workspaceId, status: "obtained" } }),
    db.membership.count({ where: { workspaceId, status: "ACTIVE" } }),
    db.process.aggregate({ where: { workspaceId, deletedAt: null }, _avg: { maturityScore: true } }),
  ])

  return c.json({
    processes: { total: processCount, withBpmn: processWithBpmn, withOwner: processWithOwner },
    opportunities: { total: oppCount, approved: oppApproved, live: oppLive },
    certifications: { total: certCount, obtained: certObtained },
    members: memberCount,
    avgMaturityScore: avgMaturity._avg.maturityScore ?? 0,
  })
})

analyticsRoutes.get("/roi", async (c) => {
  const workspaceId = c.get("workspaceId")

  const opps = await db.opportunity.findMany({
    where: { workspaceId, status: { in: ["LIVE", "CONVERTED"] }, deletedAt: null },
    select: { gainEstimate: true, realizedValue: true, createdAt: true },
  })

  const byMonth: Record<string, { planned: number; actual: number }> = {}
  for (const opp of opps) {
    const month = opp.createdAt.toISOString().slice(0, 7)
    if (!byMonth[month]) byMonth[month] = { planned: 0, actual: 0 }
    if (opp.gainEstimate) byMonth[month].planned++
    if (opp.realizedValue !== null) byMonth[month].actual += Number(opp.realizedValue)
  }

  const timeline = Object.entries(byMonth)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, data]) => ({ month, ...data }))

  return c.json({ timeline })
})

analyticsRoutes.get("/maturity", async (c) => {
  const workspaceId = c.get("workspaceId")

  const assessments = await db.aIReadinessAssessment.findMany({
    where: { workspaceId },
    orderBy: { createdAt: "asc" },
    select: { overallScore: true, classification: true, createdAt: true },
  })

  return c.json(assessments)
})

analyticsRoutes.get("/processes", async (c) => {
  const workspaceId = c.get("workspaceId")

  const [byStatus, byDomain, byMaturity] = await Promise.all([
    db.process.groupBy({ by: ["processStatus"], where: { workspaceId, deletedAt: null }, _count: true }),
    db.process.groupBy({ by: ["domainId"], where: { workspaceId, deletedAt: null }, _count: true }),
    db.process.groupBy({ by: ["maturityLevel"], where: { workspaceId, deletedAt: null }, _count: true }),
  ])

  return c.json({ byStatus, byDomain, byMaturity })
})

analyticsRoutes.get("/opportunities", async (c) => {
  const workspaceId = c.get("workspaceId")

  const statusOrder = ["DRAFT", "IDENTIFIED", "ASSESSING", "VALIDATED", "APPROVED", "IN_PROGRESS", "LIVE"]
  const funnel = await Promise.all(
    statusOrder.map(async (status) => ({
      status,
      count: await db.opportunity.count({ where: { workspaceId, status, deletedAt: null } }),
    }))
  )

  return c.json({ funnel })
})

analyticsRoutes.get("/certifications", async (c) => {
  const workspaceId = c.get("workspaceId")

  const byStatus = await db.workspaceCertification.groupBy({
    by: ["status"],
    where: { workspaceId },
    _count: true,
  })

  const total = byStatus.reduce((acc: number, s: { _count: number }) => acc + s._count, 0)
  type GroupResult = { status: string; _count: number }
  const obtained = (byStatus as GroupResult[]).find((s) => s.status === "obtained")?._count ?? 0
  const planned = (byStatus as GroupResult[]).find((s) => s.status === "planned")?._count ?? 0

  return c.json({ byStatus, total, obtained, planned, missing: total - obtained - planned })
})

analyticsRoutes.get("/adoption", async (c) => {
  const workspaceId = c.get("workspaceId")

  const [total, active, recent] = await Promise.all([
    db.membership.count({ where: { workspaceId } }),
    db.membership.count({ where: { workspaceId, status: "ACTIVE" } }),
    db.membership.count({
      where: {
        workspaceId,
        status: "ACTIVE",
        lastActiveAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
      },
    }),
  ])

  return c.json({ total, active, recentlyActive: recent, inactiveRate: active > 0 ? Math.round(((active - recent) / active) * 100) : 0 })
})
