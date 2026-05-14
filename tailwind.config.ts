import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "1.5rem",
      screens: {
        "2xl": "1280px",
      },
    },
    extend: {
      colors: {
        // ── Move to AI dark design tokens ──────────────────────────
        "bg-primary":         "var(--bg-primary)",
        "bg-secondary":       "var(--bg-secondary)",
        "bg-card":            "var(--bg-card)",
        "bg-hover":           "var(--bg-hover)",
        "mta-green":          "var(--green)",
        "mta-blue":           "var(--blue)",
        "mta-purple":         "var(--purple)",
        "mta-amber":          "var(--amber)",
        "mta-coral":          "var(--coral)",
        "mta-red":            "var(--red)",
        "text-primary":       "var(--text-primary)",
        "text-secondary":     "var(--text-secondary)",
        "text-muted":         "var(--text-muted)",
        "border-subtle":      "var(--border-subtle)",
        "border-strong":      "var(--border-strong)",
        "border-green":       "var(--border-green)",
        // ── Legacy shadcn/ui tokens ─────────────────────────────────
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          hover: "hsl(var(--primary-hover))",
          deep: "hsl(var(--primary-deep))",
          sky: "hsl(var(--primary-sky))",
          tint: "hsl(var(--primary-tint))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
        },
        warning: {
          DEFAULT: "hsl(var(--warning))",
          foreground: "hsl(var(--warning-foreground))",
        },
        danger: {
          DEFAULT: "hsl(var(--danger))",
          foreground: "hsl(var(--danger-foreground))",
        }
      },
      borderRadius: {
        pill: "999px",
        xl:   "1.5rem",
        lg:   "1rem",
        md:   "0.75rem",
        sm:   "0.5rem",
      },
      boxShadow: {
        "soft-sm":     "0 10px 30px rgba(15, 23, 42, 0.06)",
        soft:          "0 20px 45px rgba(15, 23, 42, 0.10)",
        glow:          "0 12px 60px rgba(37, 99, 235, 0.18)",
        "focus-green": "0 0 0 3px rgba(110,231,183,0.12)",
        "focus-blue":  "0 0 0 3px rgba(56,189,248,0.12)",
      },
      backgroundImage: {
        "hero-grid":
          "linear-gradient(to right, rgba(148, 163, 184, 0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(148, 163, 184, 0.08) 1px, transparent 1px)"
      },
      fontFamily: {
        syne:  ["var(--font-syne)", "sans-serif"],
        inter: ["Inter", "sans-serif"],
      },
      animation: {
        "mkt-ticker":   "mkt-ticker 18s linear infinite",
        "mkt-pulse":    "mkt-pulse 2s ease-in-out infinite",
        "mkt-fade-up":  "mkt-fade-up 0.7s ease both",
        "mkt-slide-in": "mkt-slide-in 0.5s ease both",
      },
      keyframes: {
        "mkt-ticker":   { from: { transform: "translateX(0)" },          to: { transform: "translateX(-50%)" } },
        "mkt-pulse":    { "0%,100%": { opacity: "0.6", transform: "scale(1)" }, "50%": { opacity: "1", transform: "scale(1.2)" } },
        "mkt-fade-up":  { from: { opacity: "0", transform: "translateY(18px)" }, to: { opacity: "1", transform: "translateY(0)" } },
        "mkt-slide-in": { from: { opacity: "0", transform: "translateX(-12px)" }, to: { opacity: "1", transform: "translateX(0)" } },
      },
    }
  },
  plugins: [tailwindcssAnimate]
};

export default config;
