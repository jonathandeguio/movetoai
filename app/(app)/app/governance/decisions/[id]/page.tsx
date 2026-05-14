export const dynamic = "force-dynamic";

import type { Route } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { requireAnyPermission } from "@/server/permissions";
import { governanceRepo }         from "@/lib/repositories/governance.repo";

type ADRStatus = "proposed" | "accepted" | "superseded" | "deprecated";

interface DecisionDetail {
  id: string;
  title: string;
  status: string;
  decisionDate: Date;
  context: string;
  decision: string;
  rationale: string;
  consequences: string | null;
  alternatives: unknown;
  impactedApps: unknown;
  impactedProcesses: unknown;
  expectedOutcome: string | null;
  observedOutcome: string | null;
  outcomeDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
  author: { id: string; name: string | null; email: string };
}

interface PageProps {
  params: Promise<{ id: string }>;
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

function TextBlock({
  title,
  content,
  color,
}: {
  title: string;
  content: string;
  color?: string;
}) {
  return (
    <div
      style={{
        borderRadius: "0.75rem",
        border: "1px solid var(--border)",
        background: "var(--bg-subtle, var(--bg-card))",
        padding: "1.25rem",
        display: "flex",
        flexDirection: "column",
        gap: "0.5rem",
      }}
    >
      <h3
        style={{
          margin: 0,
          fontSize: "0.8rem",
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.06em",
          color: color ?? "var(--text-muted)",
        }}
      >
        {title}
      </h3>
      <p
        style={{
          margin: 0,
          fontSize: "0.9rem",
          color: "var(--text-primary)",
          lineHeight: 1.7,
          whiteSpace: "pre-wrap",
        }}
      >
        {content}
      </p>
    </div>
  );
}

function JsonListBlock({
  title,
  items,
}: {
  title: string;
  items: unknown[];
}) {
  if (!items || items.length === 0) return null;
  return (
    <div
      style={{
        borderRadius: "0.75rem",
        border: "1px solid var(--border)",
        background: "var(--bg-subtle, var(--bg-card))",
        padding: "1.25rem",
        display: "flex",
        flexDirection: "column",
        gap: "0.5rem",
      }}
    >
      <h3
        style={{
          margin: 0,
          fontSize: "0.8rem",
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.06em",
          color: "var(--text-muted)",
        }}
      >
        {title}
      </h3>
      <ul style={{ margin: 0, paddingLeft: "1.25rem" }}>
        {items.map((item, i) => (
          <li key={i} style={{ fontSize: "0.88rem", color: "var(--text-primary)", lineHeight: 1.6 }}>
            {typeof item === "string" ? item : JSON.stringify(item)}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default async function DecisionDetailPage({ params }: PageProps) {
  const { workspace } = await requireAnyPermission([
    "business-structure.manage",
    "analytics.view",
  ]);

  const { id } = await params;

  const decision = await governanceRepo.findDecisionById(id, workspace!.id) as DecisionDetail | null;

  if (!decision) {
    notFound();
  }

  const statusCfg =
    STATUS_CONFIG[decision.status as ADRStatus] ?? STATUS_CONFIG.proposed;

  const formattedDate = new Date(decision.decisionDate).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const impactedApps = Array.isArray(decision.impactedApps) ? decision.impactedApps : [];
  const impactedProcesses = Array.isArray(decision.impactedProcesses)
    ? decision.impactedProcesses
    : [];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", maxWidth: "860px" }}>
      {/* Back link */}
      <Link
        href={"/app/governance/decisions" as Route}
        style={{
          fontSize: "0.82rem",
          color: "var(--text-muted)",
          textDecoration: "none",
          display: "inline-flex",
          alignItems: "center",
          gap: "0.3rem",
        }}
      >
        ← Retour aux décisions
      </Link>

      {/* Header card */}
      <section
        style={{
          borderRadius: "1.5rem",
          border: "1px solid var(--green-border)",
          background: "var(--bg-card)",
          padding: "2rem",
          boxShadow: "var(--shadow-soft-sm)",
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
        }}
      >
        {/* Status + date + author */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            flexWrap: "wrap",
          }}
        >
          <span
            style={{
              padding: "0.2rem 0.7rem",
              borderRadius: "999px",
              fontSize: "0.75rem",
              fontWeight: 700,
              letterSpacing: "0.02em",
              background: statusCfg.bg,
              color: statusCfg.text,
              border: `1px solid ${statusCfg.border}`,
            }}
          >
            {statusCfg.label}
          </span>
          <span style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>
            Décision du {formattedDate}
          </span>
          <span style={{ color: "var(--border)", fontSize: "0.82rem" }}>·</span>
          <span style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>
            Par {decision.author.name ?? decision.author.email}
          </span>
        </div>

        {/* Title */}
        <h1
          style={{
            margin: 0,
            fontSize: "1.8rem",
            fontWeight: 700,
            color: "var(--text-primary)",
            lineHeight: 1.3,
          }}
        >
          {decision.title}
        </h1>

        {/* Action buttons */}
        <div style={{ display: "flex", gap: "0.5rem", paddingTop: "0.25rem" }}>
          <button
            disabled
            title="Modification disponible prochainement"
            style={{
              padding: "0.45rem 1rem",
              borderRadius: "0.5rem",
              background: "var(--border)",
              color: "var(--text-muted)",
              border: "none",
              fontWeight: 500,
              fontSize: "0.82rem",
              cursor: "not-allowed",
            }}
          >
            Modifier
          </button>
        </div>
      </section>

      {/* Main content blocks */}
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <TextBlock title="Contexte" content={decision.context} color="var(--blue, #3b82f6)" />
        <TextBlock title="Décision" content={decision.decision} color="var(--green)" />
        <TextBlock title="Justification" content={decision.rationale} color="var(--purple, #8b5cf6)" />

        {decision.consequences && (
          <TextBlock
            title="Conséquences"
            content={decision.consequences}
            color="var(--amber, #f59e0b)"
          />
        )}
      </div>

      {/* Impacted apps/processes */}
      {(impactedApps.length > 0 || impactedProcesses.length > 0) && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          {impactedApps.length > 0 && (
            <JsonListBlock title="Applications impactées" items={impactedApps} />
          )}
          {impactedProcesses.length > 0 && (
            <JsonListBlock title="Processus impactés" items={impactedProcesses} />
          )}
        </div>
      )}

      {/* Outcomes */}
      {(decision.expectedOutcome || decision.observedOutcome) && (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {decision.expectedOutcome && (
            <TextBlock
              title="Résultat attendu"
              content={decision.expectedOutcome}
              color="var(--text-secondary)"
            />
          )}
          {decision.observedOutcome && (
            <div>
              <TextBlock
                title={`Résultat observé${decision.outcomeDate ? ` (${new Date(decision.outcomeDate).toLocaleDateString("fr-FR")})` : ""}`}
                content={decision.observedOutcome}
                color="var(--green)"
              />
            </div>
          )}
        </div>
      )}

      {/* Metadata footer */}
      <div
        style={{
          borderRadius: "0.75rem",
          border: "1px solid var(--border)",
          background: "var(--bg-card)",
          padding: "1rem 1.25rem",
          display: "flex",
          gap: "2rem",
          flexWrap: "wrap",
          fontSize: "0.78rem",
          color: "var(--text-muted)",
        }}
      >
        <span>
          Créée le{" "}
          {new Date(decision.createdAt).toLocaleDateString("fr-FR", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })}
        </span>
        <span>
          Modifiée le{" "}
          {new Date(decision.updatedAt).toLocaleDateString("fr-FR", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })}
        </span>
        <span>ID: {decision.id}</span>
      </div>
    </div>
  );
}
