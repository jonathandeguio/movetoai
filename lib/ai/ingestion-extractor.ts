import "server-only";

import { prisma }           from "@/lib/prisma";
import { llmRouter }        from "@/lib/ai/llm-router";
import { parseLLMJsonSafe } from "@/lib/ai/parse-llm-json";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = prisma as any;

export interface ExtractedApplication {
  name: string;
  vendor: string;
  description: string;
  criticality: string;
}

export interface ExtractedProcess {
  name: string;
  description: string;
  aiPotential: string;
}

export interface ExtractedCapability {
  name: string;
  description: string;
  level: string;
}

export interface ExtractedEntities {
  applications: ExtractedApplication[];
  processes: ExtractedProcess[];
  capabilities: ExtractedCapability[];
}

export async function extractEntitiesFromText(
  text: string,
  workspaceId: string,
  jobId: string
): Promise<void> {
  // Mark as processing
  await db.ingestionJob.update({
    where: { id: jobId },
    data: { status: "processing" },
  });

  try {
    const prompt = `You are an enterprise AI transformation analyst. Analyze the following document text and extract structured business entities in JSON format.

Extract:
1. **Applications**: Software applications, tools, platforms mentioned (name, vendor, description, criticality: low|medium|high|critical)
2. **Processes**: Business processes or workflows mentioned (name, description, aiPotential: low|medium|high)
3. **Capabilities**: Business or technical capabilities mentioned (name, description, level: basic|intermediate|advanced|expert)

Return ONLY a valid JSON object with this exact structure, no markdown, no explanation:
{
  "applications": [{"name": "string", "vendor": "string", "description": "string", "criticality": "low|medium|high|critical"}],
  "processes": [{"name": "string", "description": "string", "aiPotential": "low|medium|high"}],
  "capabilities": [{"name": "string", "description": "string", "level": "basic|intermediate|advanced|expert"}]
}

If no entities of a type are found, return an empty array for that type.

Document text to analyze:
---
${text.slice(0, 15000)}
---`;

    const response = await llmRouter.complete({
      task:        "ingestion_extract",
      workspace_id: workspaceId,
      prompt,
      json_mode:   true,
      max_tokens:  2048,
      temperature: 0.1,
    });

    const parsed = parseLLMJsonSafe<ExtractedEntities>(response.content);

    if (!parsed) {
      throw new Error("Could not parse JSON from LLM response");
    }

    const entities: ExtractedEntities = {
      applications: Array.isArray(parsed.applications) ? parsed.applications : [],
      processes:    Array.isArray(parsed.processes)    ? parsed.processes    : [],
      capabilities: Array.isArray(parsed.capabilities) ? parsed.capabilities : [],
    };

    await db.ingestionJob.update({
      where: { id: jobId },
      data: {
        status: "done",
        extractedEntities: entities,
        errorMessage: null,
      },
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error during extraction";

    await db.ingestionJob.update({
      where: { id: jobId },
      data: {
        status: "failed",
        errorMessage,
      },
    });
  }
}
