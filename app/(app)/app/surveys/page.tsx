export const dynamic = "force-dynamic";

import type { Route } from "next";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { MetricCard } from "@/components/app/metric-card";
import { SurveyCard } from "@/components/surveys/SurveyCard";
import { surveyRepo }            from "@/lib/repositories/survey.repo";
import { requireAnyPermission } from "@/server/permissions";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function SurveysPage({ searchParams }: { searchParams: SearchParams }) {
  const { workspace } = await requireAnyPermission([
    "business-structure.manage",
    "analytics.view",
  ]);

  const sp = await searchParams;
  const tab = typeof sp.tab === "string" ? sp.tab : "all";

  const surveys = await surveyRepo.findByWorkspace(workspace!.id);

  const totalResponses = surveys.reduce((sum, s) => sum + s._count.responses, 0);
  const active = surveys.filter((s) => s.status === "active");
  const closed = surveys.filter((s) => s.status === "closed");
  const drafts = surveys.filter((s) => s.status === "draft");

  const filtered =
    tab === "active"
      ? active
      : tab === "draft"
        ? drafts
        : tab === "closed"
          ? closed
          : surveys;

  const tabs = [
    { key: "all", label: "Toutes", count: surveys.length },
    { key: "active", label: "Actives", count: active.length },
    { key: "draft", label: "Brouillons", count: drafts.length },
    { key: "closed", label: "Fermées", count: closed.length },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <section className="rounded-3xl border border-[--green-border] bg-[--bg-card] p-8 shadow-soft-sm">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-4">
            <Badge>Gouvernance</Badge>
            <h2 className="max-w-2xl text-4xl font-semibold tracking-tight text-[--text-primary] text-balance">
              Enquêtes &amp; Attestations
            </h2>
            <p className="max-w-2xl text-base leading-8 text-[--text-secondary]">
              Collectez des retours terrain, pilotez les certifications et validations sur vos entités métier.
            </p>
          </div>
          <Link
            href={"/app/surveys/new" as Route}
            className="shrink-0 rounded-lg bg-[--green] px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
          >
            + Nouvelle enquête
          </Link>
        </div>
      </section>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <MetricCard label="Total enquêtes" value={String(surveys.length)} />
        <MetricCard label="Actives" value={String(active.length)} />
        <MetricCard label="Fermées" value={String(closed.length)} />
        <MetricCard label="Total réponses" value={String(totalResponses)} />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-xl border border-[--border] bg-[--bg-card] p-1">
        {tabs.map((t) => (
          <Link
            key={t.key}
            href={`/app/surveys?tab=${t.key}` as Route}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              tab === t.key
                ? "bg-[--green-dim] text-[--green]"
                : "text-[--text-secondary] hover:text-[--text-primary]"
            }`}
          >
            {t.label}
            <span
              className={`rounded-full px-1.5 py-0.5 text-[10px] font-medium ${
                tab === t.key
                  ? "bg-[--green] text-white"
                  : "bg-[--bg-hover] text-[--text-muted]"
              }`}
            >
              {t.count}
            </span>
          </Link>
        ))}
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[--border] bg-[--bg-card] py-16 text-center">
          <p className="text-sm font-medium text-[--text-secondary]">Aucune enquête dans cette catégorie</p>
          <p className="mt-1 text-xs text-[--text-muted]">
            Créez votre première enquête pour collecter des retours.
          </p>
          <Link
            href={"/app/surveys/new" as Route}
            className="mt-4 rounded-lg bg-[--green] px-4 py-2 text-sm font-medium text-white hover:opacity-90"
          >
            Nouvelle enquête
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((survey) => (
            <SurveyCard
              key={survey.id}
              id={survey.id}
              title={survey.title}
              description={survey.description}
              status={survey.status}
              dueDate={survey.dueDate}
              targetEntityType={survey.targetEntityType}
              _count={survey._count}
            />
          ))}
        </div>
      )}
    </div>
  );
}
