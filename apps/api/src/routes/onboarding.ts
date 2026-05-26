import { Hono } from "hono"
import { zValidator } from "@hono/zod-validator"
import { z } from "zod"
import type { HonoEnv } from "../types/env.js"
import { db } from "../lib/db.js"
import { authMiddleware } from "../middleware/auth.js"
import { workspaceMiddleware } from "../middleware/workspace.js"

export const onboardingRoutes = new Hono<HonoEnv>()

onboardingRoutes.use("*", authMiddleware, workspaceMiddleware)

onboardingRoutes.patch(
  "/sector",
  zValidator("json", z.object({ sectorCode: z.string(), companySize: z.string() })),
  async (c) => {
    const workspaceId = c.get("workspaceId")
    const { sectorCode, companySize } = c.req.valid("json")

    const updated = await db.workspace.update({
      where: { id: workspaceId },
      data: { sectorCode, companySize },
    })
    return c.json(updated)
  }
)

onboardingRoutes.post(
  "/certifications",
  zValidator("json", z.object({
    certifications: z.array(z.object({ catalogId: z.string(), status: z.string() })),
  })),
  async (c) => {
    const workspaceId = c.get("workspaceId")
    const { certifications } = c.req.valid("json")

    const results = await Promise.all(
      certifications.map((cert) =>
        db.workspaceCertification.upsert({
          where: { workspaceId_catalogId: { workspaceId, catalogId: cert.catalogId } },
          create: { workspaceId, catalogId: cert.catalogId, status: cert.status, source: "onboarding_target" },
          update: { status: cert.status },
        })
      )
    )

    return c.json({ created: results.length, certifications: results })
  }
)

onboardingRoutes.post(
  "/processes",
  zValidator("json", z.object({
    codes: z.array(z.string()),
    certificationIds: z.array(z.string()).optional(),
  })),
  async (c) => {
    const workspaceId = c.get("workspaceId")
    const { codes, certificationIds } = c.req.valid("json")

    type CatFlat = { code: string; name_fr?: string; name_en?: string; description_fr?: string; children?: CatFlat[]; [key: string]: unknown }
    function flatCat(items: CatFlat[]): CatFlat[] { return items.flatMap((i) => [i, ...flatCat(i.children ?? [])]) }
    let catalogue: CatFlat[] = []
    try {
      const mod = await import("../../../../lib/seed/process-catalogue.js").catch(() => null)
      if (mod) catalogue = flatCat((mod.PROCESS_CATALOGUE ?? []) as unknown as CatFlat[])
    } catch {
      catalogue = []
    }

    const firstDomain = await db.domain.findFirst({ where: { workspaceId, deletedAt: null } })

    let created = 0
    let skipped = 0
    const processes = []

    for (const code of codes) {
      const existing = await db.process.findFirst({ where: { workspaceId, catalogCode: code } })
      if (existing) { skipped++; continue }

      if (!firstDomain) { skipped++; continue }

      const entry = catalogue.find((p) => p.code === code)
      const slug = `${code.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`

      const process = await db.process.create({
        data: {
          workspaceId,
          domainId: firstDomain.id,
          name: ((entry?.name_fr ?? entry?.name_en) as string | undefined) ?? code,
          slug,
          catalogCode: code,
          description: (entry?.description_fr as string | undefined) ?? null,
        },
      })

      if (certificationIds?.length) {
        await Promise.all(
          certificationIds.map((certId) =>
            db.certificationLink.upsert({
              where: { workspaceCertificationId_entityType_entityId: { workspaceCertificationId: certId, entityType: "process", entityId: process.id } },
              create: { workspaceCertificationId: certId, entityType: "process", entityId: process.id },
              update: {},
            }).catch(() => null)
          )
        )
      }

      processes.push(process)
      created++
    }

    return c.json({ created, skipped, processes })
  }
)

onboardingRoutes.post(
  "/opportunities",
  zValidator("json", z.object({
    opportunities: z.array(z.object({
      title: z.string(),
      processId: z.string(),
      priorityLevel: z.string().optional(),
      gainEstimate: z.string().optional(),
    })),
  })),
  async (c) => {
    const workspaceId = c.get("workspaceId")
    const userId = c.get("userId")
    const { opportunities } = c.req.valid("json")

    // Need domainId and capabilityId and opportunityTypeId for creation
    const [firstDomain, firstCapability, firstType] = await Promise.all([
      db.domain.findFirst({ where: { workspaceId, deletedAt: null } }),
      db.capability.findFirst({ where: { workspaceId, deletedAt: null } }),
      db.opportunityType.findFirst({ where: { workspaceId } }),
    ])

    if (!firstDomain || !firstCapability || !firstType) {
      return c.json({ error: "Missing domain, capability, or opportunity type" }, 400)
    }

    const created = await Promise.all(
      opportunities.map((opp) =>
        db.opportunity.create({
          data: {
            workspaceId,
            createdById: userId,
            title: opp.title,
            processId: opp.processId,
            domainId: firstDomain.id,
            capabilityId: firstCapability.id,
            opportunityTypeId: firstType.id,
            priorityLevel: opp.priorityLevel ?? "P2",
            gainEstimate: opp.gainEstimate,
          },
        })
      )
    )

    return c.json({ created: created.length, opportunities: created })
  }
)

onboardingRoutes.post("/complete", async (c) => {
  const workspaceId = c.get("workspaceId")

  await db.workspace.update({ where: { id: workspaceId }, data: { onboardingCompleted: true } })
  return c.json({ success: true })
})
