// app/api/aria/recommendations/route.ts
// GET — génère 3 recommandations proactives pour le workspace courant (cache 5 min).

import { NextResponse }              from "next/server";
import { auth }                      from "@/lib/auth";
import { getCurrentWorkspaceContext } from "@/lib/current-workspace";
import { llmRouter }                 from "@/lib/ai/llm-router";
import { parseLLMJsonSafe }          from "@/lib/ai/parse-llm-json";
import { buildWorkspaceSnapshot }    from "@/lib/aria/context-builder";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface Recommendation {
  id:           string;
  title:        string;
  description:  string;
  action_label: string;
  action_url:   string;
  priority:     "high" | "medium" | "low";
}

const CACHE = new Map<string, { recs: Recommendation[]; expiresAt: number }>();
const CACHE_TTL_MS = 5 * 60 * 1_000; // 5 minutes

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ recommendations: [] });

    const { workspace } = await getCurrentWorkspaceContext();
    if (!workspace?.id)  return NextResponse.json({ recommendations: [] });

    // Cache en mémoire (process-local, suffisant pour un seul serveur PM2)
    const cached = CACHE.get(workspace.id);
    if (cached && cached.expiresAt > Date.now()) {
      return NextResponse.json({ recommendations: cached.recs });
    }

    const wsData = await buildWorkspaceSnapshot(workspace.id);

    const llmResponse = await llmRouter.complete({
      task:   "aria_recommendations",
      system: `Tu es Aria, l'assistante IA de Move to AI.
Analyse les données du workspace et génère exactement 3 recommandations prioritaires.
Réponds UNIQUEMENT en JSON valide sans texte autour :
{ "recommendations": [{ "id": string, "title": string, "description": string, "action_label": string, "action_url": string, "priority": "high"|"medium"|"low" }] }`,
      prompt:      `Données workspace : ${JSON.stringify(wsData, null, 2)}`,
      max_tokens:  800,
      workspace_id: workspace.id,
    });

    const parsed = parseLLMJsonSafe<{ recommendations: Recommendation[] }>(llmResponse.content);
    const recs   = parsed?.recommendations ?? [];

    CACHE.set(workspace.id, { recs, expiresAt: Date.now() + CACHE_TTL_MS });

    return NextResponse.json({ recommendations: recs });
  } catch {
    return NextResponse.json({ recommendations: [] });
  }
}
