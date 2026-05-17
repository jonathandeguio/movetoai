// components/aria/AriaSuggestion.tsx
// Card de suggestion cliquable affichée dans le panel Aria.

"use client";

import { useRouter }             from "next/navigation";
import type { Route }            from "next";
import type { AriaSuggestion }   from "@/lib/aria/page-configs";

interface AriaSuggestionCardProps {
  suggestion: AriaSuggestion;
  onAction?:  () => void;
}

export function AriaSuggestionCard({ suggestion, onAction }: AriaSuggestionCardProps) {
  const router = useRouter();

  const handleClick = () => {
    if (suggestion.action_url) {
      router.push(suggestion.action_url as Route);
    }
    onAction?.();
  };

  const priorityColor: Record<string, string> = {
    high:   "rgba(248,113,113,0.18)",
    medium: "rgba(251,191,36,0.14)",
    low:    "rgba(110,231,183,0.10)",
  };

  const priorityBorder: Record<string, string> = {
    high:   "rgba(248,113,113,0.28)",
    medium: "rgba(251,191,36,0.22)",
    low:    "rgba(110,231,183,0.20)",
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      style={{
        width:        "100%",
        textAlign:    "left",
        background:   "rgba(255,255,255,0.025)",
        border:       `1px solid ${priorityBorder[suggestion.priority] ?? "rgba(255,255,255,0.08)"}`,
        borderRadius: 10,
        padding:      "10px 13px",
        cursor:       "pointer",
        transition:   "background 150ms ease, border-color 150ms ease",
        display:      "flex",
        flexDirection:"column",
        gap:          4,
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLButtonElement).style.background     = priorityColor[suggestion.priority] ?? "rgba(255,255,255,0.04)";
        (e.currentTarget as HTMLButtonElement).style.borderColor    = priorityBorder[suggestion.priority] ?? "rgba(255,255,255,0.14)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.background     = "rgba(255,255,255,0.025)";
        (e.currentTarget as HTMLButtonElement).style.borderColor    = priorityBorder[suggestion.priority] ?? "rgba(255,255,255,0.08)";
      }}
    >
      {/* Titre */}
      <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
        <span style={{ fontSize: 15 }}>{suggestion.icon}</span>
        <span style={{ fontSize: 13, fontWeight: 600, color: "#c8cad8", lineHeight: 1.3 }}>
          {suggestion.title}
        </span>
      </div>

      {/* Description */}
      <p style={{
        fontSize:   12,
        color:      "rgba(200,202,216,0.55)",
        lineHeight: 1.5,
        margin:     0,
        paddingLeft: 22,
      }}>
        {suggestion.description}
      </p>

      {/* Action label */}
      <span style={{
        paddingLeft: 22,
        fontSize:    11,
        fontWeight:  600,
        color:       "#6ee7b7",
        marginTop:   2,
      }}>
        {suggestion.action_label}
      </span>
    </button>
  );
}
