import { prisma } from "@/modules/business-structure/server/_shared";

export async function getDomainDetail(workspaceId: string, domainId: string) {
  return prisma.domain.findFirst({
    where: {
      id: domainId,
      workspaceId,
      deletedAt: null
    },
    select: {
      id: true,
      name: true,
      description: true,
      businessUnit: {
        select: {
          id: true,
          name: true
        }
      },
      capabilities: {
        where: {
          deletedAt: null
        },
        select: {
          id: true,
          name: true,
          description: true,
          _count: {
            select: {
              processes: true,
              opportunities: true
            }
          }
        },
        orderBy: {
          name: "asc"
        }
      },
      processes: {
        where: {
          deletedAt: null
        },
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
          _count: {
            select: {
              painPoints: true,
              opportunities: true,
              applications: true,
              dataSources: true
            }
          }
        },
        orderBy: {
          name: "asc"
        }
      },
      opportunities: {
        where: {
          deletedAt: null
        },
        select: {
          id: true,
          title: true,
          status: true,
          badge: true,
          overallScore: true,
          expectedValue: true,
          owner: {
            select: {
              name: true
            }
          },
          process: {
            select: {
              name: true
            }
          },
          capability: {
            select: {
              name: true
            }
          },
          currentDecision: {
            select: {
              status: true
            }
          }
        },
        orderBy: [
          {
            overallScore: "desc"
          },
          {
            expectedValue: "desc"
          }
        ],
        take: 6
      },
      _count: {
        select: {
          capabilities: true,
          processes: true,
          opportunities: true
        }
      }
    }
  });
}
