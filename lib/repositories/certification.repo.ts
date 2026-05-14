import "server-only";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

export type CertificationWithCatalog = Prisma.WorkspaceCertificationGetPayload<{
  include: { catalog: true; owner: { select: { name: true } } };
}>;

export const certificationRepo = {
  /** Toutes les certifications du workspace avec catalogue */
  async findByWorkspace(workspaceId: string): Promise<CertificationWithCatalog[]> {
    return prisma.workspaceCertification.findMany({
      where: { workspaceId },
      include: { catalog: true, owner: { select: { name: true } } },
      orderBy: [{ status: "asc" }, { createdAt: "asc" }],
    });
  },

  /** Une certification avec ses liens vers les processus */
  async findByIdWithLinks(id: string, workspaceId: string) {
    return prisma.workspaceCertification.findFirst({
      where: { id, workspaceId },
      include: {
        catalog: true,
        owner:   { select: { id: true, name: true, email: true } },
        links:   true,
      },
    });
  },

  /** Certifications expirant dans N jours */
  async findExpiringSoon(workspaceId: string, days: number) {
    const limit = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
    return prisma.workspaceCertification.findMany({
      where: {
        workspaceId,
        expiryDate: { lte: limit },
        status: { notIn: ["expired", "not_applicable"] },
      },
      include: { catalog: { select: { name: true, shortName: true } } },
      orderBy: { expiryDate: "asc" },
    });
  },

  /** Compter par statut */
  async countByStatus(workspaceId: string) {
    const rows = await prisma.workspaceCertification.groupBy({
      by: ["status"],
      where: { workspaceId },
      _count: { _all: true },
    });
    const map: Record<string, number> = {};
    for (const r of rows) map[r.status] = r._count._all;
    return map;
  },

  /** Processus liés à une certification (par IDs d'entité) */
  async findLinkedProcesses(processIds: string[], workspaceId: string) {
    if (processIds.length === 0) return [];
    return prisma.process.findMany({
      where:   { id: { in: processIds }, workspaceId, deletedAt: null },
      select:  { id: true, name: true, domain: { select: { name: true } } },
      orderBy: [{ domain: { name: "asc" } }, { name: "asc" }],
    });
  },

  /** Mettre à jour le statut */
  async updateStatus(
    id: string,
    workspaceId: string,
    data: Partial<Pick<Prisma.WorkspaceCertificationUpdateInput,
      "status" | "obtainedDate" | "expiryDate" | "notes" | "certifyingBody" | "certificateRef"
    >>
  ) {
    return prisma.workspaceCertification.update({
      where: { id },
      data,
    });
  },
};
