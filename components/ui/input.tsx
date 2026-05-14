import * as React from "react";

import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-11 w-full rounded-lg px-3.5 py-2 text-sm",
          "bg-[--bg-input] border border-[--border]",
          "text-[--text-primary] placeholder:text-[--text-muted]",
          "transition-colors duration-150",
          "focus-visible:outline-none focus-visible:border-[--border-focus] focus-visible:shadow-focus-green",
          "disabled:cursor-not-allowed disabled:opacity-40",
          "file:border-0 file:bg-transparent file:text-sm file:font-medium",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
