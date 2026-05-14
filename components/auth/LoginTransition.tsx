"use client";

import { useEffect, useState } from "react";

interface LoginTransitionProps {
  show: boolean;
  message?: string;
}

const STEPS = [
  "Vérification des identifiants…",
  "Chargement de votre espace…",
  "Préparation du tableau de bord…",
];

export function LoginTransition({ show, message }: LoginTransitionProps) {
  const [progress, setProgress] = useState(0);
  const [stepIndex, setStepIndex] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!show) {
      setProgress(0);
      setStepIndex(0);
      setVisible(false);
      return;
    }

    // Fade in
    const fadeIn = setTimeout(() => setVisible(true), 10);

    // Animate progress bar
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 90) { clearInterval(interval); return p; }
        return p + Math.random() * 8 + 2;
      });
    }, 400);

    // Cycle through step messages
    const stepInterval = setInterval(() => {
      setStepIndex((i) => (i + 1) % STEPS.length);
    }, 1400);

    return () => {
      clearTimeout(fadeIn);
      clearInterval(interval);
      clearInterval(stepInterval);
    };
  }, [show]);

  if (!show && !visible) return null;

  return (
    <div
      aria-live="polite"
      className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-8 bg-[--bg-primary] transition-opacity duration-300"
      style={{ opacity: visible ? 1 : 0 }}
    >
      {/* Logo */}
      <div className="text-center">
        <span
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "28px",
            fontWeight: 800,
            color: "#fff",
            letterSpacing: "-0.02em",
          }}
        >
          move<span style={{ color: "var(--green)" }}>.</span>ai
        </span>
      </div>

      {/* Progress bar */}
      <div className="w-48 overflow-hidden rounded-full bg-[--bg-hover]" style={{ height: "3px" }}>
        <div
          className="h-full rounded-full transition-all duration-500 ease-out"
          style={{
            width: `${Math.min(progress, 95)}%`,
            background: "var(--green)",
          }}
        />
      </div>

      {/* Step message */}
      <p
        key={stepIndex}
        className="animate-fadeIn text-sm text-[--text-muted]"
        style={{ animation: "fadeIn 0.4s ease" }}
      >
        {message ?? STEPS[stepIndex]}
      </p>
    </div>
  );
}
