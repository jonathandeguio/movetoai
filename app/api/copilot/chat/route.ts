export const runtime = "nodejs";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getCurrentWorkspaceContext } from "@/server/auth";
import { streamCopilotResponse, type CopilotMessage } from "@/lib/ai/copilot";

function isMessageArray(value: unknown): value is CopilotMessage[] {
  if (!Array.isArray(value)) return false;
  return value.every(
    (m) =>
      m &&
      typeof m === "object" &&
      (m.role === "user" || m.role === "assistant") &&
      typeof m.content === "string"
  );
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { workspace } = await getCurrentWorkspaceContext({ requireMembership: true });
  if (!workspace?.id) {
    return new Response(JSON.stringify({ error: "No workspace" }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { message, conversationId, messages } = body as {
    message?: unknown;
    conversationId?: unknown;
    messages?: unknown;
  };

  if (typeof message !== "string" || message.trim().length === 0) {
    return new Response(JSON.stringify({ error: "message is required" }), {
      status: 422,
      headers: { "Content-Type": "application/json" },
    });
  }

  const userId = session.user.id;
  const workspaceId = workspace.id;

  // Resolve or create conversation
  let conversation = typeof conversationId === "string"
    ? await prisma.copilotConversation.findFirst({
        where: { id: conversationId, workspaceId, userId },
      })
    : null;

  if (!conversation) {
    conversation = await prisma.copilotConversation.create({
      data: {
        workspaceId,
        userId,
        title: message.slice(0, 60),
        messages: [],
      },
    });
  }

  const existingMessages: CopilotMessage[] = isMessageArray(messages)
    ? messages
    : isMessageArray(conversation.messages)
    ? (conversation.messages as CopilotMessage[])
    : [];

  const encoder = new TextEncoder();
  let fullResponse = "";

  const stream = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of streamCopilotResponse(workspaceId, existingMessages, message)) {
          fullResponse += chunk;
          controller.enqueue(encoder.encode(`data: ${chunk}\n\n`));
        }

        // Persist updated messages
        const updatedMessages: CopilotMessage[] = [
          ...existingMessages,
          { role: "user", content: message, createdAt: new Date().toISOString() },
          { role: "assistant", content: fullResponse, createdAt: new Date().toISOString() },
        ];

        await prisma.copilotConversation.update({
          where: { id: conversation!.id },
          data: {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            messages: updatedMessages as any,
            title: conversation!.title ?? message.slice(0, 60),
          },
        });

        controller.enqueue(encoder.encode(`data: [DONE]\n\n`));
        controller.enqueue(
          encoder.encode(`data: {"conversationId":"${conversation!.id}"}\n\n`)
        );
        controller.close();
      } catch (err) {
        console.error("[copilot/chat] stream error", err);
        controller.enqueue(encoder.encode(`data: [ERROR]\n\n`));
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
