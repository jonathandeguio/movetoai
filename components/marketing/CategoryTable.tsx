"use client";

const ROWS = [
  {
    label: "Prix annuel",
    leanix: "30 000 €/an",
    celonis: "50 000 €/an",
    mckinsey: "200 000 €+",
    movetoai: "Gratuit",
    highlight: true,
  },
  {
    label: "Délai 1er résultat",
    leanix: "3 mois",
    celonis: "6 mois",
    mckinsey: "6 – 12 mois",
    movetoai: "< 48h",
    highlight: true,
  },
  {
    label: "IA générative intégrée",
    leanix: "✗",
    celonis: "Partielle",
    mckinsey: "✗",
    movetoai: "✓ natif",
    highlight: false,
  },
  {
    label: "ROI mesuré",
    leanix: "✗",
    celonis: "✓",
    mckinsey: "✗",
    movetoai: "✓",
    highlight: false,
  },
  {
    label: "Adapté PME",
    leanix: "✗",
    celonis: "✗",
    mckinsey: "✗",
    movetoai: "✓",
    highlight: false,
  },
  {
    label: "Consultants IA inclus",
    leanix: "✗",
    celonis: "✗",
    mckinsey: "✓ (très cher)",
    movetoai: "✓ inclus",
    highlight: false,
  },
];

const COL_HEADER = [
  { key: "leanix",   label: "LeanIX",   color: "rgba(232,230,240,0.40)" },
  { key: "celonis",  label: "Celonis",  color: "rgba(232,230,240,0.40)" },
  { key: "mckinsey", label: "McKinsey", color: "rgba(232,230,240,0.40)" },
  { key: "movetoai", label: "Move to AI", color: "#6ee7b7", featured: true },
] as const;

export function CategoryTable() {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-24 sm:px-6 xl:px-8">
      {/* Header */}
      <div className="mb-14 space-y-4 text-center">
        <p
          className="text-xs font-medium uppercase"
          style={{ color: "#6ee7b7", letterSpacing: "0.16em" }}
        >
          Comparatif
        </p>
        <h2
          className="font-syne font-bold"
          style={{
            fontSize: "clamp(1.6rem, 3.5vw, 2.6rem)",
            lineHeight: 1.1,
            letterSpacing: "-0.02em",
            color: "#fff",
          }}
        >
          Pourquoi Move to AI plutôt qu&apos;un cabinet ?
        </h2>
        <p className="text-sm" style={{ color: "rgba(232,230,240,0.55)" }}>
          50× moins cher. 20× plus rapide. Et ça reste votre outil, pas leur rapport.
        </p>
      </div>

      {/* Table */}
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
              {COL_HEADER.map((col) => (
                <th
                  key={col.key}
                  style={{
                    padding: "10px 16px",
                    textAlign: "center",
                    color: col.color,
                    fontWeight: col.featured ? 700 : 500,
                    fontSize: col.featured ? 13 : 12,
                    letterSpacing: "0.04em",
                    borderBottom: col.featured
                      ? "2px solid rgba(110,231,183,0.30)"
                      : "1px solid rgba(255,255,255,0.07)",
                    background: col.featured
                      ? "rgba(110,231,183,0.04)"
                      : "transparent",
                  }}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ROWS.map((row, i) => (
              <tr key={row.label}>
                <td
                  style={{
                    padding: "12px 16px",
                    color: "rgba(232,230,240,0.65)",
                    fontWeight: 500,
                    borderBottom:
                      i < ROWS.length - 1
                        ? "1px solid rgba(255,255,255,0.05)"
                        : "none",
                  }}
                >
                  {row.label}
                </td>
                {COL_HEADER.map((col) => {
                  const val = row[col.key];
                  const isMoveToAI = col.key === "movetoai";
                  const isPositive = val === "✓" || val === "✓ natif" || val === "✓ inclus";
                  const isNegative = val === "✗";
                  return (
                    <td
                      key={col.key}
                      style={{
                        padding: "12px 16px",
                        textAlign: "center",
                        color: isMoveToAI
                          ? row.highlight
                            ? "#6ee7b7"
                            : isPositive
                            ? "#6ee7b7"
                            : "rgba(232,230,240,0.65)"
                          : isNegative
                          ? "rgba(232,230,240,0.25)"
                          : "rgba(232,230,240,0.55)",
                        fontWeight: isMoveToAI ? 600 : 400,
                        background: isMoveToAI
                          ? "rgba(110,231,183,0.03)"
                          : "transparent",
                        borderBottom:
                          i < ROWS.length - 1
                            ? "1px solid rgba(255,255,255,0.05)"
                            : "none",
                        borderLeft: isMoveToAI
                          ? "1px solid rgba(110,231,183,0.15)"
                          : "none",
                        borderRight: isMoveToAI
                          ? "1px solid rgba(110,231,183,0.15)"
                          : "none",
                      }}
                    >
                      {val}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
