import { MessageSquareMore } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { Locale } from "@/lib/i18n/config";
import { formatDate } from "@/modules/opportunities/ui/opportunity-ui.utils";

type CommentsPanelProps = {
  locale: Locale;
  title: string;
  description: string;
  emptyTitle: string;
  emptyDescription: string;
  comments: Array<{
    id: string;
    body: string;
    createdAt: Date;
    author: {
      name: string | null;
      jobTitle: string | null;
    };
  }>;
};

export function CommentsPanel({
  locale,
  title,
  description,
  emptyTitle,
  emptyDescription,
  comments
}: CommentsPanelProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 pt-0">
        {comments.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-primary/20 bg-primary/5 p-5">
            <div className="flex items-start gap-3">
              <span className="rounded-2xl bg-white p-2 text-primary shadow-soft-sm">
                <MessageSquareMore className="h-4 w-4" />
              </span>
              <div className="space-y-2">
                <p className="text-sm font-semibold text-slate-950">{emptyTitle}</p>
                <p className="text-sm leading-6 text-slate-600">{emptyDescription}</p>
              </div>
            </div>
          </div>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="rounded-2xl border border-border/80 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-950">
                    {comment.author.name ?? "-"}
                  </p>
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                    {comment.author.jobTitle ?? ""}
                  </p>
                </div>
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
                  {formatDate(locale, comment.createdAt)}
                </p>
              </div>
              <p className="mt-3 text-sm leading-7 text-slate-600">{comment.body}</p>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
