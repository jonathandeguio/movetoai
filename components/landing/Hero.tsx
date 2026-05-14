"use client";

import type { Route } from "next";
import Link from "next/link";
import { useRef } from "react";
import { useParticleCanvas } from "@/hooks/useParticleCanvas";

export function Hero() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useParticleCanvas(canvasRef);

  return (
    <section
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 text-center"
      style={{ background: "#060810" }}
    >
      {/* Canvas background */}
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="absolute inset-0 h-full w-full"
        style={{ zIndex: 0 }}
      />

      {/* Radial glow behind content */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 60% 40% at 50% 40%, rgba(110,231,183,0.07) 0%, transparent 70%)",
          zIndex: 1,
        }}
      />

      {/* Content */}
      <div className="relative z-10 mx-auto flex max-w-4xl flex-col items-center gap-8">
        {/* Eyebrow badge */}
        <div
          className="flex items-center gap-2 rounded-full px-4 py-1.5"
          style={{
            background: "rgba(110,231,183,0.08)",
            border: "1px solid rgba(110,231,183,0.25)",
          }}
        >
          <span
            aria-label="En ligne"
            className="h-[7px] w-[7px] rounded-full animate-mkt-pulse"
            style={{ background: "#6ee7b7", flexShrink: 0 }}
          />
          <span
            className="text-xs font-medium"
            style={{ color: "#6ee7b7", letterSpacing: "0.04em" }}
          >
            AI Opportunity Intelligence · Bêta ouverte
          </span>
        </div>

        {/* H1 */}
        <h1
          className="font-syne font-extrabold text-balance"
          style={{
            fontSize: "clamp(2rem, 5vw, 4.2rem)",
            lineHeight: 1.06,
            letterSpacing: "-0.03em",
            color: "#fff",
          }}
        >
          Votre premier consultant IA —
          <br />
          <span
            style={{
              backgroundImage:
                "linear-gradient(90deg, #6ee7b7 0%, #38bdf8 50%, #a78bfa 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            sans le prix du cabinet.
          </span>
        </h1>

        {/* Subtitle */}
        <p
          className="max-w-2xl text-lg leading-8"
          style={{ color: "rgba(232,230,240,0.65)" }}
        >
          Move to AI identifie vos opportunités d&apos;automatisation, les structure en use cases
          prêts à déployer, et les connecte aux bons experts — en 48h.
        </p>

        {/* CTAs */}
        <div className="flex flex-col items-center gap-3 sm:flex-row">
          <Link
            href={"/signup" as Route}
            className="rounded-full px-6 py-3 text-sm font-semibold transition-all duration-150 hover:-translate-y-px hover:opacity-90"
            style={{ background: "#6ee7b7", color: "#060810" }}
          >
            Identifier mes opportunités IA — gratuitement
          </Link>
          <a
            href="#demo"
            className="rounded-full border px-6 py-3 text-sm font-medium transition-all duration-150 hover:border-white/40 hover:text-white"
            style={{
              border: "1px solid rgba(255,255,255,0.12)",
              color: "rgba(232,230,240,0.65)",
            }}
          >
            Voir la démo
          </a>
        </div>

        {/* Social proof */}
        <p className="text-xs" style={{ color: "rgba(232,230,240,0.35)" }}>
          Déjà{" "}
          <span style={{ color: "rgba(232,230,240,0.65)" }}>800+ entreprises</span>
          {" · "}
          <span style={{ color: "#6ee7b7" }}>Gratuit pour toujours</span>
          {" · "}
          Sans carte bancaire
        </p>
      </div>

      {/* Scroll hint */}
      <div
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        style={{ zIndex: 10 }}
        aria-hidden="true"
      >
        <div
          className="mx-auto h-8 w-px"
          style={{
            background:
              "linear-gradient(to bottom, rgba(110,231,183,0.5), transparent)",
          }}
        />
      </div>
    </section>
  );
}
