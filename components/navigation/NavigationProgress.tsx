"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

/**
 * Thin top-of-page progress bar that shows during App Router navigations.
 * - Starts on any internal <a> click
 * - Completes when usePathname changes (route settled)
 * No external dependencies.
 */
export function NavigationProgress() {
  const pathname = usePathname();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const prevPathname = useRef(pathname);
  const completing = useRef(false);

  // Intercept clicks on internal links to kick off the bar
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      const anchor = (e.target as HTMLElement).closest("a");
      if (!anchor) return;

      const href = anchor.getAttribute("href");
      // Only internal same-origin navigations, skip hash-only or current page
      if (!href || !href.startsWith("/") || href === pathname || href.startsWith("/#")) return;

      // Don't restart if already loading
      if (completing.current) return;

      completing.current = false;
      setVisible(true);
      setProgress(8);
    }

    document.addEventListener("click", handleClick, { capture: true });
    return () => document.removeEventListener("click", handleClick, { capture: true });
  }, [pathname]);

  // Simulate incremental progress while visible
  useEffect(() => {
    if (!visible) return;

    intervalRef.current = setInterval(() => {
      setProgress((p) => {
        // Slow down asymptotically toward 90%
        if (p >= 90) return p;
        const step = p < 30 ? 8 : p < 60 ? 5 : p < 80 ? 2 : 0.5;
        return Math.min(p + step, 90);
      });
    }, 150);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [visible]);

  // Complete the bar when the route actually changes
  useEffect(() => {
    if (pathname === prevPathname.current) return;
    prevPathname.current = pathname;

    if (!visible) return; // navigation started before our click handler fired

    completing.current = true;
    if (intervalRef.current) clearInterval(intervalRef.current);
    setProgress(100);

    const t = setTimeout(() => {
      setVisible(false);
      setProgress(0);
      completing.current = false;
    }, 350);

    return () => clearTimeout(t);
  }, [pathname, visible]);

  if (!visible) return null;

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-[9999] h-[2px] bg-primary shadow-[0_0_6px_1px] shadow-primary/40 transition-[width] duration-150 ease-out will-change-[width]"
      style={{ width: `${progress}%` }}
    />
  );
}
