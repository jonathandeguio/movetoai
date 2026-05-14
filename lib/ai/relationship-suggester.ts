import "server-only";
import { prisma }       from "@/lib/prisma";
import { llmRouter }    from "@/lib/ai/llm-router";
import { parseLLMJson } from "@/lib/ai/parse-llm-json";

interface RawSuggestion {
  sourceType: string;
  sourceId: string;
  targetType: string;
  targetId: string;
  confidence: number;
  rationale: string;
}

export async function generateRelationshipSuggestions(workspaceId: string): Promise<number> {
  const [applications, capabilities, processes] = await Promise.all([
    prisma.application.findMany({
      where: { workspaceId, deletedAt: null },
      select: { id: true, name: true, vendor: true, description: true },
    }),
    prisma.capability.findMany({
      where: { workspaceId, deletedAt: null },
      select: { id: true, name: true, description: true },
    }),
    prisma.process.findMany({
      where: { workspaceId, deletedAt: null },
      select: { id: true, name: true, description: true, aiPotential: true },
    }),
  ]);

  if (applications.length === 0 && capabilities.length === 0 && processes.length === 0) {
    return 0;
  }

  const prompt = `You are an enterprise architecture expert. Your task is to identify missing relationships between business entities.

Here are the entities in this workspace:

APPLICATIONS:
${applications.map((a) => `- ID: ${a.id} | Name: ${a.name} | Vendor: ${a.vendor ?? "Unknown"} | Description: ${a.description ?? "No description"}`).join("\n") || "None"}

CAPABILITIES:
${capabilities.map((c) => `- ID: ${c.id} | Name: ${c.name} | Description: ${c.description ?? "No description"}`).join("\n") || "None"}

PROCESSES:
${processes.map((p) => `- ID: ${p.id} | Name: ${p.name} | Description: ${p.description ?? "No description"} | AI Potential: ${p.aiPotential ?? "Unknown"}`).join("\n") || "None"}

Analyze the names and descriptions to identify likely missing relationships. Consider:
- Which applications likely support which capabilities (sourceType: "application", targetType: "capability")?
- Which applications likely support which processes (sourceType: "application", targetType: "process")?
- Which processes likely exercise which capabilities (sourceType: "process", targetType: "capability")?

Return ONLY a JSON object (no markdown, no explanation):
{
  "suggestions": [
    {
      "sourceType": "application" | "process" | "capability",
      "sourceId": "<id>",
      "targetType": "application" | "process" | "capability",
      "targetId": "<id>",
      "confidence": <float 0.0-1.0>,
      "rationale": "<1-2 sentences explaining why this relationship likely exists>"
    }
  ]
}

Only suggest relationships that are genuinely likely based on the entity names and descriptions. Aim for quality over quantity. Maximum 20 suggestions.`;

  const response = await llmRouter.complete({
    task:        "relationship_suggest",  // simple → Ollama → Groq → Claude
    workspace_id: workspaceId,
    prompt,
    json_mode:   true,
    max_tokens:  4096,
    temperature: 0.2,
  });

  let parsed: { suggestions: RawSuggestion[] };
  try {
    parsed = parseLLMJson<{ suggestions: RawSuggestion[] }>(response.content);
  } catch {
    return 0;
  }

  const suggestions: RawSuggestion[] = Array.isArray(parsed?.suggestions) ? parsed.suggestions : [];

  // Validate IDs are real entities
  const appIds = new Set(applications.map((a) => a.id));
  const capIds = new Set(capabilities.map((c) => c.id));
  const procIds = new Set(processes.map((p) => p.id));

  function isValidId(type: string, id: string): boolean {
    if (type === "application") return appIds.has(id);
    if (type === "capability") return capIds.has(id);
    if (type === "process") return procIds.has(id);
    return false;
  }

  let created = 0;
  for (const s of suggestions) {
    if (!isValidId(s.sourceType, s.sourceId) || !isValidId(s.targetType, s.targetId)) {
      continue;
    }
    const confidence = Math.max(0, Math.min(1, Number(s.confidence) || 0));

    await prisma.relationshipSuggestion.upsert({
      where: {
        workspaceId_sourceType_sourceId_targetType_targetId: {
          workspaceId,
          sourceType: s.sourceType,
          sourceId: s.sourceId,
          targetType: s.targetType,
          targetId: s.targetId,
        },
      },
      update: {
        confidence,
        rationale: s.rationale ?? "",
        status: "pending",
      },
      create: {
        workspaceId,
        sourceType: s.sourceType,
        sourceId: s.sourceId,
        targetType: s.targetType,
        targetId: s.targetId,
        confidence,
        rationale: s.rationale ?? "",
        status: "pending",
      },
    });
    created++;
  }

  return created;
}
