import type { ProcessFilters } from "@/modules/business-structure/model/business-structure.types";
import { buildProcessWhere, prisma } from "@/modules/business-structure/server/_shared";

export async function getProcessList(workspaceId: string, filters: ProcessFilters) {
  const where = buildProcessWhere(workspaceId, filters);

  const [businessUnits, processes] = await Promise.all([
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
    prisma.process.findMany({
      where,
      select: {
        id: true,
        name: true,
        description: true,
        owner: {
          select: {
            name: true
          }
        },
        businessUnit: {
          select: {
            name: true
          }
        },
        domain: {
          select: {
            name: true
          }
        },
        applications: {
          select: {
            application: {
              select: {
                name: true
              }
            }
          }
        },
        dataSources: {
          select: {
            dataSource: {
              select: {
                name: true
              }
            }
          }
        },
        maturityScore: true,
        maturityLevel: true,
        catalogCode: true,
        _count: {
          select: {
            painPoints: true,
            opportunities: true
          }
        }
      },
      orderBy: {
        name: "asc"
      }
    })
  ]);

  const applicationSet = new Set<string>();
  let painPoints = 0;
  let opportunities = 0;

  for (const process of processes) {
    painPoints += process._count.painPoints;
    opportunities += process._count.opportunities;

    for (const item of process.applications) {
      applicationSet.add(item.application.name);
    }
  }

  return {
    businessUnits,
    processes,
    metrics: {
      processes: processes.length,
      painPoints,
      opportunities,
      applications: applicationSet.size
    }
  };
}
