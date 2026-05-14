/**
 * logo.tsx — backward-compatibility shim.
 *
 * All new code should import from:
 *   @/components/brand/brand-logo   (BrandLogo — full logo with wordmark)
 *   @/components/brand/brand-mark   (BrandMark — icon only)
 *   @/components/brand/brand-header (BrandHeader / BrandWatermark)
 *
 * This file keeps the old `<Logo />` API working without changes.
 * The old props are mapped to BrandLogo equivalents.
 */
import type { Route } from "next";

import { BrandLogo } from "@/components/brand/brand-logo";

type LegacyLogoSize = "sm" | "md" | "lg";

type LogoProps = {
  href?: Route;
  className?: string;
  /** Hide the wordmark — icon only. */
  compact?: boolean;
  /** Dark-background variant (renders wordmark in white). */
  dark?: boolean;
  /** Size preset. Defaults to "md". */
  size?: LegacyLogoSize;
};

const LEGACY_SIZE_MAP: Record<LegacyLogoSize, "sm" | "md" | "lg"> = {
  sm: "sm",
  md: "md",
  lg: "lg",
};

/**
 * @deprecated Use <BrandLogo /> from @/components/brand/brand-logo.
 * This wrapper exists for backward-compatibility.
 */
export function Logo({
  href = "/",
  className,
  compact = false,
  dark = false,
  size = "md",
}: LogoProps) {
  return (
    <BrandLogo
      href={href}
      className={className}
      withWordmark={!compact}
      variant={dark ? "dark" : "light"}
      size={LEGACY_SIZE_MAP[size]}
      animated
    />
  );
}
