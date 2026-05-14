import { prisma } from "@/modules/business-structure/server/_shared";

export async function getProcessDetail(workspaceId: string, processId: string) {
  return prisma.process.findFirst({
    where: {
      id: processId,
      workspaceId,
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
          id: true,
          name: true
        }
      },
      domain: {
        select: {
          id: true,
          name: true
        }
      },
      capability: {
        select: {
          id: true,
          name: true
        }
      },
      applications: {
        select: {
          application: {
            select: {
              id: true,
              name: true,
              vendor: true
            }
          }
        },
        orderBy: {
          application: {
            name: "asc"
          }
        }
      },
      dataSources: {
        select: {
          dataSource: {
            select: {
              id: true,
              name: true,
              classification: true,
              systemName: true
            }
          }
        },
        orderBy: {
          dataSource: {
            name: "asc"
          }
        }
      },
      painPoints: {
        where: {
          deletedAt: null
        },
        select: {
          id: true,
          title: true,
          description: true,
          severity: true
        },
        orderBy: {
          createdAt: "asc"
        }
      },
      subProcesses: {
        where: {
          deletedAt: null
        },
        select: {
          id: true,
          name: true
        },
        orderBy: {
          name: "asc"
        }
      },
      kpis: {
        where: {
          deletedAt: null
        },
        select: {
          id: true,
          name: true,
          unit: true
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
      }
    }
  });
}
