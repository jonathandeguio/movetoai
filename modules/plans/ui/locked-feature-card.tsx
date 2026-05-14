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
      <Card className="border-dashed border-[--green-border] bg-[--bg-card]">
        <CardHeader className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline">{planLabel}</Badge>
            {previewLabel ? <Badge variant="secondary">{previewLabel}</Badge> : null}
          </div>
          <div className="flex items-start gap-3">
            <span className="rounded-2xl bg-[--green-dim] p-2 text-[--green]">
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
                className="rounded-xl border border-[--border] bg-[--bg-hover] px-3 py-3 text-sm leading-6 text-[--text-secondary]"
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
