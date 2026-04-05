import type { Route } from "next";
import Image from "next/image";
import Link from "next/link";

import { cn } from "@/lib/utils";

type MoveToAiLogoProps = {
  href?: Route;
  className?: string;
};

export function MoveToAiLogo({ href = "/", className }: MoveToAiLogoProps) {
  return (
    <Link
      href={href}
      className={cn("inline-flex items-center gap-3", className)}
      aria-label="Move to AI"
    >
      <span className="flex items-center gap-3">
        <Image
          src="/branding/move-to-ai/move-to-ai-logo.png"
          alt="Move to AI"
          width={240}
          height={64}
          priority
          className="h-9 w-auto sm:h-10"
        />
      </span>
    </Link>
  );
}
