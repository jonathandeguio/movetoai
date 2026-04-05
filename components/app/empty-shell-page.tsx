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
        <h2 className="text-3xl font-semibold tracking-tight text-slate-950">
          {title}
        </h2>
        <p className="max-w-3xl text-base leading-7 text-slate-600">{description}</p>
      </div>
      <Card className="border-dashed border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowUpRight className="h-5 w-5 text-primary" />
            {cardTitle}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0 text-sm leading-7 text-slate-600">{cardBody}</CardContent>
      </Card>
    </div>
  );
}
