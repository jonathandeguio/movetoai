"use client";

import { useContext } from "react";
import { ThemeContext } from "@/lib/theme/ThemeProvider";

export type Theme = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used within <ThemeProvider>");
  }
  return ctx;
}
