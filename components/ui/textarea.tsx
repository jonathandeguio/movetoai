import * as React from "react";

import { cn } from "@/lib/utils";

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<"textarea">
>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "flex min-h-[120px] w-full rounded-lg px-3.5 py-2.5 text-sm",
        "bg-[--bg-input] border border-[--border]",
        "text-[--text-primary] placeholder:text-[--text-muted]",
        "transition-colors duration-150",
        "focus-visible:outline-none focus-visible:border-[--border-focus] focus-visible:shadow-focus-green",
        "disabled:cursor-not-allowed disabled:opacity-40",
        className
      )}
      ref={ref}
      {...props}
    />
  );
});

Textarea.displayName = "Textarea";

export { Textarea };
