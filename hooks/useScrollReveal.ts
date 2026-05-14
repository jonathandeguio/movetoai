"use client";

import { useEffect } from "react";

export function useScrollReveal(
  selector: string,
  options: IntersectionObserverInit = {}
) {
  useEffect(() => {
    const elements = document.querySelectorAll<Element>(selector);
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("revealed");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.15, ...options }
    );
    elements.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [selector, options]);
}
