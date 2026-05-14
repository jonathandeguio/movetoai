import type { Route } from "next";

import { BrandLogo, type BrandLogoSize } from "@/components/brand/brand-logo";
import { cn } from "@/lib/utils";

// ─── Watermark pattern — subtle network grid behind auth / onboarding pages ──

/**
 * Lightweight SVG pattern derived from the logo's geometry.
 * Used as an optional decorative background on auth and onboarding pages.
 */
function BrandPattern({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={cn("pointer-events-none select-none", className)}
      xmlns="http://www.w3.org/2000/svg"
      width="100%"
      height="100%"
    >
      <defs>
        <pattern id="bp-grid" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
          {/* Small cube outline — centre hexagon */}
          <polygon
            points="40,8 58,18 58,38 40,48 22,38 22,18"
            fill="none"
            stroke="currentColor"
            strokeWidth="0.8"
          />
          {/* Inner top face */}
          <line x1="40" y1="8"  x2="40" y2="28" stroke="currentColor" strokeWidth="0.5" />
          <line x1="22" y1="18" x2="40" y2="28" stroke="currentColor" strokeWidth="0.5" />
          <line x1="58" y1="18" x2="40" y2="28" stroke="currentColor" strokeWidth="0.5" />
          {/* Node dot */}
          <circle cx="40" cy="8"  r="1.5" fill="currentColor" opacity="0.5" />
          <circle cx="22" cy="18" r="1.5" fill="currentColor" opacity="0.5" />
          <circle cx="58" cy="18" r="1.5" fill="currentColor" opacity="0.5" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#bp-grid)" />
    </svg>
  );
}

// ─── BrandHeader ─────────────────────────────────────────────────────────────

export type BrandHeaderVariant = "auth" | "onboarding" | "minimal";

interface BrandHeaderProps {
  /**
   * Visual context.
   * - "auth"       — sticky top bar with logo left (login / signup pages)
   * - "onboarding" — centered logo over a subtle pattern (multi-step flows)
   * - "minimal"    — logo only, no pattern, no sticky positioning
   * @default "auth"
   */
  variant?: BrandHeaderVariant;
  /** Size of the BrandLogo inside the header. */
  logoSize?: BrandLogoSize;
  /** Destination the logo links to. @default "/" */
  logoHref?: Route;
  /** Optional slot — rendered right of the logo in "auth" variant. */
  right?: React.ReactNode;
  /** Optional slot — rendered below the logo in "onboarding" variant. */
  below?: React.ReactNode;
  className?: string;
}

/**
 * BrandHeader — reusable branded page header.
 *
 * Three variants:
 *   "auth"        → sticky top bar (marketing-style) with logo left + optional right slot
 *   "onboarding"  → centred block with subtle network pattern and logo
 *   "minimal"     → plain inline logo, no chrome
 *
 * Usage:
 *   <BrandHeader variant="auth" right={<LanguageSwitcher />} />
 *   <BrandHeader variant="onboarding" below={<ProgressBar step={1} total={3} />} />
 */
export function BrandHeader({
  variant = "auth",
  logoSize,
  logoHref = "/" as Route,
  right,
  below,
  className,
}: BrandHeaderProps) {
  /* ── Auth variant — sticky top bar ── */
  if (variant === "auth") {
    return (
      <header
        className={cn(
          "sticky top-0 z-40 border-b border-white/70 bg-white/88 backdrop-blur-xl",
          className
        )}
      >
        <div className="page-shell flex h-20 items-center justify-between gap-4">
          <BrandLogo
            size={logoSize ?? "md"}
            animated
            href={logoHref as Route}
          />
          {right && <div className="flex items-center gap-3">{right}</div>}
        </div>
      </header>
    );
  }

  /* ── Onboarding variant — centred with pattern ── */
  if (variant === "onboarding") {
    return (
      <div
        className={cn(
          "relative flex flex-col items-center gap-4 overflow-hidden pb-8 pt-10",
          className
        )}
      >
        {/* Network pattern background */}
        <BrandPattern className="absolute inset-0 text-blue-200/40 dark:text-blue-900/30" />

        {/* Radial fade over the pattern */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/0 via-white/60 to-white dark:from-transparent dark:via-slate-950/60 dark:to-slate-950" />

        {/* Logo */}
        <div className="relative z-10">
          <BrandLogo
            size={logoSize ?? "lg"}
            animated
            href={logoHref as Route}
          />
        </div>

        {/* Below slot (e.g. step indicator) */}
        {below && <div className="relative z-10">{below}</div>}
      </div>
    );
  }

  /* ── Minimal variant ── */
  return (
    <div className={cn("inline-flex", className)}>
      <BrandLogo
        size={logoSize ?? "sm"}
        href={logoHref as Route}
      />
    </div>
  );
}

// ─── BrandWatermark — large decorative mark for hero / empty-state pages ──────

interface BrandWatermarkProps {
  /** Opacity multiplier (0–1). @default 0.04 */
  opacity?: number;
  /** Size in px of the mark. @default 480 */
  size?: number;
  className?: string;
}

/**
 * BrandWatermark — oversized, near-transparent version of the brand mark.
 *
 * Position absolutely inside a `relative overflow-hidden` container.
 *
 * Usage:
 *   <section className="relative overflow-hidden">
 *     <BrandWatermark className="absolute -right-20 -top-20" />
 *     ...content...
 *   </section>
 */
export function BrandWatermark({
  opacity = 0.04,
  size = 480,
  className,
}: BrandWatermarkProps) {
  // Reuse the inline SVG directly — just override opacity.
  return (
    <div
      aria-hidden="true"
      className={cn("pointer-events-none select-none", className)}
      style={{ opacity, width: size, height: size }}
    >
      {/* Import BrandMark lazily to keep this a thin wrapper */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 976 1105"
        width={size}
        height={size}
        focusable="false"
      >
        <defs>
          <linearGradient id="bwm-l" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2D5EE5" />
            <stop offset="100%" stopColor="#0B1E7A" />
          </linearGradient>
          <linearGradient id="bwm-r" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#35D2EC" />
            <stop offset="100%" stopColor="#1754C9" />
          </linearGradient>
          <linearGradient id="bwm-t" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#60F0F2" />
            <stop offset="100%" stopColor="#26C6E6" />
          </linearGradient>
        </defs>
        {/* Simplified version: just the cube outlines (no shadows/filters) */}
        {/* Centre cube */}
        <polygon points="356,473 488,549 488,715 356,639" fill="url(#bwm-l)" />
        <polygon points="488,549 620,473 620,639 488,715" fill="url(#bwm-r)" />
        <polygon points="356,473 488,397 620,473 488,549" fill="url(#bwm-t)" />
        <polyline points="356,473 488,397 620,473" fill="none" stroke="#58F2F5" strokeWidth="4" strokeLinejoin="round" />
        {/* Upper-left cube */}
        <polygon points="4,270 111,331 111,461 4,400"    fill="url(#bwm-l)" />
        <polygon points="111,331 218,270 218,400 111,461" fill="url(#bwm-r)" />
        <polygon points="4,270 111,209 218,270 111,331"  fill="url(#bwm-t)" />
        {/* Upper-right cube */}
        <polygon points="758,271 865,332 865,462 758,401" fill="url(#bwm-l)" />
        <polygon points="865,332 972,271 972,401 865,462" fill="url(#bwm-r)" />
        <polygon points="758,271 865,210 972,271 865,332" fill="url(#bwm-t)" />
        {/* Top-centre cube */}
        <polygon points="381,63 488,124 488,254 381,193"   fill="url(#bwm-l)" />
        <polygon points="488,124 595,63 595,193 488,254"   fill="url(#bwm-r)" />
        <polygon points="381,63 488,2 595,63 488,124"      fill="url(#bwm-t)" />
        {/* Lower-left cube */}
        <polygon points="3,706 110,767 110,897 3,836"     fill="url(#bwm-l)" />
        <polygon points="110,767 217,706 217,836 110,897" fill="url(#bwm-r)" />
        <polygon points="3,706 110,645 217,706 110,767"   fill="url(#bwm-t)" />
        {/* Lower-right cube */}
        <polygon points="758,706 865,767 865,897 758,836" fill="url(#bwm-l)" />
        <polygon points="865,767 972,706 972,836 865,897" fill="url(#bwm-r)" />
        <polygon points="758,706 865,645 972,706 865,767" fill="url(#bwm-t)" />
        {/* Bottom-centre cube */}
        <polygon points="381,917 488,978 488,1108 381,1047" fill="url(#bwm-l)" />
        <polygon points="488,978 595,917 595,1047 488,1108" fill="url(#bwm-r)" />
        <polygon points="381,917 488,856 595,917 488,978"   fill="url(#bwm-t)" />
        {/* Network lines (simplified) */}
        <line x1="476" y1="254" x2="488" y2="397" stroke="#3554D0" strokeWidth="12" strokeLinecap="round" opacity="0.6" />
        <line x1="476" y1="715" x2="488" y2="856" stroke="#3554D0" strokeWidth="12" strokeLinecap="round" opacity="0.6" />
        <line x1="356" y1="556" x2="218" y2="400" stroke="#3554D0" strokeWidth="12" strokeLinecap="round" opacity="0.6" />
        <line x1="620" y1="556" x2="758" y2="400" stroke="#46DFF0" strokeWidth="12" strokeLinecap="round" opacity="0.6" />
        <line x1="356" y1="556" x2="218" y2="706" stroke="#3554D0" strokeWidth="12" strokeLinecap="round" opacity="0.6" />
        <line x1="620" y1="556" x2="758" y2="706" stroke="#46DFF0" strokeWidth="12" strokeLinecap="round" opacity="0.6" />
      </svg>
    </div>
  );
}
