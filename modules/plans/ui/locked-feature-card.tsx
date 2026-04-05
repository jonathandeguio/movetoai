import type { Route } from "next";

import { Lock } from "lucide-react";

import { UpgradeCta } from "@/modules/plans/ui/upgrade-cta";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type LockedFeatureCardProps = {
  planLabel: string;
  title: string;
  description: string;
  bullets: string[];
  ctaLabel: string;
  href: Route;
  previewLabel?: string;
};

export function LockedFeatureCard({
  planLabel,
  title,
  description,
  bullets,
  ctaLabel,
  href,
  previewLabel
}: LockedFeatureCardProps) {
  return (
    <div className="space-y-4">
      <Card className="border-dashed border-primary/20 bg-white">
        <CardHeader className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline">{planLabel}</Badge>
            {previewLabel ? <Badge variant="secondary">{previewLabel}</Badge> : null}
          </div>
          <div className="flex items-start gap-3">
            <span className="rounded-2xl bg-primary/10 p-2 text-primary">
              <Lock className="h-4 w-4" />
            </span>
            <div className="space-y-2">
              <CardTitle>{title}</CardTitle>
              <CardDescription>{description}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid gap-2">
            {bullets.map((bullet) => (
              <div
                key={bullet}
                className="rounded-xl border border-border/80 bg-slate-50 px-3 py-3 text-sm leading-6 text-slate-600"
              >
                {bullet}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      <UpgradeCta
        eyebrow={planLabel}
        title={title}
        description={description}
        ctaLabel={ctaLabel}
        href={href}
      />
    </div>
  );
}
