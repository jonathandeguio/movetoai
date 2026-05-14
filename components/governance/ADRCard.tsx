"use client";

import type { Route } from "next";
import Link from "next/link";

type ADRStatus = "proposed" | "accepted" | "superseded" | "deprecated";

interface ADRCardProps {
  id: string;
  title: string;
  status: ADRStatus;
  decisionDate: string | Date;
  author: { name: string | null };
  context: string;
  decision: string;
  rationale: string;
}

const STATUS_CONFIG: Record<
  ADRStatus,
  { label: string; bg: string; text: string; border: string }
> = {
  proposed: {
    label: "Proposée",
    bg: "color-mix(in srgb, var(--blue, #3b82f6) 12%, transparent)",
    text: "var(--blue, #3b82f6)",
    border: "color-mix(in srgb, var(--blue, #3b82f6) 30%, transparent)",
  },
  accepted: {
    label: "Acceptée",
    bg: "color-mix(in srgb, var(--green) 12%, transparent)",
    text: "var(--green)",
    border: "color-mix(in srgb, var(--green) 30%, transparent)",
  },
  superseded: {
    label: "Remplacée",
    bg: "color-mix(in srgb, var(--amber, #f59e0b) 12%, transparent)",
    text: "var(--amber, #f59e0b)",
    border: "color-mix(in srgb, var(--amber, #f59e0b) 30%, transparent)",
  },
  deprecated: {
    label: "Obsolète",
    bg: "color-mix(in srgb, var(--text-muted) 12%, transparent)",
    text: "var(--text-muted)",
    border: "color-mix(in srgb, var(--text-muted) 30%, transparent)",
  },
};

function truncate(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text;
  return text.slice(0, maxLen).trimEnd() + "…";
}

export function ADRCard({
  id,
  title,
  status,
  decisionDate,
  author,
  context,
  decision,
  rationale,
}: ADRCardProps) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.proposed;

  const formattedDate = new Date(decisionDate).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  return (
    <Link
      href={`/app/governance/decisions/${id}` as Route}
      style={{ textDecoration: "none", display: "block" }}
    >
      <div
        style={{
          borderRadius: "1rem",
          border: "1px solid var(--border)",
          background: "var(--bg-card)",
          padding: "1.25rem",
          display: "flex",
          flexDirection: "column",
          gap: "0.75rem",
          cursor: "pointer",
          transition: "border-color 0.15s, box-shadow 0.15s",
        }}
        onMouseEnter={(e) => {
          const el = e.currentTarget;
          el.style.borderColor = "var(--green)";
          el.style.boxShadow = "0 0 0 1px var(--green)";
        }}
        onMouseLeave={(e) => {
          const el = e.currentTarget;
          el.style.borderColor = "var(--border)";
          el.style.boxShadow = "none";
        }}
      >
        {/* Header: status + date */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "0.5rem" }}>
          <span
            style={{
              padding: "0.15rem 0.6rem",
              borderRadius: "999px",
              fontSize: "0.72rem",
              fontWeight: 700,
              letterSpacing: "0.02em",
              background: config.bg,
              color: config.text,
              border: `1px solid ${config.border}`,
            }}
          >
            {config.label}
          </span>
          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
            {formattedDate}
          </span>
        </div>

        {/* Title */}
        <h3
          style={{
            margin: 0,
            fontSize: "0.975rem",
            fontWeight: 600,
            color: "var(--text-primary)",
            lineHeight: 1.4,
          }}
        >
          {title}
        </h3>

        {/* Context preview (2 lines) */}
        <p
          style={{
            margin: 0,
            fontSize: "0.82rem",
            color: "var(--text-secondary)",
            lineHeight: 1.55,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          <span style={{ fontWeight: 500, color: "var(--text-muted)", fontSize: "0.75rem" }}>
            Contexte:&nbsp;
          </span>
          {context}
        </p>

        {/* Decision preview (2 lines) */}
        <p
          style={{
            margin: 0,
            fontSize: "0.82rem",
            color: "var(--text-secondary)",
            lineHeight: 1.55,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          <span style={{ fontWeight: 500, color: "var(--text-muted)", fontSize: "0.75rem" }}>
            Décision:&nbsp;
          </span>
          {decision}
        </p>

        {/* Rationale short */}
        {rationale && (
          <p
            style={{
              margin: 0,
              fontSize: "0.78rem",
              color: "var(--text-muted)",
              lineHeight: 1.5,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            Justification: {truncate(rationale, 80)}
          </p>
        )}

        {/* Footer: author */}
        <div
          style={{
            paddingTop: "0.5rem",
            borderTop: "1px solid var(--border)",
            fontSize: "0.75rem",
            color: "var(--text-muted)",
          }}
        >
          Par {author.name ?? "Inconnu"}
        </div>
      </div>
    </Link>
  );
}
