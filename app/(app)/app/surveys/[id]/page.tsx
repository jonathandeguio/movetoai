export const dynamic = "force-dynamic";

import type { Route } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { SurveyResponseForm } from "@/components/surveys/SurveyResponseForm";
import { surveyRepo }            from "@/lib/repositories/survey.repo";
import { requireAnyPermission } from "@/server/permissions";

type RouteProps = { params: Promise<{ id: string }> };

function formatDueDate(date: Date): string {
  return date.toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
}

function getStatusBadgeVariant(status: string): "gray" | "green" | "blue" {
  switch (status) {
    case "active": return "green";
    case "closed": return "blue";
    default: return "gray";
  }
}

function getStatusLabel(status: string): string {
  switch (status) {
    case "active": return "Actif";
    case "closed": return "Fermé";
    default: return "Brouillon";
  }
}

function getTypeBadgeVariant(type: string): "gray" | "blue" | "amber" | "green" {
  switch (type) {
    case "rating": return "amber";
    case "choice": return "blue";
    case "yesno": return "green";
    default: return "gray";
  }
}

function getTypeLabel(type: string): string {
  switch (type) {
    case "text": return "Texte";
    case "rating": return "Note";
    case "choice": return "Choix";
    case "yesno": return "Oui/Non";
    default: return type;
  }
}

export default async function SurveyDetailPage({ params }: RouteProps) {
  const { workspace } = await requireAnyPermission([
    "business-structure.manage",
    "analytics.view",
  ]);

  const { id } = await params;

  const survey = await surveyRepo.findById(id, workspace!.id);

  if (!survey) notFound();

  return (
    <div className="space-y-6">
      {/* Back */}
      <Link
        href={"/app/surveys" as Route}
        className="inline-flex items-center gap-1.5 text-sm text-[--text-secondary] hover:text-[--text-primary] transition-colors"
      >
        ← Retour aux enquêtes
      </Link>

      {/* Header */}
      <section className="rounded-xl border border-[--border] bg-[--bg-card] p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={getStatusBadgeVariant(survey.status)}>
                {getStatusLabel(survey.status)}
              </Badge>
              {survey.targetEntityType && (
                <Badge variant="outline">{survey.targetEntityType}</Badge>
              )}
              {survey.dueDate && (
                <span className="text-xs text-[--text-muted]">
                  Échéance : {formatDueDate(survey.dueDate)}
                </span>
              )}
            </div>
            <h1 className="text-2xl font-semibold text-[--text-primary]">{survey.title}</h1>
            {survey.description && (
              <p className="max-w-2xl text-sm leading-relaxed text-[--text-secondary]">
                {survey.description}
              </p>
            )}
          </div>
          <div className="text-right text-sm text-[--text-muted]">
            <p>
              <span className="font-semibold text-[--text-primary]">{survey._count.responses}</span>{" "}
              réponse{survey._count.responses !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
      </section>

      {/* Questions */}
      <section className="rounded-xl border border-[--border] bg-[--bg-card] p-6">
        <h2 className="mb-4 text-base font-semibold text-[--text-primary]">
          Questions ({survey.questions.length})
        </h2>
        {survey.questions.length === 0 ? (
          <p className="text-sm text-[--text-muted]">Aucune question définie pour cette enquête.</p>
        ) : (
          <ol className="space-y-3">
            {survey.questions.map((q, idx) => (
              <li key={q.id} className="flex items-start gap-3 rounded-lg border border-[--border-subtle] bg-[--bg-hover] px-4 py-3">
                <span className="shrink-0 mt-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-[--green-dim] text-[10px] font-bold text-[--green]">
                  {idx + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-[--text-primary]">{q.label}</p>
                  {q.required && (
                    <p className="mt-0.5 text-xs text-[--text-muted]">Obligatoire</p>
                  )}
                </div>
                <Badge variant={getTypeBadgeVariant(q.type)} className="shrink-0">
                  {getTypeLabel(q.type)}
                </Badge>
              </li>
            ))}
          </ol>
        )}
      </section>

      {/* Réponses */}
      <section className="rounded-xl border border-[--border] bg-[--bg-card] p-6">
        <h2 className="mb-4 text-base font-semibold text-[--text-primary]">
          Répondre à l&apos;enquête
        </h2>
        {survey.status !== "active" ? (
          <div className="rounded-lg border border-[--amber-border] bg-[--amber-dim] px-4 py-3 text-sm text-[--amber]">
            Ce sondage n&apos;est plus actif. Les réponses ne sont plus acceptées.
          </div>
        ) : survey.questions.length === 0 ? (
          <p className="text-sm text-[--text-muted]">
            Impossible de répondre : aucune question n&apos;a été définie.
          </p>
        ) : (
          <SurveyResponseForm
            surveyId={survey.id}
            questions={survey.questions.map((q) => ({
              id: q.id,
              type: q.type,
              label: q.label,
              options: q.options,
              required: q.required,
            }))}
          />
        )}
      </section>
    </div>
  );
}
