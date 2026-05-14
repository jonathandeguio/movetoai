// components/aria/AriaPanel.tsx
// Panel conversationnel latéral d'Aria — 370 px, slide depuis la droite.

"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { usePathname }                               from "next/navigation";
import { useAria }                                   from "@/hooks/useAria";
import { AriaAvatar }                                from "./AriaAvatar";
import { AriaTyping }                                from "./AriaTyping";
import { ARIA_PAGE_CONFIGS }                         from "@/lib/aria/page-configs";

const PANEL_W = 370;

export function AriaPanel() {
  const pathname  = usePathname();
  const {
    isOpen, close,
    messages, isThinking,
    sendMessage,
  } = useAria();

  const [input, setInput] = useState("");
  const bottomRef         = useRef<HTMLDivElement>(null);
  const inputRef          = useRef<HTMLTextAreaElement>(null);
  const config            = ARIA_PAGE_CONFIGS[pathname];
  const topics            = config?.help_topics ?? [];

  // Focus input quand le panel s'ouvre
  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 320);
  }, [isOpen]);

  // Scroll vers le bas à chaque nouveau message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isThinking]);

  const handleSend = useCallback(() => {
    const text = input.trim();
    if (!text || isThinking) return;
    setInput("");
    void sendMessage(text);
  }, [input, isThinking, sendMessage]);

  const handleKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleTopic = (label: string) => {
    void sendMessage(label);
  };

  const canSend = input.trim().length > 0 && !isThinking;

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          aria-hidden="true"
          onClick={close}
          style={{
            position:       "fixed",
            inset:          0,
            zIndex:         9997,
            background:     "rgba(6,8,16,0.45)",
            backdropFilter: "blur(2px)",
            animation:      "aria-fade-in 200ms ease",
          }}
        />
      )}

      {/* Panel */}
      <aside
        role="dialog"
        aria-label="Aria — Assistante IA"
        aria-modal={isOpen}
        style={{
          position:        "fixed",
          top:             0,
          right:           0,
          bottom:          0,
          zIndex:          9998,
          width:           PANEL_W,
          maxWidth:        "100vw",
          display:         "flex",
          flexDirection:   "column",
          background:      "#0a0e1a",
          borderLeft:      "1px solid rgba(110,231,183,0.14)",
          transform:       isOpen ? "translateX(0)" : `translateX(${PANEL_W}px)`,
          transition:      "transform 280ms cubic-bezier(0.22,1,0.36,1)",
          boxShadow:       isOpen ? "-8px 0 48px rgba(0,0,0,0.55)" : "none",
        }}
      >
        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div
          style={{
            display:      "flex",
            alignItems:   "center",
            gap:          10,
            padding:      "16px 20px",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
            flexShrink:   0,
          }}
        >
          <AriaAvatar size={28} animated={isThinking} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#c8cad8" }}>Aria</div>
            <div style={{ fontSize: 11, color: "rgba(200,202,216,0.40)" }}>
              Assistante IA · Move to AI
            </div>
          </div>
          <button
            type="button"
            onClick={close}
            aria-label="Fermer Aria"
            style={{
              background:   "none",
              border:       "none",
              color:        "rgba(200,202,216,0.38)",
              cursor:       "pointer",
              fontSize:     20,
              lineHeight:   1,
              padding:      "4px 6px",
              borderRadius: 6,
              transition:   "color 150ms ease, background 150ms ease",
            }}
            onMouseEnter={(e) => {
              const b = e.currentTarget as HTMLButtonElement;
              b.style.color      = "#c8cad8";
              b.style.background = "rgba(255,255,255,0.06)";
            }}
            onMouseLeave={(e) => {
              const b = e.currentTarget as HTMLButtonElement;
              b.style.color      = "rgba(200,202,216,0.38)";
              b.style.background = "none";
            }}
          >
            ×
          </button>
        </div>

        {/* ── Messages ────────────────────────────────────────────────────── */}
        <div
          style={{
            flex:          1,
            overflowY:     "auto",
            padding:       "16px 20px",
            display:       "flex",
            flexDirection: "column",
            gap:           12,
          }}
        >
          {/* État vide */}
          {messages.length === 0 && (
            <div style={{ textAlign: "center", paddingTop: 32 }}>
              <AriaAvatar size={52} />
              <p
                style={{
                  marginTop:  14,
                  fontSize:   13,
                  color:      "rgba(200,202,216,0.55)",
                  lineHeight: 1.7,
                }}
              >
                Bonjour ! Je suis Aria, votre assistante IA.<br />
                Comment puis-je vous aider sur cette page ?
              </p>
            </div>
          )}

          {/* Bulles de conversation */}
          {messages.map((msg) => (
            <div
              key={msg.id}
              style={{
                display:       "flex",
                flexDirection: msg.role === "user" ? "row-reverse" : "row",
                alignItems:    "flex-start",
                gap:           8,
              }}
            >
              {msg.role === "aria" && (
                <div style={{ flexShrink: 0, marginTop: 2 }}>
                  <AriaAvatar size={22} />
                </div>
              )}
              <div
                style={{
                  maxWidth:     "82%",
                  padding:      "9px 13px",
                  borderRadius: msg.role === "user"
                    ? "12px 12px 4px 12px"
                    : "12px 12px 12px 4px",
                  background: msg.role === "user"
                    ? "rgba(110,231,183,0.09)"
                    : "rgba(255,255,255,0.035)",
                  border: msg.role === "user"
                    ? "1px solid rgba(110,231,183,0.18)"
                    : "1px solid rgba(255,255,255,0.07)",
                  fontSize:   13,
                  lineHeight: 1.68,
                  color:      "rgba(200,202,216,0.92)",
                  whiteSpace: "pre-wrap",
                  wordBreak:  "break-word",
                }}
              >
                {msg.content}
              </div>
            </div>
          ))}

          {/* Animation frappe */}
          {isThinking && (
            <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
              <div style={{ flexShrink: 0, marginTop: 2 }}>
                <AriaAvatar size={22} animated />
              </div>
              <AriaTyping />
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* ── Questions fréquentes (si aucun message) ──────────────────────── */}
        {topics.length > 0 && messages.length === 0 && (
          <div
            style={{
              padding:    "12px 20px",
              borderTop:  "1px solid rgba(255,255,255,0.05)",
              flexShrink: 0,
            }}
          >
            <p
              style={{
                fontSize:      11,
                color:         "rgba(200,202,216,0.32)",
                marginBottom:  8,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              Questions fréquentes
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
              {topics.map((t) => (
                <button
                  key={t.query}
                  type="button"
                  onClick={() => handleTopic(t.label)}
                  style={{
                    textAlign:  "left",
                    background: "none",
                    border:     "none",
                    padding:    "5px 0",
                    fontSize:   12,
                    color:      "rgba(110,231,183,0.68)",
                    cursor:     "pointer",
                    transition: "color 150ms ease",
                    lineHeight: 1.5,
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#6ee7b7"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "rgba(110,231,183,0.68)"; }}
                >
                  › {t.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Zone de saisie ────────────────────────────────────────────────── */}
        <div
          style={{
            padding:    "12px 16px",
            borderTop:  "1px solid rgba(255,255,255,0.07)",
            display:    "flex",
            gap:        8,
            alignItems: "flex-end",
            flexShrink: 0,
          }}
        >
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              // Auto-resize
              e.target.style.height = "auto";
              e.target.style.height = `${Math.min(e.target.scrollHeight, 80)}px`;
            }}
            onKeyDown={handleKey}
            placeholder="Posez votre question à Aria…"
            rows={1}
            style={{
              flex:        1,
              resize:      "none",
              background:  "rgba(255,255,255,0.04)",
              border:      "1px solid rgba(255,255,255,0.09)",
              borderRadius: 8,
              padding:     "9px 12px",
              fontSize:    13,
              color:       "#c8cad8",
              outline:     "none",
              fontFamily:  "inherit",
              lineHeight:  1.55,
              maxHeight:   80,
              overflowY:   "auto",
              transition:  "border-color 150ms ease",
            }}
            onFocus={(e) => { (e.currentTarget as HTMLTextAreaElement).style.borderColor = "rgba(110,231,183,0.32)"; }}
            onBlur={(e)  => { (e.currentTarget as HTMLTextAreaElement).style.borderColor = "rgba(255,255,255,0.09)"; }}
          />
          <button
            type="button"
            onClick={handleSend}
            disabled={!canSend}
            aria-label="Envoyer"
            style={{
              width:          36,
              height:         36,
              flexShrink:     0,
              borderRadius:   8,
              border:         "none",
              background:     canSend ? "#6ee7b7" : "rgba(110,231,183,0.10)",
              color:          canSend ? "#060810" : "rgba(110,231,183,0.32)",
              cursor:         canSend ? "pointer" : "not-allowed",
              display:        "flex",
              alignItems:     "center",
              justifyContent: "center",
              transition:     "background 150ms ease, color 150ms ease",
              fontSize:       16,
              fontWeight:     700,
            }}
          >
            ↑
          </button>
        </div>
      </aside>

      <style>{`
        @keyframes aria-fade-in {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
      `}</style>
    </>
  );
}
