"use client";

import { useState, useRef, useEffect, useTransition } from "react";
import { Send, Bot, User, Loader2, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const SUGGESTED_QUESTIONS = [
  "Comment créer une demande d'absence ?",
  "Quel est le processus de relance client ?",
  "Comment utiliser l'outil de clôture mensuelle ?",
  "Qui contacter pour un problème d'accès ?",
];

export default function MemberAssistantPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Bonjour ! Je suis votre assistant IA. Posez-moi vos questions sur vos processus, vos tâches ou l'utilisation de la plateforme. Je suis là pour vous aider.",
    },
  ]);
  const [input, setInput] = useState("");
  const [isPending, startTransition] = useTransition();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function sendMessage(text: string) {
    if (!text.trim() || isPending) return;
    const userMsg: Message = { role: "user", content: text.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    startTransition(() => {
      void (async () => {
        // Simulate assistant response — replace with real API call to /api/assistant
        await new Promise((r) => setTimeout(r, 800));
        const reply: Message = {
          role: "assistant",
          content:
            "Je comprends votre question. Pour le moment, cette fonctionnalité est en cours d'activation par votre administrateur workspace. En attendant, je vous invite à contacter votre responsable d'équipe pour obtenir de l'aide.",
        };
        setMessages((prev) => [...prev, reply]);
      })();
    });
  }

  return (
    <div className="flex flex-col" style={{ height: "calc(100vh - 200px)", minHeight: "500px" }}>
      {/* Header */}
      <div className="mb-4 flex items-center gap-3 rounded-2xl border border-[--border] bg-[--bg-card] px-5 py-3.5 shadow-sm shrink-0">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[--bg-hover]">
          <Sparkles className="h-4 w-4 text-[--text-secondary]" />
        </div>
        <div>
          <p className="text-sm font-semibold text-[--text-primary]">Assistant IA</p>
          <p className="text-xs text-[--text-muted]">Disponible pour vos questions métier</p>
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          <div className="h-2 w-2 rounded-full bg-[--green]" />
          <span className="text-xs text-[--text-muted]">En ligne</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto rounded-2xl border border-[--border] bg-[--bg-card] p-5 shadow-sm space-y-4">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
          >
            <div
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
                msg.role === "assistant" ? "bg-[--bg-hover]" : "bg-[--bg-secondary]"
              }`}
            >
              {msg.role === "assistant" ? (
                <Bot className="h-4 w-4 text-[--text-secondary]" />
              ) : (
                <User className="h-4 w-4 text-[--text-primary]" />
              )}
            </div>
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                msg.role === "assistant"
                  ? "bg-[--bg-hover] border border-[--border] text-[--text-secondary]"
                  : "bg-[--bg-secondary] text-[--text-primary]"
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
        {isPending && (
          <div className="flex gap-3">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[--bg-hover]">
              <Bot className="h-4 w-4 text-[--text-secondary]" />
            </div>
            <div className="rounded-2xl border border-[--border] bg-[--bg-hover] px-4 py-3">
              <Loader2 className="h-4 w-4 animate-spin text-[--text-muted]" />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Suggestions */}
      {messages.length === 1 && (
        <div className="mt-3 flex flex-wrap gap-2 shrink-0">
          {SUGGESTED_QUESTIONS.map((q) => (
            <button
              key={q}
              onClick={() => sendMessage(q)}
              className="rounded-xl border border-[--border] bg-[--bg-card] px-3 py-1.5 text-xs text-[--text-secondary] hover:border-[--border-strong] hover:bg-[--bg-hover] transition shadow-sm"
            >
              {q}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="mt-3 flex gap-2 shrink-0">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage(input)}
          placeholder="Posez votre question…"
          className="flex-1 rounded-xl border border-[--border] bg-[--bg-card] px-4 py-2.5 text-sm text-[--text-primary] placeholder:text-[--text-muted] focus:border-[--border-focus] focus:outline-none shadow-sm"
          disabled={isPending}
        />
        <Button
          onClick={() => sendMessage(input)}
          disabled={isPending || !input.trim()}
          size="icon"
          className="rounded-xl h-10 w-10 shrink-0"
        >
          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
}
