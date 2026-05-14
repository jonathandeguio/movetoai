import type { Route } from "next";
import Link from "next/link";
import { Network, Plus } from "lucide-react";

import { AriaBanner }   from "@/components/aria/AriaBanner";
import { ProcessCard }  from "@/components/knowledge/ProcessCard";
import { getKnowledgeProcessesPageData } from "@/modules/knowledge/processes/server/get-processes-page-data";

export const dynamic = "force-dynamic";

export default async function KnowledgeProcessesPage() {
  const { processes, stats } = await getKnowledgeProcessesPageData();

  return (
    <div className="space-y-6">
      <AriaBanner />

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-[--text-primary]">
            Processus métier
          </h1>
          <p className="mt-1 text-sm text-[--text-muted]">
            {stats.total} processus dans ce workspace
          </p>
        </div>
        <Link
          href={"/app/admin/processes" as Route}
          className="inline-flex items-center gap-1.5 rounded-lg bg-[--blue] px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
        >
          <Plus className="h-4 w-4" />
          Nouveau processus
        </Link>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Total",                        value: stats.total,           color: "text-[--text-primary]" },
          { label: "Potentiel IA élevé",            value: stats.highAiPotential, color: "text-[--green]"        },
          { label: "Avec étapes documentées",       value: stats.withSteps,       color: "text-[--blue]"         },
        ].map((stat) => (
          <div key={stat.label} className="rounded-2xl border border-[--border] bg-[--bg-card] p-5 shadow-sm">
            <p className="text-sm text-[--text-muted]">{stat.label}</p>
            <p className={`mt-1 text-3xl font-bold ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Content */}
      {processes.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-[--border] bg-[--bg-hover] py-16 text-center">
          <Network className="h-10 w-10 text-[--text-disabled]" />
          <div>
            <p className="font-medium text-[--text-secondary]">Aucun processus documenté</p>
            <p className="mt-1 text-sm text-[--text-muted]">
              Commencez par cartographier vos processus métier clés.
            </p>
          </div>
          <Link
            href={"/app/admin/processes" as Route}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[--blue] px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
          >
            <Plus className="h-4 w-4" />
            Nouveau processus
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {processes.map((process) => (
            <ProcessCard
              key={process.id}
              id={process.id}
              name={process.name}
              description={process.description}
              aiPotential={process.aiPotential}
              frequency={process.frequency}
              manualEffortH={process.manualEffortH}
              painLevel={process.painLevel}
              automationRate={process.automationRate}
              capability={process.capability}
              domain={process.domain}
              owner={process.owner}
              _count={process._count}
            />
          ))}
        </div>
      )}
    </div>
  );
}
