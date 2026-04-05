import type { ReactNode } from "react";

import { Badge } from "@/components/ui/badge";

type PageHeroProps = {
  eyebrow: string;
  title: string;
  subtitle: string;
  aside?: ReactNode;
};

export function PageHero({ eyebrow, title, subtitle, aside }: PageHeroProps) {
  return (
    <section className="page-shell grid gap-10 py-18 lg:grid-cols-[1.1fr_0.9fr] lg:items-start lg:py-24">
      <div className="space-y-6">
        <Badge>{eyebrow}</Badge>
        <h1 className="max-w-4xl text-4xl font-semibold tracking-tight text-slate-950 text-balance md:text-5xl">
          {title}
        </h1>
        <p className="max-w-3xl text-lg leading-8 text-slate-600">{subtitle}</p>
      </div>
      {aside ? <div className="lg:justify-self-end">{aside}</div> : null}
    </section>
  );
}
