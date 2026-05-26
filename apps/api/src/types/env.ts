import type { PrismaClient } from "@prisma/client"

export type HonoEnv = {
  Variables: {
    userId: string
    workspaceId: string
    tenantId: string
    role: string
    prisma: PrismaClient
  }
}
