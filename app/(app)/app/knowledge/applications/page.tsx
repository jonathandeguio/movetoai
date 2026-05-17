import type { Route } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus } from "lucide-react";

import { AriaBanner } from "@/components/aria/AriaBanner";

import { requirePermission } from "@/server/permissions";
import { applicationRepo }    from "@/lib/repositories/application.repo";
import { ApplicationsGrid } from "@/components/knowledge/ApplicationsGrid";

export const dynamic = "force-dynamic";

export default async function KnowledgeApplicationsPage() {
  const { workspace } = await requirePermission("business-structure.manage");
  if (!workspace?.id) redirect("/onboarding");

  const applications = await applicationRepo.findForKnowledge(workspace.id);

  const total = applications.length;
  const activeCount   = applications.filter((a) => a.lifecycleState?.toLowerCase() === "active").length;
  const tolerateCount = applications.filter((a) => a.lifecycleState?.toLowerCase() === "tolerate").length;
  const phaseoutCount = applications.filter((a) => a.lifecycleState?.toLowerCase() === "phaseout").length;

  // Serialize Prisma Float → plain number for client component
  const serialized = applications.map((a) => ({
    ...a,
    annualCost:       a.annualCost       != null ? Number(a.annualCost) : null,
    aiReadinessScore: a.aiReadinessScore != null ? Number(a.aiReadinessScore) : null,
  }));

  return (
    <div className="space-y-6">
      <AriaBanner />
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-[--text-primary]">
            Applications
          </h1>
          <p className="mt-1 text-sm text-[--text-muted]">
            {total} application{total !== 1 ? "s" : ""}
            {activeCount > 0 && ` · ${activeCount} active${activeCount !== 1 ? "s" : ""}`}
            {tolerateCount > 0 && ` · ${tolerateCount} tolérée${tolerateCount !== 1 ? "s" : ""}`}
          </p>
        </div>
        <Link
          href={"/app/admin/applications" as Route}
          className="inline-flex items-center gap-1.5 rounded-lg bg-[--blue] px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
        >
          <Plus className="h-4 w-4" />
          Nouvelle application
        </Link>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-4">
        {[
          { label: "Total",     value: total,        color: "text-[--text-primary]" },
          { label: "Actives",   value: activeCount,   color: "text-[--green]" },
          { label: "Tolérées",  value: tolerateCount, color: "text-[--amber]" },
          { label: "À retirer", value: phaseoutCount, color: "text-[--red]" },
        ].map((stat) => (
          <div key={stat.label} className="rounded-2xl border border-[--border] bg-[--bg-card] p-5 shadow-sm">
            <p className="text-sm text-[--text-muted]">{stat.label}</p>
            <p className={`mt-1 text-3xl font-bold ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Interactive grid with lifecycle tabs (client island) */}
      <ApplicationsGrid applications={serialized} />
    </div>
  );
}
