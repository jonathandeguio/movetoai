import type { Route } from "next";
import Link from "next/link";

import { ArrowRight, Building2, Network, ShieldCheck, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type QuickAction = {
  title: string;
  description: string;
  href: Route;
  label: string;
  available: boolean;
  tier: "free" | "pro" | "enterprise";
  icon: "sparkles" | "network" | "shield" | "business";
};

type QuickActionsBarProps = {
  eyebrow: string;
  actions: QuickAction[];
  lockedLabel: string;
};

function getIcon(icon: QuickAction["icon"]) {
  if (icon === "network") {
    return Network;
  }

  if (icon === "shield") {
    return ShieldCheck;
  }

  if (icon === "business") {
    return Building2;
  }

  return Sparkles;
}

function getTierClassName(tier: QuickAction["tier"], available: boolean) {
  if (!available) {
    return "border-dashed border-primary/15 bg-slate-50";
  }

  if (tier === "enterprise") {
    return "border-primary/20 bg-primary/5";
  }

  if (tier === "pro") {
    return "border-sky-200 bg-sky-50/70";
  }

  return "border-border/80 bg-white";
}

export function QuickActionsBar({ eyebrow, actions, lockedLabel }: QuickActionsBarProps) {
  return (
    <Card>
      <CardContent className="space-y-4 p-6">
        <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
          {eyebrow}
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {actions.map((action) => {
            const Icon = getIcon(action.icon);

            return (
              <div
                key={action.title}
                className={cn("rounded-2xl border p-4", getTierClassName(action.tier, action.available))}
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="rounded-2xl bg-white p-2 text-primary shadow-soft-sm">
                    <Icon className="h-4 w-4" />
                  </span>
                  <Badge variant={action.available ? "outline" : "secondary"}>
                    {action.available ? action.tier.toUpperCase() : lockedLabel}
                  </Badge>
                </div>
                <h3 className="mt-4 text-base font-semibold text-slate-950">{action.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{action.description}</p>
                <Button className="mt-4 w-full" variant={action.available ? "outline" : "secondary"} asChild>
                  <Link href={action.href}>
                    {action.label}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
