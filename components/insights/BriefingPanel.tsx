"use client";

import { useState } from "react";
import type { WeeklyBriefing, BriefingSection } from "@/lib/ai/weekly-briefing";

function SkeletonBlock({ height = "80px" }: { height?: string }) {
  return (
    <div
      style={{
        height,
        borderRadius: "0.75rem",
        background: "var(--bg-hover)",
        animation: "briefing-pulse 1.5s ease-in-out infinite",
      }}
    />
  );
}

function TrendIcon({ trend }: { trend: "up" | "down" | "stable" }) {
  if (trend === "up") return <span style={{ color: "var(--green)", fontSize: "1rem" }}>↑</span>;
  if (trend === "down") return <span style={{ color: "var(--red)", fontSize: "1rem" }}>↓</span>;
  return <span style={{ color: "var(--text-muted)", fontSize: "1rem" }}>→</span>;
}

function Accordion({ section }: { section: BriefingSection }) {
  const [open, setOpen] = useState(false);

  return (
    <div
      style={{
        border: "1px solid var(--border)",
        borderRadius: "0.875rem",
        overflow: "hidden",
      }}
    >
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0.875rem 1.25rem",
          background: open ? "var(--bg-hover)" : "var(--bg-card)",
          border: "none",
          cursor: "pointer",
          textAlign: "left",
          gap: "1rem",
          transition: "background 0.15s",
        }}
      >
        <span
          style={{
            fontWeight: 600,
            fontSize: "0.9rem",
            color: "var(--text-primary)",
          }}
        >
          {section.title}
        </span>
        <span
          style={{
            color: "var(--text-muted)",
            fontSize: "0.875rem",
            transform: open ? "rotate(180deg)" : "none",
            transition: "transform 0.2s",
            flexShrink: 0,
          }}
        >
          ▾
        </span>
      </button>

      {open && (
        <div
          style={{
            padding: "0.875rem 1.25rem 1.125rem",
            borderTop: "1px solid var(--border-subtle)",
            background: "var(--bg-card)",
          }}
        >
          {section.content && (
            <p
              style={{
                fontSize: "0.875rem",
                color: "var(--text-secondary)",
                lineHeight: "1.6",
                margin: "0 0 0.625rem",
              }}
            >
              {section.content}
            </p>
          )}
          {section.items && section.items.length > 0 && (
            <ul style={{ margin: 0, paddingLeft: "1.125rem", display: "flex", flexDirection: "column", gap: "0.375rem" }}>
              {section.items.map((item, i) => (
                <li
                  key={i}
                  style={{ fontSize: "0.8125rem", color: "var(--text-primary)", lineHeight: "1.5" }}
                >
                  {item}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

export function BriefingPanel() {
  const [briefing, setBriefing] = useState<WeeklyBriefing | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function generate() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/briefing/generate", { method: "POST" });
      if (!res.ok) {
        const body = (await res.json()) as { error?: string };
        throw new Error(body.error ?? "Erreur lors de la génération");
      }
      const data = (await res.json()) as WeeklyBriefing;
      setBriefing(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <style>{`
        @keyframes briefing-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>

      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        {/* Action bar */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem" }}>
          {briefing && (
            <p style={{ fontSize: "0.8125rem", color: "var(--text-muted)", margin: 0 }}>
              Généré le{" "}
              {new Date(briefing.generatedAt).toLocaleDateString("fr-FR", {
                day: "numeric",
                month: "long",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          )}
          <div style={{ marginLeft: "auto" }}>
            <button
              onClick={() => void generate()}
              disabled={loading}
              style={{
                padding: "0.5rem 1.25rem",
                borderRadius: "0.75rem",
                border: "1px solid var(--green-border)",
                background: loading ? "var(--bg-hover)" : "var(--green-dim)",
                color: loading ? "var(--text-muted)" : "var(--green)",
                fontWeight: 600,
                fontSize: "0.8125rem",
                cursor: loading ? "not-allowed" : "pointer",
                transition: "opacity 0.15s",
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? "Génération en cours…" : briefing ? "Régénérer" : "Générer le briefing"}
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div
            style={{
              padding: "0.875rem 1.25rem",
              borderRadius: "0.875rem",
              border: "1px solid var(--red-dim)",
              background: "var(--red-dim)",
              color: "var(--red)",
              fontSize: "0.875rem",
            }}
          >
            {error}
          </div>
        )}

        {/* Loading skeleton */}
        {loading && !briefing && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <SkeletonBlock height="64px" />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem" }}>
              <SkeletonBlock height="80px" />
              <SkeletonBlock height="80px" />
              <SkeletonBlock height="80px" />
            </div>
            <SkeletonBlock height="100px" />
            <SkeletonBlock height="100px" />
            <SkeletonBlock height="100px" />
          </div>
        )}

        {/* Briefing content */}
        {briefing && !loading && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            {/* Period banner */}
            <div
              style={{
                padding: "0.875rem 1.25rem",
                borderRadius: "0.875rem",
                border: "1px solid var(--blue-dim)",
                background: "var(--blue-dim)",
              }}
            >
              <p style={{ margin: 0, fontWeight: 600, fontSize: "0.875rem", color: "var(--blue)" }}>
                {briefing.period}
              </p>
            </div>

            {/* Key metrics */}
            {briefing.keyMetrics.length > 0 && (
              <div>
                <h2
                  style={{
                    margin: "0 0 0.875rem",
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color: "var(--text-muted)",
                  }}
                >
                  Métriques clés
                </h2>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
                    gap: "0.875rem",
                  }}
                >
                  {briefing.keyMetrics.map((m, i) => (
                    <div
                      key={i}
                      style={{
                        padding: "1rem 1.125rem",
                        borderRadius: "0.875rem",
                        border: "1px solid var(--border)",
                        background: "var(--bg-card)",
                        display: "flex",
                        flexDirection: "column",
                        gap: "0.25rem",
                      }}
                    >
                      <p style={{ margin: 0, fontSize: "0.75rem", color: "var(--text-muted)" }}>
                        {m.label}
                      </p>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
                        <span
                          style={{
                            fontSize: "1.5rem",
                            fontWeight: 700,
                            color: "var(--text-primary)",
                          }}
                        >
                          {m.value}
                        </span>
                        <TrendIcon trend={m.trend} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Sections (accordions) */}
            {briefing.sections.length > 0 && (
              <div>
                <h2
                  style={{
                    margin: "0 0 0.875rem",
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color: "var(--text-muted)",
                  }}
                >
                  Sections
                </h2>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  {briefing.sections.map((section, i) => (
                    <Accordion key={i} section={section} />
                  ))}
                </div>
              </div>
            )}

            {/* Top opportunities */}
            {briefing.topOpportunities.length > 0 && (
              <div
                style={{
                  padding: "1.125rem 1.25rem",
                  borderRadius: "0.875rem",
                  border: "1px solid var(--amber-dim)",
                  background: "var(--amber-dim)",
                }}
              >
                <h2
                  style={{
                    margin: "0 0 0.75rem",
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color: "var(--amber)",
                  }}
                >
                  Top opportunités
                </h2>
                <ol
                  style={{
                    margin: 0,
                    paddingLeft: "1.25rem",
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.375rem",
                  }}
                >
                  {briefing.topOpportunities.map((opp, i) => (
                    <li
                      key={i}
                      style={{ fontSize: "0.875rem", color: "var(--text-primary)", lineHeight: "1.5" }}
                    >
                      {opp}
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {/* Recommendations */}
            {briefing.recommendations.length > 0 && (
              <div
                style={{
                  padding: "1.125rem 1.25rem",
                  borderRadius: "0.875rem",
                  border: "1px solid var(--green-border)",
                  background: "var(--green-dim)",
                }}
              >
                <h2
                  style={{
                    margin: "0 0 0.75rem",
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color: "var(--green)",
                  }}
                >
                  Recommandations
                </h2>
                <ul
                  style={{
                    margin: 0,
                    padding: 0,
                    listStyle: "none",
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.5rem",
                  }}
                >
                  {briefing.recommendations.map((rec, i) => (
                    <li
                      key={i}
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: "0.5rem",
                        fontSize: "0.875rem",
                        color: "var(--text-primary)",
                        lineHeight: "1.5",
                      }}
                    >
                      <span style={{ color: "var(--green)", flexShrink: 0, marginTop: "2px" }}>✓</span>
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Empty state */}
        {!briefing && !loading && !error && (
          <div
            style={{
              padding: "3rem 2rem",
              borderRadius: "1rem",
              border: "1px dashed var(--border)",
              background: "var(--bg-hover)",
              textAlign: "center",
            }}
          >
            <p style={{ margin: "0 0 0.5rem", fontWeight: 600, color: "var(--text-secondary)", fontSize: "0.9375rem" }}>
              Aucun briefing généré
            </p>
            <p style={{ margin: 0, fontSize: "0.875rem", color: "var(--text-muted)" }}>
              Cliquez sur &ldquo;Générer le briefing&rdquo; pour obtenir votre rapport hebdomadaire IA.
            </p>
          </div>
        )}
      </div>
    </>
  );
}
