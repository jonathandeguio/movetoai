import { cn } from "@/lib/utils";

// Domain → colour mapping using design tokens
const DOMAIN_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  Finance:    { bg: "bg-[--blue-dim]",   text: "text-[--blue]",   border: "border-[--blue-border]"   },
  RH:         { bg: "bg-[--green-dim]",  text: "text-[--green]",  border: "border-[--green-border]"  },
  Commercial: { bg: "bg-[--purple-dim]", text: "text-[--purple]", border: "border-[--purple-border]" },
  Marketing:  { bg: "bg-[--coral-dim]",  text: "text-[--coral]",  border: "border-[--coral-dim]"     },
  Ops:        { bg: "bg-[--amber-dim]",  text: "text-[--amber]",  border: "border-[--amber-dim]"     },
  Support:    { bg: "bg-[--green-dim]",  text: "text-[--green]",  border: "border-[--green-border]"  },
  Juridique:  { bg: "bg-[--red-dim]",    text: "text-[--red]",    border: "border-[--red-dim]"       },
  Achats:     { bg: "bg-[--amber-dim]",  text: "text-[--amber]",  border: "border-[--amber-dim]"     },
  IT:         { bg: "bg-[--blue-dim]",   text: "text-[--blue]",   border: "border-[--blue-border]"   },
};

const DEFAULT_COLOR = {
  bg:     "bg-[--bg-hover]",
  text:   "text-[--text-secondary]",
  border: "border-[--border]",
};

interface DomainBadgeProps {
  domain: string | null | undefined;
  className?: string;
  size?: "sm" | "md";
}

export function DomainBadge({ domain, className, size = "md" }: DomainBadgeProps) {
  const label  = domain ?? "—";
  const colors = domain ? (DOMAIN_COLORS[domain] ?? DEFAULT_COLOR) : DEFAULT_COLOR;

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-pill border font-medium",
        size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-0.5 text-[11px]",
        colors.bg, colors.text, colors.border,
        className
      )}
    >
      {label}
    </span>
  );
}

export { DOMAIN_COLORS };
