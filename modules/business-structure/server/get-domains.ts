import { prisma, buildDomainWhere } from "@/modules/business-structure/server/_shared";
import type { DomainFilters } from "@/modules/business-structure/model/business-structure.types";

export async function getDomainList(workspaceId: string, filters: DomainFilters) {
  const where = buildDomainWhere(workspaceId, filters);

  const [businessUnits, domains] = await Promise.all([
    prisma.businessUnit.findMany({
      where: {
        workspaceId,
        deletedAt: null
      },
      select: {
        id: true,
        name: true
      },
      orderBy: {
        name: "asc"
      }
    }),
    prisma.domain.findMany({
      where,
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        businessUnit: {
          select: {
            id: true,
            name: true
          }
        },
        _count: {
          select: {
            capabilities: true,
            processes: true,
            opportunities: true
          }
        }
      },
      orderBy: {
        name: "asc"
      }
    })
  ]);

  const metrics = domains.reduce(
    (accumulator, domain) => {
      accumulator.capabilities += domain._count.capabilities;
      accumulator.processes += domain._count.processes;
      accumulator.opportunities += domain._count.opportunities;
      return accumulator;
    },
    {
      domains: domains.length,
      capabilities: 0,
      processes: 0,
      opportunities: 0
    }
  );

  return {
    businessUnits,
    domains,
    metrics
  };
}
