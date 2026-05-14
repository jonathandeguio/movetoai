import { Bot, PenLine, Users } from "lucide-react";
import { cn } from "@/lib/utils";

const SOURCE_CONFIG = {
  ai:      { label: "IA",        Icon: Bot,     className: "bg-[--purple-dim] text-[--purple] border-[--purple-border]" },
  manual:  { label: "Manuel",    Icon: PenLine,  className: "bg-[--bg-hover] text-[--text-secondary] border-[--border]" },
  terrain: { label: "Terrain",   Icon: Users,    className: "bg-[--blue-dim] text-[--blue] border-[--blue-border]" },
} as const;

type Source = keyof typeof SOURCE_CONFIG;

interface SourceBadgeProps {
  source: Source | string;
  className?: string;
}

export function SourceBadge({ source, className }: SourceBadgeProps) {
  const config = SOURCE_CONFIG[source as Source] ?? SOURCE_CONFIG.manual;
  const Icon = config.Icon;
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium", config.className, className)}>
      <Icon className="h-3 w-3" />
      {config.label}
    </span>
  );
}
