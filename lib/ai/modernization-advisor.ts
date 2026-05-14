import "server-only";
import { prisma }       from "@/lib/prisma";
import { llmRouter }    from "@/lib/ai/llm-router";
import { parseLLMJson } from "@/lib/ai/parse-llm-json";

export interface ModernizationAdvice {
  strategy: "keep" | "renovate" | "replace" | "retire";
  summary: string;
  rationale: string;
  quickWins: string[];
  risks: string[];
  estimatedEffort: "low" | "medium" | "high";
  recommendedTechnologies: string[];
}

export async function generateModernizationAdvice(
  applicationId: string,
  workspaceId: string
): Promise<ModernizationAdvice> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const app: any = await prisma.application.findFirst({
    where: { id: applicationId, workspaceId, deletedAt: null },
    include: {
      capabilities: { include: { capability: { select: { name: true } } } },
      processes: { include: { process: { select: { name: true, aiPotential: true } } } },
      technologies: { include: { technology: { select: { name: true, category: true } } } },
    },
  });

  if (!app) throw new Error("Application not found");

  const techList =
    app.technologies
      .map((t: { technology: { name: string; category?: string | null } }) =>
        `${t.technology.name} (${t.technology.category ?? "misc"})`
      )
      .join(", ") || "None documented";

  const capList =
    app.capabilities
      .map((c: { capability: { name: string } }) => c.capability.name)
      .join(", ") || "None";

  const procList =
    app.processes
      .map(
        (p: { process: { name: string; aiPotential: string | null } }) =>
          `${p.process.name} (AI potential: ${p.process.aiPotential ?? "unknown"})`
      )
      .join(", ") || "None";

  const prompt = `You are an enterprise architecture advisor. Analyze this application and provide a modernization recommendation.

Application: ${app.name}
Vendor: ${app.vendor ?? "Unknown"}
Lifecycle State: ${app.lifecycleState ?? "Unknown"}
Criticality: ${app.criticality ?? "Unknown"}
Deployment Type: ${app.deploymentType ?? "Unknown"}
Annual Cost: ${app.annualCost != null ? `€${Number(app.annualCost).toLocaleString("fr-FR")}` : "Unknown"}
User Count: ${app.userCount ?? "Unknown"}
AI Readiness Score: ${app.aiReadinessScore != null ? `${Math.round(Number(app.aiReadinessScore))}/100` : "Unknown"}
Description: ${app.description ?? "No description"}

Technologies: ${techList}
Supported Capabilities: ${capList}
Supported Processes: ${procList}

Based on lifecycle state, criticality, AI readiness, and usage, recommend the best modernization strategy.

Respond ONLY with a JSON object (no markdown fences, no extra text):
{
  "strategy": "keep" | "renovate" | "replace" | "retire",
  "summary": "1-2 sentence executive summary in French",
  "rationale": "3-4 sentence detailed rationale in French",
  "quickWins": ["action 1 in French", "action 2 in French", "action 3 in French"],
  "risks": ["risk 1 in French", "risk 2 in French"],
  "estimatedEffort": "low" | "medium" | "high",
  "recommendedTechnologies": ["tech1", "tech2"]
}`;

  const response = await llmRouter.complete({
    task:        "modernization_advice",  // complex → Groq → Claude
    workspace_id: workspaceId,
    prompt,
    json_mode:   true,
    max_tokens:  1024,
    temperature: 0.3,
  });

  const advice = parseLLMJson<ModernizationAdvice>(response.content);

  // Persist to Application.modernizationAdvice
  await prisma.application.update({
    where: { id: applicationId },
    data: { modernizationAdvice: JSON.stringify(advice) },
  });

  return advice;
}
