"use client";

import type { Route } from "next";
import Link from "next/link";
import { useState, useEffect } from "react";

const NAV_LINKS = [
  { label: "Produit",      href: "/product" },
  { label: "Partenaires",  href: "/partners" },
  { label: "Tarifs",       href: "/pricing" },
  { label: "Blog",         href: "/blog" },
];

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <header
        className="sticky top-0 z-50 transition-all duration-200"
        style={{
          background: "rgba(6,8,16,0.85)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          borderBottom: scrolled
            ? "1px solid rgba(255,255,255,0.10)"
            : "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-6 px-4 sm:px-6 xl:px-8">
          {/* Logo */}
          <Link href={"/" as Route} className="shrink-0">
            <span
              className="font-syne text-xl font-extrabold"
              style={{ color: "#fff", letterSpacing: "-0.02em" }}
            >
              move<span style={{ color: "#6ee7b7" }}>.</span>ai
            </span>
          </Link>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Desktop CTAs */}
          <div className="flex items-center gap-3">
            <Link
              href={"/login" as Route}
              className="hidden text-sm font-medium transition-colors duration-150 hover:text-white lg:block"
              style={{ color: "rgba(232,230,240,0.65)" }}
            >
              Connexion
            </Link>
            <Link
              href={"/signup" as Route}
              className="rounded-full px-4 py-2 text-sm font-semibold transition-all duration-150 hover:opacity-88 hover:-translate-y-px"
              style={{ background: "#6ee7b7", color: "#060810" }}
            >
              Démarrer →
            </Link>

            {/* Mobile hamburger */}
            <button
              className="flex flex-col gap-1.5 p-2 lg:hidden"
              aria-label={mobileOpen ? "Fermer le menu" : "Ouvrir le menu"}
              onClick={() => setMobileOpen((v) => !v)}
            >
              <span className="block h-px w-5 rounded transition-all" style={{ background: "rgba(232,230,240,0.65)" }} />
              <span className="block h-px w-5 rounded transition-all" style={{ background: "rgba(232,230,240,0.65)" }} />
              <span className="block h-px w-3.5 rounded transition-all" style={{ background: "rgba(232,230,240,0.65)" }} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 flex"
          onClick={() => setMobileOpen(false)}
        >
          <div className="absolute inset-0" style={{ background: "rgba(6,8,16,0.75)" }} />
          <nav
            className="relative ml-auto flex h-full w-72 flex-col gap-1 px-6 pb-8 pt-20"
            style={{
              background: "#0a0e1a",
              borderLeft: "1px solid rgba(255,255,255,0.08)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {NAV_LINKS.map((item) => (
              <Link
                key={item.href}
                href={item.href as Route}
                className="rounded-lg px-3 py-3 text-sm font-medium hover:text-white"
                style={{ color: "rgba(232,230,240,0.75)" }}
                onClick={() => setMobileOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <div className="mt-auto flex flex-col gap-3">
              <Link
                href={"/login" as Route}
                className="rounded-full border px-4 py-2.5 text-center text-sm font-medium"
                style={{ borderColor: "rgba(255,255,255,0.12)", color: "rgba(232,230,240,0.75)" }}
                onClick={() => setMobileOpen(false)}
              >
                Connexion
              </Link>
              <Link
                href={"/signup" as Route}
                className="rounded-full px-4 py-2.5 text-center text-sm font-semibold"
                style={{ background: "#6ee7b7", color: "#060810" }}
                onClick={() => setMobileOpen(false)}
              >
                Démarrer →
              </Link>
            </div>
          </nav>
        </div>
      )}
    </>
  );
}
