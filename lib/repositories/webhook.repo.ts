import "server-only";
import { prisma } from "@/lib/prisma";

export const webhookRepo = {
  /** Liste des webhooks avec compteur de livraisons */
  async findByWorkspace(workspaceId: string) {
    return prisma.webhook.findMany({
      where:   { workspaceId },
      include: { _count: { select: { deliveries: true } } },
      orderBy: { createdAt: "desc" },
    });
  },
};
