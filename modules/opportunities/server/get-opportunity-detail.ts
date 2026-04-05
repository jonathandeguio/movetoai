import "server-only";

import { deriveOpportunityWorkflowStatus } from "@/lib/demo-labels";
import { prisma } from "@/lib/prisma";
import { deriveOpportunityScoring } from "@/modules/scoring/domain/calculate-score";

export async function getOpportunityDetail(workspaceId: string, opportunityId: string) {
  const opportunity = await prisma.opportunity.findFirst({
    where: {
      id: opportunityId,
      workspaceId,
      deletedAt: null
    },
    select: {
      id: true,
      title: true,
      summary: true,
      problemStatement: true,
      aiHypothesis: true,
      status: true,
      badge: true,
      dataReadiness: true,
      riskSeverity: true,
      expectedValue: true,
      realizedValue: true,
      overallScore: true,
      currencyCode: true,
      createdAt: true,
      updatedAt: true,
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
      process: {
        select: {
          id: true,
          name: true,
          owner: {
            select: {
              name: true
            }
          }
        }
      },
      subProcess: {
        select: {
          id: true,
          name: true
        }
      },
      painPoint: {
        select: {
          id: true,
          title: true,
          description: true,
          severity: true
        }
      },
      owner: {
        select: {
          id: true,
          name: true,
          email: true,
          jobTitle: true
        }
      },
      sponsor: {
        select: {
          id: true,
          name: true,
          email: true,
          jobTitle: true
        }
      },
      createdBy: {
        select: {
          id: true,
          name: true,
          email: true
        }
      },
      opportunityType: {
        select: {
          id: true,
          name: true,
          description: true
        }
      },
      scoreTemplate: {
        select: {
          id: true,
          name: true,
          description: true,
          dimensions: {
            where: {
              deletedAt: null
            },
            select: {
              id: true,
              key: true,
              name: true,
              description: true,
              weight: true,
              displayOrder: true
            },
            orderBy: {
              displayOrder: "asc"
            }
          }
        }
      },
      assessments: {
        where: {
          deletedAt: null
        },
        select: {
          id: true,
          summary: true,
          notes: true,
          recommendation: true,
          valueScore: true,
          feasibilityScore: true,
          confidenceScore: true,
          riskScore: true,
          overallScore: true,
          isCurrent: true,
          createdAt: true,
          assessor: {
            select: {
              name: true
            }
          },
          scoreTemplate: {
            select: {
              name: true
            }
          },
          dimensionScores: {
            select: {
              rawValue: true,
              normalizedValue: true,
              weightedValue: true,
              notes: true,
              scoreDimension: {
                select: {
                  key: true,
                  name: true,
                  description: true,
                  weight: true,
                  displayOrder: true
                }
              }
            },
            orderBy: {
              scoreDimension: {
                displayOrder: "asc"
              }
            }
          }
        },
        orderBy: {
          createdAt: "desc"
        },
        take: 2
      },
      applications: {
        select: {
          application: {
            select: {
              id: true,
              name: true,
              vendor: true,
              description: true
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
              systemName: true,
              description: true
            }
          }
        },
        orderBy: {
          dataSource: {
            name: "asc"
          }
        }
      },
      risks: {
        where: {
          deletedAt: null
        },
        select: {
          id: true,
          title: true,
          description: true,
          severity: true,
          status: true,
          mitigationPlan: true,
          dueDate: true,
          owner: {
            select: {
              name: true
            }
          }
        },
        orderBy: [
          { severity: "desc" },
          { createdAt: "asc" }
        ]
      },
      complianceChecks: {
        where: {
          deletedAt: null
        },
        select: {
          id: true,
          framework: true,
          controlName: true,
          requirement: true,
          status: true,
          notes: true,
          reviewedAt: true,
          owner: {
            select: {
              name: true
            }
          }
        },
        orderBy: {
          framework: "asc"
        }
      },
      dependencies: {
        where: {
          deletedAt: null
        },
        select: {
          id: true,
          dependencyType: true,
          title: true,
          description: true,
          isBlocking: true,
          targetOpportunity: {
            select: {
              id: true,
              title: true
            }
          },
          targetInitiative: {
            select: {
              id: true,
              name: true,
              status: true
            }
          }
        }
      },
      blockedBy: {
        where: {
          deletedAt: null
        },
        select: {
          id: true,
          dependencyType: true,
          title: true,
          description: true,
          isBlocking: true,
          opportunity: {
            select: {
              id: true,
              title: true
            }
          }
        }
      },
      currentDecision: {
        select: {
          id: true,
          status: true,
          summary: true,
          rationale: true,
          approvedBudget: true,
          currencyCode: true,
          decidedAt: true,
          decisionBoard: {
            select: {
              name: true
            }
          },
          reviewMeeting: {
            select: {
              title: true,
              scheduledAt: true
            }
          },
          decidedBy: {
            select: {
              name: true
            }
          },
          approvalSteps: {
            select: {
              id: true,
              stepOrder: true,
              approverRoleLabel: true,
              status: true,
              dueDate: true,
              actedAt: true,
              notes: true,
              approver: {
                select: {
                  name: true
                }
              }
            },
            orderBy: {
              stepOrder: "asc"
            }
          },
          actionItems: {
            where: {
              deletedAt: null
            },
            select: {
              id: true,
              title: true,
              status: true,
              dueDate: true,
              owner: {
                select: {
                  name: true
                }
              }
            },
            orderBy: {
              createdAt: "desc"
            },
            take: 4
          }
        }
      },
      comments: {
        where: {
          deletedAt: null
        },
        select: {
          id: true,
          body: true,
          createdAt: true,
          author: {
            select: {
              name: true,
              jobTitle: true
            }
          }
        },
        orderBy: {
          createdAt: "desc"
        }
      },
      initiatives: {
        where: {
          deletedAt: null
        },
        select: {
          id: true,
          name: true,
          status: true,
          description: true,
          budgetAmount: true,
          currencyCode: true,
          startDate: true,
          targetDate: true,
          owner: {
            select: {
              name: true
            }
          },
          milestones: {
            where: {
              deletedAt: null
            },
            select: {
              id: true,
              name: true,
              status: true,
              dueDate: true
            },
            orderBy: {
              dueDate: "asc"
            },
            take: 4
          }
        },
        orderBy: {
          createdAt: "desc"
        }
      },
      benefitMetrics: {
        where: {
          deletedAt: null
        },
        select: {
          id: true,
          name: true,
          description: true,
          metricType: true,
          unit: true,
          targetValue: true,
          currentValue: true,
          baselineValues: {
            select: {
              id: true,
              value: true,
              capturedAt: true,
              notes: true
            },
            orderBy: {
              capturedAt: "asc"
            },
            take: 1
          },
          realizedValues: {
            select: {
              id: true,
              value: true,
              capturedAt: true,
              notes: true
            },
            orderBy: {
              capturedAt: "desc"
            },
            take: 3
          }
        },
        orderBy: {
          name: "asc"
        }
      },
      adoptionMetrics: {
        where: {
          deletedAt: null
        },
        select: {
          id: true,
          name: true,
          description: true,
          metricType: true,
          unit: true,
          baselineValue: true,
          targetValue: true,
          currentValue: true,
          capturedAt: true
        },
        orderBy: {
          name: "asc"
        }
      }
    }
  });

  if (!opportunity) {
    return null;
  }

  const workflowStatus = deriveOpportunityWorkflowStatus(
    opportunity.status,
    opportunity.currentDecision?.status
  );
  const currentAssessment =
    opportunity.assessments.find((assessment) => assessment.isCurrent) ??
    opportunity.assessments[0] ??
    null;

  return {
    ...opportunity,
    workflowStatus,
    scoring: deriveOpportunityScoring({
      expectedValue: opportunity.expectedValue,
      dataReadiness: opportunity.dataReadiness,
      riskSeverity: opportunity.riskSeverity,
      workflowStatus,
      existingBadge: opportunity.badge,
      assessment: currentAssessment
    })
  };
}
