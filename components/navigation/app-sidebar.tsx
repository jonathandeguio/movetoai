"use client";

import type { Route } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { Logo } from "@/components/brand/logo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLocaleContext } from "@/components/providers/locale-provider";
import { appNavigation } from "@/lib/navigation";
import { cn } from "@/lib/utils";

type AppSidebarProps = {
  workspaceName: string;
  planName: string;
};

export function AppSidebar({ workspaceName, planName }: AppSidebarProps) {
  const pathname = usePathname();
  const { messages } = useLocaleContext();

  return (
    <aside className="hidden w-80 shrink-0 border-r border-border/80 bg-white/95 px-6 py-8 backdrop-blur lg:flex lg:flex-col">
      <div className="space-y-8">
        <Logo href="/app" />
        <div className="rounded-2xl border border-primary/10 bg-primary/5 p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-primary-deep">
              {messages.common.labels.multilingual}
            </p>
            <Badge variant="default">{planName}</Badge>
          </div>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
            {workspaceName}
          </p>
          <p className="mt-1 text-sm leading-6 text-slate-600">
            EN / FR / ES
          </p>
        </div>
      </div>

      <nav className="mt-10 space-y-2">
        {appNavigation.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === "/app"
              ? pathname === item.href
              : pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.key}
              href={item.href as Route}
              className={cn(
                "group flex items-start gap-3 rounded-2xl border px-4 py-3 transition",
                isActive
                  ? "border-primary/15 bg-primary/5"
                  : "border-transparent hover:border-border hover:bg-slate-50"
              )}
            >
              <span
                className={cn(
                  "mt-0.5 rounded-xl p-2 transition",
                  isActive
                    ? "bg-primary text-white shadow-glow"
                    : "bg-slate-100 text-slate-600 group-hover:bg-primary/10 group-hover:text-primary-deep"
                )}
              >
                <Icon className="h-4 w-4" />
              </span>
              <span className="space-y-1">
                <span className="block font-medium text-slate-950">
                  {messages.app.nav[item.key].title}
                </span>
                <span className="block text-sm leading-5 text-slate-500">
                  {messages.app.nav[item.key].description}
                </span>
              </span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto rounded-2xl border border-border/80 bg-slate-50 p-5">
        <p className="text-sm font-semibold text-slate-950">
          {messages.common.labels.featureGate}
        </p>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          {messages.common.featureGating.upgradeHint}
        </p>
        <Button className="mt-4 w-full" asChild>
          <Link href="/pricing">{messages.common.ctas.comparePlans}</Link>
        </Button>
      </div>
    </aside>
  );
}
