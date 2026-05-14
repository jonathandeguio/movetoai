import type { Route } from "next";
import Link from "next/link";

export interface VsRow {
  label: string;
  competitor: string;
  movetoai: string;
  competitorPositive?: boolean;
  movetoaiPositive?: boolean;
}

export interface VsPageTemplateProps {
  competitor: {
    name: string;
    tagline: string;
    color: string;
  };
  headline: string;
  subheadline: string;
  rows: VsRow[];
  competitorDescription: string;
  movetoaiPitch: string;
}

export function VsPageTemplate({
  competitor,
  headline,
  subheadline,
  rows,
  competitorDescription,
  movetoaiPitch,
}: VsPageTemplateProps) {
  return (
    <main style={{ background: "#060810", minHeight: "100vh" }}>
      {/* Hero */}
      <section className="mx-auto max-w-4xl px-4 py-24 text-center sm:px-6">
        <p
          className="mb-4 text-xs font-medium uppercase"
          style={{ color: "#6ee7b7", letterSpacing: "0.16em" }}
        >
          Move to AI vs {competitor.name}
        </p>
        <h1
          className="font-syne font-extrabold"
          style={{
            fontSize: "clamp(2rem, 5vw, 3.6rem)",
            lineHeight: 1.08,
            letterSpacing: "-0.03em",
            color: "#fff",
          }}
        >
          {headline}
        </h1>
        <p
          className="mx-auto mt-6 max-w-xl text-base leading-7"
          style={{ color: "rgba(232,230,240,0.60)" }}
        >
          {subheadline}
        </p>

        <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link
            href={"/signup" as Route}
            className="rounded-full px-6 py-3 text-sm font-semibold transition-all duration-150 hover:-translate-y-px hover:opacity-90"
            style={{ background: "#6ee7b7", color: "#060810" }}
          >
            Essayer gratuitement
          </Link>
          <Link
            href={"/pricing" as Route}
            className="rounded-full border px-6 py-3 text-sm font-medium transition-all duration-150 hover:border-white/40 hover:text-white"
            style={{
              border: "1px solid rgba(255,255,255,0.12)",
              color: "rgba(232,230,240,0.65)",
            }}
          >
            Voir les tarifs
          </Link>
        </div>
      </section>

      {/* Comparison table */}
      <section className="mx-auto w-full max-w-4xl px-4 pb-24 sm:px-6">
        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "separate",
              borderSpacing: 0,
              fontSize: 13,
            }}
          >
            <thead>
              <tr>
                <th
                  style={{
                    padding: "10px 16px",
                    textAlign: "left",
                    color: "rgba(232,230,240,0.35)",
                    fontWeight: 500,
                    fontSize: 11,
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    borderBottom: "1px solid rgba(255,255,255,0.07)",
                  }}
                >
                  Critère
                </th>
                <th
                  style={{
                    padding: "10px 16px",
                    textAlign: "center",
                    color: competitor.color,
                    fontWeight: 500,
                    fontSize: 12,
                    borderBottom: "1px solid rgba(255,255,255,0.07)",
                  }}
                >
                  {competitor.name}
                </th>
                <th
                  style={{
                    padding: "10px 16px",
                    textAlign: "center",
                    color: "#6ee7b7",
                    fontWeight: 700,
                    fontSize: 13,
                    borderBottom: "2px solid rgba(110,231,183,0.30)",
                    background: "rgba(110,231,183,0.04)",
                  }}
                >
                  Move to AI
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={row.label}>
                  <td
                    style={{
                      padding: "12px 16px",
                      color: "rgba(232,230,240,0.65)",
                      fontWeight: 500,
                      borderBottom:
                        i < rows.length - 1
                          ? "1px solid rgba(255,255,255,0.05)"
                          : "none",
                    }}
                  >
                    {row.label}
                  </td>
                  <td
                    style={{
                      padding: "12px 16px",
                      textAlign: "center",
                      color:
                        row.competitor === "✗"
                          ? "rgba(232,230,240,0.25)"
                          : row.competitorPositive
                          ? "rgba(232,230,240,0.75)"
                          : "rgba(232,230,240,0.50)",
                      borderBottom:
                        i < rows.length - 1
                          ? "1px solid rgba(255,255,255,0.05)"
                          : "none",
                    }}
                  >
                    {row.competitor}
                  </td>
                  <td
                    style={{
                      padding: "12px 16px",
                      textAlign: "center",
                      color:
                        row.movetoai === "✓" || row.movetoaiPositive
                          ? "#6ee7b7"
                          : "rgba(232,230,240,0.65)",
                      fontWeight: 600,
                      background: "rgba(110,231,183,0.03)",
                      borderBottom:
                        i < rows.length - 1
                          ? "1px solid rgba(255,255,255,0.05)"
                          : "none",
                      borderLeft: "1px solid rgba(110,231,183,0.15)",
                      borderRight: "1px solid rgba(110,231,183,0.15)",
                    }}
                  >
                    {row.movetoai}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Two-column pitch */}
      <section className="mx-auto w-full max-w-5xl px-4 pb-24 sm:px-6">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: "1.5rem",
          }}
        >
          <div
            className="rounded-[14px] p-7"
            style={{
              border: "1px solid rgba(255,255,255,0.07)",
              background: "rgba(255,255,255,0.02)",
            }}
          >
            <p
              className="mb-3 font-syne font-bold text-sm"
              style={{ color: competitor.color }}
            >
              {competitor.name}
            </p>
            <p className="text-sm leading-7" style={{ color: "rgba(232,230,240,0.55)" }}>
              {competitorDescription}
            </p>
          </div>
          <div
            className="rounded-[14px] p-7"
            style={{
              border: "2px solid rgba(110,231,183,0.25)",
              background: "rgba(110,231,183,0.03)",
            }}
          >
            <p className="mb-3 font-syne font-bold text-sm" style={{ color: "#6ee7b7" }}>
              Move to AI
            </p>
            <p className="text-sm leading-7" style={{ color: "rgba(232,230,240,0.65)" }}>
              {movetoaiPitch}
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-3xl px-4 pb-32 text-center sm:px-6">
        <h2
          className="mb-6 font-syne font-bold"
          style={{
            fontSize: "clamp(1.4rem, 3vw, 2.2rem)",
            color: "#fff",
            letterSpacing: "-0.02em",
          }}
        >
          Prêt à passer à Move to AI ?
        </h2>
        <p className="mb-8 text-sm" style={{ color: "rgba(232,230,240,0.55)" }}>
          Gratuit pour toujours · Sans carte bancaire · Premiers résultats en 48h
        </p>
        <Link
          href={"/signup" as Route}
          className="inline-block rounded-full px-8 py-3.5 text-sm font-semibold transition-all duration-150 hover:-translate-y-px hover:opacity-90"
          style={{ background: "#6ee7b7", color: "#060810" }}
        >
          Identifier mes opportunités IA — gratuitement
        </Link>
      </section>
    </main>
  );
}
