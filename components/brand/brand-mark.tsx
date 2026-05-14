"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";

// ─── Size presets ────────────────────────────────────────────────────────────

const SIZE_MAP = {
  xs:   24,
  sm:   32,
  md:   40,
  lg:   52,
  xl:   72,
  hero: 100,
} as const;

type SizePreset = keyof typeof SIZE_MAP;

export type BrandMarkVariant = "full" | "icon";

export interface BrandMarkProps {
  /**
   * Height of the mark in px, or a size preset.
   * @default "md"
   */
  size?: SizePreset | number;
  /**
   * "full" → standard icon (default)
   * "icon" → same icon, alias kept for API compatibility
   */
  variant?: BrandMarkVariant;
  /** Enable hover glow + scale-up micro-animation. */
  animated?: boolean;
  /** Additional classes applied to the wrapper. */
  className?: string;
  /** aria-label when the mark carries meaning (e.g. standalone nav logo). */
  ariaLabel?: string;
  /**
   * Background context — determines which asset is used.
   * "dark"  → white mark on transparent (for dark sidebars / topbars)
   * "light" → contained badge (for light / auth pages)
   * @default "dark"
   */
  background?: "dark" | "light";
}

/**
 * BrandMark — Move to AI canonical icon.
 *
 * Uses next/image to render the official brand asset.
 * "dark"  context → mark-white.png  (white "m" + green square, transparent bg)
 * "light" context → favicon.png      (dark rounded badge with "m" + green square)
 *
 * Usage:
 *   <BrandMark size="md" animated />
 *   <BrandMark size={64} background="light" />
 */
export function BrandMark({
  size = "md",
  variant: _variant = "full",
  animated = false,
  className,
  ariaLabel,
  background = "dark",
}: BrandMarkProps) {
  const sizePx = typeof size === "number" ? size : SIZE_MAP[size];

  // Asset choice based on background context
  const src = background === "light"
    ? "/favicon.png"                            // dark-bg badge → works on white pages
    : "/branding/move-to-ai/mark-white.png";   // white transparent → works on dark pages

  return (
    <div
      className={cn(
        "relative inline-flex shrink-0 select-none",
        animated && "group/brand",
        className
      )}
      style={{ width: sizePx, height: sizePx }}
      aria-hidden={!ariaLabel}
      role={ariaLabel ? "img" : undefined}
      aria-label={ariaLabel}
    >
      <Image
        src={src}
        alt={ariaLabel ?? "Move to AI"}
        width={sizePx}
        height={sizePx}
        priority
        className={cn(
          "block object-contain",
          animated && [
            "transition-[filter,transform] duration-300 ease-out will-change-transform",
            "group-hover/brand:scale-[1.03] group-hover/brand:[filter:drop-shadow(0_0_8px_rgba(110,231,183,0.55))]",
          ]
        )}
        style={{ width: sizePx, height: sizePx }}
      />
    </div>
  );
}
