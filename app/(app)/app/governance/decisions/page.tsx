export const dynamic = "force-dynamic";

import type { Route } from "next";
import Link from "next/link";

import { requireAnyPermission } from "@/server/permissions";
import { governanceRepo }         from "@/lib/repositories/governance.repo";
import { ADRCard } from "@/components/governance/ADRCard";

type ADRStatus = "proposed" | "accepted" | "superseded" | "deprecated";

interface DecisionRow {
  id: string;
  title: string;
  status: string;
  decisionDate: Date;
  context: string;
  decision: string;
  rationale: string;
  author: { id: string; name: string | null; email: string };
}

const ALL_STATUSES: ADRStatus[] = ["proposed", "accepted", "superseded", "deprecated"];

const STATUS_LABELS: Record<ADRStatus, string> = {
  proposed: "Proposée",
  accepted: "Acceptée",
  superseded: "Remplacée",
  deprecated: "Obsolète",
};

interface PageProps {
  searchParams: Promise<{ status?: string }>;
}

export default async function DecisionsPage({ searchParams }: PageProps) {
  const { workspace } = await requireAnyPermission([
    "business-structure.manage",
    "analytics.view",
  ]);

  const { status: statusParam } = await searchParams;
  const activeStatus: ADRStatus | null =
    statusParam && (ALL_STATUSES as string[]).includes(statusParam)
      ? (statusParam as ADRStatus)
      : null;

  const allDecisions = await governanceRepo.findDecisions(workspace!.id) as DecisionRow[];

  const totalCount = allDecisions.length;
  const proposedCount = allDecisions.filter((d) => d.status === "proposed").length;
  const acceptedCount = allDecisions.filter((d) => d.status === "accepted").length;
  const deprecatedCount = allDecisions.filter((d) => d.status === "deprecated").length;

  const filteredDecisions = activeStatus
    ? allDecisions.filter((d) => d.status === activeStatus)
    : allDecisions;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* Header */}
      <section
        style={{
          borderRadius: "1.5rem",
          border: "1px solid var(--green-border)",
          background: "var(--bg-card)",
          padding: "2rem",
          boxShadow: "var(--shadow-soft-sm)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: "1.5rem",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              padding: "0.2rem 0.75rem",
              borderRadius: "999px",
              border: "1px solid var(--green-border)",
              color: "var(--green)",
              fontSize: "0.8rem",
              fontWeight: 600,
              width: "fit-content",
            }}
          >
            Gouvernance
          </span>
          <h1
            style={{
              fontSize: "2rem",
              fontWeight: 700,
              color: "var(--text-primary)",
              margin: 0,
            }}
          >
            Architecture Decision Registry
          </h1>
          <p
            style={{
              fontSize: "0.95rem",
              color: "var(--text-secondary)",
              maxWidth: "40rem",
              margin: 0,
              lineHeight: 1.6,
            }}
          >
            Centralisez et suivez toutes les décisions architecturales de votre organisation pour
            assurer la cohérence de votre transformation IA.
          </p>
        </div>

        <Link
          href={"/app/governance/decisions/new" as Route}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.4rem",
            padding: "0.6rem 1.25rem",
            borderRadius: "0.5rem",
            background: "var(--green)",
            color: "#fff",
            fontWeight: 600,
            fontSize: "0.875rem",
            textDecoration: "none",
            whiteSpace: "nowrap",
            flexShrink: 0,
          }}
        >
          + Nouvelle décision
        </Link>
      </section>

      {/* Stat cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "1rem",
        }}
      >
        {[
          { label: "Total ADR", value: totalCount, color: "var(--text-primary)" },
          { label: "Proposées", value: proposedCount, color: "var(--blue, #3b82f6)" },
          { label: "Acceptées", value: acceptedCount, color: "var(--green)" },
          { label: "Obsolètes", value: deprecatedCount, color: "var(--text-muted)" },
        ].map((stat) => (
          <div
            key={stat.label}
            style={{
              borderRadius: "1rem",
              border: "1px solid var(--border)",
              background: "var(--bg-card)",
              padding: "1.25rem 1.5rem",
              display: "flex",
              flexDirection: "column",
              gap: "0.25rem",
            }}
          >
            <span
              style={{
                fontSize: "1.75rem",
                fontWeight: 700,
                color: stat.color,
                lineHeight: 1,
              }}
            >
              {stat.value}
            </span>
            <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{stat.label}</span>
          </div>
        ))}
      </div>

      {/* Status filter tabs */}
      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
        <Link
          href={"/app/governance/decisions" as Route}
          style={{
            padding: "0.35rem 0.9rem",
            borderRadius: "999px",
            fontSize: "0.82rem",
            fontWeight: activeStatus === null ? 700 : 500,
            background:
              activeStatus === null
                ? "var(--green)"
                : "color-mix(in srgb, var(--border) 50%, transparent)",
            color: activeStatus === null ? "#fff" : "var(--text-secondary)",
            textDecoration: "none",
            border: "1px solid transparent",
            transition: "all 0.15s",
          }}
        >
          Toutes ({totalCount})
        </Link>
        {ALL_STATUSES.map((s) => {
          const count = allDecisions.filter((d) => d.status === s).length;
          const isActive = activeStatus === s;
          return (
            <Link
              key={s}
              href={`/app/governance/decisions?status=${s}` as Route}
              style={{
                padding: "0.35rem 0.9rem",
                borderRadius: "999px",
                fontSize: "0.82rem",
                fontWeight: isActive ? 700 : 500,
                background: isActive
                  ? "var(--green)"
                  : "color-mix(in srgb, var(--border) 50%, transparent)",
                color: isActive ? "#fff" : "var(--text-secondary)",
                textDecoration: "none",
                border: "1px solid transparent",
                transition: "all 0.15s",
              }}
            >
              {STATUS_LABELS[s]} ({count})
            </Link>
          );
        })}
      </div>

      {/* Grid of ADR cards */}
      {filteredDecisions.length === 0 ? (
        <div
          style={{
            borderRadius: "1rem",
            border: "1px dashed var(--border)",
            padding: "3rem",
            textAlign: "center",
            color: "var(--text-muted)",
            fontSize: "0.9rem",
          }}
        >
          Aucune décision architecturale
          {activeStatus ? ` avec le statut "${STATUS_LABELS[activeStatus]}"` : ""}.
          <br />
          <Link
            href={"/app/governance/decisions/new" as Route}
            style={{
              color: "var(--green)",
              textDecoration: "none",
              fontWeight: 600,
              marginTop: "0.5rem",
              display: "inline-block",
            }}
          >
            Créer la première ADR
          </Link>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
            gap: "1rem",
          }}
        >
          {filteredDecisions.map((d) => (
            <ADRCard
              key={d.id}
              id={d.id}
              title={d.title}
              status={d.status as "proposed" | "accepted" | "superseded" | "deprecated"}
              decisionDate={d.decisionDate}
              author={{ name: d.author.name }}
              context={d.context}
              decision={d.decision}
              rationale={d.rationale}
            />
          ))}
        </div>
      )}
    </div>
  );
}
