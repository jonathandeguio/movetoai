"use client";

import { useEffect, useState, useCallback } from "react";
import { formatRelativeTime } from "@/lib/bpmn/bpmn-utils";

// ── Types ─────────────────────────────────────────────────────────────────────

interface CommentAuthor { id: string; name: string | null; image: string | null }

interface CommentReply {
  id: string; commentId: string; content: string; createdAt: string;
  author: CommentAuthor;
}

interface DiagramComment {
  id: string; diagramId: string; elementId: string | null; elementType: string | null;
  content: string; resolved: boolean; createdAt: string; updatedAt: string;
  author: CommentAuthor; replies: CommentReply[];
}

interface Props {
  useCaseId: string;
  selectedElementId?: string | null;
  currentUserId?: string;
  onCommentAdded?: () => void;
}

// ── Avatar ────────────────────────────────────────────────────────────────────

function Avatar({ name, size = 24 }: { name: string | null; size?: number }) {
  const initial = name?.trim()?.[0]?.toUpperCase() ?? "?";
  const hue = name
    ? Array.from(name).reduce((a, c) => a + c.charCodeAt(0), 0) % 360
    : 200;
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%", flexShrink: 0,
      background: `hsl(${hue},55%,35%)`, display: "flex", alignItems: "center",
      justifyContent: "center", fontSize: size * 0.42, fontWeight: 600,
      color: "#fff", userSelect: "none",
    }}>{initial}</div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function CommentsPanel({ useCaseId, selectedElementId, currentUserId, onCommentAdded }: Props) {
  const [comments,       setComments]       = useState<DiagramComment[]>([]);
  const [loading,        setLoading]        = useState(true);
  const [newText,        setNewText]        = useState("");
  const [linkToElement,  setLinkToElement]  = useState(false);
  const [submitting,     setSubmitting]     = useState(false);
  const [expandedIds,    setExpandedIds]    = useState<Set<string>>(new Set());
  const [replyTexts,     setReplyTexts]     = useState<Record<string, string>>({});
  const [replyingTo,     setReplyingTo]     = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch(`/api/use-cases/${useCaseId}/diagram/comments`);
      const data = await r.json();
      if (Array.isArray(data)) setComments(data);
    } finally { setLoading(false); }
  }, [useCaseId]);

  useEffect(() => { load(); }, [load]);

  async function submitComment() {
    const text = newText.trim();
    if (!text || submitting) return;
    setSubmitting(true);
    try {
      await fetch(`/api/use-cases/${useCaseId}/diagram/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content:     text,
          elementId:   (linkToElement && selectedElementId) ? selectedElementId : undefined,
          elementType: (linkToElement && selectedElementId) ? "element" : undefined,
        }),
      });
      setNewText("");
      setLinkToElement(false);
      await load();
      onCommentAdded?.();
    } finally { setSubmitting(false); }
  }

  async function toggleResolve(comment: DiagramComment) {
    await fetch(`/api/use-cases/${useCaseId}/diagram/comments/${comment.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resolved: !comment.resolved }),
    });
    await load();
  }

  async function deleteComment(id: string) {
    await fetch(`/api/use-cases/${useCaseId}/diagram/comments/${id}`, { method: "DELETE" });
    await load();
  }

  async function submitReply(commentId: string) {
    const text = (replyTexts[commentId] ?? "").trim();
    if (!text) return;
    await fetch(`/api/use-cases/${useCaseId}/diagram/comments/${commentId}/replies`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: text }),
    });
    setReplyTexts(prev => ({ ...prev, [commentId]: "" }));
    setReplyingTo(null);
    await load();
  }

  // Sort: element comments matching selection first, then chronological
  const sorted = [...comments].sort((a, b) => {
    const aMatch = a.elementId === selectedElementId ? -1 : 0;
    const bMatch = b.elementId === selectedElementId ? -1 : 0;
    if (aMatch !== bMatch) return aMatch - bMatch;
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  });

  const S = {
    panel: {
      width: 256, background: "var(--bg-primary)", borderLeft: "1px solid var(--border)",
      display: "flex", flexDirection: "column" as const, height: "100%", overflow: "hidden",
    },
    header: {
      padding: "10px 12px 8px", borderBottom: "1px solid var(--border)", flexShrink: 0,
      fontSize: 10, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase" as const,
      color: "var(--green)",
    },
    list: { flex: 1, overflowY: "auto" as const, padding: "8px 10px" },
    card: (highlight: boolean, resolved: boolean) => ({
      borderRadius: 8, border: `1px solid ${highlight ? "var(--green-border)" : "var(--border)"}`,
      background: highlight ? "var(--green-dim)" : resolved ? "transparent" : "var(--bg-secondary)",
      padding: "8px 10px", marginBottom: 8, opacity: resolved ? 0.55 : 1,
      transition: "opacity 0.2s",
    }),
    authorRow: { display: "flex", alignItems: "center", gap: 6, marginBottom: 4 },
    authorName: { fontSize: 11, fontWeight: 600, color: "var(--text-secondary)" },
    time: { fontSize: 10, color: "var(--text-disabled)", marginLeft: "auto" },
    elementBadge: {
      fontSize: 9, background: "var(--blue-dim)", color: "var(--blue)",
      borderRadius: 4, padding: "1px 6px", display: "inline-block", marginBottom: 4,
    },
    content: { fontSize: 12, color: "var(--text-primary)", lineHeight: 1.5, wordBreak: "break-word" as const },
    actions: { display: "flex", gap: 8, marginTop: 6 },
    actionBtn: (color?: string) => ({
      fontSize: 10, color: color ?? "var(--text-muted)", background: "none", border: "none",
      cursor: "pointer", padding: 0,
    }),
    replyArea: {
      marginTop: 6, paddingTop: 6, borderTop: "1px solid var(--border-subtle)",
    },
    replyCard: {
      marginTop: 4, display: "flex", gap: 6, alignItems: "flex-start",
    },
    replyContent: { fontSize: 11, color: "var(--text-secondary)", lineHeight: 1.4 },
    footer: {
      flexShrink: 0, padding: "8px 10px", borderTop: "1px solid var(--border)",
      background: "var(--bg-primary)",
    },
    textarea: {
      width: "100%", resize: "none" as const, borderRadius: 6, padding: "6px 8px",
      border: "1px solid var(--border)", background: "var(--bg-secondary)",
      color: "var(--text-primary)", fontSize: 12, lineHeight: 1.5,
      boxSizing: "border-box" as const, fontFamily: "inherit",
    },
    sendBtn: (disabled: boolean) => ({
      marginTop: 6, width: "100%", padding: "5px 0", borderRadius: 6,
      border: "1px solid var(--green-border)", background: disabled ? "transparent" : "var(--green-dim)",
      color: disabled ? "var(--text-disabled)" : "var(--green)",
      fontSize: 12, fontWeight: 500, cursor: disabled ? "not-allowed" : "pointer",
    }),
    linkRow: {
      display: "flex", alignItems: "center", gap: 6, marginTop: 4,
      fontSize: 11, color: "var(--text-muted)",
    },
  };

  return (
    <div style={S.panel}>
      <div style={S.header}>
        Commentaires · {comments.length}
      </div>

      <div style={S.list}>
        {loading && (
          <p style={{ fontSize: 11, color: "var(--text-disabled)", textAlign: "center", paddingTop: 16 }}>
            Chargement…
          </p>
        )}
        {!loading && comments.length === 0 && (
          <p style={{ fontSize: 11, color: "var(--text-disabled)", textAlign: "center", paddingTop: 16 }}>
            Aucun commentaire.
          </p>
        )}

        {sorted.map(comment => {
          const isHighlighted = !!selectedElementId && comment.elementId === selectedElementId;
          const isExpanded    = expandedIds.has(comment.id);

          return (
            <div key={comment.id} style={S.card(isHighlighted, comment.resolved)}>
              {comment.elementId && (
                <div style={S.elementBadge}>
                  Élément : {comment.elementId.slice(0, 12)}
                </div>
              )}
              <div style={S.authorRow}>
                <Avatar name={comment.author.name} size={20} />
                <span style={S.authorName}>{comment.author.name ?? "Anonyme"}</span>
                <span style={S.time}>{formatRelativeTime(new Date(comment.createdAt))}</span>
              </div>
              <p style={S.content}>{comment.content}</p>

              <div style={S.actions}>
                <button style={S.actionBtn(comment.resolved ? "var(--text-muted)" : "var(--green)")}
                  onClick={() => toggleResolve(comment)}>
                  {comment.resolved ? "Rouvrir" : "Résoudre"}
                </button>
                <button style={S.actionBtn()} onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}>
                  Répondre
                </button>
                {comment.author.id === currentUserId && (
                  <button style={S.actionBtn("var(--red)")} onClick={() => deleteComment(comment.id)}>
                    Suppr.
                  </button>
                )}
              </div>

              {/* Replies */}
              {comment.replies.length > 0 && (
                <div style={S.replyArea}>
                  {!isExpanded && comment.replies.length > 0 && (
                    <button style={S.actionBtn()} onClick={() =>
                      setExpandedIds(s => { const n = new Set(s); n.add(comment.id); return n; })}>
                      +{comment.replies.length} réponse{comment.replies.length > 1 ? "s" : ""}
                    </button>
                  )}
                  {isExpanded && comment.replies.map(r => (
                    <div key={r.id} style={S.replyCard}>
                      <Avatar name={r.author.name} size={16} />
                      <div>
                        <span style={{ fontSize: 10, fontWeight: 600, color: "var(--text-muted)" }}>
                          {r.author.name ?? "Anonyme"}
                        </span>
                        <p style={S.replyContent}>{r.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Reply form */}
              {replyingTo === comment.id && (
                <div style={{ marginTop: 6 }}>
                  <textarea
                    rows={2}
                    value={replyTexts[comment.id] ?? ""}
                    onChange={e => setReplyTexts(prev => ({ ...prev, [comment.id]: e.target.value }))}
                    placeholder="Votre réponse…"
                    style={S.textarea}
                  />
                  <button style={S.sendBtn(!(replyTexts[comment.id] ?? "").trim())}
                    onClick={() => submitReply(comment.id)}>
                    Envoyer
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* New comment form */}
      <div style={S.footer}>
        <textarea
          rows={3}
          value={newText}
          onChange={e => setNewText(e.target.value)}
          placeholder="Ajouter un commentaire…"
          style={S.textarea}
        />
        {selectedElementId && (
          <label style={S.linkRow}>
            <input type="checkbox" checked={linkToElement}
              onChange={e => setLinkToElement(e.target.checked)}
              style={{ width: 12, height: 12 }} />
            Lier à l&apos;élément sélectionné
          </label>
        )}
        <button style={S.sendBtn(!newText.trim() || submitting)} onClick={submitComment}>
          {submitting ? "Envoi…" : "Publier"}
        </button>
      </div>
    </div>
  );
}
