import type { Route } from "next";
import Link from "next/link";

import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type UpgradeCtaProps = {
  eyebrow: string;
  title: string;
  description: string;
  ctaLabel: string;
  href: Route;
};

export function UpgradeCta({
  eyebrow,
  title,
  description,
  ctaLabel,
  href
}: UpgradeCtaProps) {
  return (
    <Card className="border-primary/15 bg-primary/5">
      <CardHeader className="space-y-3">
        <div className="text-xs font-semibold uppercase tracking-[0.18em] text-primary-deep">
          {eyebrow}
        </div>
        <div className="space-y-2">
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <Button asChild>
          <Link href={href}>
            {ctaLabel}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
