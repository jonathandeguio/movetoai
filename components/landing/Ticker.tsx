"use client";

const ITEMS = [
  "< 48h pour votre 1er use case",
  "14 000 € économisés en moyenne",
  "Gratuit pour toujours",
  "ROI mesuré avant / après",
  "Consultants certifiés inclus",
  "PME · ETI · Grands groupes",
];

export function Ticker() {
  // Duplicate items for seamless loop
  const all = [...ITEMS, ...ITEMS];

  return (
    <div
      className="overflow-hidden py-4"
      style={{
        borderTop: "1px solid rgba(255,255,255,0.06)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        background: "rgba(255,255,255,0.02)",
      }}
    >
      <div
        className="flex gap-12 whitespace-nowrap"
        style={{ animation: "mkt-ticker 18s linear infinite" }}
      >
        {all.map((item, i) => (
          <span
            key={i}
            className="shrink-0 text-sm font-medium"
            style={{ color: "rgba(232,230,240,0.45)" }}
          >
            <span style={{ color: "#6ee7b7", marginRight: "0.75rem" }}>·</span>
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
