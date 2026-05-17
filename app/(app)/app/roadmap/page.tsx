import type { Route } from "next";
import Link from "next/link";
import { CalendarRange, CheckCircle2, AlertTriangle, Clock } from "lucide-react";

import { AriaBanner } from "@/components/aria/AriaBanner";

import { requireAnyPermission } from "@/server/permissions";
import { initiativeRepo }        from "@/lib/repositories/initiative.repo";
import { Badge } from "@/components/ui/badge";
import { RoadmapTimeline } from "@/components/roadmap/RoadmapTimeline";

export const dynamic = "force-dynamic";

export default async function RoadmapPage() {
  const { workspace } = await requireAnyPermission(["opportunities.manage", "analytics.view"]);

  const initiatives = await initiativeRepo.findByWorkspace(workspace!.id, { excludeCanceled: true });

  const total      = initiatives.length;
  const inProgress = initiatives.filter((i) => i.status === "IN_PROGRESS").length;
  const atRisk     = initiatives.filter((i) => i.status === "AT_RISK").length;
  const completed  = initiatives.filter((i) => i.status === "COMPLETED").length;

  const stats = [
    {
      label: "Total",
      value: total,
      icon: CalendarRange,
      color: "text-[--blue]",
      bg: "bg-[--blue-dim]",
      border: "border-[--border]",
    },
    {
      label: "En cours",
      value: inProgress,
      icon: Clock,
      color: "text-[--green]",
      bg: "bg-[--green-dim]",
      border: "border-[--green-border]",
    },
    {
      label: "À risque",
      value: atRisk,
      icon: AlertTriangle,
      color: "text-[--amber]",
      bg: "bg-[--amber-dim]",
      border: "border-[--border]",
    },
    {
      label: "Complétées",
      value: completed,
      icon: CheckCircle2,
      color: "text-[--text-muted]",
      bg: "bg-[--bg-hover]",
      border: "border-[--border]",
    },
  ];

  return (
    <div className="space-y-6">
      <AriaBanner />
      {/* Header */}
      <section className="rounded-3xl border border-[--green-border] bg-[--bg-card] p-8 shadow-soft-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-3">
            <Badge>Roadmap</Badge>
            <h2 className="max-w-2xl text-4xl font-semibold tracking-tight text-[--text-primary] text-balance">
              Roadmap IA
            </h2>
            <p className="max-w-2xl text-base leading-8 text-[--text-secondary]">
              Visualisez et planifiez vos initiatives de transformation IA sur une frise temporelle. Suivez les jalons clés et anticipez les risques.
            </p>
          </div>
          <div className="shrink-0">
            <Link
              href={"/app/governance" as Route}
              className="inline-flex items-center gap-2 rounded-xl border border-[--border] bg-[--bg-card] px-4 py-2.5 text-sm font-medium text-[--text-secondary] transition-colors hover:bg-[--bg-hover] hover:text-[--text-primary]"
            >
              Gérer les initiatives
            </Link>
          </div>
        </div>
      </section>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div
              key={s.label}
              className={`rounded-2xl border ${s.border} bg-[--bg-card] p-5 shadow-sm`}
            >
              <div className={`mb-3 inline-flex rounded-xl p-2 ${s.bg}`}>
                <Icon className={`h-4 w-4 ${s.color}`} />
              </div>
              <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
              <p className="mt-1 text-sm font-medium text-[--text-secondary]">{s.label}</p>
            </div>
          );
        })}
      </div>

      {/* Timeline */}
      <RoadmapTimeline
        initiatives={initiatives.map((i) => ({
          id: i.id,
          title: i.name,
          status: i.status as "PLANNED" | "IN_PROGRESS" | "AT_RISK" | "COMPLETED" | "CANCELED",
          startDate: i.startDate ?? null,
          endDate: i.targetDate ?? null,
          owner: i.owner ?? null,
          milestones: i.milestones.map((m) => ({
            id: m.id,
            title: m.name,
            status: m.status as "PLANNED" | "IN_PROGRESS" | "DONE" | "MISSED",
            dueDate: m.dueDate ?? null,
            completedAt: m.completedAt ?? null,
          })),
        }))}
      />
    </div>
  );
}
