// app/api/aria/chat/route.ts
// POST — conversation avec Aria. Retourne la réponse en JSON simple (non-streamé).

import { NextResponse }              from "next/server";
import { auth }                      from "@/lib/auth";
import { getCurrentWorkspaceContext } from "@/lib/current-workspace";
import { llmRouter }                 from "@/lib/ai/llm-router";
import { buildPageContext, buildWorkspaceSnapshot } from "@/lib/aria/context-builder";
import { ARIA_SYSTEM_PROMPT }        from "@/lib/aria/prompts/system-prompt";
import { prisma }                    from "@/lib/prisma";

export const runtime = "nodejs";

// ── Types ─────────────────────────────────────────────────────────────────────

interface ChatBody {
  message:    string;
  page_path:  string;
  session_id: string;
}

// ── Handler principal ─────────────────────────────────────────────────────────

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { workspace, user } = await getCurrentWorkspaceContext();
    if (!workspace?.id) {
      return NextResponse.json({ error: "No workspace" }, { status: 400 });
    }

    const body = await request.json() as Partial<ChatBody>;
    const { message, page_path = "/app", session_id } = body;

    if (!message?.trim()) {
      return NextResponse.json({ error: "Empty message" }, { status: 400 });
    }

    // Construire le contexte en parallèle
    const [pageData, wsData, historyText] = await Promise.all([
      buildPageContext(page_path, workspace.id),
      buildWorkspaceSnapshot(workspace.id),
      getSessionHistory(session.user.id, workspace.id),
    ]);

    const userRole = (user as Record<string, unknown>)?.userFunction as string ?? "utilisateur";
    const userName = session.user.name ?? session.user.email ?? "Utilisateur";

    const systemPrompt = ARIA_SYSTEM_PROMPT
      .replace("{workspace_context}", JSON.stringify(wsData, null, 2))
      .replace("{current_page}",     page_path)
      .replace("{page_data}",        JSON.stringify(pageData, null, 2))
      .replace("{user_role}",        userRole)
      .replace("{user_name}",        userName);

    const llmResponse = await llmRouter.complete({
      task:        "aria_chat",
      system:      systemPrompt,
      prompt:      message,
      max_tokens:  600,
      temperature: 0.7,
      workspace_id: workspace.id,
    });

    const content = llmResponse.content ?? "Je n'ai pas pu traiter votre demande.";

    // Sauvegarder en arrière-plan (non-bloquant)
    void saveMessages(session.user.id, workspace.id, page_path, session_id ?? "", message, content);

    return NextResponse.json({ content });

  } catch (err) {
    console.error("[aria/chat]", err);
    // Toujours retourner 200 avec un message de fallback pour ne pas casser l'UI
    return NextResponse.json({
      content: "Je rencontre une difficulté technique en ce moment. Réessayez dans un instant.",
    });
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

async function getSessionHistory(userId: string, workspaceId: string): Promise<string> {
  try {
    const ariaSession = await prisma.ariaSession.findFirst({
      where:   { userId, workspaceId },
      orderBy: { updatedAt: "desc" },
      include: {
        messages: {
          orderBy: { createdAt: "desc" },
          take:    8,
        },
      },
    });

    if (!ariaSession?.messages.length) return "";

    return ariaSession.messages
      .reverse()
      .map((m) => `${m.role === "user" ? "Utilisateur" : "Aria"}: ${m.content}`)
      .join("\n");
  } catch {
    return "";
  }
}

async function saveMessages(
  userId:      string,
  workspaceId: string,
  pagePath:    string,
  _sessionId:  string,
  userMsg:     string,
  ariaMsg:     string
) {
  try {
    let ariaSession = await prisma.ariaSession.findFirst({
      where:   { userId, workspaceId },
      orderBy: { updatedAt: "desc" },
    });

    if (!ariaSession) {
      ariaSession = await prisma.ariaSession.create({
        data: { userId, workspaceId, pagePath },
      });
    }

    await prisma.ariaMessage.createMany({
      data: [
        { sessionId: ariaSession.id, role: "user", content: userMsg, pagePath },
        { sessionId: ariaSession.id, role: "aria", content: ariaMsg, pagePath },
      ],
    });

    await prisma.ariaSession.update({
      where: { id: ariaSession.id },
      data:  { updatedAt: new Date() },
    });
  } catch {
    // Non-fatal : la réponse est déjà renvoyée
  }
}
