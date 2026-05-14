"use client";

import { Sun, Moon, Monitor } from "lucide-react";
import { useTheme } from "@/lib/theme/useTheme";
import type { Theme } from "@/lib/theme/useTheme";

type ThemeToggleProps = {
  variant?: "icon" | "segmented";
};

const SEGMENTS: { value: Theme; icon: React.ReactNode; label: string }[] = [
  { value: "light", icon: <Sun className="h-3.5 w-3.5" />, label: "Clair" },
  { value: "system", icon: <Monitor className="h-3.5 w-3.5" />, label: "Système" },
  { value: "dark", icon: <Moon className="h-3.5 w-3.5" />, label: "Sombre" },
];

export function ThemeToggle({ variant = "icon" }: ThemeToggleProps) {
  const { theme, resolvedTheme, setTheme } = useTheme();

  if (variant === "segmented") {
    return (
      <div
        role="group"
        aria-label="Thème de l'interface"
        className="flex rounded-lg border border-border/80 bg-slate-50 p-0.5 dark:border-slate-700 dark:bg-slate-900"
      >
        {SEGMENTS.map(({ value, icon, label }) => (
          <button
            key={value}
            type="button"
            aria-pressed={theme === value}
            aria-label={`Passer en mode ${label}`}
            onClick={() => setTheme(value)}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-medium transition ${
              theme === value
                ? "bg-white text-slate-950 shadow-sm dark:bg-slate-700 dark:text-slate-100"
                : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
            }`}
          >
            {icon}
            <span className="hidden sm:block">{label}</span>
          </button>
        ))}
      </div>
    );
  }

  // Icon toggle: light ↔ dark
  const isDark = resolvedTheme === "dark";

  return (
    <button
      type="button"
      aria-label={isDark ? "Passer en mode clair" : "Passer en mode sombre"}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="flex h-9 w-9 items-center justify-center rounded-xl border border-border/60 bg-white text-slate-500 transition hover:border-primary/20 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700"
    >
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
}
