import type { Route } from "next";
import Link from "next/link";

import { BrandMark, type BrandMarkVariant } from "@/components/brand/brand-mark";
import { cn } from "@/lib/utils";

// ─── Size system ─────────────────────────────────────────────────────────────

export type BrandLogoSize = "xs" | "sm" | "md" | "lg" | "xl" | "hero";

const MARK_HEIGHT: Record<BrandLogoSize, number> = {
  xs:   24,   // compact sidebar / mobile
  sm:   32,   // sidebar, auth header compact
  md:   40,   // default nav / topbar
  lg:   52,   // marketing header, onboarding top
  xl:   72,   // onboarding hero, page hero sections
  hero: 100,  // homepage hero
};

const WORDMARK_CLASS: Record<BrandLogoSize, string> = {
  xs:   "text-sm   font-semibold tracking-tight leading-none",
  sm:   "text-base font-semibold tracking-tight leading-none",
  md:   "text-lg   font-semibold tracking-tight leading-none",
  lg:   "text-xl   font-semibold tracking-tight leading-none",
  xl:   "text-2xl  font-bold     tracking-tight leading-none",
  hero: "text-4xl  font-bold     tracking-tight leading-none",
};

// ─── Variant ─────────────────────────────────────────────────────────────────

export type BrandLogoVariant = "light" | "dark";

const WORDMARK_STYLE: Record<BrandLogoVariant, React.CSSProperties> = {
  light: {
    background: "linear-gradient(90deg, #2C7BDF 0%, #0A2A86 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
  },
  dark: {
    color: "#ffffff",
  },
};

// ─── Props ───────────────────────────────────────────────────────────────────

export interface BrandLogoProps {
  /** Size preset. @default "md" */
  size?: BrandLogoSize;
  /** Light or dark background context. @default "light" */
  variant?: BrandLogoVariant;
  /** Whether to show the "Move to AI" wordmark. @default true */
  withWordmark?: boolean;
  /** Enable hover glow + scale micro-animation on the mark. @default false */
  animated?: boolean;
  /** Additional classes on the root element. */
  className?: string;
  /**
   * If provided the logo is wrapped in a Next.js Link.
   * Pass `false` to render as a plain div (e.g. already inside a link).
   * @default "/"
   */
  href?: Route | false;
  /**
   * Icon variant forwarded to BrandMark.
   * "full" shows the whole network; "icon" crops to the centre cube.
   * @default "full"
   */
  markVariant?: BrandMarkVariant;
}

/**
 * BrandLogo — canonical brand component used across all surfaces.
 *
 * Combines the BrandMark SVG icon with the "Move to AI" wordmark.
 *
 * Examples:
 *   <BrandLogo />                                  — default (md, light, wordmark)
 *   <BrandLogo size="sm" variant="dark" />         — sidebar dark
 *   <BrandLogo size="hero" animated withWordmark={false} href={false} />
 *   <BrandLogo size="xs" markVariant="icon" withWordmark={false} />
 */
export function BrandLogo({
  size = "md",
  variant = "light",
  withWordmark = true,
  animated = false,
  className,
  href = "/",
  markVariant = "full",
}: BrandLogoProps) {
  const content = (
    <>
      <BrandMark
        size={MARK_HEIGHT[size]}
        variant={markVariant}
        animated={animated}
        background={variant === "dark" ? "dark" : "light"}
        ariaLabel={!withWordmark ? "Move to AI" : undefined}
      />
      {withWordmark && (
        <span
          className={cn(WORDMARK_CLASS[size], "select-none")}
          style={WORDMARK_STYLE[variant]}
        >
          Move to AI
        </span>
      )}
    </>
  );

  const sharedClasses = cn(
    "inline-flex items-center gap-2.5",
    // Slightly tighter gap for small sizes
    size === "xs" && "gap-2",
    size === "sm" && "gap-2",
    className
  );

  if (href === false) {
    return <div className={sharedClasses}>{content}</div>;
  }

  return (
    <Link
      href={href}
      className={cn(sharedClasses, "rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2")}
      aria-label="Move to AI — Accueil"
    >
      {content}
    </Link>
  );
}
