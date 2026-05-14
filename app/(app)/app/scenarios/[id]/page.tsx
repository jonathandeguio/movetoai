export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import type { Route } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

import { scenarioRepo }           from "@/lib/repositories/scenario.repo";
import { requireAnyPermission }  from "@/server/permissions";
import { ScenarioBuilder } from "@/components/scenarios/ScenarioBuilder";

type Props = { params: Promise<{ id: string }> };

// ── Status display ─────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; border: string }> = {
  draft: { label: "Brouillon", color: "var(--amber)", bg: "var(--amber-dim)", border: "var(--amber)" },
  active: { label: "Actif", color: "var(--green)", bg: "var(--green-dim)", border: "var(--green-border)" },
  archived: { label: "Archivé", color: "var(--text-muted)", bg: "var(--bg-hover)", border: "var(--border)" },
};

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function ScenarioDetailPage({ params }: Props) {
  const { id } = await params;
  const { workspace } = await requireAnyPermission(["opportunities.manage", "analytics.view"]);

  const [scenario, allScenarios] = await Promise.all([
    scenarioRepo.findById(id, workspace!.id),
    scenarioRepo.findTitles(workspace!.id),
  ]);

  if (!scenario) notFound();

  const cfg = STATUS_CONFIG[scenario.status] ?? STATUS_CONFIG.draft;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      {/* Breadcrumb */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
        <Link
          href={"/app/scenarios" as Route}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "4px",
            fontSize: "13px",
            color: "var(--text-muted)",
            textDecoration: "none",
          }}
        >
          <ChevronLeft size={14} />
          Scénarios
        </Link>
        <span style={{ fontSize: "13px", color: "var(--text-muted)" }}>/</span>
        <span style={{ fontSize: "13px", color: "var(--text-secondary)", fontWeight: 500 }}>
          {scenario.title}
        </span>
        <span
          style={{
            fontSize: "11px",
            fontWeight: 600,
            color: cfg.color,
            background: cfg.bg,
            border: `1px solid ${cfg.border}`,
            borderRadius: "999px",
            padding: "2px 10px",
            marginLeft: "4px",
          }}
        >
          {cfg.label}
        </span>
      </div>

      {/* Builder */}
      <ScenarioBuilder
        scenarioId={scenario.id}
        initialData={{
          id: scenario.id,
          title: scenario.title,
          description: scenario.description,
          status: scenario.status as "draft" | "active" | "archived",
          items: scenario.items as Parameters<typeof ScenarioBuilder>[0]["initialData"]["items"],
          totalInvestment: scenario.totalInvestment,
          totalExpectedGain: scenario.totalExpectedGain,
          roi: scenario.roi,
        }}
        allScenarios={allScenarios}
      />
    </div>
  );
}
