import type { Route } from "next";
import Link from "next/link";

export function CtaFinal() {
  return (
    <section
      className="px-4 py-24 text-center"
      style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}
    >
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-8">
        <h2
          className="font-syne font-bold text-balance"
          style={{
            fontSize: "clamp(1.6rem, 3.5vw, 2.6rem)",
            lineHeight: 1.1,
            letterSpacing: "-0.02em",
            color: "#fff",
          }}
        >
          Prêt à{" "}
          <span style={{ color: "#6ee7b7" }}>accélérer</span>{" "}
          votre transformation IA ?
        </h2>

        <p
          className="text-base leading-8"
          style={{ color: "rgba(232,230,240,0.60)" }}
        >
          Rejoignez les entreprises qui ont identifié leurs premières
          opportunités IA en moins de 48 heures.
        </p>

        <div className="flex flex-col items-center gap-3 sm:flex-row">
          <Link
            href={"/signup" as Route}
            className="rounded-full px-6 py-3 text-sm font-semibold transition-all duration-150 hover:-translate-y-px hover:opacity-90"
            style={{ background: "#6ee7b7", color: "#060810" }}
          >
            Créer mon workspace gratuitement
          </Link>
          <Link
            href={"/signup?type=consultant" as Route}
            className="rounded-full border px-6 py-3 text-sm font-medium transition-all duration-150 hover:border-white/30 hover:text-white"
            style={{
              border: "1px solid rgba(255,255,255,0.12)",
              color: "rgba(232,230,240,0.65)",
            }}
          >
            Devenir partenaire consultant
          </Link>
        </div>
      </div>
    </section>
  );
}
