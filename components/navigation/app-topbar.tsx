"use client";

import { Search } from "lucide-react";

import { LanguageSwitcher } from "@/components/i18n/language-switcher";
import { useLocaleContext } from "@/components/providers/locale-provider";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

type AppTopbarProps = {
  title: string;
  subtitle: string;
  workspaceName: string;
  planName: string;
  userLabel: string;
  roleLabel: string;
};

export function AppTopbar({
  title,
  subtitle,
  workspaceName,
  planName,
  userLabel,
  roleLabel
}: AppTopbarProps) {
  const { messages } = useLocaleContext();

  return (
    <header className="border-b border-border/80 bg-white/85 px-4 py-5 backdrop-blur md:px-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="default">{planName}</Badge>
            <Badge variant="outline">{workspaceName}</Badge>
            <Badge variant="outline">{messages.common.labels.featureGate}</Badge>
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-950">
              {title}
            </h1>
            <p className="mt-1 text-sm leading-6 text-slate-600">{subtitle}</p>
          </div>
        </div>
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <div className="relative min-w-[280px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              className="pl-10"
              placeholder={messages.app.shell.searchPlaceholder}
            />
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-slate-700">{userLabel}</p>
            {roleLabel ? (
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{roleLabel}</p>
            ) : null}
          </div>
          <LanguageSwitcher />
        </div>
      </div>
    </header>
  );
}
