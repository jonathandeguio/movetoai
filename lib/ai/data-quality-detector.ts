import "server-only";
import { prisma }            from "@/lib/prisma";
import { llmRouter }         from "@/lib/ai/llm-router";
import { parseLLMJsonSafe }  from "@/lib/ai/parse-llm-json";
import type { DataQualityReport } from "@prisma/client";

interface QualityIssue {
  field: string;
  count: number;
  severity: "critical" | "warning" | "info";
  message: string;
}

interface QualityRecommendation {
  priority: number;
  action: string;
  impact: string;
}

export async function generateDataQualityReport(workspaceId: string): Promise<DataQualityReport> {
  const [applications, capabilities, processes] = await Promise.all([
    prisma.application.findMany({
      where: { workspaceId, deletedAt: null },
      select: {
        id: true,
        name: true,
        description: true,
        businessOwnerId: true,
        itOwnerId: true,
        aiReadinessScore: true,
      },
    }),
    prisma.capability.findMany({
      where: { workspaceId, deletedAt: null },
      select: {
        id: true,
        name: true,
        maturityScore: true,
        ownerId: true,
      },
    }),
    prisma.process.findMany({
      where: { workspaceId, deletedAt: null },
      select: {
        id: true,
        name: true,
        aiPotential: true,
      },
    }),
  ]);

  // ── Compute metrics locally ──────────────────────────────────────────────────

  const appCount = applications.length;
  const capCount = capabilities.length;
  const procCount = processes.length;

  const appsWithoutDescription = applications.filter((a) => !a.description?.trim()).length;
  const appsWithoutOwner = applications.filter((a) => !a.businessOwnerId && !a.itOwnerId).length;
  const appsWithoutAiScore = applications.filter((a) => a.aiReadinessScore == null).length;
  const procsWithoutAiPotential = processes.filter((p) => !p.aiPotential?.trim()).length;
  const capsWithoutMaturity = capabilities.filter((c) => c.maturityScore == null).length;
  const capsWithoutOwner = capabilities.filter((c) => !c.ownerId).length;

  // Score: start at 100, apply penalties
  let score = 100;

  function penalty(count: number, total: number, weight: number): number {
    if (total === 0) return 0;
    return Math.round((count / total) * weight);
  }

  score -= penalty(appsWithoutDescription, appCount, 20);
  score -= penalty(appsWithoutOwner, appCount, 15);
  score -= penalty(appsWithoutAiScore, appCount, 15);
  score -= penalty(procsWithoutAiPotential, procCount, 20);
  score -= penalty(capsWithoutMaturity, capCount, 15);
  score -= penalty(capsWithoutOwner, capCount, 15);

  const overallScore = Math.max(0, Math.min(100, score));

  // ── Ask Claude for structured issues + recommendations ───────────────────────

  const prompt = `You are a data governance expert. Analyze this workspace data quality summary and return structured issues and recommendations.

WORKSPACE METRICS:
- Applications: ${appCount} total
  - Without description: ${appsWithoutDescription}/${appCount}
  - Without owner: ${appsWithoutOwner}/${appCount}
  - Without AI readiness score: ${appsWithoutAiScore}/${appCount}
- Processes: ${procCount} total
  - Without AI potential defined: ${procsWithoutAiPotential}/${procCount}
- Capabilities: ${capCount} total
  - Without maturity score: ${capsWithoutMaturity}/${capCount}
  - Without owner: ${capsWithoutOwner}/${capCount}

Overall data quality score: ${overallScore}/100

Return ONLY a JSON object (no markdown, no explanation):
{
  "issues": [
    {
      "field": "<field name>",
      "count": <number>,
      "severity": "critical" | "warning" | "info",
      "message": "<short message in French describing the issue>"
    }
  ],
  "recommendations": [
    {
      "priority": <1|2|3>,
      "action": "<action to take in French>",
      "impact": "<expected impact in French>"
    }
  ]
}

Rules:
- severity "critical" if > 50% missing or blocking AI initiatives
- severity "warning" if 20-50% missing
- severity "info" if < 20% missing or minor
- Only include fields where count > 0
- Recommendations ordered by priority (1 = highest), max 5 recommendations`;

  const response = await llmRouter.complete({
    task:        "gap_detect",   // simple → Ollama → Groq → Claude
    workspace_id: workspaceId,
    prompt,
    json_mode:   true,
    max_tokens:  2048,
    temperature: 0.1,
  });

  let issues: QualityIssue[] = [];
  let recommendations: QualityRecommendation[] = [];

  const parsed = parseLLMJsonSafe<{ issues: QualityIssue[]; recommendations: QualityRecommendation[] }>(response.content);
  if (parsed) {
    issues = Array.isArray(parsed?.issues) ? parsed.issues : [];
    recommendations = Array.isArray(parsed?.recommendations) ? parsed.recommendations : [];
  } else {
    // Use fallback issues based on metrics
    if (appsWithoutDescription > 0) {
      issues.push({
        field: "application.description",
        count: appsWithoutDescription,
        severity: appsWithoutDescription / Math.max(1, appCount) > 0.5 ? "critical" : "warning",
        message: `${appsWithoutDescription} application(s) sans description`,
      });
    }
    if (appsWithoutOwner > 0) {
      issues.push({
        field: "application.owner",
        count: appsWithoutOwner,
        severity: appsWithoutOwner / Math.max(1, appCount) > 0.5 ? "critical" : "warning",
        message: `${appsWithoutOwner} application(s) sans responsable`,
      });
    }
    if (procsWithoutAiPotential > 0) {
      issues.push({
        field: "process.aiPotential",
        count: procsWithoutAiPotential,
        severity: procsWithoutAiPotential / Math.max(1, procCount) > 0.5 ? "critical" : "warning",
        message: `${procsWithoutAiPotential} processus sans potentiel IA défini`,
      });
    }
  }

  // ── Persist report ───────────────────────────────────────────────────────────

  const report = await prisma.dataQualityReport.create({
    data: {
      workspaceId,
      entityType: "workspace",
      entityId: null,
      overallScore,
      issues: JSON.parse(JSON.stringify(issues)),
      recommendations: JSON.parse(JSON.stringify(recommendations)),
      generatedAt: new Date(),
    },
  });

  return report;
}
