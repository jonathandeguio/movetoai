import { cn } from "@/lib/utils";

const PRIORITY_CONFIG = {
  P0: {
    label:     "P0 · Critique",
    className: "bg-[--red-dim]   text-[--red]   border-[--red-dim]",
    dot:       "bg-[--red]",
  },
  P1: {
    label:     "P1 · Important",
    className: "bg-[--amber-dim] text-[--amber] border-[--amber-dim]",
    dot:       "bg-[--amber]",
  },
  P2: {
    label:     "P2 · Normal",
    className: "bg-[--bg-hover]  text-[--text-secondary] border-[--border]",
    dot:       "bg-[--text-muted]",
  },
} as const;

type Priority = keyof typeof PRIORITY_CONFIG;

interface PriorityBadgeProps {
  priority: Priority | string;
  showDot?: boolean;
  className?: string;
}

export function PriorityBadge({ priority, showDot = false, className }: PriorityBadgeProps) {
  const config = PRIORITY_CONFIG[priority as Priority] ?? PRIORITY_CONFIG.P2;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-pill border px-2.5 py-0.5 text-[11px] font-medium",
        config.className,
        className
      )}
    >
      {showDot && (
        <span className={cn("h-1.5 w-1.5 rounded-full", config.dot)} />
      )}
      {config.label}
    </span>
  );
}

export { PRIORITY_CONFIG };
