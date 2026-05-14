import { ArrowUpRight } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type EmptyShellPageProps = {
  eyebrow: string;
  title: string;
  description: string;
  cardTitle: string;
  cardBody: string;
};

export function EmptyShellPage({
  eyebrow,
  title,
  description,
  cardTitle,
  cardBody
}: EmptyShellPageProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <Badge>{eyebrow}</Badge>
        <h2 className="text-3xl font-semibold tracking-tight text-[--text-primary]">
          {title}
        </h2>
        <p className="max-w-3xl text-base leading-7 text-[--text-secondary]">{description}</p>
      </div>
      <Card className="border-dashed border-[--border]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowUpRight className="h-5 w-5 text-[--green]" />
            {cardTitle}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0 text-sm leading-7 text-[--text-secondary]">{cardBody}</CardContent>
      </Card>
    </div>
  );
}
