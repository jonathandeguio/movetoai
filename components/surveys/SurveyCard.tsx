"use client";

import type { Route } from "next";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";

type SurveyCardProps = {
  id: string;
  title: string;
  description?: string | null;
  status: string;
  dueDate?: Date | string | null;
  targetEntityType?: string | null;
  _count: {
    questions: number;
    responses: number;
  };
};

function getStatusBadgeVariant(status: string): "gray" | "green" | "blue" {
  switch (status) {
    case "active":
      return "green";
    case "closed":
      return "blue";
    default:
      return "gray";
  }
}

function getStatusLabel(status: string): string {
  switch (status) {
    case "active":
      return "Actif";
    case "closed":
      return "Fermé";
    default:
      return "Brouillon";
  }
}

function formatDueDate(dueDate: Date | string): string {
  const date = typeof dueDate === "string" ? new Date(dueDate) : dueDate;
  return date.toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
}

export function SurveyCard({
  id,
  title,
  description,
  status,
  dueDate,
  targetEntityType,
  _count,
}: SurveyCardProps) {
  return (
    <Link
      href={`/app/surveys/${id}` as Route}
      className="block rounded-xl border border-[--border] bg-[--bg-card] p-5 transition-colors hover:border-[--green] hover:shadow-sm"
    >
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-sm font-semibold text-[--text-primary] leading-snug line-clamp-2">
            {title}
          </h3>
          <Badge variant={getStatusBadgeVariant(status)} className="shrink-0">
            {getStatusLabel(status)}
          </Badge>
        </div>

        {description && (
          <p className="text-xs text-[--text-secondary] line-clamp-2 leading-relaxed">
            {description}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-3 pt-1">
          <span className="text-xs text-[--text-muted]">
            <span className="font-medium text-[--text-secondary]">{_count.questions}</span>{" "}
            question{_count.questions !== 1 ? "s" : ""}
          </span>
          <span className="text-[--border]">·</span>
          <span className="text-xs text-[--text-muted]">
            <span className="font-medium text-[--text-secondary]">{_count.responses}</span>{" "}
            réponse{_count.responses !== 1 ? "s" : ""}
          </span>

          {targetEntityType && (
            <>
              <span className="text-[--border]">·</span>
              <Badge variant="outline" className="text-[10px]">
                {targetEntityType}
              </Badge>
            </>
          )}

          {dueDate && (
            <>
              <span className="text-[--border]">·</span>
              <span className="text-xs text-[--text-muted]">
                Échéance{" "}
                <span className="text-[--text-secondary]">{formatDueDate(dueDate)}</span>
              </span>
            </>
          )}
        </div>
      </div>
    </Link>
  );
}
