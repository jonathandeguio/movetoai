import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium",
    "border transition-all duration-150 cursor-pointer",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--green] focus-visible:ring-offset-1 focus-visible:ring-offset-[--bg-primary]",
    "disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none",
    "active:scale-[0.98]",
  ].join(" "),
  {
    variants: {
      variant: {
        default:
          "bg-[--green] text-[--on-green] border-transparent hover:opacity-90",
        primary:
          "bg-[--green] text-[--on-green] border-transparent hover:opacity-90",
        ghost:
          "bg-transparent text-[--text-secondary] border-[--border] hover:border-[--border-strong] hover:text-[--text-primary]",
        outline:
          "bg-transparent text-[--green] border-[--green-border] hover:border-[--green-border-h] hover:bg-[--green-dim]",
        danger:
          "bg-transparent text-[--red] border-[--red-dim] hover:bg-[--red-dim] hover:border-[--red]",
        // Legacy aliases kept for existing code
        secondary:
          "bg-[--bg-hover] text-[--text-secondary] border-[--border] hover:border-[--border-strong] hover:text-[--text-primary]",
        link: "h-auto rounded-none p-0 border-none text-[--green] underline-offset-4 hover:underline",
      },
      size: {
        default: "h-11 px-5 py-2.5 text-sm rounded-pill",
        sm:      "h-9 px-3.5 text-xs rounded-md",
        lg:      "h-12 px-6 text-base rounded-pill",
        icon:    "h-10 w-10 rounded-md",
      },
    },
    defaultVariants: {
      variant: "default",
      size:    "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
