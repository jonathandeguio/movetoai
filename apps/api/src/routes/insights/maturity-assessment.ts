import { Hono } from "hono"
import { zValidator } from "@hono/zod-validator"
import { z } from "zod"
import type { HonoEnv } from "../../types/env.js"
import { db } from "../../lib/db.js"
import { authMiddleware } from "../../middleware/auth.js"
import { workspaceMiddleware } from "../../middleware/workspace.js"
import { ApiError } from "../../lib/errors.js"

export const maturityAssessmentRoutes = new Hono<HonoEnv>()

maturityAssessmentRoutes.use("*", authMiddleware, workspaceMiddleware)

maturityAssessmentRoutes.get("/", async (c) => {
  const workspaceId = c.get("workspaceId")

  const latest = await db.aIReadinessAssessment.findFirst({
    where: { workspaceId },
    orderBy: { createdAt: "desc" },
  })

  return c.json(latest ?? null)
})

maturityAssessmentRoutes.post(
  "/",
  zValidator("json", z.object({
    entityType: z.string().default("workspace"),
    entityId: z.string().optional(),
    dataQualityScore: z.number().min(0).max(100),
    integrationScore: z.number().min(0).max(100),
    complianceScore: z.number().min(0).max(100),
    automationPotential: z.number().min(0).max(100),
    operationalFitScore: z.number().min(0).max(100),
  })),
  async (c) => {
    const workspaceId = c.get("workspaceId")
    const userId = c.get("userId")
    const body = c.req.valid("json")

    const overallScore =
      (body.dataQualityScore + body.integrationScore + body.complianceScore + body.automationPotential + body.operationalFitScore) / 5

    const classification =
      overallScore >= 80 ? "leader" : overallScore >= 60 ? "advanced" : overallScore >= 40 ? "developing" : "beginner"

    const assessment = await db.aIReadinessAssessment.create({
      data: {
        workspaceId,
        entityType: body.entityType,
        entityId: body.entityId ?? workspaceId,
        assessedAt: new Date(),
        assessedBy: userId,
        dataQualityScore: body.dataQualityScore,
        integrationScore: body.integrationScore,
        complianceScore: body.complianceScore,
        automationPotential: body.automationPotential,
        operationalFitScore: body.operationalFitScore,
        overallScore,
        classification,
        breakdown: body,
        recommendations: [],
      },
    })
    return c.json(assessment, 201)
  }
)

maturityAssessmentRoutes.get("/:id/report", async (c) => {
  const workspaceId = c.get("workspaceId")
  const id = c.req.param("id")

  const assessment = await db.aIReadinessAssessment.findFirst({ where: { id, workspaceId } })
  if (!assessment) throw new ApiError(404, "NOT_FOUND", "Assessment not found")

  return c.json({
    ...assessment,
    dimensions: [
      { name: "Data Quality", score: assessment.dataQualityScore, weight: 0.2 },
      { name: "Integration", score: assessment.integrationScore, weight: 0.2 },
      { name: "Compliance", score: assessment.complianceScore, weight: 0.2 },
      { name: "Automation Potential", score: assessment.automationPotential, weight: 0.2 },
      { name: "Operational Fit", score: assessment.operationalFitScore, weight: 0.2 },
    ],
  })
})
