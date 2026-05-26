import { Hono } from "hono"
import { zValidator } from "@hono/zod-validator"
import { z } from "zod"
import type { HonoEnv } from "../types/env.js"
import { db } from "../lib/db.js"
import { authMiddleware } from "../middleware/auth.js"
import { workspaceMiddleware } from "../middleware/workspace.js"
import { ApiError } from "../lib/errors.js"

export const certificationRoutes = new Hono<HonoEnv>()

certificationRoutes.use("*", authMiddleware, workspaceMiddleware)

certificationRoutes.get("/catalog", async (c) => {
  const { sector } = c.req.query()

  const catalogs = await db.certificationCatalog.findMany({
    where: { isActive: true },
    orderBy: { family: "asc" },
  })

  const results = sector
    ? catalogs.filter((cert: { sectors: unknown; mandatorySectors: unknown; isMandatory: boolean }) => {
        const sectors = cert.sectors as string[] | null
        return Array.isArray(sectors) && sectors.includes(sector)
      })
    : catalogs

  return c.json(results)
})

certificationRoutes.get("/catalog/:code", async (c) => {
  const code = c.req.param("code")
  const catalog = await db.certificationCatalog.findUnique({ where: { code } })
  if (!catalog) throw new ApiError(404, "NOT_FOUND", "Certification catalog entry not found")
  return c.json(catalog)
})

certificationRoutes.get("/by-sector", async (c) => {
  const { sector } = c.req.query()

  const catalogs = await db.certificationCatalog.findMany({
    where: { isActive: true },
    orderBy: { isMandatory: "desc" },
  })

  const sectorFiltered = sector
    ? catalogs.filter((cert: { sectors: unknown; mandatorySectors: unknown; isMandatory: boolean }) => {
        const sectors = cert.sectors as string[] | null
        const mandatorySectors = cert.mandatorySectors as string[] | null
        return (
          (Array.isArray(sectors) && sectors.includes(sector)) ||
          (Array.isArray(mandatorySectors) && mandatorySectors.includes(sector))
        )
      })
    : catalogs

  const mandatory = sectorFiltered.filter((cert: { isMandatory: boolean }) => cert.isMandatory)
  const recommended = sectorFiltered.filter((cert: { isMandatory: boolean }) => !cert.isMandatory)

  return c.json({ mandatory, recommended })
})

certificationRoutes.get("/compliance-score", async (c) => {
  const workspaceId = c.get("workspaceId")

  const certs = await db.workspaceCertification.findMany({
    where: { workspaceId },
    include: { catalog: { select: { isMandatory: true, family: true } } },
  })

  const total = certs.length
  type CertWithCatalog = { status: string; catalog: { isMandatory: boolean; family: string } }
  const obtained = (certs as CertWithCatalog[]).filter((wc) => wc.status === "obtained").length
  const mandatory = (certs as CertWithCatalog[]).filter((wc) => wc.catalog.isMandatory)
  const mandatoryObtained = mandatory.filter((wc) => wc.status === "obtained").length

  const score = total > 0 ? Math.round((obtained / total) * 100) : 0
  const mandatoryScore = mandatory.length > 0 ? Math.round((mandatoryObtained / mandatory.length) * 100) : 100

  return c.json({ score, mandatoryScore, total, obtained, mandatory: mandatory.length, mandatoryObtained })
})

certificationRoutes.get("/", async (c) => {
  const workspaceId = c.get("workspaceId")

  const certs = await db.workspaceCertification.findMany({
    where: { workspaceId },
    include: { catalog: true, owner: { select: { id: true, name: true } } },
    orderBy: { createdAt: "desc" },
  })
  return c.json(certs)
})

certificationRoutes.post(
  "/",
  zValidator("json", z.object({
    catalogId: z.string(),
    status: z.string(),
    obtainedDate: z.string().optional(),
    expiryDate: z.string().optional(),
    certifyingBody: z.string().optional(),
    certifyingBodyRef: z.string().optional(),
    ownerId: z.string().optional(),
  })),
  async (c) => {
    const workspaceId = c.get("workspaceId")
    const body = c.req.valid("json")

    const cert = await db.workspaceCertification.upsert({
      where: { workspaceId_catalogId: { workspaceId, catalogId: body.catalogId } },
      create: {
        workspaceId,
        catalogId: body.catalogId,
        status: body.status,
        obtainedDate: body.obtainedDate ? new Date(body.obtainedDate) : null,
        expiryDate: body.expiryDate ? new Date(body.expiryDate) : null,
        certifyingBody: body.certifyingBody,
        certificateRef: body.certifyingBodyRef,
        ownerId: body.ownerId,
      },
      update: {
        status: body.status,
        obtainedDate: body.obtainedDate ? new Date(body.obtainedDate) : undefined,
        expiryDate: body.expiryDate ? new Date(body.expiryDate) : undefined,
        certifyingBody: body.certifyingBody,
        certificateRef: body.certifyingBodyRef,
        ownerId: body.ownerId,
      },
    })
    return c.json(cert, 201)
  }
)

certificationRoutes.get("/:id", async (c) => {
  const workspaceId = c.get("workspaceId")
  const id = c.req.param("id")

  const cert = await db.workspaceCertification.findFirst({
    where: { id, workspaceId },
    include: {
      catalog: true,
      owner: { select: { id: true, name: true } },
      links: true,
    },
  })
  if (!cert) throw new ApiError(404, "NOT_FOUND", "Certification not found")
  return c.json(cert)
})

certificationRoutes.patch(
  "/:id",
  zValidator("json", z.object({
    status: z.string().optional(),
    obtainedDate: z.string().optional(),
    expiryDate: z.string().optional(),
    notes: z.string().optional(),
    ownerId: z.string().optional(),
  })),
  async (c) => {
    const workspaceId = c.get("workspaceId")
    const id = c.req.param("id")

    const existing = await db.workspaceCertification.findFirst({ where: { id, workspaceId } })
    if (!existing) throw new ApiError(404, "NOT_FOUND", "Certification not found")

    const body = c.req.valid("json")
    const updated = await db.workspaceCertification.update({
      where: { id },
      data: {
        ...body,
        obtainedDate: body.obtainedDate ? new Date(body.obtainedDate) : undefined,
        expiryDate: body.expiryDate ? new Date(body.expiryDate) : undefined,
      },
    })
    return c.json(updated)
  }
)

certificationRoutes.delete("/:id", async (c) => {
  const workspaceId = c.get("workspaceId")
  const id = c.req.param("id")

  const existing = await db.workspaceCertification.findFirst({ where: { id, workspaceId } })
  if (!existing) throw new ApiError(404, "NOT_FOUND", "Certification not found")

  await db.workspaceCertification.delete({ where: { id } })
  return c.body(null, 204)
})

certificationRoutes.get("/:id/processes", async (c) => {
  const workspaceId = c.get("workspaceId")
  const id = c.req.param("id")

  const cert = await db.workspaceCertification.findFirst({
    where: { id, workspaceId },
    include: { catalog: true },
  })
  if (!cert) throw new ApiError(404, "NOT_FOUND", "Certification not found")

  const linkedProcessCodes = cert.catalog.linkedProcessCodes as string[]
  const viaCatalogue = linkedProcessCodes?.length
    ? await db.process.findMany({ where: { workspaceId, catalogCode: { in: linkedProcessCodes }, deletedAt: null } })
    : []

  const directLinks = await db.certificationLink.findMany({
    where: { workspaceCertificationId: id, entityType: "process" },
  })
  const directProcessIds = directLinks.map((l: { entityId: string }) => l.entityId)
  const covered = directProcessIds.length
    ? await db.process.findMany({ where: { id: { in: directProcessIds }, workspaceId, deletedAt: null } })
    : []

  const totalProcesses = await db.process.count({ where: { workspaceId, deletedAt: null } })
  const coveragePct = totalProcesses > 0 ? Math.round(((covered.length + viaCatalogue.length) / totalProcesses) * 100) : 0

  return c.json({ covered, via_catalogue: viaCatalogue, coverage_pct: coveragePct })
})

certificationRoutes.post("/:id/processes/:pId/link", async (c) => {
  const workspaceId = c.get("workspaceId")
  const id = c.req.param("id")
  const pId = c.req.param("pId")

  const cert = await db.workspaceCertification.findFirst({ where: { id, workspaceId } })
  if (!cert) throw new ApiError(404, "NOT_FOUND", "Certification not found")

  const link = await db.certificationLink.upsert({
    where: { workspaceCertificationId_entityType_entityId: { workspaceCertificationId: id, entityType: "process", entityId: pId } },
    create: { workspaceCertificationId: id, entityType: "process", entityId: pId },
    update: {},
  })
  return c.json(link, 201)
})

certificationRoutes.delete("/:id/processes/:pId/link", async (c) => {
  const workspaceId = c.get("workspaceId")
  const id = c.req.param("id")
  const pId = c.req.param("pId")

  const cert = await db.workspaceCertification.findFirst({ where: { id, workspaceId } })
  if (!cert) throw new ApiError(404, "NOT_FOUND", "Certification not found")

  await db.certificationLink.deleteMany({
    where: { workspaceCertificationId: id, entityType: "process", entityId: pId },
  })
  return c.body(null, 204)
})
