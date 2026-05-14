"use client";

import { useEffect, useRef, useState, useCallback } from "react";

interface CopilotMessage {
  role: "user" | "assistant";
  content: string;
  createdAt: string;
}

interface Conversation {
  id: string;
  title: string | null;
  updatedAt: string;
  createdAt: string;
}

const SUGGESTIONS = [
  "Quel est notre score de maturité IA ?",
  "Quels processus prioriser ?",
  "Résume notre portefeuille d'applications",
];

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "short" });
}

function LoadingDots() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "4px", padding: "4px 0" }}>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          style={{
            width: "6px",
            height: "6px",
            borderRadius: "50%",
            background: "var(--text-muted)",
            animation: `copilot-bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
          }}
        />
      ))}
    </div>
  );
}

export function CopilotChat() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<CopilotMessage[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [loadingConvs, setLoadingConvs] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streaming]);

  // Load conversations list
  const loadConversations = useCallback(async () => {
    try {
      const res = await fetch("/api/copilot/conversations");
      if (!res.ok) return;
      const data = (await res.json()) as { conversations: Conversation[] };
      setConversations(data.conversations ?? []);
    } finally {
      setLoadingConvs(false);
    }
  }, []);

  useEffect(() => {
    void loadConversations();
  }, [loadConversations]);

  // Load a conversation's messages
  async function loadConversation(id: string) {
    if (streaming) return;
    const res = await fetch(`/api/copilot/conversations/${id}`);
    if (!res.ok) return;
    const data = (await res.json()) as {
      conversation: { messages: CopilotMessage[] };
    };
    const msgs = Array.isArray(data.conversation?.messages)
      ? (data.conversation.messages as CopilotMessage[])
      : [];
    setMessages(msgs);
    setActiveConvId(id);
  }

  // New conversation
  function newConversation() {
    if (streaming) return;
    setActiveConvId(null);
    setMessages([]);
    setInput("");
  }

  // Delete a conversation
  async function deleteConversation(e: React.MouseEvent, id: string) {
    e.stopPropagation();
    await fetch(`/api/copilot/conversations/${id}`, { method: "DELETE" });
    if (activeConvId === id) newConversation();
    setConversations((prev) => prev.filter((c) => c.id !== id));
  }

  // Send message
  async function sendMessage(text: string) {
    const trimmed = text.trim();
    if (!trimmed || streaming) return;

    setInput("");
    setStreaming(true);

    const userMsg: CopilotMessage = {
      role: "user",
      content: trimmed,
      createdAt: new Date().toISOString(),
    };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);

    // Placeholder for assistant
    const assistantMsg: CopilotMessage = {
      role: "assistant",
      content: "",
      createdAt: new Date().toISOString(),
    };
    setMessages([...updatedMessages, assistantMsg]);

    const ctrl = new AbortController();
    abortRef.current = ctrl;

    try {
      const res = await fetch("/api/copilot/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: trimmed,
          conversationId: activeConvId ?? undefined,
          messages: messages, // send previous messages for context
        }),
        signal: ctrl.signal,
      });

      if (!res.ok || !res.body) {
        throw new Error("Stream error");
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";
      let newConvId = activeConvId;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const raw = decoder.decode(value, { stream: true });
        const lines = raw.split("\n");

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const payload = line.slice(6);
          if (payload === "[DONE]") continue;
          if (payload === "[ERROR]") break;
          // Check if it's the conversationId JSON
          if (payload.startsWith("{") && payload.includes("conversationId")) {
            try {
              const parsed = JSON.parse(payload) as { conversationId: string };
              newConvId = parsed.conversationId;
            } catch {
              // ignore
            }
            continue;
          }
          accumulated += payload;
          setMessages((prev) => {
            const copy = [...prev];
            const last = copy[copy.length - 1];
            if (last && last.role === "assistant") {
              copy[copy.length - 1] = { ...last, content: accumulated };
            }
            return copy;
          });
        }
      }

      // Update conversation id and refresh list
      if (newConvId && newConvId !== activeConvId) {
        setActiveConvId(newConvId);
      }
      await loadConversations();
    } catch (err: unknown) {
      if (err instanceof Error && err.name === "AbortError") return;
      setMessages((prev) => {
        const copy = [...prev];
        const last = copy[copy.length - 1];
        if (last && last.role === "assistant" && last.content === "") {
          copy[copy.length - 1] = {
            ...last,
            content: "Une erreur est survenue. Veuillez réessayer.",
          };
        }
        return copy;
      });
    } finally {
      setStreaming(false);
      abortRef.current = null;
      textareaRef.current?.focus();
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void sendMessage(input);
    }
  }

  const hasMessages = messages.length > 0;

  return (
    <>
      {/* Bounce animation */}
      <style>{`
        @keyframes copilot-bounce {
          0%, 80%, 100% { transform: scale(0.7); opacity: 0.4; }
          40% { transform: scale(1); opacity: 1; }
        }
      `}</style>

      <div
        style={{
          display: "flex",
          height: "100%",
          border: "1px solid var(--border)",
          borderRadius: "1.5rem",
          overflow: "hidden",
          background: "var(--bg-card)",
        }}
      >
        {/* ── Sidebar ─────────────────────────────────────────────── */}
        <aside
          style={{
            width: "260px",
            flexShrink: 0,
            borderRight: "1px solid var(--border-subtle)",
            background: "var(--bg-secondary, var(--bg-card))",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* New conversation button */}
          <div style={{ padding: "1rem" }}>
            <button
              onClick={newConversation}
              disabled={streaming}
              style={{
                width: "100%",
                padding: "0.5rem 1rem",
                borderRadius: "0.75rem",
                border: "1px solid var(--green-border)",
                background: "var(--green-dim)",
                color: "var(--green)",
                fontWeight: 600,
                fontSize: "0.8125rem",
                cursor: streaming ? "not-allowed" : "pointer",
                opacity: streaming ? 0.6 : 1,
                transition: "opacity 0.15s",
              }}
            >
              + Nouvelle conversation
            </button>
          </div>

          {/* Conversations list */}
          <div style={{ flex: 1, overflowY: "auto", padding: "0 0.5rem 1rem" }}>
            {loadingConvs ? (
              <div style={{ padding: "1rem", fontSize: "0.8125rem", color: "var(--text-muted)", textAlign: "center" }}>
                Chargement…
              </div>
            ) : conversations.length === 0 ? (
              <div style={{ padding: "1rem", fontSize: "0.8125rem", color: "var(--text-muted)", textAlign: "center" }}>
                Aucune conversation
              </div>
            ) : (
              conversations.map((conv) => {
                const isActive = conv.id === activeConvId;
                return (
                  <div
                    key={conv.id}
                    onClick={() => void loadConversation(conv.id)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      padding: "0.5rem 0.625rem",
                      borderRadius: "0.625rem",
                      cursor: "pointer",
                      background: isActive ? "var(--bg-hover)" : "transparent",
                      border: isActive ? "1px solid var(--border-subtle)" : "1px solid transparent",
                      marginBottom: "2px",
                      transition: "background 0.1s",
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p
                        style={{
                          fontSize: "0.8125rem",
                          fontWeight: isActive ? 600 : 400,
                          color: "var(--text-primary)",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          margin: 0,
                        }}
                      >
                        {conv.title || "Conversation"}
                      </p>
                      <p style={{ fontSize: "0.6875rem", color: "var(--text-muted)", margin: 0 }}>
                        {formatDate(conv.updatedAt)}
                      </p>
                    </div>
                    <button
                      onClick={(e) => void deleteConversation(e, conv.id)}
                      style={{
                        flexShrink: 0,
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        color: "var(--text-muted)",
                        fontSize: "0.75rem",
                        padding: "2px 4px",
                        borderRadius: "4px",
                        lineHeight: 1,
                        opacity: 0.6,
                      }}
                      title="Supprimer"
                    >
                      ✕
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </aside>

        {/* ── Main chat area ───────────────────────────────────────── */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
          {/* Messages */}
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "1.5rem",
              display: "flex",
              flexDirection: "column",
              gap: "1rem",
            }}
          >
            {!hasMessages ? (
              /* Welcome screen */
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "100%",
                  gap: "1.5rem",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    width: "56px",
                    height: "56px",
                    borderRadius: "1rem",
                    background: "var(--green-dim)",
                    border: "1px solid var(--green-border)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1.75rem",
                  }}
                >
                  ✦
                </div>
                <div>
                  <h2
                    style={{
                      fontSize: "1.125rem",
                      fontWeight: 700,
                      color: "var(--text-primary)",
                      margin: "0 0 0.5rem",
                    }}
                  >
                    Bonjour&nbsp;!
                  </h2>
                  <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", margin: 0, maxWidth: "360px" }}>
                    Je suis votre assistant IA BluePilot. Posez-moi des questions sur votre transformation IA.
                  </p>
                </div>
                {/* Suggestion chips */}
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", width: "100%", maxWidth: "400px" }}>
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => void sendMessage(s)}
                      style={{
                        padding: "0.625rem 1rem",
                        borderRadius: "0.75rem",
                        border: "1px solid var(--border)",
                        background: "var(--bg-hover)",
                        color: "var(--text-secondary)",
                        fontSize: "0.875rem",
                        cursor: "pointer",
                        textAlign: "left",
                        transition: "border-color 0.15s",
                      }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((msg, idx) => {
                const isUser = msg.role === "user";
                const isLastAssistant =
                  !isUser && idx === messages.length - 1 && streaming;

                return (
                  <div
                    key={idx}
                    style={{
                      display: "flex",
                      justifyContent: isUser ? "flex-end" : "flex-start",
                    }}
                  >
                    <div
                      style={{
                        maxWidth: "70%",
                        padding: "0.625rem 1rem",
                        borderRadius: isUser ? "1rem 1rem 0.25rem 1rem" : "1rem 1rem 1rem 0.25rem",
                        background: isUser ? "var(--green)" : "var(--bg-hover)",
                        color: isUser ? "#fff" : "var(--text-primary)",
                        fontSize: "0.875rem",
                        lineHeight: "1.6",
                        whiteSpace: "pre-wrap",
                        wordBreak: "break-word",
                      }}
                    >
                      {isLastAssistant && msg.content === "" ? (
                        <LoadingDots />
                      ) : (
                        msg.content
                      )}
                    </div>
                  </div>
                );
              })
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input area */}
          <div
            style={{
              borderTop: "1px solid var(--border-subtle)",
              padding: "1rem 1.25rem",
              display: "flex",
              gap: "0.75rem",
              alignItems: "flex-end",
            }}
          >
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={streaming}
              placeholder="Posez une question sur votre transformation IA… (Entrée pour envoyer)"
              rows={1}
              style={{
                flex: 1,
                resize: "none",
                border: "1px solid var(--border)",
                borderRadius: "0.75rem",
                padding: "0.625rem 0.875rem",
                fontSize: "0.875rem",
                color: "var(--text-primary)",
                background: streaming ? "var(--bg-hover)" : "var(--bg-card)",
                outline: "none",
                fontFamily: "inherit",
                lineHeight: "1.5",
                minHeight: "42px",
                maxHeight: "120px",
                overflowY: "auto",
                opacity: streaming ? 0.7 : 1,
              }}
            />
            <button
              onClick={() => void sendMessage(input)}
              disabled={streaming || !input.trim()}
              style={{
                flexShrink: 0,
                height: "42px",
                width: "42px",
                borderRadius: "0.75rem",
                border: "none",
                background:
                  streaming || !input.trim() ? "var(--bg-hover)" : "var(--green)",
                color: streaming || !input.trim() ? "var(--text-muted)" : "#fff",
                fontSize: "1.125rem",
                cursor: streaming || !input.trim() ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "background 0.15s",
              }}
              title="Envoyer"
            >
              ↑
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
