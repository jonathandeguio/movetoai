/**
 * Move to AI — Design Tokens
 * Source unique de vérité pour toute la charte graphique.
 * Utilisé par : globals.css (CSS vars) · tailwind.config.ts · composants TS
 */

export const colors = {
  bg: {
    primary:   "#060810",
    secondary: "#0a0e1a",
    card:      "rgba(255,255,255,0.03)",
    hover:     "rgba(255,255,255,0.05)",
    input:     "rgba(255,255,255,0.04)",
  },
  green: {
    DEFAULT:   "#6ee7b7",
    dim:       "rgba(110,231,183,0.10)",
    border:    "rgba(110,231,183,0.25)",
    borderHov: "rgba(110,231,183,0.45)",
    text:      "#6ee7b7",
    onGreen:   "#060810",
  },
  blue:   { DEFAULT: "#38bdf8", dim: "rgba(56,189,248,0.10)",  border: "rgba(56,189,248,0.25)"  },
  purple: { DEFAULT: "#a78bfa", dim: "rgba(167,139,250,0.10)", border: "rgba(167,139,250,0.25)" },
  amber:  { DEFAULT: "#fbbf24", dim: "rgba(251,191,36,0.10)",  border: "rgba(251,191,36,0.25)"  },
  coral:  { DEFAULT: "#fb923c", dim: "rgba(251,146,60,0.10)",  border: "rgba(251,146,60,0.25)"  },
  red:    { DEFAULT: "#f87171", dim: "rgba(248,113,113,0.10)", border: "rgba(248,113,113,0.25)" },
  text: {
    primary:   "#ffffff",
    secondary: "rgba(232,230,240,0.65)",
    muted:     "rgba(232,230,240,0.35)",
    disabled:  "rgba(232,230,240,0.20)",
    inverse:   "#060810",
  },
  border: {
    subtle:  "rgba(255,255,255,0.06)",
    DEFAULT: "rgba(255,255,255,0.08)",
    strong:  "rgba(255,255,255,0.16)",
    green:   "rgba(110,231,183,0.30)",
    input:   "rgba(255,255,255,0.08)",
    focus:   "#6ee7b7",
  },
  status: {
    success: "#6ee7b7",
    warning: "#fbbf24",
    error:   "#f87171",
    info:    "#38bdf8",
  },
  profiles: {
    admin:      "#38bdf8",
    executive:  "#a78bfa",
    bizowner:   "#6ee7b7",
    itmanager:  "#38bdf8",
    consultant: "#fb923c",
    member:     "#94a3b8",
    superadmin: "#f87171",
  },
  domains: {
    RH:         "#6ee7b7",
    Finance:    "#38bdf8",
    Commercial: "#a78bfa",
    Marketing:  "#fb923c",
    Ops:        "#fbbf24",
    Support:    "#6ee7b7",
    Juridique:  "#f87171",
    Achats:     "#fbbf24",
    IT:         "#38bdf8",
  },
} as const;

export const typography = {
  fonts: {
    display: "'Syne', sans-serif",
    body:    "'Inter', sans-serif",
    mono:    "'JetBrains Mono', 'Fira Code', monospace",
  },
  weights: { regular: 400, medium: 500, bold: 700, black: 800 },
  sizes: {
    xs:    "10px", sm:   "11px",  base: "13px",  md:   "14px",
    lg:    "15px", xl:   "18px",  "2xl": "22px", "3xl": "28px",
    "4xl": "clamp(2rem, 4vw, 3.2rem)",
    hero:  "clamp(2.4rem, 5vw, 4.2rem)",
  },
  tracking: {
    tight: "-0.03em", normal: "0",    wide:   "0.08em",
    wider: "0.14em",  widest: "0.18em",
  },
} as const;

export const spacing = {
  cardPad:    "1rem 1.25rem",
  sectionPad: "4rem 2.5rem",
  navPad:     "1.2rem 2.5rem",
} as const;

export const radii = {
  sm: "6px", md: "8px", lg: "12px", xl: "16px", pill: "999px",
} as const;

export const transitions = {
  fast:   "150ms ease",
  normal: "200ms ease",
  slow:   "300ms ease",
} as const;

export const shadows = {
  focusGreen: "0 0 0 3px rgba(110,231,183,0.12)",
  focusBlue:  "0 0 0 3px rgba(56,189,248,0.12)",
  none:       "none",
} as const;

export type DesignTokens = {
  colors:      typeof colors;
  typography:  typeof typography;
  spacing:     typeof spacing;
  radii:       typeof radii;
  transitions: typeof transitions;
};
