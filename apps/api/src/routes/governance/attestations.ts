import { Hono } from "hono"
import { zValidator } from "@hono/zod-validator"
import { z } from "zod"
import type { HonoEnv } from "../../types/env.js"
import { db } from "../../lib/db.js"
import { authMiddleware } from "../../middleware/auth.js"
import { workspaceMiddleware } from "../../middleware/workspace.js"
import { ApiError } from "../../lib/errors.js"

export const attestationRoutes = new Hono<HonoEnv>()

attestationRoutes.use("*", authMiddleware, workspaceMiddleware)

attestationRoutes.get("/", async (c) => {
  const workspaceId = c.get("workspaceId")
  const attestations = await db.attestation.findMany({ where: { workspaceId } })
  return c.json(attestations)
})

attestationRoutes.post(
  "/",
  zValidator("json", z.object({
    entityType: z.string(),
    entityId: z.string(),
    notes: z.string().optional(),
    validUntil: z.string().optional(),
  })),
  async (c) => {
    const workspaceId = c.get("workspaceId")
    const body = c.req.valid("json")

    const attestation = await db.attestation.create({
      data: {
        workspaceId,
        entityType: body.entityType,
        entityId: body.entityId,
        notes: body.notes,
        validUntil: body.validUntil ? new Date(body.validUntil) : null,
      },
    })
    return c.json(attestation, 201)
  }
)

attestationRoutes.get("/:id", async (c) => {
  const workspaceId = c.get("workspaceId")
  const id = c.req.param("id")

  const attestation = await db.attestation.findFirst({ where: { id, workspaceId } })
  if (!attestation) throw new ApiError(404, "NOT_FOUND", "Attestation not found")
  return c.json(attestation)
})

attestationRoutes.patch(
  "/:id",
  zValidator("json", z.object({
    status: z.string().optional(),
    notes: z.string().optional(),
    validUntil: z.string().optional(),
  })),
  async (c) => {
    const workspaceId = c.get("workspaceId")
    const id = c.req.param("id")

    const existing = await db.attestation.findFirst({ where: { id, workspaceId } })
    if (!existing) throw new ApiError(404, "NOT_FOUND", "Attestation not found")

    const body = c.req.valid("json")
    const updated = await db.attestation.update({
      where: { id },
      data: { ...body, validUntil: body.validUntil ? new Date(body.validUntil) : undefined },
    })
    return c.json(updated)
  }
)

attestationRoutes.delete("/:id", async (c) => {
  const workspaceId = c.get("workspaceId")
  const id = c.req.param("id")

  const existing = await db.attestation.findFirst({ where: { id, workspaceId } })
  if (!existing) throw new ApiError(404, "NOT_FOUND", "Attestation not found")

  await db.attestation.delete({ where: { id } })
  return c.body(null, 204)
})

attestationRoutes.post("/:id/sign", async (c) => {
  const workspaceId = c.get("workspaceId")
  const userId = c.get("userId")
  const id = c.req.param("id")

  const existing = await db.attestation.findFirst({ where: { id, workspaceId } })
  if (!existing) throw new ApiError(404, "NOT_FOUND", "Attestation not found")

  const updated = await db.attestation.update({
    where: { id },
    data: { attestedById: userId, attestedAt: new Date(), status: "attested" },
  })
  return c.json(updated)
})
