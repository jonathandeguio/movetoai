import { Hono } from "hono"
import { zValidator } from "@hono/zod-validator"
import { z } from "zod"
import { randomUUID } from "node:crypto"
import type { HonoEnv } from "../types/env.js"
import { db } from "../lib/db.js"
import { authMiddleware } from "../middleware/auth.js"
import { workspaceMiddleware } from "../middleware/workspace.js"
import { ApiError } from "../lib/errors.js"
import { parsePagination } from "../lib/paginate.js"

export const processRoutes = new Hono<HonoEnv>()

processRoutes.use("*", authMiddleware, workspaceMiddleware)

// GET /catalog — static data — placed before :id to avoid conflict
processRoutes.get("/catalog", async (c) => {
  const { domain, level, q } = c.req.query()

  // Try to import the catalogue statically; fall back gracefully if file not found
  type CatItem = { code: string; name_fr: string; name_en: string; level?: number; parent?: string | null; description_fr?: string; ai_potential?: string; [key: string]: unknown }
  let catalogue: CatItem[] = []
  try {
    const mod = await import("../../../../lib/seed/process-catalogue.js").catch(() => null)
    if (mod) catalogue = (mod.PROCESS_CATALOGUE ?? []) as CatItem[]
  } catch {
    catalogue = []
  }

  // Flatten nested children into flat list
  function flatten(items: CatItem[]): CatItem[] {
    return items.flatMap((i) => [i, ...flatten((i.children as CatItem[] | undefined) ?? [])])
  }
  const flat = flatten(catalogue)

  let results = flat
  if (domain) results = results.filter((p) => p.parent === domain || p.code === domain)
  if (level) results = results.filter((p) => String(p.level) === level)
  if (q) results = results.filter((p) => p.name_fr?.toLowerCase().includes(q.toLowerCase()) || p.name_en?.toLowerCase().includes(q.toLowerCase()))

  return c.json({ data: results, total: results.length })
})

processRoutes.post(
  "/catalog/import",
  zValidator("json", z.object({ codes: z.array(z.string()), domainId: z.string().optional() })),
  async (c) => {
    const workspaceId = c.get("workspaceId")
    const { codes, domainId } = c.req.valid("json")

    type CatItemFlat = { code: string; name_fr?: string; name_en?: string; description_fr?: string; children?: CatItemFlat[]; [key: string]: unknown }
    function flattenImport(items: CatItemFlat[]): CatItemFlat[] {
      return items.flatMap((i) => [i, ...flattenImport(i.children ?? [])])
    }
    let catalogue: CatItemFlat[] = []
    try {
      const mod = await import("../../../../lib/seed/process-catalogue.js").catch(() => null)
      if (mod) catalogue = flattenImport((mod.PROCESS_CATALOGUE ?? []) as unknown as CatItemFlat[])
    } catch {
      catalogue = []
    }

    // Need a domainId to create processes — get first domain if not provided
    let resolvedDomainId = domainId
    if (!resolvedDomainId) {
      const firstDomain = await db.domain.findFirst({ where: { workspaceId, deletedAt: null } })
      if (!firstDomain) throw new ApiError(400, "NO_DOMAIN", "No domain found. Please provide a domainId or create a domain first.")
      resolvedDomainId = firstDomain.id
    }

    let created = 0
    let skipped = 0
    const processes = []

    for (const code of codes) {
      const existing = await db.process.findFirst({ where: { workspaceId, catalogCode: code } })
      if (existing) { skipped++; continue }

      const entry = catalogue.find((p) => p.code === code)
      const slug = `${code.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`

      const process = await db.process.create({
        data: {
          workspaceId,
          domainId: resolvedDomainId,
          name: (entry?.name_fr ?? entry?.name_en ?? code) as string,
          slug,
          description: (entry?.description_fr as string | undefined) ?? null,
          catalogCode: code,
        },
      })
      processes.push(process)
      created++
    }

    return c.json({ created, skipped, processes })
  }
)

processRoutes.get("/", async (c) => {
  const workspaceId = c.get("workspaceId")
  const { domain, owner, q, page, limit, sort } = c.req.query()
  const pagination = parsePagination({ page, limit, sort })

  const where = {
    workspaceId,
    deletedAt: null as null,
    ...(domain ? { domainId: domain } : {}),
    ...(owner ? { ownerId: owner } : {}),
    ...(q ? { name: { contains: q } } : {}),
  }

  const [data, total] = await Promise.all([
    db.process.findMany({
      where,
      include: {
        domain: { select: { id: true, name: true } },
        owner: { select: { id: true, name: true } },
        diagram: { select: { id: true } },
      },
      skip: pagination.skip,
      take: pagination.take,
      orderBy: pagination.orderBy,
    }),
    db.process.count({ where }),
  ])

  return c.json({ data, meta: { total, page: parseInt(page ?? "1"), limit: parseInt(limit ?? "20") } })
})

processRoutes.post(
  "/",
  zValidator("json", z.object({
    name: z.string().min(1),
    description: z.string().optional(),
    domainId: z.string(),
    ownerId: z.string().optional(),
    aiPotential: z.string().optional(),
    painLevel: z.number().optional(),
    catalogCode: z.string().optional(),
  })),
  async (c) => {
    const workspaceId = c.get("workspaceId")
    const body = c.req.valid("json")
    const slug = `${body.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now()}`

    const process = await db.process.create({
      data: { workspaceId, ...body, slug },
    })
    return c.json(process, 201)
  }
)

processRoutes.get("/:id", async (c) => {
  const workspaceId = c.get("workspaceId")
  const id = c.req.param("id")

  const process = await db.process.findFirst({
    where: { id, workspaceId, deletedAt: null },
    include: {
      domain: true,
      owner: { select: { id: true, name: true, email: true } },
      capability: true,
      steps: { orderBy: { order: "asc" } },
      diagram: true,
      processKpis: true,
      _count: { select: { opportunities: true } },
    },
  })
  if (!process) throw new ApiError(404, "NOT_FOUND", "Process not found")
  return c.json(process)
})

processRoutes.patch(
  "/:id",
  zValidator("json", z.object({
    name: z.string().optional(),
    description: z.string().optional(),
    domainId: z.string().optional(),
    ownerId: z.string().optional(),
    aiPotential: z.string().optional(),
    painLevel: z.number().optional(),
    processStatus: z.string().optional(),
    maturityScore: z.number().optional(),
    maturityLevel: z.string().optional(),
  })),
  async (c) => {
    const workspaceId = c.get("workspaceId")
    const id = c.req.param("id")

    const existing = await db.process.findFirst({ where: { id, workspaceId, deletedAt: null } })
    if (!existing) throw new ApiError(404, "NOT_FOUND", "Process not found")

    const updated = await db.process.update({ where: { id }, data: c.req.valid("json") })
    return c.json(updated)
  }
)

processRoutes.delete("/:id", async (c) => {
  const workspaceId = c.get("workspaceId")
  const id = c.req.param("id")

  const existing = await db.process.findFirst({ where: { id, workspaceId, deletedAt: null } })
  if (!existing) throw new ApiError(404, "NOT_FOUND", "Process not found")

  await db.process.update({ where: { id }, data: { deletedAt: new Date() } })
  return c.body(null, 204)
})

processRoutes.get("/:id/bpmn", async (c) => {
  const workspaceId = c.get("workspaceId")
  const id = c.req.param("id")

  const process = await db.process.findFirst({ where: { id, workspaceId, deletedAt: null } })
  if (!process) throw new ApiError(404, "NOT_FOUND", "Process not found")

  const diagram = await db.processDiagram.findFirst({
    where: { processId: id },
    orderBy: { createdAt: "desc" },
  })
  if (!diagram) throw new ApiError(404, "NOT_FOUND", "No BPMN diagram found")
  return c.json(diagram)
})

processRoutes.put(
  "/:id/bpmn",
  zValidator("json", z.object({ xml: z.string() })),
  async (c) => {
    const workspaceId = c.get("workspaceId")
    const userId = c.get("userId")
    const id = c.req.param("id")
    const { xml } = c.req.valid("json")

    const process = await db.process.findFirst({ where: { id, workspaceId, deletedAt: null } })
    if (!process) throw new ApiError(404, "NOT_FOUND", "Process not found")

    const diagram = await db.processDiagram.upsert({
      where: { processId: id },
      create: { processId: id, xml, createdBy: userId, updatedBy: userId },
      update: { xml, updatedBy: userId, updatedAt: new Date() },
    })

    const versionCount = await db.processDiagramVersion.count({ where: { diagramId: diagram.id } })
    await db.processDiagramVersion.create({
      data: {
        diagramId: diagram.id,
        versionNumber: versionCount + 1,
        xml,
        createdBy: userId,
      },
    })

    await db.processHistory.create({
      data: { processId: id, userId, action: "bpmn_updated", description: "BPMN diagram updated" },
    })

    return c.json(diagram)
  }
)

processRoutes.post("/:id/bpmn/generate", async (c) => {
  const workspaceId = c.get("workspaceId")
  const userId = c.get("userId")
  const id = c.req.param("id")

  const process = await db.process.findFirst({ where: { id, workspaceId, deletedAt: null } })
  if (!process) throw new ApiError(404, "NOT_FOUND", "Process not found")

  const jobId = randomUUID()

  await db.processHistory.create({
    data: { processId: id, userId, action: "bpmn_generated", description: `Generation job queued: ${jobId}` },
  })

  return c.json({ jobId, status: "queued" })
})

processRoutes.get("/:id/bpmn/versions", async (c) => {
  const workspaceId = c.get("workspaceId")
  const id = c.req.param("id")

  const process = await db.process.findFirst({ where: { id, workspaceId, deletedAt: null } })
  if (!process) throw new ApiError(404, "NOT_FOUND", "Process not found")

  const diagram = await db.processDiagram.findFirst({ where: { processId: id } })
  if (!diagram) return c.json([])

  const versions = await db.processDiagramVersion.findMany({
    where: { diagramId: diagram.id },
    orderBy: { createdAt: "desc" },
  })
  return c.json(versions)
})

processRoutes.post("/:id/bpmn/versions/:vId/restore", async (c) => {
  const workspaceId = c.get("workspaceId")
  const userId = c.get("userId")
  const id = c.req.param("id")
  const vId = c.req.param("vId")

  const process = await db.process.findFirst({ where: { id, workspaceId, deletedAt: null } })
  if (!process) throw new ApiError(404, "NOT_FOUND", "Process not found")

  const version = await db.processDiagramVersion.findUnique({ where: { id: vId } })
  if (!version) throw new ApiError(404, "NOT_FOUND", "Version not found")

  const diagram = await db.processDiagram.update({
    where: { processId: id },
    data: { xml: version.xml, updatedBy: userId },
  })

  await db.processHistory.create({
    data: { processId: id, userId, action: "bpmn_restored", description: `Restored version ${version.versionNumber}` },
  })

  return c.json(diagram)
})

processRoutes.get("/:id/steps", async (c) => {
  const workspaceId = c.get("workspaceId")
  const id = c.req.param("id")

  const process = await db.process.findFirst({ where: { id, workspaceId, deletedAt: null } })
  if (!process) throw new ApiError(404, "NOT_FOUND", "Process not found")

  const steps = await db.processStep.findMany({ where: { processId: id }, orderBy: { order: "asc" } })
  return c.json(steps)
})

processRoutes.post(
  "/:id/steps",
  zValidator("json", z.object({ name: z.string(), description: z.string().optional(), order: z.number().optional() })),
  async (c) => {
    const workspaceId = c.get("workspaceId")
    const id = c.req.param("id")

    const process = await db.process.findFirst({ where: { id, workspaceId, deletedAt: null } })
    if (!process) throw new ApiError(404, "NOT_FOUND", "Process not found")

    const body = c.req.valid("json")
    const maxOrder = await db.processStep.aggregate({ where: { processId: id }, _max: { order: true } })
    const order = body.order ?? (maxOrder._max.order ?? 0) + 1

    const step = await db.processStep.create({
      data: { processId: id, name: body.name, description: body.description, order },
    })
    return c.json(step, 201)
  }
)

processRoutes.patch(
  "/:id/steps/:stepId",
  zValidator("json", z.object({ name: z.string().optional(), description: z.string().optional(), order: z.number().optional() })),
  async (c) => {
    const workspaceId = c.get("workspaceId")
    const id = c.req.param("id")
    const stepId = c.req.param("stepId")

    const process = await db.process.findFirst({ where: { id, workspaceId, deletedAt: null } })
    if (!process) throw new ApiError(404, "NOT_FOUND", "Process not found")

    const updated = await db.processStep.update({ where: { id: stepId }, data: c.req.valid("json") })
    return c.json(updated)
  }
)

processRoutes.delete("/:id/steps/:stepId", async (c) => {
  const workspaceId = c.get("workspaceId")
  const id = c.req.param("id")
  const stepId = c.req.param("stepId")

  const process = await db.process.findFirst({ where: { id, workspaceId, deletedAt: null } })
  if (!process) throw new ApiError(404, "NOT_FOUND", "Process not found")

  await db.processStep.delete({ where: { id: stepId } })
  return c.body(null, 204)
})

processRoutes.post(
  "/:id/steps/reorder",
  zValidator("json", z.object({ steps: z.array(z.object({ id: z.string(), order: z.number() })) })),
  async (c) => {
    const workspaceId = c.get("workspaceId")
    const id = c.req.param("id")

    const process = await db.process.findFirst({ where: { id, workspaceId, deletedAt: null } })
    if (!process) throw new ApiError(404, "NOT_FOUND", "Process not found")

    const { steps } = c.req.valid("json")
    await Promise.all(steps.map((s) => db.processStep.update({ where: { id: s.id }, data: { order: s.order } })))
    return c.json({ success: true })
  }
)

processRoutes.get("/:id/maturity", async (c) => {
  const workspaceId = c.get("workspaceId")
  const id = c.req.param("id")

  const process = await db.process.findFirst({
    where: { id, workspaceId, deletedAt: null },
    include: { steps: true, diagram: true, processKpis: true },
  })
  if (!process) throw new ApiError(404, "NOT_FOUND", "Process not found")

  const criteria = {
    description: process.description && process.description.length > 50 ? 1 : 0,
    steps: process.steps.length >= 3 ? 1 : 0,
    bpmn: process.diagram ? 1 : 0,
    kpis: process.processKpis.some((k: { targetValue: number | null }) => k.targetValue !== null) ? 1 : 0,
    governance: process.ownerId ? 1 : 0,
  }

  const score = Object.values(criteria).reduce((a, b) => a + b, 0) * 20
  const level = score >= 80 ? "optimizing" : score >= 60 ? "quantitatively_managed" : score >= 40 ? "defined" : score >= 20 ? "managed" : "initial"

  return c.json({ score, level, criteria })
})

processRoutes.post("/:id/maturity/refresh", async (c) => {
  const workspaceId = c.get("workspaceId")
  const id = c.req.param("id")

  const process = await db.process.findFirst({
    where: { id, workspaceId, deletedAt: null },
    include: { steps: true, diagram: true, processKpis: true },
  })
  if (!process) throw new ApiError(404, "NOT_FOUND", "Process not found")

  const criteria = {
    description: process.description && process.description.length > 50 ? 1 : 0,
    steps: process.steps.length >= 3 ? 1 : 0,
    bpmn: process.diagram ? 1 : 0,
    kpis: process.processKpis.some((k: { targetValue: number | null }) => k.targetValue !== null) ? 1 : 0,
    governance: process.ownerId ? 1 : 0,
  }

  const score = Object.values(criteria).reduce((a, b) => a + b, 0) * 20
  const maturityLevel = score >= 80 ? "optimizing" : score >= 60 ? "quantitatively_managed" : score >= 40 ? "defined" : score >= 20 ? "managed" : "initial"

  await db.process.update({ where: { id }, data: { maturityScore: score, maturityLevel } })
  return c.json({ score, maturityLevel })
})

processRoutes.get("/:id/kpis", async (c) => {
  const workspaceId = c.get("workspaceId")
  const id = c.req.param("id")
  const process = await db.process.findFirst({ where: { id, workspaceId, deletedAt: null } })
  if (!process) throw new ApiError(404, "NOT_FOUND", "Process not found")

  const kpis = await db.processKPI.findMany({ where: { processId: id } })
  return c.json(kpis)
})

processRoutes.post(
  "/:id/kpis",
  zValidator("json", z.object({
    name: z.string(),
    unit: z.string(),
    targetValue: z.number().optional(),
    currentValue: z.number().optional(),
    direction: z.string().optional(),
  })),
  async (c) => {
    const workspaceId = c.get("workspaceId")
    const id = c.req.param("id")
    const process = await db.process.findFirst({ where: { id, workspaceId, deletedAt: null } })
    if (!process) throw new ApiError(404, "NOT_FOUND", "Process not found")

    const kpi = await db.processKPI.create({ data: { processId: id, ...c.req.valid("json") } })
    return c.json(kpi, 201)
  }
)

processRoutes.patch(
  "/:id/kpis/:kpiId",
  zValidator("json", z.object({
    name: z.string().optional(),
    unit: z.string().optional(),
    targetValue: z.number().optional(),
    currentValue: z.number().optional(),
  })),
  async (c) => {
    const workspaceId = c.get("workspaceId")
    const id = c.req.param("id")
    const kpiId = c.req.param("kpiId")
    const process = await db.process.findFirst({ where: { id, workspaceId, deletedAt: null } })
    if (!process) throw new ApiError(404, "NOT_FOUND", "Process not found")

    const updated = await db.processKPI.update({ where: { id: kpiId }, data: c.req.valid("json") })
    return c.json(updated)
  }
)

processRoutes.delete("/:id/kpis/:kpiId", async (c) => {
  const workspaceId = c.get("workspaceId")
  const id = c.req.param("id")
  const kpiId = c.req.param("kpiId")
  const process = await db.process.findFirst({ where: { id, workspaceId, deletedAt: null } })
  if (!process) throw new ApiError(404, "NOT_FOUND", "Process not found")

  await db.processKPI.delete({ where: { id: kpiId } })
  return c.body(null, 204)
})

processRoutes.get("/:id/dependencies", async (c) => {
  const workspaceId = c.get("workspaceId")
  const id = c.req.param("id")
  const process = await db.process.findFirst({ where: { id, workspaceId, deletedAt: null } })
  if (!process) throw new ApiError(404, "NOT_FOUND", "Process not found")

  const [upstream, downstream] = await Promise.all([
    db.processDependency.findMany({ where: { targetId: id }, include: { source: { select: { id: true, name: true } } } }),
    db.processDependency.findMany({ where: { sourceId: id }, include: { target: { select: { id: true, name: true } } } }),
  ])

  return c.json({ upstream, downstream })
})

processRoutes.post(
  "/:id/dependencies",
  zValidator("json", z.object({
    targetId: z.string().optional(),
    sourceId: z.string().optional(),
    type: z.string().optional(),
  })),
  async (c) => {
    const workspaceId = c.get("workspaceId")
    const id = c.req.param("id")
    const process = await db.process.findFirst({ where: { id, workspaceId, deletedAt: null } })
    if (!process) throw new ApiError(404, "NOT_FOUND", "Process not found")

    const { targetId, sourceId, type } = c.req.valid("json")

    let dep
    if (targetId) {
      dep = await db.processDependency.create({
        data: { sourceId: id, targetId, dependencyType: type ?? "upstream" },
      })
    } else if (sourceId) {
      dep = await db.processDependency.create({
        data: { sourceId, targetId: id, dependencyType: type ?? "downstream" },
      })
    } else {
      throw new ApiError(400, "INVALID_INPUT", "Either targetId or sourceId must be provided")
    }

    return c.json(dep, 201)
  }
)

processRoutes.delete("/:id/dependencies/:depId", async (c) => {
  const workspaceId = c.get("workspaceId")
  const id = c.req.param("id")
  const depId = c.req.param("depId")
  const process = await db.process.findFirst({ where: { id, workspaceId, deletedAt: null } })
  if (!process) throw new ApiError(404, "NOT_FOUND", "Process not found")

  await db.processDependency.delete({ where: { id: depId } })
  return c.body(null, 204)
})

processRoutes.get("/:id/certifications", async (c) => {
  const workspaceId = c.get("workspaceId")
  const id = c.req.param("id")

  const process = await db.process.findFirst({ where: { id, workspaceId, deletedAt: null } })
  if (!process) throw new ApiError(404, "NOT_FOUND", "Process not found")

  const allCerts = await db.certificationCatalog.findMany({ where: { isActive: true } })

  const catalogCode = process.catalogCode

  const suggested = catalogCode
    ? allCerts.filter((cert: { linkedProcessCodes: unknown }) => {
        const codes = cert.linkedProcessCodes as string[]
        return Array.isArray(codes) && codes.includes(catalogCode)
      })
    : []

  const directLinks = await db.certificationLink.findMany({
    where: { entityType: "process", entityId: id },
    include: { certification: { include: { catalog: true } } },
  })

  return c.json({ linked: directLinks, suggested })
})

processRoutes.post("/:id/certifications/:certId/link", async (c) => {
  const workspaceId = c.get("workspaceId")
  const id = c.req.param("id")
  const certId = c.req.param("certId")

  const process = await db.process.findFirst({ where: { id, workspaceId, deletedAt: null } })
  if (!process) throw new ApiError(404, "NOT_FOUND", "Process not found")

  const cert = await db.workspaceCertification.findFirst({ where: { id: certId, workspaceId } })
  if (!cert) throw new ApiError(404, "NOT_FOUND", "Certification not found")

  const link = await db.certificationLink.upsert({
    where: { workspaceCertificationId_entityType_entityId: { workspaceCertificationId: certId, entityType: "process", entityId: id } },
    create: { workspaceCertificationId: certId, entityType: "process", entityId: id },
    update: {},
  })

  return c.json(link, 201)
})

processRoutes.delete("/:id/certifications/:certId/link", async (c) => {
  const workspaceId = c.get("workspaceId")
  const id = c.req.param("id")
  const certId = c.req.param("certId")

  const process = await db.process.findFirst({ where: { id, workspaceId, deletedAt: null } })
  if (!process) throw new ApiError(404, "NOT_FOUND", "Process not found")

  await db.certificationLink.deleteMany({
    where: { workspaceCertificationId: certId, entityType: "process", entityId: id },
  })
  return c.body(null, 204)
})

processRoutes.get("/:id/opportunities", async (c) => {
  const workspaceId = c.get("workspaceId")
  const id = c.req.param("id")

  const process = await db.process.findFirst({ where: { id, workspaceId, deletedAt: null } })
  if (!process) throw new ApiError(404, "NOT_FOUND", "Process not found")

  const opps = await db.opportunity.findMany({
    where: { processId: id, workspaceId, deletedAt: null },
    select: { id: true, title: true, status: true, priorityLevel: true, gainEstimate: true },
  })
  return c.json(opps)
})

processRoutes.get("/:id/history", async (c) => {
  const workspaceId = c.get("workspaceId")
  const id = c.req.param("id")

  const process = await db.process.findFirst({ where: { id, workspaceId, deletedAt: null } })
  if (!process) throw new ApiError(404, "NOT_FOUND", "Process not found")

  const history = await db.processHistory.findMany({
    where: { processId: id },
    orderBy: { createdAt: "desc" },
    take: 50,
  })
  return c.json(history)
})
