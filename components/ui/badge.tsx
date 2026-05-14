import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-pill border px-2.5 py-0.5 text-[11px] font-medium tracking-wide transition-colors",
  {
    variants: {
      variant: {
        default:  "bg-[--green-dim]   text-[--green]  border-[--green-border]",
        green:    "bg-[--green-dim]   text-[--green]  border-[--green-border]",
        blue:     "bg-[--blue-dim]    text-[--blue]   border-[--blue-border]",
        purple:   "bg-[--purple-dim]  text-[--purple] border-[--purple-border]",
        amber:    "bg-[--amber-dim]   text-[--amber]  border-[--amber-dim]",
        coral:    "bg-[--coral-dim]   text-[--coral]  border-[--coral-dim]",
        red:      "bg-[--red-dim]     text-[--red]    border-[--red-dim]",
        gray:     "bg-[--bg-hover]    text-[--text-secondary] border-[--border]",
        // Legacy aliases
        secondary:"bg-[--bg-hover]    text-[--text-secondary] border-[--border]",
        success:  "bg-[--green-dim]   text-[--green]  border-[--green-border]",
        warning:  "bg-[--amber-dim]   text-[--amber]  border-[--amber-dim]",
        danger:   "bg-[--red-dim]     text-[--red]    border-[--red-dim]",
        outline:  "bg-transparent     text-[--text-secondary] border-[--border]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
