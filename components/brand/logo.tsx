import type { Route } from "next";
import Link from "next/link";

import { cn } from "@/lib/utils";

type LogoProps = {
  href?: Route;
  className?: string;
  compact?: boolean;
};

export function Logo({
  href = "/",
  className,
  compact = false
}: LogoProps) {
  return (
    <Link
      href={href}
      className={cn("inline-flex items-center gap-3 rounded-xl", className)}
      aria-label="BluePilot AI"
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 64 64"
        className="h-10 w-10 shrink-0"
        fill="none"
      >
        <rect width="64" height="64" rx="18" fill="#EFF6FF" />
        <path
          d="M18 16H31.5C40.0604 16 47 22.9396 47 31.5C47 40.0604 40.0604 47 31.5 47H18V16Z"
          fill="#2563EB"
        />
        <path
          d="M28 24H33.2C36.9555 24 40 27.0445 40 30.8C40 34.5555 36.9555 37.6 33.2 37.6H28V24Z"
          fill="white"
        />
        <path
          d="M35 20L46 20L46 31"
          stroke="#1E3A8A"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="46" cy="20" r="4" fill="#60A5FA" />
      </svg>
      {!compact ? (
        <span className="flex flex-col leading-none">
          <span className="text-sm font-semibold uppercase tracking-[0.16em] text-primary-deep">
            BluePilot
          </span>
          <span className="text-base font-semibold text-slate-950">AI</span>
        </span>
      ) : null}
    </Link>
  );
}
